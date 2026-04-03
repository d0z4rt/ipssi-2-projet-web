import {
  ShieldAlert,
  Users,
  Gamepad2,
  MessageSquare,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { ErrorBanner } from '../components/ErrorBanner'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { StatCard } from '../components/StatCard'
import { TabBar } from '../components/TabBar'
import { useAuth } from '../context/AuthContext'
import {
  adminService,
  gameService,
  Game,
  reviewService,
  Review,
  API_BASE_URL
} from '../services/api'
import { UserResponse } from '../types/users'

const REVIEWS_PER_PAGE = 20

export const Admin: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'reviews'>(
    'overview'
  )
  const [stats, setStats] = useState({
    users: null as number | null,
    games: 0,
    reviews: 0
  })
  const [games, setGames] = useState<Game[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeletingReviewId, setIsDeletingReviewId] = useState<string | null>(
    null
  )
  const [reviewIdToDelete, setReviewIdToDelete] = useState<string | null>(null)
  const [moderationError, setModerationError] = useState('')
  const [reviewsPage, setReviewsPage] = useState(1)

  const totalReviewPages = Math.max(
    1,
    Math.ceil(reviews.length / REVIEWS_PER_PAGE)
  )
  const paginatedReviews = reviews.slice(
    (reviewsPage - 1) * REVIEWS_PER_PAGE,
    reviewsPage * REVIEWS_PER_PAGE
  )

  const handleDeleteReviewFromModeration = async () => {
    if (!reviewIdToDelete) {
      return
    }

    const reviewId = reviewIdToDelete
    setModerationError('')
    setIsDeletingReviewId(reviewId)
    try {
      await reviewService.deleteReview(reviewId)
      setReviews((current) =>
        current.filter((review) => review.id !== reviewId)
      )
      setStats((current) => ({
        ...current,
        reviews: Math.max(0, current.reviews - 1)
      }))
    } catch (error) {
      setModerationError(
        error instanceof Error
          ? error.message
          : 'Suppression impossible pour le moment.'
      )
    } finally {
      setIsDeletingReviewId(null)
      setReviewIdToDelete(null)
    }
  }

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [appStats, gamesData, reviewsData, usersData] = await Promise.all(
          [
            adminService.getStats(),
            gameService.getGames(),
            reviewService.getAll(),
            adminService.getUsers()
          ]
        )
        setStats({
          users: appStats.totalUsers,
          games: appStats.totalGames,
          reviews: appStats.totalReviews
        })
        setGames(gamesData)
        setReviews(reviewsData)
        setUsers(usersData)
      } catch {
      } finally {
        setLoading(false)
      }
    }
    if (user?.role === 'admin') {
      void fetchAdminData()
    }
  }, [user])

  useEffect(() => {
    if (reviewsPage > totalReviewPages) {
      setReviewsPage(totalReviewPages)
    }
  }, [reviewsPage, totalReviewPages])

  if (authLoading) {
    return <FullPageSpinner />
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return (
    <div className="pt-24 pb-20 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-500/10 rounded-lg">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            Admin Portal
          </h1>
          <p className="text-gray-400">Manage platform content and users</p>
        </div>
      </div>

      <TabBar
        className="mb-8"
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { value: 'overview', label: 'Overview' },
          { value: 'games', label: 'Manage Games' },
          { value: 'reviews', label: 'Moderation' }
        ]}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  icon={Users}
                  label="Total Users"
                  value={(stats.users ?? users.length).toLocaleString()}
                  accentClassName="bg-blue-500/10 text-blue-400"
                />
                <StatCard
                  icon={Gamepad2}
                  label="Total Games"
                  value={stats.games.toLocaleString()}
                  accentClassName="bg-green-500/10 text-green-400"
                />
                <StatCard
                  icon={MessageSquare}
                  label="Total Reviews"
                  value={stats.reviews.toLocaleString()}
                  accentClassName="bg-purple-500/10 text-purple-400"
                />
              </div>

              <div className="mt-6 sm:col-span-2 lg:col-span-4 bg-cardBg border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="font-medium text-white">Users</h2>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    {users.length} loaded
                  </span>
                </div>
                {users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                      <thead className="text-xs text-gray-500 uppercase bg-darkBg/50 border-b border-gray-800">
                        <tr>
                          <th className="px-6 py-3">Username</th>
                          <th className="px-6 py-3">Mail</th>
                          <th className="px-6 py-3">Role</th>
                          <th className="px-6 py-3">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr
                            key={u.id}
                            className="border-b border-gray-800 hover:bg-gray-800/30"
                          >
                            <td className="px-6 py-4 text-white font-medium">
                              {u.username}
                            </td>
                            <td className="px-6 py-4">{u.mail}</td>
                            <td className="px-6 py-4">
                              {u.is_admin
                                ? 'admin'
                                : u.is_curator
                                  ? 'curator'
                                  : 'user'}
                            </td>
                            <td className="px-6 py-4">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    No users loaded.
                  </div>
                )}
              </div>
            </>
          )}

          {/* Games Tab */}
          {activeTab === 'games' && (
            <div className="bg-cardBg border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h2 className="font-medium text-white">Games Database</h2>
                <button className="px-4 py-2 bg-accent text-darkBg text-sm font-bold rounded hover:bg-accent/90">
                  + Add New Game
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="text-xs text-gray-500 uppercase bg-darkBg/50 border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-3">Game</th>
                      <th className="px-6 py-3">Genre</th>
                      <th className="px-6 py-3">Rating</th>
                      <th className="px-6 py-3">Release Date</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((game) => (
                      <tr
                        key={game.id}
                        className="border-b border-gray-800 hover:bg-gray-800/30"
                      >
                        <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                          <img
                            src={`${API_BASE_URL}/v1/${game.image}`}
                            alt={game.title}
                            className="w-10 h-10 rounded object-cover"
                          />

                          {game.title}
                        </td>
                        <td className="px-6 py-4">{game.genre}</td>
                        <td className="px-6 py-4">{game.rating.toFixed(1)}</td>
                        <td className="px-6 py-4">
                          {new Date(game.releaseDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="text-gray-400 hover:text-white mr-3"
                            title="Edit game"
                            aria-label="Edit game"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-gray-400 hover:text-red-400"
                            title="Delete game"
                            aria-label="Delete game"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="bg-cardBg border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="font-medium text-white">Review feed</h2>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    {reviews.length} loaded
                  </span>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <button
                        type="button"
                        onClick={() => setReviewsPage((current) => current - 1)}
                        disabled={reviewsPage === 1}
                        className="inline-flex items-center justify-center rounded border border-gray-700 p-1.5 text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Page precedente"
                        aria-label="Page precedente"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span>
                        Page {reviewsPage} / {totalReviewPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setReviewsPage((current) => current + 1)}
                        disabled={reviewsPage >= totalReviewPages}
                        className="inline-flex items-center justify-center rounded border border-gray-700 p-1.5 text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Page suivante"
                        aria-label="Page suivante"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {moderationError && (
                <ErrorBanner message={moderationError} className="mx-4 mt-4" />
              )}
              {reviews.length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {paginatedReviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                    >
                      <Link
                        to={`/games/${encodeURIComponent(gameService.getGameSlugById(review.gameId) || '')}#review-${review.id}`}
                        className="group block flex-1 rounded-md px-1 py-1 transition-colors hover:bg-gray-900/50"
                      >
                        <div className="text-white font-medium group-hover:text-blue-400 transition-colors">
                          {review.title || 'Untitled review'}
                        </div>
                        <div className="text-sm text-gray-400">
                          Game ID {review.gameId} • User {review.username} •{' '}
                          {review.rating}/10
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2 group-hover:text-gray-300 transition-colors">
                          {review.content}
                        </p>
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{review.likes} likes</span>
                        <span>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => setReviewIdToDelete(review.id)}
                          disabled={isDeletingReviewId === review.id}
                          className="inline-flex items-center gap-1 rounded border border-red-500/30 px-2 py-1 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {isDeletingReviewId === review.id
                            ? 'Suppression...'
                            : 'Supprimer'}
                        </button>
                      </div>
                    </div>
                  ))}

                  {reviews.length > REVIEWS_PER_PAGE && (
                    <div className="flex items-center justify-between border-t border-gray-800 px-4 py-3 text-sm text-gray-400">
                      <span>
                        Affichage {(reviewsPage - 1) * REVIEWS_PER_PAGE + 1} -{' '}
                        {Math.min(
                          reviewsPage * REVIEWS_PER_PAGE,
                          reviews.length
                        )}{' '}
                        sur {reviews.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setReviewsPage((current) => current - 1)
                          }
                          disabled={reviewsPage === 1}
                          className="inline-flex items-center gap-1 rounded border border-gray-700 px-2 py-1 text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Prec
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setReviewsPage((current) => current + 1)
                          }
                          disabled={reviewsPage >= totalReviewPages}
                          className="inline-flex items-center gap-1 rounded border border-gray-700 px-2 py-1 text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Suiv
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <ShieldAlert className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-orbitron text-white mb-2">
                    No reviews loaded
                  </h3>
                  <p className="text-gray-400">
                    The API is currently returning an empty moderation feed.
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
            onConfirm={() => void handleDeleteReviewFromModeration()}
          />
        </>
      )}
    </div>
  )
}
