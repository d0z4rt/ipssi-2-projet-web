import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Gamepad2 } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'

import { FullPageSpinner } from '../components/FullPageSpinner'
import { GameCard } from '../components/GameCard'
import { useAuth } from '../context/AuthContext'
import { Game, gameService } from '../services/api'
import { GameUserStatusType } from '../types/games'

type StatusFilterValue = '' | GameUserStatusType | 'favorite'
type RatingFilterValue =
  | 'all'
  | '0_2'
  | '3_4'
  | '5_6'
  | '7_8'
  | '9_10'

const statusFilterOptions: Array<{
  value: StatusFilterValue
  label: string
}> = [
  {
    value: '',
    label: 'Tous les statuts'
  },
  {
    value: 'want_to_play',
    label: 'Envie de jouer'
  },
  {
    value: 'playing',
    label: 'En cours'
  },
  {
    value: 'played',
    label: 'Termine'
  },
  {
    value: 'favorite',
    label: 'Favori'
  }
]

const ratingFilterOptions: Array<{
  value: RatingFilterValue
  label: string
}> = [
  {
    value: 'all',
    label: 'Toutes les notes'
  },
  {
    value: '0_2',
    label: '0-2/10'
  },
  {
    value: '3_4',
    label: '3-4/10'
  },
  {
    value: '5_6',
    label: '5-6/10'
  },
  {
    value: '7_8',
    label: '7-8/10'
  },
  {
    value: '9_10',
    label: '9-10/10'
  }
]

const matchesRatingRange = (
  rating: number,
  ratingFilter: RatingFilterValue
) => {
  if (ratingFilter === 'all') {
    return true
  }

  if (ratingFilter === '0_2') {
    return rating >= 0 && rating < 3
  }

  if (ratingFilter === '3_4') {
    return rating >= 3 && rating < 5
  }

  if (ratingFilter === '5_6') {
    return rating >= 5 && rating < 7
  }

  if (ratingFilter === '7_8') {
    return rating >= 7 && rating < 9
  }

  if (ratingFilter === '9_10') {
    return rating >= 9
  }

  return false
}

