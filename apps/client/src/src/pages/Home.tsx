import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'

import { GameCard } from '../components/GameCard'
import { ReviewCard } from '../components/ReviewCard'
import { Game, Review, gameService, reviewService } from '../services/api'

const steamHeaderByGameId: Record<string, string> = {
  '1': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg?t=1767883716',
  '2': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/48a2fcbda8565bb45025e98fd8ebde8a7203f6a0/header.jpg?t=1773079016',
  '3': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/ad9240e088f953a84aee814034c50a6a92bf4516/header.jpg?t=1768303991',
  '4': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg?t=1759502961',
  '5': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/e9047d8ec47ae3d94bb8b464fb0fc9e9972b4ac7/header.jpg?t=1769690377',
  '6': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/3c3489495136b26b34f8a9543c7f5645b99d388c/header.jpg?t=1770338567',
  '7': 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg?t=1758127023',
  '8': '/CrimsonDesert.png'
}

const steamStoreByGameId: Record<string, string> = {
  '1': 'https://store.steampowered.com/app/1245620',
  '2': 'https://store.steampowered.com/app/1086940',
  '3': 'https://store.steampowered.com/app/292030',
  '4': 'https://store.steampowered.com/app/1174180',
  '5': 'https://store.steampowered.com/app/1091500',
  '6': 'https://store.steampowered.com/app/367520',
  '7': 'https://store.steampowered.com/app/1145360',
  '8': 'https://crimsondesert.pearlabyss.com/'
}

const HOME_GAMES_SECTION_LIMIT = 12

export const Home: React.FC = () => {
  const [trendingGames, setTrendingGames] = useState<Game[]>([])
  const [latestReleases, setLatestReleases] = useState<Game[]>([])
  const [popularReviews, setPopularReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const trendingRef = useRef<HTMLDivElement>(null)
  const releasesRef = useRef<HTMLDivElement>(null)
  const reviewsRef = useRef<HTMLDivElement>(null)

  const featuredGame = latestReleases[0] || trendingGames[0]
  const featuredBanner =
    (featuredGame && steamHeaderByGameId[featuredGame.id]) ||
    featuredGame?.bannerImage ||
    featuredGame?.image ||
    '/CrimsonDesert.png'
  const featuredSteamFromAppId = featuredGame?.steamAppId
    ? `https://store.steampowered.com/app/${featuredGame.steamAppId}`
    : null
  const featuredSteamUrl =
    featuredSteamFromAppId ||
    (featuredGame && steamStoreByGameId[featuredGame.id]) ||
    'https://store.steampowered.com'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allGames, reviews] = await Promise.all([
          gameService.getGames(),
          reviewService.getLatestReviews()
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
    fetchData()
  }, [])
  const scroll = (
    ref: React.RefObject<HTMLDivElement>,
    direction: 'left' | 'right'
  ) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current
      const firstItem = ref.current.querySelector<HTMLElement>(
        '[data-carousel-item="true"]'
      )

      let scrollStep = clientWidth

      if (firstItem) {
        const styles = window.getComputedStyle(ref.current)
        const gapValue = Number.parseFloat(
          styles.gap || styles.columnGap || '0'
        )
        const itemWidth =
          firstItem.offsetWidth + (Number.isNaN(gapValue) ? 0 : gapValue)
        const visibleItems = Math.max(1, Math.floor(clientWidth / itemWidth))
        scrollStep = itemWidth * visibleItems
      }

      const scrollTo =
        direction === 'left' ? scrollLeft - scrollStep : scrollLeft + scrollStep
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
      {/* Hero Section - Steam header style banner */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden mb-12">
        <div className="absolute inset-0 z-0">
          <img
            src={featuredBanner}
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

          <div className="relative group/carousel">
            <button
              onClick={() => scroll(trendingRef, 'left')}
              title="Voir les jeux précédents"
              aria-label="Voir les jeux précédents"
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-gray-900/80 border border-gray-700 text-white p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={trendingRef}
              className="flex gap-3 overflow-x-auto py-2 snap-x snap-mandatory scrollbar-hide"
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
            </div>

            <button
              onClick={() => scroll(trendingRef, 'right')}
              title="Voir les jeux suivants"
              aria-label="Voir les jeux suivants"
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-gray-900/80 border border-gray-700 text-white p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-800"
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

          <div className="relative group/carousel">
            <button
              onClick={() => scroll(releasesRef, 'left')}
              title="Voir les sorties précédentes"
              aria-label="Voir les sorties précédentes"
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-gray-900/80 border border-gray-700 text-white p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={releasesRef}
              className="flex gap-3 overflow-x-auto py-2 snap-x snap-mandatory scrollbar-hide"
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
            </div>

            <button
              onClick={() => scroll(releasesRef, 'right')}
              title="Voir les sorties suivantes"
              aria-label="Voir les sorties suivantes"
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-gray-900/80 border border-gray-700 text-white p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-800"
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

          <div className="relative group/carousel">
            <button
              onClick={() => scroll(reviewsRef, 'left')}
              title="Voir les critiques précédentes"
              aria-label="Voir les critiques précédentes"
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-gray-900/80 border border-gray-700 text-white p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={reviewsRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x scrollbar-hide"
            >
              {popularReviews.map((review) => (
                <div key={review.id} className="snap-start w-[400px] shrink-0">
                  <ReviewCard review={review} showGameInfo={true} />
                </div>
              ))}
            </div>

            <button
              onClick={() => scroll(reviewsRef, 'right')}
              title="Voir les critiques suivantes"
              aria-label="Voir les critiques suivantes"
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-gray-900/80 border border-gray-700 text-white p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-gray-800"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
