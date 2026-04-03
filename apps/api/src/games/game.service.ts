import { ApiError } from '#utils/errors.js'

import { AppDataSource } from '../config/typeorm-datasource.js'
import { Game } from './game.entity.js'
import { GameUserStatusSchema } from './game.schemas.js'
import { GameUserStatus } from './gameUserStatus.entity.js'

const gameRepository = AppDataSource.getRepository(Game)
const gameUserStatusRepository = AppDataSource.getRepository(GameUserStatus)

const gameService = {
  getAll: async () => {
    return gameRepository.find({
      relations: ['games_to_categories', 'games_to_categories.category']
    })
  },
  getOne: async (id: string) => {
    return gameRepository.findOne({
      where: { id },
      relations: [
        'games_to_categories',
        'games_to_categories.category',
        'reviews'
      ]
    })
  },
  getUserStatusByGame: async (gameId: string, userId: string) => {
    const game = await gameRepository.findOne({ where: { id: gameId } })
    if (!game) {
      throw new ApiError(404, 'Jeu non trouvé')
    }

    const status = await gameUserStatusRepository.findOne({
      where: {
        game_id: gameId,
        user_id: userId
      }
    })

    return status
  },
  getAllUserGameStatuses: async (userId: string) => {
    const entries = await gameUserStatusRepository.find({
      where: {
        user_id: userId
      },
      relations: ['game']
    })
    return entries
  },
  getStatusSummaryByGame: async (gameId: string) => {
    const game = await gameRepository.findOne({ where: { id: gameId } })

    if (!game) {
      throw new ApiError(404, 'Jeu non trouvé')
    }

    const entries = await gameUserStatusRepository.find({
      where: {
        game_id: gameId
      }
    })

    const summary = {
      played: 0,
      want_to_play: 0,
      playing: 0,
      favorite: 0
    }

    for (const entry of entries) {
      if (entry.status) {
        summary[entry.status] += 1
      }
      if (entry.is_favorite) {
        summary.favorite += 1
      }
    }

    return summary
  },
  setUserStatusByGame: async (
    gameId: string,
    userId: string,
    dto: GameUserStatusSchema
  ) => {
    const game = await gameRepository.findOne({ where: { id: gameId } })

    if (!game) {
      throw new ApiError(404, 'Jeu non trouvé')
    }

    const existing = await gameUserStatusRepository.findOne({
      where: {
        game_id: gameId,
        user_id: userId
      }
    })

    if (dto.active) {
      if (!existing) {
        const created = gameUserStatusRepository.create({
          game_id: gameId,
          user_id: userId,
          is_favorite: !!dto.is_favorite,
          status: dto.status
        })
        await gameUserStatusRepository.save(created)
      } else {
        await gameUserStatusRepository.update(existing.id, {
          is_favorite: !!dto.is_favorite,
          status: dto.status
        })
      }
    } else if (existing) {
      await gameUserStatusRepository.remove(existing)
    }

    return gameService.getUserStatusByGame(gameId, userId)
  }
}

export default gameService
