import { motion } from 'framer-motion'
import React from 'react'
import { Link } from 'react-router-dom'

import { Game } from '../services/api'
interface GameCardProps {
  game: Game
}
export const getRatingColor = (rating: number) => {
  if (rating >= 7) return 'text-ratingGood'
  if (rating >= 5) return 'text-ratingMid'
  return 'text-ratingBad'
}
export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <motion.div
      whileHover={{
        y: -4
      }}
      transition={{
        duration: 0.2
      }}
      className="group relative flex flex-col h-full w-full max-w-[200px] shrink-0"
    >
      <Link to={`/games/${game.id}`} className="block flex-grow flex flex-col">
        {/* Image Section - Portrait */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-gray-900 border border-gray-800 mb-3 shadow-lg group-hover:border-gray-600 transition-colors">
          <img
            src={game.image}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-grow">
          <h3 className="font-inter font-medium text-sm text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
            {game.title}
          </h3>

          <div className="mt-auto pt-2 flex items-center gap-1.5">
            <div
              className={`flex items-center gap-1 font-bold ${getRatingColor(game.rating)}`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span>{game.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
