import type { ErrorRequestHandler } from 'express'

import { createLogger } from '../utils/logger.js'

const logger = createLogger({
  prefix: 'HTTP', // Add a prefix to the log
  timestamp: true // Include timestamps in logs
})

const requestErrorLogger: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(
    `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
    err
  )
  next(err)
}
export default requestErrorLogger
