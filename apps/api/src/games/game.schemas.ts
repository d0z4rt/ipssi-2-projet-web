import { z } from 'zod'

import { GameUserStatusType } from './gameUserStatus.entity.js'

export const gameUserStatusSchema = z.object({
  status: z.enum(GameUserStatusType),
  active: z.boolean()
})

export type GameUserStatusSchema = z.infer<typeof gameUserStatusSchema>
