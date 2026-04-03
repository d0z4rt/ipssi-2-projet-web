import type { LoginResponse } from '../types/auth'
import type {
  GameResponse,
  GameStatusesSummaryResponse,
  GameUserStatusResponse,
  GameUserStatusType
} from '../types/games'
import type { ReviewResponse } from '../types/reviews'
import type { UserResponse } from '../types/users'

export type Role = 'user' | 'curator' | 'admin'

export interface AuthUser {
  id: string
  username: string
  email: string
  role: Role
  isCurator: boolean
  isAdmin: boolean
}

export interface AuthSession {
  token: string
  expiresAt: string
  user: AuthUser
}

export interface Game {
  id: string
  slug: string
  title: string
  steamAppId?: string
  description: string
  genre: string
  platform: string[]
  rating: number
  image: string
  bannerImage?: string
  screenshots?: string[]
  releaseDate: string
  developer: string
  reviewCount?: number
  likeCount?: number
}

export type GameUserStatus = GameUserStatusType

export type GameStatusSummary = Record<GameUserStatus | 'favorite', number>

export interface UserGameWithStatuses {
  game: Game
  statuses: GameUserStatus[]
}

export interface Review {
  id: string
  gameId: string
  gameTitle?: string
  gameImage?: string
  userId: string
  username: string
  userReviewCount?: number
  rating: number
  title?: string
  content: string
  likes: number
  createdAt: string
  liked: boolean
  isPositive?: boolean
  tags?: string[]
}

export interface ContactRequest {
  firstName: string
  lastName: string
  email: string
  subject: string
  category: 'support' | 'bug-report' | 'business' | 'other'
  message: string
  acceptedPolicy: boolean
}

export interface ContactResponse {
  id: string
  status: 'received'
  createdAt: string
}

export type AdminUser = UserResponse

export type ApiAuthUser = Omit<UserResponse, 'created_at'>

export type ApiAuthResponse = LoginResponse

export type ApiLike = {
  review_id: string
  user_id: string
}

export type ApiReviewTag = {
  tag?: { name: string } | null
}

export type ApiReview = Omit<ReviewResponse, 'likes' | 'tags'> & {
  likes?: number | ApiLike[] | null
  reviews_to_tags?: ApiReviewTag[] | null
}

export type ApiGame = Omit<
  GameResponse,
  'steam_app_id' | 'categories' | 'reviews'
> & {
  steam_app_id?: number | string | null
  categories?: string[] | null
  reviews?: ApiReview[] | null
}

export type ApiGameStatusesResponse = Omit<GameUserStatusResponse, 'status'> & {
  status: GameUserStatus
}

export type ApiGameStatusSummaryResponse = GameStatusesSummaryResponse

export type ApiUserGameWithStatuses = {
  game: ApiGame
  statuses: GameUserStatus[]
}

export type Catalog = {
  games: ApiGame[]
  reviews: ApiReview[]
}

export type GameStats = {
  rating: number
  reviewCount: number
  likeCount: number
}
