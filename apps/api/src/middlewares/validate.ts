import type { RequestHandler } from 'express'

import { type ZodSchema, z } from 'zod'

export default function validate<T>(schema: ZodSchema<T>): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: z.prettifyError(result.error)
      })
      return
    }
    req.body = result.data
    next()
  }
}
