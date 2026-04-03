import type { RequestHandler } from 'express'

import { ApiError } from '#utils/errors.js'

import type {
  CreateReviewSchema,
  UpdateReviewSchema
} from './review.schemas.js'

import service from './review.service.js'

type ControllerHandlers = {
  create: RequestHandler<{}, {}, CreateReviewSchema>
  getAll: RequestHandler
  getOne: RequestHandler
  update: RequestHandler<{ id: string }, {} | null, UpdateReviewSchema>
  delete: RequestHandler
  addLike: RequestHandler
  removeLike: RequestHandler
}

const reviewController: ControllerHandlers = {
  create: async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(500, 'Cette route nécessite une authentification')
      }
      const created = await service.create(req.user.id, req.body)
      res.status(201).json(created)
    } catch (err) {
      next(err)
    }
  },

  getAll: async (_req, res, next) => {
    try {
      const reviews = await service.getAll()
      if (!reviews || reviews.length < 1) {
        throw new ApiError(404, 'Aucune critique trouvé')
      }
      res.json(reviews)
    } catch (err) {
      next(err)
    }
  },

  getOne: async (req, res, next) => {
    try {
      const id = String(req.params.id)
      const review = await service.getOne(id)
      if (!review) {
        throw new ApiError(404, 'Critique non trouvée')
      }
      res.json(review)
    } catch (err) {
      next(err)
    }
  },

  update: async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(500, 'Cette route nécessite une authentification')
      }
      const id = String(req.params.id)
      const updated = await service.update(id, req.body, req.user)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  },

  delete: async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(500, 'Cette route nécessite une authentification')
      }
      const id = String(req.params.id)
      await service.delete(id, req.user)
      res.json({ message: 'Critique supprimée' })
    } catch (err) {
      next(err)
    }
  },

  addLike: async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(500, 'Cette route nécessite une authentification')
      }
      const id = String(req.params.id)
      const review = await service.addLike(id, req.user.id)
      res.json(review)
    } catch (err) {
      next(err)
    }
  },

  removeLike: async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(500, 'Cette route nécessite une authentification')
      }
      const id = String(req.params.id)
      const review = await service.removeLike(id, req.user.id)
      res.json(review)
    } catch (err) {
      next(err)
    }
  }
}

export default reviewController
