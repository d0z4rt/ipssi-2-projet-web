import { DataSource } from 'typeorm'

import config from './config.js'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.password,
  database: config.db.database,
  synchronize: true,
  logging: false,
  entities: [],
  migrations: ['src/migrations/**/*.ts']
})
