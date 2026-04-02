import userService from '#users/user.service.js'
import { ApiError } from '#utils/errors.js'
import * as argon2 from 'argon2'
import crypto from 'node:crypto'
import { MoreThan } from 'typeorm'

import { AppDataSource } from '../config/typeorm-datasource.js'
import { LoginSchema, RegisterSchema } from './auth.schemas.js'
import { Session } from './session.entity.js'

const sessionRepository = AppDataSource.getRepository(Session)

const authService = {
  login: async (dto: LoginSchema) => {
    const user = await userService.getOneByMail(dto.mail)

    if (!user) {
      throw new ApiError(401, 'User not found')
    }

    const isValidPassword = await argon2.verify(user.password, dto.password)
    if (!isValidPassword) {
      throw new ApiError(403, 'Invalid password')
    }

    const { token, tokenHash } = await authService.generateToken()

    const session = await authService.createSession(user.id, tokenHash)

    return { token, session, user }
  },
  register: async (dto: RegisterSchema) => {
    const existingUser = await userService.getOneByMail(dto.mail)
    if (existingUser) {
      throw new ApiError(409, 'User already exists')
    }

    const hashedPassword = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4
    })

    const user = await userService.create({
      username: dto.username,
      mail: dto.mail,
      password: hashedPassword,
      is_curator: dto.is_curator
    })

    // Generate random token for the new user
    const { token, tokenHash } = await authService.generateToken()

    const session = await authService.createSession(user.id, tokenHash)

    return { token, session, user }
  },
  authenticate: async (token: string) => {
    // Get all active sessions
    const sessions = await sessionRepository.find({
      where: { expires_at: MoreThan(new Date()) },
      relations: ['user']
    })

    // Find session by verifying token hash
    let validSession = null
    for (const session of sessions) {
      try {
        const isMatch = await argon2.verify(session.token_hash, token)
        if (isMatch) {
          validSession = session
          break
        }
      } catch {
        // Invalid hash format or verification error
        continue
      }
    }

    if (!validSession) {
      throw new ApiError(401, 'Invalid session')
    }

    // Update last activity
    await sessionRepository.update(validSession.id, {
      last_activity_at: new Date()
    })

    return validSession
  },
  generateToken: async () => {
    const token = crypto.randomBytes(64).toString('hex')
    const tokenHash = await argon2.hash(token, {
      type: argon2.argon2id, // Recommended: argon2id
      memoryCost: 65536, // 64 MB
      timeCost: 3, // 3 iterations
      parallelism: 4 // 4 parallel threads
    })

    return { token, tokenHash }
  },
  createSession: async (user_id: string, tokenHash: string) => {
    const session = sessionRepository.create({
      user_id,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      last_activity_at: new Date()
    })
    return sessionRepository.save(session)
  }
}

export default authService
