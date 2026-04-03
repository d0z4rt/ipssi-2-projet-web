import type { Handler } from 'express'

import { createLogger } from '../utils/logger.js'

const logger = createLogger({
  prefix: 'HTTP', // Add a prefix to the log
  timestamp: true // Include timestamps in logs
})

const requestLogger: Handler = (req, _res, next) => {
  logger.log(`${req.method} ${req.url}`)
  next()
}
export default requestLogger
