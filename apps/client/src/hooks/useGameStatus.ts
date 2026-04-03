import { useEffect, useState } from 'react'

import { gameService } from '../services/api'
import { GameStatusesSummaryResponse, GameUserStatusType } from '../types/games'

const createStatusLoadingState = (): Record<
  GameUserStatusType | 'favorite',
  boolean
> => ({
  played: false,
  want_to_play: false,
  playing: false,
  favorite: false
})

const createEmptyStatusSummary = (): GameStatusesSummaryResponse => ({
  played: 0,
  want_to_play: 0,
  playing: 0,
  favorite: 0
})

export const useGameStatus = (
  gameId: string | undefined,
  isAuthenticated: boolean
) => {
  const [gameStatus, setGameStatus] = useState<GameUserStatusType | null>(null)
  const [gameFavorite, setGameFavorite] = useState<boolean>(false)
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false)
  const [statusSummary, setStatusSummary] =
    useState<GameStatusesSummaryResponse>(createEmptyStatusSummary)
  const [statusError, setStatusError] = useState('')
  const [statusLoadingByType, setStatusLoadingByType] = useState<
    Record<GameUserStatusType | 'favorite', boolean>
  >(createStatusLoadingState)

  useEffect(() => {
    const fetchStatus = async () => {
      if (!gameId || !isAuthenticated) {
        setGameStatus(null)
        return
      }

      setIsLoadingStatuses(true)
      setStatusError('')
      try {
        const status = await gameService.getMyStatus(gameId)
        setGameStatus(status?.status ?? null)
        setGameFavorite(status?.is_favorite || false)
      } catch (error) {
        setStatusError(
          error instanceof Error
            ? error.message
            : 'Impossible de charger vos statuts pour ce jeu.'
        )
      } finally {
        setIsLoadingStatuses(false)
      }
    }

    void fetchStatus()
  }, [gameId, isAuthenticated])

  useEffect(() => {
    if (!gameId) {
      setStatusSummary(createEmptyStatusSummary())
      return
    }

    let isMounted = true

    const fetchStatusSummary = async () => {
      try {
        const summary = await gameService.getStatusSummary(gameId)
        if (isMounted) {
          setStatusSummary(summary)
        }
      } catch {
        if (isMounted) {
          setStatusSummary(createEmptyStatusSummary())
        }
      }
    }

    void fetchStatusSummary()
    const intervalId = window.setInterval(() => {
      void fetchStatusSummary()
    }, 10000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [gameId])

  const toggleStatus = async (status: GameUserStatusType | 'favorite') => {
    if (!gameId) {
      return
    }

    if (!isAuthenticated) {
      setStatusError('Connectez-vous pour gerer vos statuts de jeu.')
      return
    }

    setStatusError('')
    setStatusLoadingByType((current) => ({
      ...current,
      [status]: true
    }))

    try {
      if (status === 'favorite') {
        const res = await gameService.setMyStatus(
          gameId,
          gameStatus,
          !gameFavorite,
          true
        )
        setGameStatus(res?.status ?? null)
        setGameFavorite(res?.is_favorite ?? false)
      } else {
        let newStatus: GameUserStatusType | null = status
        if (gameStatus === status) {
          setGameStatus(null)
          newStatus = null
        }
        const res = await gameService.setMyStatus(
          gameId,
          newStatus,
          gameFavorite,
          true
        )
        setGameStatus(res?.status ?? null)
        setGameFavorite(res?.is_favorite ?? false)
      }

      try {
        const summary = await gameService.getStatusSummary(gameId)
        setStatusSummary(summary)
      } catch {}
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : 'Impossible de mettre a jour ce statut.'
      )
    } finally {
      setStatusLoadingByType((current) => ({
        ...current,
        [status]: false
      }))
    }
  }

  return {
    gameStatus,
    gameFavorite,
    isLoadingStatuses,
    statusSummary,
    statusError,
    statusLoadingByType,
    toggleStatus,
    setStatusError
  }
}
