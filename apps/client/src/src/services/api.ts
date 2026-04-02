import axios from 'axios'

export const API_BASE_URL =
  (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL ?? 'http://localhost:4000'
const AUTH_USER_KEY = 'gamecritiq_user'
const AUTH_TOKEN_KEY = 'gamecritiq_token'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

type Role = 'user' | 'curator' | 'admin'

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

export type GameUserStatus = 'played' | 'want_to_play' | 'playing' | 'favorite'

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

export interface AdminUser {
  id: string
  username: string
  mail: string
  is_admin: boolean
  is_curator: boolean
  created_at: string
}

type ApiAuthUser = {
  id: string
  username: string
  mail: string
  is_admin: boolean
  is_curator: boolean
}

type ApiAuthResponse = {
  token: string
  expires_at: string
  user: ApiAuthUser
}

type ApiGame = {
  id: string
  slug: string
  name: string
  steam_app_id?: number | string | null
  description: string | null
  cover_image: string | null
  banner_image: string | null
  screenshots: string[] | null
  platforms: string[] | null
  developer: string | null
  released_at: string | null
  categories: string[] | null
  reviews?: ApiReview[] | null
}

type ApiLike = {
  review_id: string
  user_id: string
}

type ApiReviewTag = {
  tag?: { name: string } | null
}

type ApiReview = {
  id: string
  title: string
  content: string | null
  rating: number | null
  user_id: string
  game_id: string
  created_at: string
  likes?: number | ApiLike[] | null
  reviews_to_tags?: ApiReviewTag[] | null
}

type ApiGameStatusesResponse = {
  statuses: GameUserStatus[]
}

type ApiUserGameWithStatuses = {
  game: ApiGame
  statuses: GameUserStatus[]
}

type Catalog = {
  games: ApiGame[]
  reviews: ApiReview[]
}

type GameStats = {
  rating: number
  reviewCount: number
  likeCount: number
}

let catalogPromise: Promise<Catalog> | null = null
let gameSnapshotById = new Map<string, Game>()
let gameSnapshotBySlug = new Map<string, Game>()

const safeParseJson = <T>(value: string | null): T | null => {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

const getStoredUser = () =>
  safeParseJson<AuthUser>(localStorage.getItem(AUTH_USER_KEY))

const getStoredToken = () => localStorage.getItem(AUTH_TOKEN_KEY)

const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const createPlaceholderImage = (title: string, width: number, height: number) =>
  `https://placehold.co/${width}x${height}/111827/e5e7eb?text=${encodeURIComponent(title)}`

const invalidateCatalog = () => {
  catalogPromise = null
}

const getAuthHeaders = () => {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Authentication required')
  }
  return {
    Authorization: `Bearer ${token}`
  }
}

const normalizeAuthUser = (user: ApiAuthUser): AuthUser => ({
  id: user.id,
  username: user.username,
  email: user.mail,
  role: user.is_admin ? 'admin' : user.is_curator ? 'curator' : 'user',
  isCurator: user.is_curator,
  isAdmin: user.is_admin
})

const normalizeAuthResponse = (payload: ApiAuthResponse): AuthSession => ({
  token: payload.token,
  expiresAt: payload.expires_at,
  user: normalizeAuthUser(payload.user)
})

const fetchGamesRaw = async (): Promise<ApiGame[]> => {
  try {
    const response = await api.get<ApiGame[]>('/v1/games')
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return []
    }
    throw error
  }
}

const fetchReviewsRaw = async (): Promise<ApiReview[]> => {
  try {
    const response = await api.get<ApiReview[]>('/v1/reviews')
    return response.data
  } catch {
    // Reviews should never block games rendering in the UI.
    return []
  }
}

const loadCatalog = async (): Promise<Catalog> => {
  if (!catalogPromise) {
    catalogPromise = Promise.all([fetchGamesRaw(), fetchReviewsRaw()]).then(
      ([games, reviews]) => ({
        games,
        reviews
      })
    )
  }

  try {
    return await catalogPromise
  } catch (error) {
    catalogPromise = null
    throw error
  }
}

const getReviewStatsByGame = (reviews: ApiReview[]) => {
  const statsByGameId = new Map<string, GameStats>()

  for (const review of reviews) {
    const current = statsByGameId.get(review.game_id) ?? {
      rating: 0,
      reviewCount: 0,
      likeCount: 0
    }

    const nextReviewCount = current.reviewCount + 1
    const reviewRating = review.rating ?? 0
    const nextRating =
      (current.rating * current.reviewCount + reviewRating) / nextReviewCount

    statsByGameId.set(review.game_id, {
      rating: Number.isFinite(nextRating) ? nextRating : 0,
      reviewCount: nextReviewCount,
      likeCount: current.likeCount + getReviewLikesCount(review)
    })
  }

  return statsByGameId
}

