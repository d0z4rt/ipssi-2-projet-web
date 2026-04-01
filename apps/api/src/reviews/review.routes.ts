import authenticate from '#middlewares/authenticate.js'
import validate from '#middlewares/validate.js'
import { Router } from 'express'

import controller from './review.controller.js'
import { createReviewSchema } from './review.schemas.js'

const router = Router()

router.get('/', controller.getAll)
router.get('/:id', controller.getOne)
router.post('/', authenticate, validate(createReviewSchema), controller.create)
router.post('/like', authenticate, controller.addLike)
router.delete('/like', authenticate, controller.removeLike)

export default router
