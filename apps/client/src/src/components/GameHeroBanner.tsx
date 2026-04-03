import { Bookmark, Check, ExternalLink, Heart, Play } from 'lucide-react'
import React from 'react'

import { API_BASE_URL, Game, GameStatusSummary } from '../services/api'
import { getRatingColor } from './GameCard'

type GameHeroBannerProps = {
  game: Game
  releaseYear: number | 'N/A'
  steamUrl: string | null
  statusSummary: GameStatusSummary
  onImageFallback: (event: React.SyntheticEvent<HTMLImageElement>) => void
}

export const GameHeroBanner: React.FC<GameHeroBannerProps> = ({
  game,
  releaseYear,
  steamUrl,
  statusSummary,
  onImageFallback
}) => {
  return (
    <div className="relative h-[400px] w-full bg-gray-900 border-b border-gray-800">
      <div className="absolute inset-0 overflow-hidden">
        {game.bannerImage || game.image ? (
          <img
            src={`${API_BASE_URL}/v1/${game.bannerImage || game.image}`}
            alt={game.title}
            onError={onImageFallback}
            className="w-full h-full object-cover opacity-30 blur-sm"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-black via-gray-900 to-darkBg" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-darkBg to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-darkBg via-darkBg/80 to-transparent"></div>
      </div>

      <div className="absolute bottom-0 left-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end gap-8 pb-8">
          <div className="w-[220px] shrink-0 rounded-md overflow-hidden border border-gray-700 shadow-2xl relative z-10 translate-y-16">
            <img
              src={`${API_BASE_URL}/v1/${game.image}`}
              alt={game.title}
              onError={onImageFallback}
              className="w-full h-auto object-cover aspect-[2/3]"
            />
          </div>

          <div className="pb-4 relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {game.title}
            </h1>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <p className="text-xl text-gray-300">{releaseYear}</p>
              {steamUrl && (
                <a
                  href={steamUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-md border border-gray-600 bg-gray-900/70 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:border-gray-400 hover:bg-gray-800"
                >
                  Voir sur Steam
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 border border-gray-700 rounded bg-gray-900/80 backdrop-blur-sm ${getRatingColor(game.rating)}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span className="font-bold text-xl">
                  {game.rating.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" /> {statusSummary.favorite}
                </span>
                <span className="flex items-center gap-1">
                  <Bookmark className="w-4 h-4" /> {statusSummary.want_to_play}
                </span>
                <span className="flex items-center gap-1">
                  <Play className="w-4 h-4" /> {statusSummary.playing}
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> {statusSummary.played}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
