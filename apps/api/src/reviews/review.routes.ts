import authenticate from '#middlewares/authenticate.js'
import authorize from '#middlewares/authorize.js'
import validate from '#middlewares/validate.js'
import { Router } from 'express'

import controller from './review.controller.js'
import { createReviewSchema, updateReviewSchema } from './review.schemas.js'

const router = Router()

router.get('/', controller.getAll)
router.get('/:id', controller.getOne)
router.post(
  '/',
  authenticate,
  authorize('curator'),
  validate(createReviewSchema),
  controller.create
)
router.put(
  '/:id',
  authenticate,
  authorize('curator'),
  validate(updateReviewSchema),
  controller.update
)
router.delete('/:id', authenticate, authorize('curator'), controller.delete)
router.post('/:id/like', authenticate, controller.addLike)
router.delete('/:id/like', authenticate, controller.removeLike)

export default router
