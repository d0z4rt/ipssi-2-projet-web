import { User } from '#users/user.entity.js'
import { ApiError } from '#utils/errors.js'
import * as argon2 from 'argon2'
import crypto from 'node:crypto'

import { AppDataSource } from '../config/typeorm-datasource.js'
import { Session } from './session.entity.js'

const sessionRepository = AppDataSource.getRepository(Session)
const userRepository = AppDataSource.getRepository(User)

const authService = {
  login: async (mail: string, password: string) => {
    const user = await userRepository.findOne({ where: { mail } })

    if (!user) {
      throw new ApiError(401, 'User not found')
    }

    const isValidPassword = await argon2.verify(user.password, password)
    if (!isValidPassword) {
      throw new ApiError(403, 'Invalid password')
    }

    // Generate random token
    const token = crypto.randomBytes(64).toString('hex')
    const tokenId = token.slice(0, 64) // For fast lookup
    const tokenHash = await argon2.hash(token, {
      type: argon2.argon2id, // Recommended: argon2id
      memoryCost: 65536, // 64 MB
      timeCost: 3, // 3 iterations
      parallelism: 4 // 4 parallel threads
    })

    const session = await sessionRepository.save({
      user_id: user.id,
      token_id: tokenId,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      last_activity_at: new Date()
    })

    return { token, session }
  }
}

export default authService
