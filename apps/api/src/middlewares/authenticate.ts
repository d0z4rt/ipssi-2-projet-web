import type { RequestHandler } from 'express'

import { Session } from '#auth/session.entity.js'
import { AppDataSource } from '#config/typeorm-datasource.js'
import * as argon2 from 'argon2' // Install: npm install argon2
import { MoreThan } from 'typeorm'

const sessionRepository = AppDataSource.getRepository(Session)

const authenticate: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

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
    res.status(401).json({ error: 'Invalid session' })
    return
  }

  // Update last activity
  await sessionRepository.update(validSession.id, {
    last_activity_at: new Date()
  })

  req.user = validSession.user
  req.session = validSession

  next()
}

export default authenticate
