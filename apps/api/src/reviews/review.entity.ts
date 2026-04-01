import { Game } from '#games/game.entity.js'
import { User } from '#users/user.entity.js'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

import { Like } from './like.entity.js'
import { ReviewToTag } from './reviewToTag.entity.js'
import { Tag } from './tag.entity.js'

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255 })
  title!: string

  @Column({ type: 'text', nullable: true })
  content: string | null = null

  @Column({ type: 'int', nullable: true })
  rating: number | null = null

  @Column({ type: 'uuid' })
  user_id!: string

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({ type: 'uuid' })
  game_id!: string

  @ManyToOne('Game', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game!: Game

  @OneToMany(() => ReviewToTag, (reviewToTag) => reviewToTag.review)
  reviews_to_tags: ReviewToTag[] | null = null

  @OneToMany(() => Like, (like) => like.review)
  likes: Like[] | null = null

  @CreateDateColumn({
    type: 'timestamptz',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP'
  })
  created_at!: Date

  get tags(): Tag[] {
    return this.reviews_to_tags?.map((reviewToTag) => reviewToTag.tag) || []
  }
}
