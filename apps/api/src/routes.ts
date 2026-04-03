import authRoutes from '#auth/auth.routes.js'
import gameRoutes from '#games/game.routes.js'
import reviewRoutes from '#reviews/review.routes.js'
import usersRoutes from '#users/user.routes.js'
import { type Handler, Router } from 'express'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { logger } from './utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
    path: '/v1/auth',
    route: authRoutes
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
    path: '/v1/users',
    route: usersRoutes
  },
  {
    path: '/v1/images',
    route: express.static(path.join(__dirname, 'images'), {
      setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
        res.setHeader('Access-Control-Allow-Origin', '*')
      }
    })
  },
  {
    path: '/',
    route: (_req, res) => {
      res.status(404).send({
        statusCode: 404,
        message: 'Route not found'
      })
    }
  }
]

for (const { path, route } of defaultRoutes) {
  logger.debug(`Registering route ${path}`)
  router.use(path, route)
}

export default router
