import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { ReviewToTag } from './reviewToTag.entity.js'

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string

  @OneToMany(() => ReviewToTag, (reviewToTag) => reviewToTag.tag)
  reviews_to_tags?: ReviewToTag[]
}
