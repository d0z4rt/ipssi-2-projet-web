import 'reflect-metadata'
import colors from 'picocolors'

import app from './app.js'
import config from './config/config.js'
import { AppDataSource } from './config/typeorm-datasource.js'
import { createLogger } from './utils/logger.js'

const appStartTime = performance.now()
const logger = createLogger()

AppDataSource.initialize()
  .then(async () => {
    // Run migrations
    const migrations = await AppDataSource.runMigrations()

    // Start the server
    app.listen(config.app.httpPort, (err) => {
      if (err) {
        logger.error('Error when starting the server :', err)
        process.exit(1)
      }
      const header = ` ${colors.bold(colors.green('API'))} ready in ${colors.bold(Math.ceil(performance.now() - appStartTime))} ms`
      const url = ` ➜  url:  ${colors.cyan(`http://localhost:${config.app.httpPort}`)}`
      const mode = ` ➜  mode: ${config.app.mode}`
      const migration = ` ➜  migrations: ${migrations.length}`
      logger.log(`${header}\n${url}\n${mode}\n${migration}`)
    })
  })
  .catch((err) => {
    logger.error('Error initializing TypeORM :', err)
    process.exit(1)
  })