const mapGame = (game: ApiGame, stats?: GameStats): Game => ({
  id: game.id,
  slug: game.slug || normalizeSlug(game.name),
  title: game.name,
  steamAppId: game.steam_app_id == null ? undefined : String(game.steam_app_id),
  description: game.description ?? '',
  genre: game.categories?.[0] ?? 'Unknown',
  platform: game.platforms ?? [],
  rating: stats?.rating ?? 0,
  image: game.cover_image ?? createPlaceholderImage(game.name, 600, 900),
  bannerImage:
    game.banner_image ??
    createPlaceholderImage(`${game.name} banner`, 1600, 900),
  screenshots: game.screenshots ?? undefined,
  releaseDate: game.released_at ?? new Date(0).toISOString(),
  developer: game.developer ?? 'Unknown',
  reviewCount: stats?.reviewCount,
  likeCount: stats?.likeCount
})

const updateGameSnapshots = (games: Game[]) => {
  gameSnapshotById = new Map(games.map((game) => [game.id, game]))
  gameSnapshotBySlug = new Map(games.map((game) => [game.slug, game]))
}

const buildGameCatalog = async (): Promise<Game[]> => {
  const { games, reviews } = await loadCatalog()
  const statsByGameId = getReviewStatsByGame(reviews)
  const mappedGames = games.map((game) =>
    mapGame(game, statsByGameId.get(game.id))
  )

  updateGameSnapshots(mappedGames)
  return mappedGames
}

const loadGamesOnly = async (): Promise<Game[]> => {
  const games = await fetchGamesRaw()
  const mappedGames = games.map((game) => mapGame(game))
  updateGameSnapshots(mappedGames)
  return mappedGames
}

const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    const responseError = error.response?.data as
      | { error?: string; details?: string }
      | undefined
    return (
      responseError?.error ||
      responseError?.details ||
      error.message ||
      fallbackMessage
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
}

const getReviewLikesCount = (review: ApiReview) => {
  if (Array.isArray(review.likes)) {
    return review.likes.length
  }

  if (typeof review.likes === 'number') {
    return review.likes
  }

  return 0
}

const getReviewLikedByUser = (review: ApiReview, userId?: string | null) => {
  if (!userId || !Array.isArray(review.likes)) {
    return false
  }

  return review.likes.some((like) => like.user_id === userId)
}

const mapReview = (
  review: ApiReview,
  catalog: Catalog,
  currentUserId?: string | null,
  reviewCountsByUserId?: Map<string, number>
): Review => {
  const game = catalog.games.find((entry) => entry.id === review.game_id)
  const currentUser = currentUserId ? getStoredUser() : null
  const likes = getReviewLikesCount(review)
  const liked = getReviewLikedByUser(review, currentUserId)

  return {
    id: review.id,
    gameId: review.game_id,
    gameTitle: game?.name ?? game?.slug,
    gameImage: game?.cover_image ?? game?.banner_image ?? undefined,
    userId: review.user_id,
    username:
      currentUserId && currentUserId === review.user_id
        ? (currentUser?.username ?? 'You')
        : `Member ${review.user_id.slice(0, 6)}`,
    userReviewCount: reviewCountsByUserId?.get(review.user_id),
    rating: review.rating ?? 0,
    title: review.title,
    content: review.content ?? '',
    likes,
    createdAt: review.created_at,
    liked,
    isPositive: review.rating == null ? undefined : review.rating >= 6,
    tags: review.reviews_to_tags
      ?.map((entry) => entry.tag?.name)
      .filter(Boolean) as string[] | undefined
  }
}

const buildReviewCatalog = async (): Promise<Review[]> => {
  const catalog = await loadCatalog()
  const currentUser = getStoredUser()
  const reviewCountsByUserId = new Map<string, number>()

  for (const review of catalog.reviews) {
    reviewCountsByUserId.set(
      review.user_id,
      (reviewCountsByUserId.get(review.user_id) ?? 0) + 1
    )
  }

  return catalog.reviews
    .slice()
    .sort(
      (left, right) =>
        new Date(right.created_at).getTime() -
        new Date(left.created_at).getTime()
    )
    .map((review) =>
      mapReview(review, catalog, currentUser?.id, reviewCountsByUserId)
    )
}

