import {
  User,
  Heart,
  MessageSquare,
  Star,
  Edit2,
  Trash2,
  ArrowRight,
  Gamepad2,
  Check,
  Bookmark,
  Play
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { ErrorBanner } from '../components/ErrorBanner'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { ReviewEditRow } from '../components/ReviewEditRow'
import { StatCard } from '../components/StatCard'
import { TabBar } from '../components/TabBar'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../services/api'
import {
  Review,
  UserGameWithStatuses,
  gameService,
  reviewService
} from '../services/api'
import { GameUserStatusType } from '../types/games'
type DashboardTab = 'reviews' | 'games'

const statusLabelMap: Record<GameUserStatusType | 'favorite', string> = {
  played: 'Fini',
  want_to_play: "Envie d'y jouer",
  playing: 'En cours',
  favorite: 'Coup de coeur'
}

const statusBadgeClassMap: Record<GameUserStatusType | 'favorite', string> = {
  played: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  want_to_play: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  playing: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  favorite: 'border-pink-500/40 bg-pink-500/10 text-pink-300'
}

const statusIconMap: Record<
  GameUserStatusType | 'favorite',
  React.ComponentType<{ className?: string }>
> = {
  played: Check,
  want_to_play: Bookmark,
  playing: Play,
  favorite: Heart
}

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<DashboardTab>('reviews')
  const [userReviews, setUserReviews] = useState<Review[]>([])
  const [userGames, setUserGames] = useState<UserGameWithStatuses[]>([])
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
  const [gamesError, setGamesError] = useState('')
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user) {
        try {
          const [reviews, gamesWithStatuses] = await Promise.all([
            reviewService.getUserReviews(user.id),
            gameService.getMyGamesWithStatuses()
          ])
          setUserReviews(reviews)
          setUserGames(gamesWithStatuses)
          setGamesError('')
        } catch (error) {
          setGamesError(
            error instanceof Error
              ? error.message
              : 'Impossible de charger vos jeux pour le moment.'
          )
        } finally {
          setLoading(false)
        }
      }
    }

    void fetchDashboardData()
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

  if (authLoading) {
    return <FullPageSpinner />
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

  const totalMarkedGames = userGames.length

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={MessageSquare}
          label="Total Reviews"
          value={userReviews.length}
          accentClassName="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          icon={Heart}
          label="Likes Received"
          value={totalLikes}
          accentClassName="bg-red-500/10 text-red-400"
        />
        <StatCard
          icon={Star}
          label="Avg Rating Given (/10)"
          value={`${avgRating}/10`}
          accentClassName="bg-yellow-500/10 text-yellow-400"
        />
        <StatCard
          icon={Gamepad2}
          label="Jeux suivis"
          value={totalMarkedGames}
          accentClassName="bg-emerald-500/10 text-emerald-400"
        />
      </div>

      <TabBar
        className="mb-8"
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { value: 'reviews', label: 'Mes critiques' },
          { value: 'games', label: 'Jeux' }
        ]}
      />

      {activeTab === 'reviews' && (
        <div>
          <h2 className="text-2xl font-orbitron font-bold text-white mb-6 border-b border-gray-800 pb-4">
            My Reviews
          </h2>

          {actionError && (
            <ErrorBanner message={actionError} className="mb-4" />
          )}

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : userReviews.length > 0 ? (
            <div className="space-y-4">
              {userReviews.map((review) => {
                const gameSlug = gameService.getGameSlugById(review.gameId)
                const targetUrl = gameSlug
                  ? `/games/${encodeURIComponent(gameSlug)}#review-${review.id}`
                  : `/games/${review.gameId}#review-${review.id}`

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
                        <ReviewEditRow
                          title={editTitle}
                          content={editContent}
                          rating={editRating}
                          tags={editTags}
                          onTitleChange={setEditTitle}
                          onContentChange={setEditContent}
                          onRatingChange={setEditRating}
                          onTagsChange={setEditTags}
                        />
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
      )}

      {activeTab === 'games' && (
        <div className="bg-cardBg border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-medium text-white">Mes jeux suivis</h2>
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {userGames.length} jeux
            </span>
          </div>

          {gamesError && (
            <ErrorBanner message={gamesError} className="mx-4 mt-4" />
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : userGames.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs text-gray-500 uppercase bg-darkBg/50 border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-3">Jeu</th>
                    <th className="px-6 py-3">Genre</th>
                    <th className="px-6 py-3">Note</th>
                    <th className="px-6 py-3">Statuts</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userGames.map(({ game, statuses }) => {
                    const targetUrl = `/games/${encodeURIComponent(game.slug)}`

                    return (
                      <tr
                        key={game.id}
                        className="border-b border-gray-800 hover:bg-gray-900/40"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={`${API_BASE_URL}/v1/${game.image}`}
                              alt={game.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div>
                              <p className="text-white font-medium">
                                {game.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  game.releaseDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{game.genre}</td>
                        <td className="px-6 py-4">{game.rating.toFixed(1)}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {statuses.map((status) => {
                              const Icon = statusIconMap[status]

                              return (
                                <span
                                  key={`${game.id}-${status}`}
                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${statusBadgeClassMap[status]}`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                  {statusLabelMap[status]}
                                </span>
                              )
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={targetUrl}
                            className="inline-flex items-center gap-1 rounded border border-gray-700 px-3 py-1.5 text-xs text-gray-200 hover:border-accent hover:text-white transition-colors"
                          >
                            Voir la fiche <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center">
              <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Aucun jeu suivi pour l'instant
              </h3>
              <p className="text-sm text-gray-400">
                Ouvre une fiche jeu puis utilise les boutons de statut pour
                construire ta liste.
              </p>
            </div>
          )}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(reviewIdToDelete)}
        isDeleting={Boolean(
          reviewIdToDelete && isDeletingReviewId === reviewIdToDelete
        )}
        onCancel={() => setReviewIdToDelete(null)}
        onConfirm={() => void handleDeleteReview()}
      />
    </div>
  )
}
