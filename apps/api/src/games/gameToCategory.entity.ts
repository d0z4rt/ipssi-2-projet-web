import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from 'typeorm'

import { Category } from './category.entity.js'
import { Game } from './game.entity.js'

@Entity('games_categories')
export class GameToCategory {
  @PrimaryColumn({ type: 'uuid' })
  game_id!: string

  @PrimaryColumn({ type: 'varchar', length: 255 })
  game_slug!: string

  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'game_id', referencedColumnName: 'id' },
    { name: 'game_slug', referencedColumnName: 'slug' }
  ])
  game!: Game

  @PrimaryColumn({ type: 'uuid' })
  category_id!: string

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: Category

  @CreateDateColumn({
    type: 'timestamptz',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP'
  })
  created_at!: Date
}