const refreshReviewById = async (reviewId: string): Promise<Review> => {
  const catalog = await loadCatalog()
  const currentUser = getStoredUser()
  const reviewCountsByUserId = new Map<string, number>()

  for (const review of catalog.reviews) {
    reviewCountsByUserId.set(
      review.user_id,
      (reviewCountsByUserId.get(review.user_id) ?? 0) + 1
    )
  }

  const review = catalog.reviews.find((entry) => entry.id === reviewId)
  if (!review) {
    throw new Error('Review not found')
  }

  return mapReview(review, catalog, currentUser?.id, reviewCountsByUserId)
}

export const getGameSlugById = (gameId: string): string | undefined =>
  gameSnapshotById.get(gameId)?.slug

export const authService = {
  login: async (payload: { mail: string; password: string }) => {
    try {
      const response = await api.post<ApiAuthResponse>(
        '/v1/auth/login',
        payload
      )
      return normalizeAuthResponse(response.data)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Login failed'))
    }
  },

  register: async (payload: {
    username: string
    mail: string
    password: string
    is_curator: boolean
  }) => {
    try {
      const response = await api.post<ApiAuthResponse>(
        '/v1/auth/register',
        payload
      )
      return normalizeAuthResponse(response.data)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Registration failed'))
    }
  },

  saveSession: (session: AuthSession) => {
    setAuthToken(session.token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user))
  },

  clearSession: () => {
    setAuthToken(null)
    localStorage.removeItem(AUTH_USER_KEY)
  },

  getSession: () => ({
    token: getStoredToken(),
    user: getStoredUser()
  })
}

export const gameService = {
  getGames: async (): Promise<Game[]> => {
    try {
      return await buildGameCatalog()
    } catch {
      return loadGamesOnly()
    }
  },

  getGameById: async (id: string): Promise<Game | undefined> => {
    const cachedGame = gameSnapshotById.get(id)
    if (cachedGame) {
      return cachedGame
    }

    const response = await api.get<ApiGame>(`/v1/games/${id}`)
    const rawGame = response.data
    const statsByGameId = getReviewStatsByGame(rawGame.reviews ?? [])
    const mappedGame = mapGame(rawGame, statsByGameId.get(rawGame.id))
    gameSnapshotById.set(mappedGame.id, mappedGame)
    gameSnapshotBySlug.set(mappedGame.slug, mappedGame)
    return mappedGame
  },

  getGameBySlug: async (slug: string): Promise<Game | undefined> => {
    const decodedSlug = decodeURIComponent(slug)
    const normalizedSlug = normalizeSlug(decodedSlug)
    const cachedGame =
      gameSnapshotBySlug.get(decodedSlug) ||
      gameSnapshotBySlug.get(slug) ||
      Array.from(gameSnapshotBySlug.values()).find(
        (game) =>
          game.slug === decodedSlug ||
          game.id === decodedSlug ||
          normalizeSlug(game.slug) === normalizedSlug ||
          normalizeSlug(game.title) === normalizedSlug
      )
    if (cachedGame) {
      return cachedGame
    }

    const games = await gameService.getGames()
    return games.find(
      (game) =>
        game.slug === decodedSlug ||
        game.slug === slug ||
        game.id === decodedSlug ||
        normalizeSlug(game.slug) === normalizedSlug ||
        normalizeSlug(game.title) === normalizedSlug
    )
  },

  getTrendingGames: async (): Promise<Game[]> => {
    const games = await gameService.getGames()
    return games
      .slice()
      .sort((left, right) => right.rating - left.rating)
      .slice(0, 10)
  },

  getLatestReleases: async (): Promise<Game[]> => {
    const games = await gameService.getGames()
    return games
      .slice()
      .sort(
        (left, right) =>
          new Date(right.releaseDate).getTime() -
          new Date(left.releaseDate).getTime()
      )
      .slice(0, 5)
  },

  getMyStatuses: async (gameId: string): Promise<GameUserStatus[]> => {
    try {
      const response = await api.get<ApiGameStatusesResponse>(
        `/v1/games/${gameId}/status`,
        {
          headers: getAuthHeaders()
        }
      )
      return response.data.statuses
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          'Unable to retrieve your statuses for this game'
        )
      )
    }
  },

  setMyStatus: async (
    gameId: string,
    status: GameUserStatus,
    active: boolean
  ): Promise<GameUserStatus[]> => {
    try {
      const response = await api.put<ApiGameStatusesResponse>(
        `/v1/games/${gameId}/status`,
        {
          status,
          active
        },
        {
          headers: getAuthHeaders()
        }
      )
      return response.data.statuses
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Unable to update your game status')
      )
    }
  },

  getMyGamesWithStatuses: async (): Promise<UserGameWithStatuses[]> => {
    try {
      const response = await api.get<ApiUserGameWithStatuses[]>(
        '/v1/games/statuses/me',
        {
          headers: getAuthHeaders()
        }
      )

      return response.data.map((entry) => ({
        game: mapGame(entry.game),
        statuses: entry.statuses
      }))
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          'Unable to retrieve your personal game statuses'
        )
      )
    }
  }
}

