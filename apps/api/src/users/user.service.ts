import { AppDataSource } from '#config/typeorm-datasource.js'
import { User } from '#users/user.entity.js'
import argon2 from 'argon2'

const userRepository = AppDataSource.getRepository(User)

const userService = {
  create: async (dto: {
    username: string
    mail: string
    password: string
    is_curator?: boolean
  }) => {
    const hashedPassword = await argon2.hash(dto.password, {
      type: argon2.argon2id, // Recommended: argon2id
      memoryCost: 65536, // 64 MB
      timeCost: 3, // 3 iterations
      parallelism: 4 // 4 parallel threads
    })

    const user = userRepository.create({
      username: dto.username,
      mail: dto.mail,
      password: hashedPassword,
      is_curator: dto.is_curator
    })

    const saved_user = await userRepository.save(user)

    return saved_user
  },
  getOneByMail: async (mail: string) => {
    return userRepository.findOne({ where: { mail } })
  }
}

export default userService
