import { AppDataSource } from '#config/typeorm-datasource.js'
import { User } from '#users/user.entity.js'
import argon2 from 'argon2'

const userRepository = AppDataSource.getRepository(User)

const userService = {
  create: async (username: string, mail: string, password: string) => {
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4
    })

    const user = await userRepository.save({
      username,
      mail,
      password: hashedPassword
    })

    return user
  }
}

export default userService
