import type { RequestHandler } from 'express'

import { ApiError } from '#utils/errors.js'

import { loginSchema, registerSchema } from './auth.schemas.js'
import service from './auth.service.js'

type ControllerHandlers = {
  login: RequestHandler
  register: RequestHandler
}

const authController: ControllerHandlers = {
  login: async (req, res, next) => {
    try {
      const payload = loginSchema.parse(req.body)
      const { token, session, user } = await service.login(payload)

      res.json({
        token,
        expires_at: session.expires_at,
        user: {
          id: user.id,
          username: user.username,
          mail: user.mail,
          is_admin: user.is_admin,
          is_curator: user.is_curator
        }
      })
    } catch (err) {
      next(err)
    }
  },

  register: async (req, res, next) => {
    try {
      const payload = registerSchema.parse(req.body)

      const { token, session, user } = await service.register(payload)

      res.status(201).json({
        token,
        expires_at: session.expires_at,
        user: {
          id: user.id,
          username: user.username,
          mail: user.mail,
          is_admin: user.is_admin,
          is_curator: user.is_curator
        }
      })
    } catch (err) {
      // Keep API response explicit when unique constraints fail.
      if (err instanceof Error && /duplicate key/i.test(err.message)) {
        next(new ApiError(409, 'Username or mail already exists'))
        return
      }
      next(err)
    }
  }
}

export default authController
