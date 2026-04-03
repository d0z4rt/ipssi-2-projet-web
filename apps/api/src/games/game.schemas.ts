import { z } from 'zod'

import { GameUserStatusType } from './gameUserStatus.entity.js'

export const gameUserStatusSchema = z.object({
  status: z.enum(GameUserStatusType).nullish(),
  is_favorite: z.boolean(),
  active: z.boolean()
})

export type GameUserStatusSchema = z.infer<typeof gameUserStatusSchema>
