import type { RequestHandler } from 'express'

import { ApiError } from '../utils/errors.js'
import { gameUserStatusSchema } from './game.schemas.js'
import service from './game.service.js'

type ControllerHandlers = {
  getAll: RequestHandler
  getOne: RequestHandler
  getStatusSummary: RequestHandler
  getUserStatuses: RequestHandler
  setUserStatus: RequestHandler
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

      if (!summary) {
        throw new ApiError(404, 'Jeu non trouvé')
      }

      res.json({ summary })
    } catch (err) {
      next(err)
    }
  },

  getUserStatuses: async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(500, 'Cette route nécessite une authentification')
      }

      const id = String(req.params.id)
      const game = await service.getOne(id)
      if (!game) {
        throw new ApiError(404, 'Jeu non trouvé')
      }

      const statuses = await service.getUserStatusesByGame(id, req.user.id)
      res.json({ statuses })
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
      const parsedBody = gameUserStatusSchema.parse(req.body)

      if (parsedBody.active) {
        const currentStatuses = await service.getUserStatusesByGame(
          id,
          req.user.id
        )
        const incompatibleStatus = service.getIncompatibleStatus(
          currentStatuses,
          parsedBody.status
        )

        if (incompatibleStatus) {
          const message =
            parsedBody.status === 'favorite'
              ? "Retirez d'abord le statut Envie d'y jouer pour mettre Coup de coeur."
              : parsedBody.status === 'want_to_play'
                ? "Retirez d'abord le statut Coup de coeur pour mettre Envie d'y jouer."
                : parsedBody.status === 'played'
                  ? "Retirez d'abord le statut En cours pour mettre Fini."
                  : "Retirez d'abord le statut Fini pour mettre En cours."

          throw new ApiError(400, message)
        }
      }

      const statuses = await service.setUserStatusByGame(
        id,
        req.user.id,
        parsedBody.status,
        parsedBody.active
      )

      if (!statuses) {
        throw new ApiError(404, 'Jeu non trouvé')
      }

      res.json({ statuses })
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