export const Games: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilterValue>('')
  const [selectedRatingFilter, setSelectedRatingFilter] =
    useState<RatingFilterValue>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [statusesByGameId, setStatusesByGameId] = useState<
    Map<string, Array<GameUserStatusType | 'favorite'>>
  >(new Map())

  const genres = useMemo(() => {
    const uniqueGenres = new Set<string>()

    for (const game of games) {
      const gameGenres = game.genres.length > 0 ? game.genres : [game.genre]
      for (const genre of gameGenres) {
        const normalizedGenre = genre.trim()
        if (normalizedGenre) {
          uniqueGenres.add(normalizedGenre)
        }
      }
    }

    return Array.from(uniqueGenres).sort((left, right) =>
      left.localeCompare(right)
    )
  }, [games])

  const platforms = useMemo(() => {
    const uniquePlatforms = new Set<string>()

    for (const game of games) {
      for (const platform of game.platform) {
        const normalizedPlatform = platform.trim()
        if (normalizedPlatform) {
          uniquePlatforms.add(normalizedPlatform)
        }
      }
    }

    return Array.from(uniquePlatforms).sort((left, right) =>
      left.localeCompare(right)
    )
  }, [games])

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true)
      try {
        const data = await gameService.getGames()
        setGames(data)

        if (!isAuthenticated) {
          setStatusesByGameId(new Map())
          return
        }

        try {
          const gamesWithStatuses = await gameService.getMyGamesWithStatuses()
          const nextStatusesByGameId = new Map<
            string,
            Array<GameUserStatusType | 'favorite'>
          >()

          for (const entry of gamesWithStatuses) {
            nextStatusesByGameId.set(entry.game.id, entry.statuses)
          }

          setStatusesByGameId(nextStatusesByGameId)
        } catch (error) {
          setStatusesByGameId(new Map())
          // oxlint-disable-next-line no-console
          console.error('Failed to fetch user game statuses', error)
        }
      } catch (error) {
        setStatusesByGameId(new Map())
        // oxlint-disable-next-line no-console
        console.error('Failed to fetch games', error)
      } finally {
        setLoading(false)
      }
    }
    void fetchGames()
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedStatus('')
    }
  }, [isAuthenticated])

  const filteredGames = useMemo(() => {
    let result = games

    if (searchTerm) {
      result = result.filter(
        (game) =>
          game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          game.developer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedGenre) {
      result = result.filter((game) => {
        const gameGenres = game.genres.length > 0 ? game.genres : [game.genre]
        return gameGenres.includes(selectedGenre)
      })
    }

    if (selectedPlatform) {
      result = result.filter((game) => game.platform.includes(selectedPlatform))
    }

    if (selectedStatus) {
      result = result.filter((game) => {
        const gameStatuses = statusesByGameId.get(game.id) ?? []
        return gameStatuses.includes(selectedStatus)
      })
    }

    if (selectedRatingFilter !== 'all') {
      result = result.filter((game) =>
        matchesRatingRange(game.rating, selectedRatingFilter)
      )
    }

    return result
  }, [
    games,
    searchTerm,
    selectedGenre,
    selectedPlatform,
    selectedRatingFilter,
    selectedStatus,
    statusesByGameId
  ])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedGenre('')
    setSelectedPlatform('')
    setSelectedStatus('')
    setSelectedRatingFilter('all')
  }
  const hasActiveFilters =
    selectedGenre ||
    selectedPlatform ||
    selectedStatus ||
    selectedRatingFilter !== 'all' ||
    searchTerm
  return (
    <div className="pt-24 pb-20 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-orbitron font-bold text-white mb-2">
          Game Library
        </h1>
        <p className="text-gray-400">
          Browse and discover your next favorite game.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-cardBg border border-gray-800 rounded-xl p-4 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg leading-5 bg-darkBg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm transition-colors"
              placeholder="Search games by title or developer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-darkBg border border-gray-700 rounded-lg text-gray-300 hover:text-white"
          >
            <Filter className="w-5 h-5" />
            Filters{' '}
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-accent"></span>
            )}
          </button>

          {/* Desktop Filters */}
          <div className="hidden md:flex gap-4">
            <select
              title="Filtrer par genre"
              aria-label="Filtrer par genre"
              className="block w-40 pl-3 pr-10 py-3 text-base border-gray-700 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-lg bg-darkBg text-gray-300 border"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              title="Filtrer par plateforme"
              aria-label="Filtrer par plateforme"
              className="block w-40 pl-3 pr-10 py-3 text-base border-gray-700 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-lg bg-darkBg text-gray-300 border"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
            >
              <option value="">All Platforms</option>
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              title="Filtrer par statut"
              aria-label="Filtrer par statut"
              className="block w-44 pl-3 pr-10 py-3 text-base border-gray-700 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-lg bg-darkBg text-gray-300 border disabled:opacity-60 disabled:cursor-not-allowed"
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as StatusFilterValue)
              }
              disabled={!isAuthenticated}
            >
              {statusFilterOptions.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              title="Filtrer par plage de note"
              aria-label="Filtrer par plage de note"
              className="block w-40 pl-3 pr-10 py-3 text-base border-gray-700 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-lg bg-darkBg text-gray-300 border"
              value={selectedRatingFilter}
              onChange={(e) =>
                setSelectedRatingFilter(e.target.value as RatingFilterValue)
              }
            >
              {ratingFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                title="Clear Filters"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filters Expandable */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0
              }}
              animate={{
                height: 'auto',
                opacity: 1
              }}
              exit={{
                height: 0,
                opacity: 0
              }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-800 flex flex-col gap-3">
                <select
                  title="Filtrer mobile par genre"
                  aria-label="Filtrer mobile par genre"
                  className="block w-full pl-3 pr-10 py-3 text-base border-gray-700 rounded-lg bg-darkBg text-gray-300 border"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                >
                  <option value="">All Genres</option>
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                <select
                  title="Filtrer mobile par plateforme"
                  aria-label="Filtrer mobile par plateforme"
                  className="block w-full pl-3 pr-10 py-3 text-base border-gray-700 rounded-lg bg-darkBg text-gray-300 border"
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                >
                  <option value="">All Platforms</option>
                  {platforms.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>

                <select
                  title="Filtrer mobile par statut"
                  aria-label="Filtrer mobile par statut"
                  className="block w-full pl-3 pr-10 py-3 text-base border-gray-700 rounded-lg bg-darkBg text-gray-300 border disabled:opacity-60 disabled:cursor-not-allowed"
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as StatusFilterValue)
                  }
                  disabled={!isAuthenticated}
                >
                  {statusFilterOptions.map((option) => (
                    <option key={`mobile-${option.value || 'all'}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  title="Filtrer mobile par plage de note"
                  aria-label="Filtrer mobile par plage de note"
                  className="block w-full pl-3 pr-10 py-3 text-base border-gray-700 rounded-lg bg-darkBg text-gray-300 border"
                  value={selectedRatingFilter}
                  onChange={(e) =>
                    setSelectedRatingFilter(e.target.value as RatingFilterValue)
                  }
                >
                  {ratingFilterOptions.map((option) => (
                    <option key={`mobile-rating-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <X className="w-5 h-5" /> Clear All Filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      {loading ? (
        <FullPageSpinner className="min-h-0 py-20 bg-transparent" />
      ) : filteredGames.length > 0 ? (
        <>
          <p className="text-gray-400 mb-6 text-sm">
            Showing {filteredGames.length} result
            {filteredGames.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-cardBg/50 border border-gray-800 rounded-xl">
          <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-orbitron text-white mb-2">
            No games found
          </h3>
          <p className="text-gray-400 mb-6">
            Try adjusting your filters or search term.
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-accent text-darkBg font-bold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
