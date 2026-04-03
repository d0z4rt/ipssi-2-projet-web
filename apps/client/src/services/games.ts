import axios from 'axios'

import {
  GameResponse,
  GameStatusesSummaryResponse,
  GameUserStatusResponse,
  GameUserStatusType
} from '../types/games'
import {
  api,
  authService,
  getApiErrorMessage,
  getReviewStatsByGame,
  loadCatalog
} from './api'

export type Game = {
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

export type UserGameWithStatuses = {
  game: Game
  statuses: Array<GameUserStatusType | 'favorite'>
}

let gameSnapshotBySlug = new Map<string, Game>()
let gameSnapshotById = new Map<string, Game>()

const createPlaceholderImage = (title: string, width: number, height: number) =>
  `https://placehold.co/${width}x${height}/111827/e5e7eb?text=${encodeURIComponent(title)}`

const getAuthHeaders = () => {
  const token = authService.getStoredToken()
  if (!token) {
    throw new Error('Authentication required')
  }
  return {
    Authorization: `Bearer ${token}`
  }
}

export type GameStats = {
  rating: number
  reviewCount: number
  likeCount: number
}

export const mapGame = (game: GameResponse, stats?: GameStats): Game => ({
  id: game.id,
  slug: game.slug,
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

export const gameService = {
  fetchGamesRaw: async (): Promise<GameResponse[]> => {
    try {
      const response = await api.get<GameResponse[]>('/v1/games')
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return []
      }
      throw error
    }
  },

  loadGamesOnly: async (): Promise<Game[]> => {
    const games = await gameService.fetchGamesRaw()
    const mappedGames = games.map((game) => mapGame(game))
    updateGameSnapshots(mappedGames)
    return mappedGames
  },

  getGames: async (): Promise<Game[]> => {
    try {
      return await buildGameCatalog()
    } catch {
      return gameService.loadGamesOnly()
    }
  },

  getGameSlugById: (gameId: string): string | undefined =>
    gameSnapshotById.get(gameId)?.slug,

  getGameById: async (id: string): Promise<Game | undefined> => {
    const cachedGame = gameSnapshotById.get(id)
    if (cachedGame) {
      return cachedGame
    }

    const response = await api.get<GameResponse>(`/v1/games/${id}`)
    const rawGame = response.data
    const statsByGameId = getReviewStatsByGame(rawGame.reviews ?? [])
    const mappedGame = mapGame(rawGame, statsByGameId.get(rawGame.id))
    gameSnapshotById.set(mappedGame.id, mappedGame)
    gameSnapshotBySlug.set(mappedGame.slug, mappedGame)
    return mappedGame
  },

  getGameBySlug: async (slug: string): Promise<Game | undefined> => {
    const decodedSlug = decodeURIComponent(slug)
    const cachedGame =
      gameSnapshotBySlug.get(decodedSlug) ||
      gameSnapshotBySlug.get(slug) ||
      Array.from(gameSnapshotBySlug.values()).find(
        (game) => game.slug === decodedSlug
      )
    if (cachedGame) {
      return cachedGame
    }

    const games = await gameService.getGames()
    return games.find((game) => game.slug === decodedSlug || game.slug === slug)
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

  getMyStatus: async (gameId: string): Promise<GameUserStatusResponse> => {
    try {
      const response = await api.get<GameUserStatusResponse>(
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

  getStatusSummary: async (
    gameId: string
  ): Promise<GameStatusesSummaryResponse> => {
    try {
      const response = await api.get<GameStatusesSummaryResponse>(
        `/v1/games/${gameId}/status/summary`
      )

      return response.data
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Unable to retrieve game status summary')
      )
    }
  },

  setMyStatus: async (
    gameId: string,
    status: GameUserStatusType | null,
    isFavorite: boolean,
    active: boolean
  ) => {
    try {
      const response = await api.put<GameUserStatusResponse>(
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
      const response = await api.get<GameUserStatusResponse[]>(
        '/v1/games/status/me',
        {
          headers: getAuthHeaders()
        }
      )

      const groupedByGameId = new Map<
        string,
        {
          game: GameResponse
          statuses: Array<GameUserStatusType | 'favorite'>
        }
      >()

      for (const entry of response.data) {
        const current = groupedByGameId.get(entry.game.id)
        const nextStatuses = current?.statuses ?? []

        if (entry.status && !nextStatuses.includes(entry.status)) {
          nextStatuses.push(entry.status)
        }

        if (entry.is_favorite && !nextStatuses.includes('favorite')) {
          nextStatuses.push('favorite')
        }

        groupedByGameId.set(entry.game.id, {
          game: entry.game,
          statuses: nextStatuses
        })
      }

      return Array.from(groupedByGameId.values()).map((entry) => ({
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
