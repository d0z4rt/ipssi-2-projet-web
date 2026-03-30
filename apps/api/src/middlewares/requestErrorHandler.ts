import type { ErrorRequestHandler } from 'express'

import z, { ZodError } from 'zod'

import { ApiError } from '../utils/errors.js'

const requestErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: z.prettifyError(err)
    })
    return
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message || 'Server internal error'
    })
    return
  }

  if (err instanceof Error) {
    res.status(500).json({
      error: err.message || 'Server internal error'
    })
    return
  }

  res.status(500).json({
    error: 'Server internal error'
  })
}

export default requestErrorHandler
