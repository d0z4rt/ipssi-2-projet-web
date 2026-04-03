import axios from 'axios'

import type {
  AdminUser,
  ApiAuthResponse,
  ApiAuthUser,
  ApiGame,
  ApiGameStatusesResponse,
  ApiGameStatusSummaryResponse,
  ApiReview,
  ApiUserGameWithStatuses,
  AuthSession,
  AuthUser,
  Catalog,
  ContactRequest,
  ContactResponse,
  Game,
  GameStatusSummary,
  GameUserStatus,
  Review,
  UserGameWithStatuses
} from './api-types'

import {
  getReviewStatsByGame,
  mapGame,
  mapReview,
  normalizeSlug
} from './api-mappers'

export type {
  AdminUser,
  AuthSession,
  AuthUser,
  ContactRequest,
  ContactResponse,
  Game,
  GameStatusSummary,
  GameUserStatus,
  Review,
  UserGameWithStatuses
} from './api-types'

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
      mapReview(
        review,
        catalog,
        currentUser?.id,
        currentUser?.username,
        reviewCountsByUserId
      )
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

  return mapReview(
    review,
    catalog,
    currentUser?.id,
    currentUser?.username,
    reviewCountsByUserId
  )
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

  getMyStatus: async (gameId: string): Promise<ApiGameStatusesResponse> => {
    try {
      const response = await api.get<ApiGameStatusesResponse>(
        `/v1/games/${gameId}/status`,
        {
          headers: getAuthHeaders()
        }
      )
      return response.data
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          'Unable to retrieve your statuses for this game'
        )
      )
    }
  },

  getStatusSummary: async (gameId: string): Promise<GameStatusSummary> => {
    try {
      const response = await api.get<ApiGameStatusSummaryResponse>(
        `/v1/games/${gameId}/status/summary`
      )

      return response.data.summary
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Unable to retrieve game status summary')
      )
    }
  },

  setMyStatus: async (
    gameId: string,
    status: GameUserStatus | null,
    isFavorite: boolean,
    active: boolean
  ) => {
    try {
      const response = await api.put<ApiGameStatusesResponse>(
        `/v1/games/${gameId}/status`,
        {
          status,
          active,
          is_favorite: isFavorite
        },
        {
          headers: getAuthHeaders()
        }
      )
      return response.data
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Unable to update your game status')
      )
    }
  },

  getMyGamesWithStatuses: async (): Promise<UserGameWithStatuses[]> => {
    try {
      const response = await api.get<ApiUserGameWithStatuses[]>(
        '/v1/games/status/me',
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

  getLatestReviews: async (limit = 3): Promise<Review[]> => {
    const reviews = await buildReviewCatalog()
    return reviews
      .slice()
      .sort(
        (left, right) =>
          right.likes - left.likes ||
          new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime()
      )
      .slice(0, limit)
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
        getStoredUser()?.username,
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
      getStoredUser()?.username,
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
