import {
  ShieldAlert,
  Users,
  Gamepad2,
  MessageSquare,
  AlertTriangle,
  Check,
  Trash2,
  Edit
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { adminService, gameService, Game } from '../services/api'
export const Admin: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'reviews'>(
    'overview'
  )
  const [stats, setStats] = useState({
    users: 0,
    games: 0,
    reviews: 0,
    reported: 0
  })
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [appStats, gamesData] = await Promise.all([
          adminService.getStats(),
          gameService.getGames()
        ])
        setStats({
          users: appStats.totalUsers,
          games: appStats.totalGames,
          reviews: appStats.totalReviews,
          reported: appStats.reportedReviews
        })
        setGames(gamesData)
      } catch (error) {
        console.error('Failed to fetch admin data', error)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-cardBg border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-medium">Total Users</h3>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl font-orbitron font-bold text-white">
                  {stats.users.toLocaleString()}
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

              <div className="bg-cardBg border border-red-500/30 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-medium">
                    Reported Content
                  </h3>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-3xl font-orbitron font-bold text-white">
                  {stats.reported}
                </p>
                <button className="mt-4 text-xs text-red-400 hover:text-red-300 font-medium">
                  Review Now &rarr;
                </button>
              </div>
            </div>
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
                            src={game.image}
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
                          <button className="text-gray-400 hover:text-white mr-3">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-gray-400 hover:text-red-400">
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
            <div className="bg-cardBg border border-gray-800 rounded-xl p-8 text-center">
              <ShieldAlert className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-orbitron text-white mb-2">
                Moderation Queue Empty
              </h3>
              <p className="text-gray-400">
                There are no reported reviews that require your attention right
                now.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
