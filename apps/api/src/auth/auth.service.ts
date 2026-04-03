import userService from '#users/user.service.js'
import { ApiError } from '#utils/errors.js'
import * as argon2 from 'argon2'
import crypto from 'node:crypto'
import { createHash } from 'node:crypto'
import { MoreThan } from 'typeorm'

import { AppDataSource } from '../config/typeorm-datasource.js'
import { LoginSchema, RegisterSchema } from './auth.schemas.js'
import { Session } from './session.entity.js'

const sessionRepository = AppDataSource.getRepository(Session)

const authService = {
  login: async (dto: LoginSchema) => {
    try {
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
    } catch {
      // Prevent enumerating users by throwing a generic error
      throw new ApiError(401, 'Invalid credentials')
    }
  },
  register: async (dto: RegisterSchema) => {
    const existingUser = await userService.getOneByMail(dto.mail)
    if (existingUser) {
      throw new ApiError(409, 'User already exists')
    }

    const user = await userService.create({
      username: dto.username,
      mail: dto.mail,
      password: dto.password,
      is_curator: dto.is_curator
    })

    // Generate random token for the new user
    const { token, tokenHash } = await authService.generateToken()

    const session = await authService.createSession(user.id, tokenHash)

    return { token, session, user }
  },
  authenticate: async (token: string) => {
    const tokenHash = authService.hashToken(token)
    const session = await sessionRepository.findOne({
      where: { token_hash: tokenHash, expires_at: MoreThan(new Date()) },
      relations: ['user']
    })
    if (!session) throw new ApiError(401, 'Invalid session')
    await sessionRepository.update(session.id, { last_activity_at: new Date() })
    return session
  },
  generateToken: async () => {
    const token = crypto.randomBytes(64).toString('hex')
    const tokenHash = authService.hashToken(token)

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
  },
  hashToken: (token: string) => createHash('sha256').update(token).digest('hex')
}

export default authService
