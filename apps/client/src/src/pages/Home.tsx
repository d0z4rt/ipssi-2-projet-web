import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'

import { GameCard } from '../components/GameCard'
import { ReviewCard } from '../components/ReviewCard'
import { Game, Review, gameService, reviewService } from '../services/api'
export const Home: React.FC = () => {
  const [trendingGames, setTrendingGames] = useState<Game[]>([])
  const [latestReleases, setLatestReleases] = useState<Game[]>([])
  const [popularReviews, setPopularReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const trendingRef = useRef<HTMLDivElement>(null)
  const releasesRef = useRef<HTMLDivElement>(null)
  const reviewsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trending, releases, reviews] = await Promise.all([
          gameService.getTrendingGames(),
          gameService.getLatestReleases(),
          reviewService.getLatestReviews()
        ])
        setTrendingGames(trending)
        setLatestReleases(releases)
        setPopularReviews(reviews)
      } catch (error) {
        console.error('Failed to fetch home data', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  const scroll = (
    ref: React.RefObject<HTMLDivElement>,
    direction: 'left' | 'right'
  ) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current
      const scrollTo =
        direction === 'left'
          ? scrollLeft - clientWidth / 2
          : scrollLeft + clientWidth / 2
      ref.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      })
    }
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  return (
    <div className="pt-16 min-h-screen bg-darkBg">
      {/* Hero Section - Using uploaded image */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden mb-12">
        <div className="absolute inset-0 z-0">
          <img
            src="/image.png"
            alt="Crimson Desert"
            className="w-full h-full object-cover opacity-60"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-darkBg/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-darkBg/80 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.7
            }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              Crimson Desert
            </h1>
            <p className="text-lg text-gray-300 mb-8 line-clamp-3">
              Une saga écrite dans le sang. Faites l'expérience de l'incroyable
              histoire de mercenaires luttant pour leur survie dans l'immense
              continent de Pywel.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/games/8"
                className="px-6 py-3 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Voir la fiche du jeu
              </Link>
              <button className="px-6 py-3 rounded bg-gray-800/80 text-white font-medium hover:bg-gray-700 transition-colors backdrop-blur-sm border border-gray-700">
                Ajouter à une liste
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-20">
        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-2">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              Tops Jeux Vidéo
            </h2>
            <Link
              to="/games"
              className="text-sm text-blue-400 hover:underline flex items-center"
            >
              Voir plus <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="relative group">
            <button
              onClick={() => scroll(trendingRef, 'left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-gray-900/80 border border-gray-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={trendingRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {trendingGames.map((game) => (
                <div key={game.id} className="snap-start">
                  <GameCard game={game} />
                </div>
              ))}
            </div>

            <button
              onClick={() => scroll(trendingRef, 'right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-gray-900/80 border border-gray-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Latest Releases Section */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-2">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              Dernières Sorties
            </h2>
            <Link
              to="/games"
              className="text-sm text-blue-400 hover:underline flex items-center"
            >
              Voir plus <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="relative group">
            <button
              onClick={() => scroll(releasesRef, 'left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-gray-900/80 border border-gray-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={releasesRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {latestReleases.map((game) => (
                <div key={game.id} className="snap-start">
                  <GameCard game={game} />
                </div>
              ))}
            </div>

            <button
              onClick={() => scroll(releasesRef, 'right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-gray-900/80 border border-gray-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Popular Reviews Section */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-2">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              Critiques Populaires
            </h2>
          </div>

          <div className="relative group">
            <button
              onClick={() => scroll(reviewsRef, 'left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-gray-900/80 border border-gray-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={reviewsRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {popularReviews.map((review) => (
                <div key={review.id} className="snap-start w-[400px] shrink-0">
                  <ReviewCard review={review} showGameInfo={true} />
                </div>
              ))}
            </div>

            <button
              onClick={() => scroll(reviewsRef, 'right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-gray-900/80 border border-gray-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
