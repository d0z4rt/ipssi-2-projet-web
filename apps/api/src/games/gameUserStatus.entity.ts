import { User } from '#users/user.entity.js'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm'

import { Game } from './game.entity.js'

export enum GameUserStatusType {
  PLAYED = 'played',
  WANT_TO_PLAY = 'want_to_play',
  PLAYING = 'playing',
  FAVORITE = 'favorite'
}

@Entity('games_users_statuses')
@Unique('uq_game_user_status', ['game_id', 'user_id', 'status'])
export class GameUserStatus {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'uuid' })
  game_id!: string

  @Column({ type: 'uuid' })
  user_id!: string

  @Column({
    type: 'enum',
    enum: GameUserStatusType
  })
  status!: GameUserStatusType

  @ManyToOne(() => Game, (game) => game.user_statuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game!: Game

  @ManyToOne(() => User, (user) => user.game_statuses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User
}
