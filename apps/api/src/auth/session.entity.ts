import { User } from '#users/user.entity.js'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255 })
  token_hash!: string

  @Column({ type: 'uuid' })
  user_id!: string

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @Column({
    type: 'timestamptz',
    precision: 3,
    nullable: true
  })
  last_activity_at!: Date

  @Column({
    type: 'timestamptz',
    precision: 3
  })
  expires_at!: Date

  @CreateDateColumn({
    type: 'timestamptz',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP'
  })
  created_at!: Date
}
