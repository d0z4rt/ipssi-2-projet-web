import { Router } from 'express'

import controller from './game.controller.js'

const router = Router()

router.get('/', controller.getAll)
router.get('/:id', controller.getOne)

export default router
