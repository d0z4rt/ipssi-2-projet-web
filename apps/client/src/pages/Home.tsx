import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Carousel } from '../components/Carousel'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { GameCard } from '../components/GameCard'
import { ReviewCard } from '../components/ReviewCard'
import {
  API_BASE_URL,
  Game,
  Review,
  gameService,
  reviewService
} from '../services/api'

const HOME_GAMES_SECTION_LIMIT = 12

export const Home: React.FC = () => {
  const [trendingGames, setTrendingGames] = useState<Game[]>([])
  const [latestReleases, setLatestReleases] = useState<Game[]>([])
  const [popularReviews, setPopularReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const featuredGame = latestReleases[0] || trendingGames[0]
  const featuredBanner =
    featuredGame?.bannerImage || featuredGame?.image || '/CrimsonDesert.png'
  const featuredSteamFromAppId = featuredGame?.steamAppId
    ? `https://store.steampowered.com/app/${featuredGame.steamAppId}`
    : null
  const featuredSteamUrl =
    featuredSteamFromAppId || 'https://store.steampowered.com'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allGames, reviews] = await Promise.all([
          gameService.getGames(),
          reviewService.getLatestReviews(HOME_GAMES_SECTION_LIMIT)
        ])

        const trending = allGames
          .slice()
          .sort((left, right) => right.rating - left.rating)
          .slice(0, HOME_GAMES_SECTION_LIMIT)

        const releases = allGames
          .slice()
          .sort(
            (left, right) =>
              new Date(right.releaseDate).getTime() -
              new Date(left.releaseDate).getTime()
          )
          .slice(0, HOME_GAMES_SECTION_LIMIT)

        setTrendingGames(trending)
        setLatestReleases(releases)
        setPopularReviews(reviews)
      } catch {
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
  }, [])
  if (loading) {
    return <FullPageSpinner />
  }
  return (
    <div className="pt-16 min-h-screen bg-darkBg">
      {/* Hero Section - Steam header style banner */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden mb-12">
        <div className="absolute inset-0 z-0">
          <img
            src={`${API_BASE_URL}/v1/${featuredBanner}`}
            alt={
              featuredGame
                ? `${featuredGame.title} Steam banner`
                : 'Steam game banner'
            }
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
              {featuredGame?.title || 'Featured Game'}
            </h1>
            <p className="text-lg text-gray-300 mb-8 line-clamp-3">
              {featuredGame?.description ||
                'Découvrez les meilleures sorties et critiques de jeux vidéo sur GameCritiq.'}
            </p>
            <div className="flex items-center gap-4">
              <Link
                to={featuredGame ? `/games/${featuredGame.slug}` : '/games'}
                className="px-6 py-3 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Voir la fiche du jeu
              </Link>
              <a
                href={featuredSteamUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="px-6 py-3 rounded bg-gray-800/80 text-white font-medium hover:bg-gray-700 transition-colors backdrop-blur-sm border border-gray-700 inline-flex items-center gap-2"
              >
                Voir sur Steam <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-20">
        <Carousel
          title="Tops Jeux Vidéo"
          seeMoreLink="/games"
          previousLabel="Voir les jeux précédents"
          nextLabel="Voir les jeux suivants"
          trackClassName="flex gap-3 overflow-x-auto py-2 snap-x snap-mandatory scrollbar-hide"
        >
          {trendingGames.map((game) => (
            <div
              key={game.id}
              data-carousel-item="true"
              className="snap-start shrink-0 w-[170px] sm:w-[180px] lg:w-[190px] xl:w-[200px] p-1"
            >
              <GameCard game={game} />
            </div>
          ))}
        </Carousel>

        <Carousel
          title="Dernières Sorties"
          seeMoreLink="/games"
          previousLabel="Voir les sorties précédentes"
          nextLabel="Voir les sorties suivantes"
          trackClassName="flex gap-3 overflow-x-auto py-2 snap-x snap-mandatory scrollbar-hide"
        >
          {latestReleases.map((game) => (
            <div
              key={game.id}
              data-carousel-item="true"
              className="snap-start shrink-0 w-[170px] sm:w-[180px] lg:w-[190px] xl:w-[200px] p-1"
            >
              <GameCard game={game} />
            </div>
          ))}
        </Carousel>

        <Carousel
          title="Critiques Populaires"
          previousLabel="Voir les critiques précédentes"
          nextLabel="Voir les critiques suivantes"
          trackClassName="flex gap-6 overflow-x-auto pb-4 snap-x scrollbar-hide"
        >
          {popularReviews.map((review) => (
            <div
              key={review.id}
              data-carousel-item="true"
              className="snap-start w-[400px] shrink-0"
            >
              <ReviewCard review={review} showGameInfo={true} />
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  )
}
