import { Session } from '#auth/session.entity.js'
import { User } from '#users/user.entity.js'

declare global {
  namespace Express {
    interface Request {
      user?: User
      session?: Session
    }
  }
}
