import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from 'typeorm'

import { Review } from './review.entity.js'
import { Tag } from './tag.entity.js'

@Entity('reviews_tags')
export class ReviewToTag {
  @PrimaryColumn({ type: 'uuid' })
  review_id!: string

  @ManyToOne(() => Review, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review!: Review

  @PrimaryColumn({ type: 'uuid' })
  tag_id!: string

  @ManyToOne(() => Tag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag!: Tag

  @CreateDateColumn({
    type: 'timestamptz',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP'
  })
  created_at!: Date
}
