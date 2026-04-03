export type ReviewResponse = {
  id: string
  title: string
  content: string | null
  rating: number | null
  user_id: string
  user: { id: string; username: string }
  game_id: string
  likes?: LikeResponse[] | null
  like_count: number
  created_at: string
  tags?: string[]
  reviews_to_tags?:
    | {
        tag?: {
          name: string
        } | null
      }[]
    | null
}

export type CreateReviewRequest = {
  title: string
  content: string | null
  rating: number | null
  game_id: string
  tags: string[] | null
}

export type UpdateReviewRequest = {
  title?: string
  content?: string | null
  rating?: number | null
  tags?: string[] | null
}

export type LikeResponse = {
  review_id: string
  user_id: string
  created_at: string
}
