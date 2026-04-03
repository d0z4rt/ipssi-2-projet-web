import { Bookmark, Check, Heart, Play } from 'lucide-react'
import React from 'react'

import { GameUserStatusType } from '../types/games'
import { ErrorBanner } from './ErrorBanner'

type StatusButtonConfig = {
  status: GameUserStatusType | 'favorite'
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const STATUS_BUTTONS: StatusButtonConfig[] = [
  {
    status: 'played',
    label: 'Fini',
    icon: Check
  },
  {
    status: 'want_to_play',
    label: "Envie d'y jouer",
    icon: Bookmark
  },
  {
    status: 'playing',
    label: 'En cours',
    icon: Play
  },
  {
    status: 'favorite',
    label: 'Coup de coeur',
    icon: Heart
  }
]

type GameStatusPanelProps = {
  canWriteReview: boolean
  onOpenReviewForm: () => void
  statusError: string
  isLoadingStatuses: boolean
  statusLoadingByType: Record<GameUserStatusType | 'favorite', boolean>
  gameStatus: GameUserStatusType | null
  gameFavorite: boolean
  onToggleStatus: (status: GameUserStatusType | 'favorite') => Promise<void>
}

export const GameStatusPanel: React.FC<GameStatusPanelProps> = ({
  canWriteReview,
  onOpenReviewForm,
  statusError,
  isLoadingStatuses,
  statusLoadingByType,
  gameStatus,
  gameFavorite,
  onToggleStatus
}) => {
  return (
    <div className="bg-cardBg border border-gray-800 rounded-lg p-5">
      <h3 className="text-white font-bold mb-3">Ma note</h3>

      {canWriteReview && (
        <button
          onClick={onOpenReviewForm}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded mb-4 transition-colors"
        >
          ÉCRIRE UNE CRITIQUE
        </button>
      )}

      {statusError && (
        <ErrorBanner message={statusError} compact={true} className="mb-3" />
      )}

      {isLoadingStatuses && (
        <p className="mb-3 text-xs text-gray-400">
          Chargement de vos statuts...
        </p>
      )}

      <div className="space-y-1">
        {STATUS_BUTTONS.map(({ status, label, icon: Icon }) => {
          const active =
            gameStatus === status || (status === 'favorite' && gameFavorite)
          const loadingStatus = statusLoadingByType[status]

          return (
            <button
              key={status}
              type="button"
              onClick={() => void onToggleStatus(status)}
              disabled={loadingStatus}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors border ${
                active
                  ? 'text-white bg-accent/15 border-accent/50'
                  : 'text-gray-300 border-transparent hover:bg-gray-800'
              } ${loadingStatus ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
