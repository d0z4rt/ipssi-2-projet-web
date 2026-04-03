import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  API_BASE_URL,
  gameService,
  Review,
  reviewService
} from '../services/api'

type ReviewCardProps = {
  review: Review
  onLikeUpdate?: (updatedReview: Review) => void
  showGameInfo?: boolean
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onLikeUpdate,
  showGameInfo = true
}) => {
  const [isLiking, setIsLiking] = useState(false)
  const [localReview, setLocalReview] = useState(review)
  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    try {
      // Optimistic update
      const updated = {
        ...localReview,
        liked: !localReview.liked,
        likes: localReview.liked ? localReview.likes - 1 : localReview.likes + 1
      }
      setLocalReview(updated)
      // Actual API call
      const serverUpdated = await reviewService.toggleLike(
        review.id,
        localReview.liked
      )
      setLocalReview(serverUpdated)
      if (onLikeUpdate) onLikeUpdate(serverUpdated)
    } catch {
      // Revert on error
      setLocalReview(review)
    } finally {
      setIsLiking(false)
    }
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    // Format like "il y a 4 jours" or specific date
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const gameSlugOrId =
    gameService.getGameSlugById(localReview.gameId) || localReview.gameId
  const reviewUrl = `/games/${encodeURIComponent(gameSlugOrId)}#review-${localReview.id}`

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className={`rounded-lg overflow-hidden flex flex-col h-full`}
    >
      {/* Game Info Header (Optional) */}
      {showGameInfo && localReview.gameTitle && (
        <div className="flex items-center gap-3 p-5 pb-4 border-b border-gray-800/50 bg-cardBg">
          {localReview.gameImage ? (
            <img
              src={`${API_BASE_URL}/v1/${localReview.gameImage}`}
              alt={localReview.gameTitle}
              className="w-10 h-14 object-cover rounded"
            />
          ) : (
            <div className="w-10 h-14 rounded bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700" />
          )}
          <Link
            to={`/games/${gameService.getGameSlugById(localReview.gameId) || localReview.gameId}`}
            className="font-medium text-white hover:text-blue-400 transition-colors"
          >
            {localReview.gameTitle}
          </Link>
        </div>
      )}

      {/* Clickable Content Wrapper */}
      <Link
        to={showGameInfo ? reviewUrl : '#'}
        onClick={(e) => {
          if (!showGameInfo) e.preventDefault()
        }}
        className={`bg-cardBg border border-gray-800 hover:border-gray-700 hover:bg-gray-900/30 transition-colors flex flex-col flex-grow p-5 ${localReview.isPositive === true ? 'border-t-2 border-t-ratingGood' : localReview.isPositive === false ? 'border-t-2 border-t-ratingBad' : ''}`}
      >
        {/* User & Rating Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-darkBg border border-gray-700 rounded font-bold text-xl text-white">
            {localReview.rating}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localReview.username}`}
                alt={localReview.username}
                className="w-full h-full"
              />
            </div>
            <div>
              <h4 className="text-white font-medium text-sm">
                {localReview.username}
              </h4>
              <span className="text-gray-500 text-xs">
                {localReview.userReviewCount || 0} critiques
              </span>
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-grow">
          {localReview.title && (
            <h3 className="text-white font-bold text-lg mb-2 leading-tight">
              {localReview.title}
            </h3>
          )}
          <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-4">
            {localReview.content}
          </p>

          {localReview.tags && localReview.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {localReview.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-blue-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800/50 mt-auto">
          <span className="text-gray-500 text-xs">
            le {formatDate(localReview.createdAt)}
          </span>

          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{
                scale: 0.9
              }}
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                await handleLike()
              }}
              disabled={isLiking}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${localReview.liked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}
            >
              <motion.div
                animate={
                  localReview.liked
                    ? {
                        scale: [1, 1.2, 1]
                      }
                    : {}
                }
                transition={{
                  duration: 0.3
                }}
              >
                <Heart
                  className={`w-4 h-4 ${localReview.liked ? 'fill-red-400' : ''}`}
                />
              </motion.div>
              <span>{localReview.likes} j'aime</span>
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
