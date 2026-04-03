import { useEffect, useState } from 'react'

import { Game, Review, gameService, reviewService } from '../services/api'

export const useGameDetails = (slug: string | undefined) => {
  const [game, setGame] = useState<Game | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGameData = async () => {
      if (!slug) {
        return
      }

      try {
        setLoading(true)
        const gameData = await gameService.getGameBySlug(slug)
        if (!gameData) {
          setGame(null)
          setReviews([])
          return
        }

        setGame(gameData)

        try {
          const reviewsData = await reviewService.getReviewsByGame(gameData.id)
          setReviews(reviewsData)
        } catch {
          setReviews([])
        }
      } catch {
        setGame(null)
        setReviews([])
      } finally {
        setLoading(false)
      }
    }

    void fetchGameData()
  }, [slug])

  return {
    game,
    reviews,
    loading,
    setReviews
  }
}
