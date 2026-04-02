import { z } from 'zod'

export const createReviewSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().max(2000).nullish(),
  rating: z.number().int().min(0).max(10).nullish(),
  game_id: z.uuid(),
  tags: z.array(z.string().min(1).max(255)).nullish()
})

export type CreateReviewSchema = z.infer<typeof createReviewSchema>

export const updateReviewSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().max(2000).optional(),
  rating: z.number().int().min(0).max(10).optional(),
  game_id: z.uuid().optional(),
  tags: z.array(z.string().min(1).max(255)).optional()
})

export type UpdateReviewSchema = z.infer<typeof updateReviewSchema>
