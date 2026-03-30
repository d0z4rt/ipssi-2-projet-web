import { User, Heart, MessageSquare, Star, Edit2, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { Review, reviewService } from '../services/api'
export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [userReviews, setUserReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (user) {
        try {
          const reviews = await reviewService.getUserReviews(user.id)
          setUserReviews(reviews)
        } catch (error) {
          console.error('Failed to fetch user reviews', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchUserReviews()
  }, [user])
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
              Avg Rating Given
            </p>
            <p className="text-3xl font-orbitron font-bold text-white">
              {avgRating}
            </p>
          </div>
        </div>
      </div>

      {/* User's Reviews */}
      <div>
        <h2 className="text-2xl font-orbitron font-bold text-white mb-6 border-b border-gray-800 pb-4">
          My Reviews
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : userReviews.length > 0 ? (
          <div className="space-y-4">
            {userReviews.map((review) => (
              <div
                key={review.id}
                className="bg-cardBg border border-gray-800 rounded-xl p-5 flex flex-col md:flex-row gap-4 justify-between"
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-400">
                      Game ID: {review.gameId}
                    </span>
                    <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded border border-gray-800">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{review.content}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <Heart className="w-3.5 h-3.5" /> {review.likes} likes
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 justify-end border-t md:border-t-0 md:border-l border-gray-800 pt-3 md:pt-0 md:pl-4">
                  <button className="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button className="flex items-center justify-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
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
    </div>
  )
}
