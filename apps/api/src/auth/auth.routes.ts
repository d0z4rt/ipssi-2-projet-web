import validate from '#middlewares/validate.js'
import { Router } from 'express'

import controller from './auth.controller.js'
import { loginSchema, registerSchema } from './auth.schemas.js'

const router = Router()

router.post('/login', validate(loginSchema), controller.login)
router.post('/register', validate(registerSchema), controller.register)

export default router
