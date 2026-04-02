import { Review } from '#reviews/review.entity.js'
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

import { GameToCategory } from './gameToCategory.entity.js'
import { GameUserStatus } from './gameUserStatus.entity.js'

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string

  @Column({ type: 'int', unique: true })
  steam_app_id!: number

  @Column({ type: 'varchar', length: 255 })
  name!: string

  @Column({ type: 'text', nullable: true })
  description: string | null = null

  @Column({ type: 'varchar', length: 255, nullable: true })
  cover_image: string | null = null

  @Column({ type: 'varchar', length: 255, nullable: true })
  banner_image: string | null = null

  @Column({ type: 'varchar', array: true, nullable: true })
  screenshots: string[] | null = null

  @Column({ type: 'varchar', array: true, nullable: true })
  platforms: string[] | null = null

  @Column({ type: 'varchar', length: 255, nullable: true })
  developer: string | null = null

  @CreateDateColumn({
    type: 'timestamptz',
    precision: 3,
    nullable: true
  })
  released_at: Date | null = null

  @OneToMany(() => GameToCategory, (gameToCategory) => gameToCategory.game)
  games_to_categories: GameToCategory[] | null = null

  @OneToMany(() => Review, (review) => review.game)
  reviews: Review[] | null = null

  @OneToMany(() => GameUserStatus, (gameUserStatus) => gameUserStatus.game)
  user_statuses: GameUserStatus[] | null = null

  @CreateDateColumn({
    type: 'timestamptz',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP'
  })
  created_at!: Date

  get categories(): string[] {
    return (
      this.games_to_categories?.map(
        (reviewToTag) => reviewToTag.category.name
      ) || []
    )
  }

  /**
   * Returns a JSON representation of the game, omitting the games_to_categories field
   */
  toJSON() {
    const { games_to_categories: _, ...rest } = this
    return {
      ...rest,
      categories: this.categories
    }
  }
}
