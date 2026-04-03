import type {
  ApiGame,
  ApiReview,
  Catalog,
  Game,
  GameStats,
  Review
} from './api-types'

export const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const createPlaceholderImage = (title: string, width: number, height: number) =>
  `https://placehold.co/${width}x${height}/111827/e5e7eb?text=${encodeURIComponent(title)}`

export const getReviewLikesCount = (review: ApiReview) => {
  if (Array.isArray(review.likes)) {
    return review.likes.length
  }

  if (typeof review.likes === 'number') {
    return review.likes
  }

  return 0
}

export const getReviewLikedByUser = (
  review: ApiReview,
  userId?: string | null
) => {
  if (!userId || !Array.isArray(review.likes)) {
    return false
  }

  return review.likes.some((like) => like.user_id === userId)
}

export const getReviewStatsByGame = (reviews: ApiReview[]) => {
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

export const mapGame = (game: ApiGame, stats?: GameStats): Game => ({
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

export const mapReview = (
  review: ApiReview,
  catalog: Catalog,
  currentUserId?: string | null,
  currentUsername?: string,
  reviewCountsByUserId?: Map<string, number>
): Review => {
  const game = catalog.games.find((entry) => entry.id === review.game_id)
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
        ? (currentUsername ?? 'You')
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
