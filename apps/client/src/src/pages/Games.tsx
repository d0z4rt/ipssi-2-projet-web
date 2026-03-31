import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Gamepad2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { GameCard } from '../components/GameCard'
import { Game, gameService } from '../services/api'
export const Games: React.FC = () => {
  const [games, setGames] = useState<Game[]>([])
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const genres = [
    'Action',
    'RPG',
    'Adventure',
    'Strategy',
    'Sports',
    'Puzzle',
    'Shooter'
  ]

  const platforms = ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile']
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await gameService.getGames()
        setGames(data)
        setFilteredGames(data)
      } catch (error) {
        console.error('Failed to fetch games', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGames()
  }, [])
  useEffect(() => {
    let result = games
    if (searchTerm) {
      result = result.filter(
        (game) =>
          game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          game.developer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (selectedGenre) {
      result = result.filter((game) => game.genre === selectedGenre)
    }
    if (selectedPlatform) {
      result = result.filter((game) => game.platform.includes(selectedPlatform))
    }
    if (minRating > 0) {
      result = result.filter((game) => game.rating >= minRating)
    }
    setFilteredGames(result)
  }, [searchTerm, selectedGenre, selectedPlatform, minRating, games])
  const clearFilters = () => {
    setSearchTerm('')
    setSelectedGenre('')
    setSelectedPlatform('')
    setMinRating(0)
  }
  const hasActiveFilters =
    selectedGenre || selectedPlatform || minRating > 0 || searchTerm
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
              title="Filtrer par note minimale"
              aria-label="Filtrer par note minimale"
              className="block w-40 pl-3 pr-10 py-3 text-base border-gray-700 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-lg bg-darkBg text-gray-300 border"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
            >
              <option value="0">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4">4.0+ Stars</option>
              <option value="3">3.0+ Stars</option>
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
                  title="Filtrer mobile par note minimale"
                  aria-label="Filtrer mobile par note minimale"
                  className="block w-full pl-3 pr-10 py-3 text-base border-gray-700 rounded-lg bg-darkBg text-gray-300 border"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                >
                  <option value="0">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4">4.0+ Stars</option>
                  <option value="3">3.0+ Stars</option>
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
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
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
