import { ReviewResponse } from './reviews'

export type GameResponse = {
  id: string
  slug: string
  steam_app_id?: number | string | null
  name: string
  description: string | null
  cover_image: string | null
  banner_image: string | null
  screenshots: string[] | null
  platforms: string[] | null
  developer: string | null
  released_at: string | null
  reviews?: ReviewResponse[] | null
  created_at?: string
  categories?: string[] | null
}

export type GameStatusesSummaryResponse = {
  played: number
  want_to_play: number
  playing: number
  favorite: number
}

export type GameUserStatusType = 'played' | 'want_to_play' | 'playing'

export type GameUserStatusResponse = {
  id: string
  game: GameResponse
  game_id: string
  user_id: string
  is_favorite: boolean
  status: GameUserStatusType
}

export type GameUserStatusRequest = {
  // active is used to delete or upsert a game status
  active: boolean
  status: GameUserStatusType | null
  is_favorite: boolean
}
