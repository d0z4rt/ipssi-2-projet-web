import {
  User,
  Heart,
  MessageSquare,
  Star,
  Edit2,
  Trash2,
  ArrowRight
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { getGameSlugById } from '../services/api'
import { Review, reviewService } from '../services/api'
export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [userReviews, setUserReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editRating, setEditRating] = useState(0)
  const [editTags, setEditTags] = useState('')
  const [actionError, setActionError] = useState('')
  const [isSavingReview, setIsSavingReview] = useState(false)
  const [isDeletingReviewId, setIsDeletingReviewId] = useState<string | null>(
    null
  )
  const [reviewIdToDelete, setReviewIdToDelete] = useState<string | null>(null)
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (user) {
        try {
          const reviews = await reviewService.getUserReviews(user.id)
          setUserReviews(reviews)
        } catch {
        } finally {
          setLoading(false)
        }
      }
    }
    fetchUserReviews()
  }, [user])

  const startEditing = (review: Review) => {
    setActionError('')
    setEditingReviewId(review.id)
    setEditTitle(review.title ?? '')
    setEditContent(review.content)
    setEditRating(review.rating)
    setEditTags((review.tags ?? []).join(', '))
  }

  const cancelEditing = () => {
    setEditingReviewId(null)
    setActionError('')
  }

  const handleUpdateReview = async (reviewId: string) => {
    if (!Number.isFinite(editRating) || editRating < 0 || editRating > 10) {
      setActionError('La note doit etre entre 0 et 10.')
      return
    }

    const trimmedTitle = editTitle.trim()
    const trimmedContent = editContent.trim()
    const tags = editTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    setIsSavingReview(true)
    setActionError('')
    try {
      const updated = await reviewService.updateReview(reviewId, {
        title: trimmedTitle.length > 0 ? trimmedTitle : undefined,
        content: trimmedContent,
        rating: editRating,
        tags
      })

      setUserReviews((current) =>
        current.map((review) => (review.id === reviewId ? updated : review))
      )
      setEditingReviewId(null)
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'La modification de la critique a echoue.'
      )
    } finally {
      setIsSavingReview(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!reviewIdToDelete) {
      return
    }

    const reviewId = reviewIdToDelete
    setIsDeletingReviewId(reviewId)
    setActionError('')
    try {
      await reviewService.deleteReview(reviewId)
      setUserReviews((current) =>
        current.filter((review) => review.id !== reviewId)
      )
      if (editingReviewId === reviewId) {
        setEditingReviewId(null)
      }
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'La suppression de la critique a echoue.'
      )
    } finally {
      setIsDeletingReviewId(null)
      setReviewIdToDelete(null)
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  const totalLikes = userReviews.reduce((sum, review) => sum + review.likes, 0)
  const avgRating =
    userReviews.length > 0
      ? (
          userReviews.reduce((sum, review) => sum + review.rating, 0) /
          userReviews.length
        ).toFixed(1)
      : '0.0'
  return (
    <div className="pt-24 pb-20 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-secondary p-1">
          <div className="w-full h-full bg-darkBg rounded-full flex items-center justify-center border-4 border-cardBg">
            <span className="text-4xl font-bold text-white">
              {user?.username.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white mb-1">
            Welcome, {user?.username}
          </h1>
          <p className="text-gray-400 flex items-center gap-2">
            <User className="w-4 h-4" /> {user?.email}
            <span className="px-2 py-0.5 bg-gray-800 rounded text-xs ml-2 uppercase tracking-wider">
              {user?.role}
            </span>
          </p>
        </div>
      </div>

      {user?.isCurator && (
        <div className="mb-8 rounded-xl border border-accent/30 bg-accent/5 px-5 py-4 text-sm text-gray-200">
          Curator stats are based on your published reviews and will
          automatically pick up likes, review count and average score from the
          API.
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-cardBg border border-gray-800 rounded-xl p-6 flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 rounded-lg text-blue-400">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Reviews</p>
            <p className="text-3xl font-orbitron font-bold text-white">
              {userReviews.length}
            </p>
          </div>
        </div>

        <div className="bg-cardBg border border-gray-800 rounded-xl p-6 flex items-center gap-4">
          <div className="p-4 bg-red-500/10 rounded-lg text-red-400">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Likes Received</p>
            <p className="text-3xl font-orbitron font-bold text-white">
              {totalLikes}
            </p>
          </div>
        </div>

        <div className="bg-cardBg border border-gray-800 rounded-xl p-6 flex items-center gap-4">
          <div className="p-4 bg-yellow-500/10 rounded-lg text-yellow-400">
            <Star className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">
              Avg Rating Given (/10)
            </p>
            <p className="text-3xl font-orbitron font-bold text-white">
              {avgRating}/10
            </p>
          </div>
        </div>
      </div>

      {/* User's Reviews */}
      <div>
        <h2 className="text-2xl font-orbitron font-bold text-white mb-6 border-b border-gray-800 pb-4">
          My Reviews
        </h2>

        {actionError && (
          <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {actionError}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : userReviews.length > 0 ? (
          <div className="space-y-4">
            {userReviews.map((review) => {
              const gameSlug = getGameSlugById(review.gameId)
              const targetUrl = gameSlug
                ? `/games/${encodeURIComponent(gameSlug)}`
                : `/games/${review.gameId}`

              const isEditing = editingReviewId === review.id
              const isDeleting = isDeletingReviewId === review.id

              return (
                <div
                  key={review.id}
                  className="bg-cardBg border border-gray-800 rounded-xl p-5 flex flex-col md:flex-row gap-4 justify-between hover:border-gray-700 hover:bg-gray-900/40 transition-colors"
                >
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-white">
                        {review.gameTitle || 'Unknown game'}
                      </span>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">
                        Review
                      </span>
                      {!isEditing && (
                        <span className="text-sm text-gray-300">
                          {review.title || 'Untitled review'}
                        </span>
                      )}
                      <div className="inline-flex items-center rounded border border-gray-800 bg-black/30 px-2 py-0.5 text-xs font-medium text-yellow-300">
                        {isEditing ? editRating : review.rating}/10
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          className="w-full rounded-lg border border-gray-700 bg-darkBg px-3 py-2 text-white focus:outline-none focus:border-accent"
                          placeholder="Titre"
                        />
                        <textarea
                          value={editContent}
                          onChange={(event) =>
                            setEditContent(event.target.value)
                          }
                          rows={4}
                          className="w-full rounded-lg border border-gray-700 bg-darkBg px-3 py-2 text-white focus:outline-none focus:border-accent"
                          placeholder="Contenu"
                        />
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <input
                            title="Note"
                            type="number"
                            min={0}
                            max={10}
                            value={editRating}
                            onChange={(event) =>
                              setEditRating(Number(event.target.value))
                            }
                            className="w-full rounded-lg border border-gray-700 bg-darkBg px-3 py-2 text-white focus:outline-none focus:border-accent"
                          />
                          <input
                            type="text"
                            value={editTags}
                            onChange={(event) =>
                              setEditTags(event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-700 bg-darkBg px-3 py-2 text-white focus:outline-none focus:border-accent"
                            placeholder="Tags (comma separated)"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-300 text-sm">
                          {review.content}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5" /> {review.likes}{' '}
                            likes
                          </span>
                          <Link
                            to={targetUrl}
                            className="inline-flex items-center gap-1 text-accent"
                          >
                            Open on game page{' '}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex md:flex-col gap-2 justify-end border-t md:border-t-0 md:border-l border-gray-800 pt-3 md:pt-0 md:pl-4">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleUpdateReview(review.id)}
                          disabled={isSavingReview}
                          className="flex items-center justify-center gap-2 px-3 py-1.5 bg-accent hover:bg-accent/90 text-darkBg text-sm font-bold rounded transition-colors disabled:opacity-60"
                        >
                          {isSavingReview ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditing(review)}
                          className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewIdToDelete(review.id)}
                          disabled={isDeleting}
                          className="flex items-center justify-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded transition-colors disabled:opacity-60"
                        >
                          <Trash2 className="w-4 h-4" />
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-cardBg/50 border border-gray-800 rounded-xl">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-400">
              You haven't written any reviews. Go find a game to review!
            </p>
          </div>
        )}
      </div>

      {reviewIdToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-800 bg-cardBg p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">
              Confirmer la suppression
            </h3>
            <p className="mt-2 text-sm text-gray-300">
              Cette action supprimera definitivement la critique.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewIdToDelete(null)}
                disabled={isDeletingReviewId === reviewIdToDelete}
                className="rounded-md border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteReview()}
                disabled={isDeletingReviewId === reviewIdToDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
              >
                {isDeletingReviewId === reviewIdToDelete
                  ? 'Suppression...'
                  : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
