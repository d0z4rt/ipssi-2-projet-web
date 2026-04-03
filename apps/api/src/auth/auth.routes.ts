import validate from '#middlewares/validate.js'
import { Router } from 'express'
import rateLimit from 'express-rate-limit'

import controller from './auth.controller.js'
import { loginSchema, registerSchema } from './auth.schemas.js'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, try again later' }
})

const router = Router()

router.post('/login', authLimiter, validate(loginSchema), controller.login)
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  controller.register
)

export default router
