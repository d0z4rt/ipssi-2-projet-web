import type { RequestHandler } from 'express'

import { ApiError } from '../utils/errors.js'
import service from './game.service.js'

const gameController: Record<string, RequestHandler> = {
  getAll: async (_req, res, next) => {
    try {
      const games = await service.getAll()
      if (!games || games.length < 1) {
        throw new ApiError(404, 'Aucun jeu trouvé')
      }
      res.json(games)
    } catch (err) {
      next(err)
    }
  },

  getOne: async (req, res, next) => {
    try {
      const id = String(req.params.id)
      const game = await service.getOne(id)
      if (!game) {
        throw new ApiError(404, 'Jeu non trouvé')
      }
      res.json(game)
    } catch (err) {
      next(err)
    }
  }
}

export default gameController
