import { ReviewResponse } from '../types/reviews'
import {
  api,
  authService,
  Catalog,
  GameStats,
  getApiErrorMessage,
  invalidateCatalog,
  loadCatalog
} from './api'

export type Review = {
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

export const mapReview = (
  review: ReviewResponse,
  catalog: Catalog,
  currentUserId?: string | null,
  currentUsername?: string,
  reviewCountsByUserId?: Map<string, number>
): Review => {
  const game = catalog.games.find((entry) => entry.id === review.game_id)
  const liked = getReviewLikedByUser(review, currentUserId)

  return {
    id: review.id,
    gameId: review.game_id,
    gameTitle: game?.name ?? game?.slug,
    gameImage: game?.cover_image ?? game?.banner_image ?? undefined,
    userId: review.user_id,
    username:
      currentUserId && currentUserId === review.user_id
        ? (currentUsername ?? 'You')
        : review.user.username,
    userReviewCount: reviewCountsByUserId?.get(review.user_id),
    rating: review.rating ?? 0,
    title: review.title,
    content: review.content ?? '',
    likes: review.like_count || 0,
    createdAt: review.created_at,
    liked,
    isPositive: review.rating == null ? undefined : review.rating >= 6,
    tags: (review.tags ??
      review.reviews_to_tags
        ?.map((entry) => entry.tag?.name)
        .filter(Boolean)) as string[] | undefined
  }
}

export const getReviewLikedByUser = (
  review: ReviewResponse,
  userId?: string | null
) => {
  if (!userId || !Array.isArray(review.likes)) {
    return false
  }

  return review.likes.some((like) => like.user_id === userId)
}

const buildReviewCatalog = async (): Promise<Review[]> => {
  const catalog = await loadCatalog()
  const currentUser = authService.getStoredUser()
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
  const currentUser = authService.getStoredUser()
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

export const fetchReviewsRaw = async (): Promise<ReviewResponse[]> => {
  try {
    const response = await api.get<ReviewResponse[]>('/v1/reviews')
    return response.data
  } catch {
    // Reviews should never block games rendering in the UI.
    return []
  }
}

export const getReviewStatsByGame = (reviews: ReviewResponse[]) => {
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
      likeCount: current.likeCount + (review.like_count || 0)
    })
  }

  return statsByGameId
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
      const response = await api.post<ReviewResponse>(
        '/v1/reviews',
        {
          title: review.title,
          content: review.content ?? null,
          rating: review.rating ?? null,
          game_id: review.gameId,
          tags: review.tags ?? null
        },
        {
          headers: authService.getAuthHeaders()
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
        authService.getStoredUser()?.id,
        authService.getStoredUser()?.username,
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
    const response = await api.put<ReviewResponse>(
      `/v1/reviews/${reviewId}`,
      {
        title: review.title,
        content: review.content,
        rating: review.rating,
        game_id: review.gameId,
        tags: review.tags
      },
      {
        headers: authService.getAuthHeaders()
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
      authService.getStoredUser()?.id,
      authService.getStoredUser()?.username,
      reviewCountsByUserId
    )
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/v1/reviews/${reviewId}`, {
      headers: authService.getAuthHeaders()
    })
    invalidateCatalog()
  },

  toggleLike: async (reviewId: string, liked = false): Promise<Review> => {
    const currentUser = authService.getStoredUser()
    if (!currentUser) {
      throw new Error('Authentication required')
    }

    if (liked) {
      await api.delete(`/v1/reviews/${reviewId}/like`, {
        headers: authService.getAuthHeaders()
      })
    } else {
      await api.post(`/v1/reviews/${reviewId}/like`, undefined, {
        headers: authService.getAuthHeaders()
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
