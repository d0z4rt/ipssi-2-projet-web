import type { RequestHandler } from 'express'

import userService from '#users/user.service.js'
import { ApiError } from '#utils/errors.js'

type ControllerHandlers = {
  getAll: RequestHandler
}

const usersController: ControllerHandlers = {
  getAll: async (_req, res, next) => {
    try {
      const users = await userService.getAll()

      if (!users || users.length < 1) {
        throw new ApiError(404, 'Aucun utilisateur trouve')
      }

      res.json(
        users.map((user) => ({
          id: user.id,
          username: user.username,
          mail: user.mail,
          is_admin: user.is_admin,
          is_curator: user.is_curator,
          created_at: user.created_at
        }))
      )
    } catch (err) {
      next(err)
    }
  }
}

export default usersController
