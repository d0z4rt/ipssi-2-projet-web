import { AppDataSource } from '../config/typeorm-datasource.js'
import { Game } from './game.entity.js'
import { GameUserStatus, GameUserStatusType } from './gameUserStatus.entity.js'

const gameRepository = AppDataSource.getRepository(Game)
const gameUserStatusRepository = AppDataSource.getRepository(GameUserStatus)

type GameStatusSummary = Record<GameUserStatusType, number>

const createEmptyStatusSummary = (): GameStatusSummary => ({
  played: 0,
  want_to_play: 0,
  playing: 0,
  favorite: 0
})

const gameService = {
  getAll: async () => {
    return gameRepository.find({
      relations: ['games_to_categories', 'games_to_categories.category']
    })
  },
  getOne: async (id: string) => {
    return gameRepository.findOne({
      where: { id },
      relations: [
        'games_to_categories',
        'games_to_categories.category',
        'reviews'
      ]
    })
  },
  getUserStatusesByGame: async (gameId: string, userId: string) => {
    const statuses = await gameUserStatusRepository.find({
      where: {
        game_id: gameId,
        user_id: userId
      }
    })

    return statuses.map((status) => status.status)
  },
  getAllUserGameStatuses: async (userId: string) => {
    const entries = await gameUserStatusRepository.find({
      where: {
        user_id: userId
      },
      relations: ['game']
    })

    const groupedByGameId = new Map<
      string,
      {
        game: Game
        statuses: GameUserStatusType[]
      }
    >()

    for (const entry of entries) {
      const current = groupedByGameId.get(entry.game_id)
      if (!current) {
        groupedByGameId.set(entry.game_id, {
          game: entry.game,
          statuses: [entry.status]
        })
        continue
      }
      if (!current.statuses.includes(entry.status)) {
        current.statuses.push(entry.status)
      }
    }

    return Array.from(groupedByGameId.values())
  },
  getIncompatibleStatus: (
    activeStatuses: GameUserStatusType[],
    nextStatus: GameUserStatusType
  ): GameUserStatusType | null => {
    const incompatibleByStatus: Record<
      GameUserStatusType,
      GameUserStatusType[]
    > = {
      played: [GameUserStatusType.PLAYING],
      playing: [GameUserStatusType.PLAYED],
      want_to_play: [GameUserStatusType.FAVORITE],
      favorite: [GameUserStatusType.WANT_TO_PLAY]
    }

    return (
      activeStatuses.find((status) =>
        incompatibleByStatus[nextStatus].includes(status)
      ) ?? null
    )
  },
  getStatusSummaryByGame: async (gameId: string) => {
    const game = await gameRepository.findOne({ where: { id: gameId } })

    if (!game) {
      return null
    }

    const entries = await gameUserStatusRepository.find({
      where: {
        game_id: gameId
      }
    })

    const summary = createEmptyStatusSummary()

    for (const entry of entries) {
      summary[entry.status] += 1
    }

    return summary
  },
  setUserStatusByGame: async (
    gameId: string,
    userId: string,
    status: GameUserStatusType,
    active: boolean
  ) => {
    const game = await gameRepository.findOne({ where: { id: gameId } })

    if (!game) {
      return null
    }

    const existing = await gameUserStatusRepository.findOne({
      where: {
        game_id: gameId,
        user_id: userId,
        status
      }
    })

    if (active) {
      if (!existing) {
        const created = gameUserStatusRepository.create({
          game_id: gameId,
          user_id: userId,
          status
        })
        await gameUserStatusRepository.save(created)
      }
    } else if (existing) {
      await gameUserStatusRepository.remove(existing)
    }

    return gameService.getUserStatusesByGame(gameId, userId)
  }
}

export default gameService
