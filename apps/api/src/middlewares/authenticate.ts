import type { RequestHandler } from 'express'

import authService from '#auth/auth.service.js'

const authenticate: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ statusCode: 401, error: 'Unauthorized' })
    return
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    res.status(401).json({ statusCode: 401, error: 'Unauthorized' })
    return
  }

  try {
    const validSession = await authService.authenticate(token)
    req.user = validSession.user
    req.session = validSession
    next()
  } catch {
    res.status(401).json({ statusCode: 401, error: 'Invalid session' })
    return
  }
}

export default authenticate
