import type { Response } from 'express'

import { logger } from './logger.js'

export function handleError(res: Response, error: unknown) {
  logger.error('handleError:', error)
  res.status(500).json({ error: 'Server internal error' })
}

export class ApiError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    stack = ''
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
