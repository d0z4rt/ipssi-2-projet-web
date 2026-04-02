import authenticate from '#middlewares/authenticate.js'
import { Router } from 'express'

import controller from './game.controller.js'

const router = Router()

router.get('/', controller.getAll)
router.get('/statuses/me', authenticate, controller.getAllUserGameStatuses)
router.get('/:id', controller.getOne)
router.get('/:id/status', authenticate, controller.getUserStatuses)
router.put('/:id/status', authenticate, controller.setUserStatus)

export default router
