import { Pool } from 'pg'

import { logger } from '../utils/logger.js'
import config from './config.js'

export const dbPool = new Pool(config.db)

dbPool.on('error', (err) => {
  logger.error('PostgreSQL pool error:', err)
})
