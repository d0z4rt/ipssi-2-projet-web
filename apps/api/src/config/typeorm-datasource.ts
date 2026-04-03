import { Session } from '#auth/session.entity.js'
import { Category } from '#games/category.entity.js'
import { Game } from '#games/game.entity.js'
import { GameToCategory } from '#games/gameToCategory.entity.js'
import { GameUserStatus } from '#games/gameUserStatus.entity.js'
import { Like } from '#reviews/like.entity.js'
import { Review } from '#reviews/review.entity.js'
import { ReviewToTag } from '#reviews/reviewToTag.entity.js'
import { Tag } from '#reviews/tag.entity.js'
import { User } from '#users/user.entity.js'
import { DataSource } from 'typeorm'

import config from './config.js'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.password,
  database: config.db.database,
  synchronize: config.app.mode === 'development',
  logging: false,
  entities: [
    User,
    Session,
    Review,
    Like,
    Tag,
    ReviewToTag,
    Game,
    GameUserStatus,
    Category,
    GameToCategory
  ],
  migrations: ['src/migrations/**/*.ts']
})
