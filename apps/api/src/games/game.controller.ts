import type { RequestHandler } from 'express'

import type { GameUserStatusSchema } from './game.schemas.js'

import { ApiError } from '../utils/errors.js'
import service from './game.service.js'

type ControllerHandlers = {
  getAll: RequestHandler
  getOne: RequestHandler
  getStatusSummary: RequestHandler
  getUserStatus: RequestHandler
  setUserStatus: RequestHandler<{ id: string }, {} | null, GameUserStatusSchema>
  getAllUserGameStatuses: RequestHandler
}

const gameController: ControllerHandlers = {
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
  },

  getStatusSummary: async (req, res, next) => {
    try {
      const id = String(req.params.id)
      const summary = await service.getStatusSummaryByGame(id)

      res.json({ summary })
    } catch (err) {
      next(err)
    }
  },

  getUserStatus: async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(500, 'Cette route nécessite une authentification')
      }

      const id = String(req.params.id)

      const status = await service.getUserStatusByGame(id, req.user.id)

      res.json(status)
    } catch (err) {
      next(err)
    }
  },

  setUserStatus: async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(500, 'Cette route nécessite une authentification')
      }

      const id = String(req.params.id)

      const status = await service.setUserStatusByGame(
        id,
        req.user.id,
        req.body
      )

      res.json(status)
    } catch (err) {
      next(err)
    }
  },

  getAllUserGameStatuses: async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(500, 'Cette route nécessite une authentification')
      }

      const gamesWithStatuses = await service.getAllUserGameStatuses(
        req.user.id
      )
      res.json(gamesWithStatuses)
    } catch (err) {
      next(err)
    }
  }
}

export default gameController
