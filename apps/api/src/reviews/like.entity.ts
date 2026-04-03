import { User } from '#users/user.entity.js'
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique
} from 'typeorm'

import { Review } from './review.entity.js'

@Entity('likes')
@Unique(['review_id', 'user_id'])
export class Like {
  @PrimaryColumn({ type: 'uuid' })
  review_id!: string

  @ManyToOne(() => Review, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review!: Review

  @PrimaryColumn({ type: 'uuid' })
  user_id!: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @CreateDateColumn({
    type: 'timestamptz',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP'
  })
  created_at!: Date
}