export const reviewService = {
  getAll: async (): Promise<Review[]> => buildReviewCatalog(),

  getReviewsByGame: async (gameId: string): Promise<Review[]> => {
    const reviews = await buildReviewCatalog()
    return reviews.filter((review) => review.gameId === gameId)
  },

  getLatestReviews: async (): Promise<Review[]> => {
    const reviews = await buildReviewCatalog()
    return reviews.slice(0, 3)
  },

  getUserReviews: async (userId: string): Promise<Review[]> => {
    const reviews = await buildReviewCatalog()
    return reviews.filter((review) => review.userId === userId)
  },

  addReview: async (review: {
    title: string
    content?: string | null
    rating?: number | null
    gameId: string
    tags?: string[] | null
  }): Promise<Review> => {
    try {
      const response = await api.post<ApiReview>(
        '/v1/reviews',
        {
          title: review.title,
          content: review.content ?? null,
          rating: review.rating ?? null,
          game_id: review.gameId,
          tags: review.tags ?? null
        },
        {
          headers: getAuthHeaders()
        }
      )
      invalidateCatalog()
      const nextCatalog = await loadCatalog()
      const reviewCountsByUserId = new Map<string, number>()

      for (const entry of nextCatalog.reviews) {
        reviewCountsByUserId.set(
          entry.user_id,
          (reviewCountsByUserId.get(entry.user_id) ?? 0) + 1
        )
      }

      return mapReview(
        response.data,
        nextCatalog,
        getStoredUser()?.id,
        reviewCountsByUserId
      )
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to publish review'))
    }
  },

  updateReview: async (
    reviewId: string,
    review: {
      title?: string
      content?: string | null
      rating?: number | null
      gameId?: string
      tags?: string[] | null
    }
  ): Promise<Review> => {
    const response = await api.put<ApiReview>(
      `/v1/reviews/${reviewId}`,
      {
        title: review.title,
        content: review.content,
        rating: review.rating,
        game_id: review.gameId,
        tags: review.tags
      },
      {
        headers: getAuthHeaders()
      }
    )
    invalidateCatalog()
    const nextCatalog = await loadCatalog()
    const reviewCountsByUserId = new Map<string, number>()

    for (const entry of nextCatalog.reviews) {
      reviewCountsByUserId.set(
        entry.user_id,
        (reviewCountsByUserId.get(entry.user_id) ?? 0) + 1
      )
    }

    return mapReview(
      response.data,
      nextCatalog,
      getStoredUser()?.id,
      reviewCountsByUserId
    )
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/v1/reviews/${reviewId}`, {
      headers: getAuthHeaders()
    })
    invalidateCatalog()
  },

  toggleLike: async (reviewId: string, liked = false): Promise<Review> => {
    const currentUser = getStoredUser()
    if (!currentUser) {
      throw new Error('Authentication required')
    }

    if (liked) {
      await api.delete(`/v1/reviews/${reviewId}/like`, {
        headers: getAuthHeaders()
      })
    } else {
      await api.post(`/v1/reviews/${reviewId}/like`, undefined, {
        headers: getAuthHeaders()
      })
    }

    invalidateCatalog()
    const refreshed = await refreshReviewById(reviewId)
    return {
      ...refreshed,
      liked: !liked
    }
  }
}

export const adminService = {
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get<AdminUser[]>('/v1/users', {
      headers: getAuthHeaders()
    })
    return response.data
  },
  getStats: async () => {
    const [catalog, users] = await Promise.all([
      loadCatalog(),
      adminService.getUsers().catch(() => [])
    ])

    return {
      totalUsers: users.length,
      totalGames: catalog.games.length,
      totalReviews: catalog.reviews.length,
      reportedReviews: null
    }
  }
}

export const contactService = {
  submit: async (payload: ContactRequest): Promise<ContactResponse> => {
    const response = await api.post<ContactResponse>('/contact', payload)
    return response.data
  }
}
