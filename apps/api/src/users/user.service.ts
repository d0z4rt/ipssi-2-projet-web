import { AppDataSource } from '#config/typeorm-datasource.js'
import { User } from '#users/user.entity.js'
import argon2 from 'argon2'

const userRepository = AppDataSource.getRepository(User)

const userService = {
  create: async (username: string, mail: string, password: string) => {
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id, // Recommended: argon2id
      memoryCost: 65536, // 64 MB
      timeCost: 3, // 3 iterations
      parallelism: 4 // 4 parallel threads
    })

    const user = userRepository.create({
      username,
      mail,
      password: hashedPassword
    })

    const saved_user = await userRepository.save(user)

    return saved_user
  }
}

export default userService
