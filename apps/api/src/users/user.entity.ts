import { Review } from '#reviews/review.entity.js'
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255, unique: true })
  username!: string

  @Column({ type: 'varchar', length: 255, unique: true })
  mail!: string

  @Column({ type: 'varchar', length: 255 })
  password!: string

  @Column({ type: 'bool', default: false })
  is_admin!: string

  @Column({ type: 'bool', default: false })
  is_curator!: string

  @OneToMany(() => Review, (review) => review.user)
  reviews?: Review[]

  @CreateDateColumn({
    type: 'timestamptz',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP'
  })
  created_at!: Date
}
