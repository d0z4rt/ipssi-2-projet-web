import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { GameToCategory } from './gameToCategory.entity.js'

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string

  @OneToMany(() => GameToCategory, (gameToCategory) => gameToCategory.category)
  games_to_categories?: GameToCategory[]
}
