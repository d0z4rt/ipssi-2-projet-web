import {
  ShieldAlert,
  Users,
  Gamepad2,
  MessageSquare,
  Edit,
  Trash2
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import {
  adminService,
  AdminUser,
  gameService,
  Game,
  reviewService,
  Review,
  API_BASE_URL
} from '../services/api'
export const Admin: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
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
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
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
      fetchAdminData()
    }
  }, [user])
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

      {/* Tabs */}
      <div className="flex border-b border-gray-800 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'overview' ? 'text-accent' : 'text-gray-400 hover:text-white'}`}
        >
          Overview
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('games')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'games' ? 'text-accent' : 'text-gray-400 hover:text-white'}`}
        >
          Manage Games
          {activeTab === 'games' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'reviews' ? 'text-accent' : 'text-gray-400 hover:text-white'}`}
        >
          Moderation
          {activeTab === 'reviews' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent"></div>
          )}
        </button>
      </div>

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
                <div className="bg-cardBg border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium">Total Users</h3>
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-3xl font-orbitron font-bold text-white">
                    {(stats.users ?? users.length).toLocaleString()}
                  </p>
                </div>

                <div className="bg-cardBg border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium">Total Games</h3>
                    <Gamepad2 className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-3xl font-orbitron font-bold text-white">
                    {stats.games.toLocaleString()}
                  </p>
                </div>

                <div className="bg-cardBg border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium">Total Reviews</h3>
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-3xl font-orbitron font-bold text-white">
                    {stats.reviews.toLocaleString()}
                  </p>
                </div>
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
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  {reviews.length} loaded
                </span>
              </div>
              {reviews.length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {reviews.slice(0, 10).map((review) => (
                    <div
                      key={review.id}
                      className="p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <div className="text-white font-medium">
                          {review.title || 'Untitled review'}
                        </div>
                        <div className="text-sm text-gray-400">
                          Game ID {review.gameId} • User {review.username} •{' '}
                          {review.rating}/10
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {review.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{review.likes} likes</span>
                        <span>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
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
        </>
      )}
    </div>
  )
}
