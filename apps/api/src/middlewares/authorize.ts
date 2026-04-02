import type { RequestHandler } from 'express'

import { ApiError } from '#utils/errors.js'

const authorize = (role: 'admin' | 'curator'): RequestHandler => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(500, 'Cette route nécessite une authentification')
      }

      const isAdmin = req.user.is_admin
      const isCurator = req.user.is_curator

      if (role === 'admin' && !isAdmin) {
        throw new ApiError(403, 'Accès refusé')
      }

      if (role === 'curator' && !isCurator && !isAdmin) {
        throw new ApiError(403, 'Accès refusé')
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

export default authorize
