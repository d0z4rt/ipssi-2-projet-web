import type { RequestHandler } from 'express'

import authService from '#auth/auth.service.js'
import { ApiError } from '#utils/errors.js'

const authenticate: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new ApiError(401, 'Unauthorized'))
    return
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    next(new ApiError(401, 'Unauthorized'))
    return
  }

  try {
    const validSession = await authService.authenticate(token)
    req.user = validSession.user
    req.session = validSession
    next()
  } catch {
    // Generalize error to prevent leaking sensitive information
    next(new ApiError(401, 'Unauthorized'))
  }
}

export default authenticate
