import type { RequestHandler } from 'express'

import { ApiError } from '#utils/errors.js'

import { createReviewSchema } from './review.schemas.js'
import service from './review.service.js'

const reviewController: Record<string, RequestHandler> = {
  create: async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(500, 'Cette route nécessite une authentification')
      }
      const review = createReviewSchema.parse(req.body)
      const created = await service.create(req.user.id, review)
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

  addLike: async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(500, 'Cette route nécessite une authentification')
      }
      const id = String(req.params.id)
      const review = await service.addLike(req.user.id, id)
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
      const review = await service.removeLike(req.user.id, id)
      res.json(review)
    } catch (err) {
      next(err)
    }
  }
}

export default reviewController
