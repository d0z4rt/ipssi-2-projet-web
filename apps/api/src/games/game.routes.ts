import authenticate from '#middlewares/authenticate.js'
import validate from '#middlewares/validate.js'
import { Router } from 'express'

import controller from './game.controller.js'
import { gameUserStatusSchema } from './game.schemas.js'

const router = Router()

router.get('/', controller.getAll)
router.get('/status/me', authenticate, controller.getAllUserGameStatuses)
router.get('/:id', controller.getOne)
router.get('/:id/status/summary', controller.getStatusSummary)
router.get('/:id/status', authenticate, controller.getUserStatus)
router.put(
  '/:id/status',
  authenticate,
  validate(gameUserStatusSchema),
  controller.setUserStatus
)

export default router
