import { z } from 'zod'

export const loginSchema = z.object({
  mail: z.email(),
  password: z.string().min(1).max(255)
})

export const registerSchema = z.object({
  username: z.string().min(1).max(255),
  mail: z.email(),
  is_curator: z.boolean().default(false),
  password: z.string().min(8).max(255)
})

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
