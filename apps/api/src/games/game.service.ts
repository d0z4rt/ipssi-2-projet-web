import { AppDataSource } from '../config/typeorm-datasource.js'
import { Game } from './game.entity.js'

const gameRepository = AppDataSource.getRepository(Game)

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
  }
}

export default gameService
