import gameRoutes from '#games/game.routes.js'
import reviewRoutes from '#reviews/review.routes.js'
import { type Handler, Router } from 'express'

import { logger } from './utils/logger.js'

const router = Router()

const defaultRoutes: { path: string; route: Handler }[] = [
  {
    path: '/health',
    route: (_req, res) => {
      res.send({
        statusCode: 200,
        message: 'Api running'
      })
    }
  },
  {
    path: '/v1/games',
    route: gameRoutes
  },
  {
    path: '/v1/reviews',
    route: reviewRoutes
  },
  {
    path: '/',
    route: (_req, res) => {
      res.send('Welcome to  IPSSI 2 Projet Web')
    }
  }
]

for (const { path, route } of defaultRoutes) {
  logger.debug(`Registering route ${path}`)
  router.use(path, route)
}

export default router
