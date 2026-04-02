import authenticate from '#middlewares/authenticate.js'
import authorize from '#middlewares/authorize.js'
import { Router } from 'express'

import usersController from './user.controller.js'

const router = Router()

router.get('/', authenticate, authorize('admin'), usersController.getAll)

export default router
