import { Play } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { ErrorBanner } from '../components/ErrorBanner'
import { FullPageSpinner } from '../components/FullPageSpinner'
import { GameHeroBanner } from '../components/GameHeroBanner'
import { GameStatusPanel } from '../components/GameStatusPanel'
import { ReviewCard } from '../components/ReviewCard'
import { ReviewForm } from '../components/ReviewForm'
import { useAuth } from '../context/AuthContext'
import { useGameDetails } from '../hooks/useGameDetails'
import { useGameStatus } from '../hooks/useGameStatus'
import { API_BASE_URL, Review } from '../services/api'

type ReviewSortOption = 'most_liked' | 'latest' | 'rating_desc'
const REVIEW_FORM_ANCHOR_ID = 'review-form'

export const GameDetails: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const { slug } = useParams<{
    slug: string
  }>()
  const { game, reviews, loading, setReviews } = useGameDetails(slug)
  const {
    gameStatus,
    gameFavorite,
    isLoadingStatuses,
    statusSummary,
    statusError,
    statusLoadingByType,
    toggleStatus,
    setStatusError
  } = useGameStatus(game?.id, isAuthenticated)
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSort, setReviewSort] = useState<ReviewSortOption>('most_liked')

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [slug, location.hash])

  useEffect(() => {
    if (loading || reviews.length === 0) return

    const hash = location.hash
    if (!hash) return

    const targetId = hash.startsWith('#') ? hash.slice(1) : hash
    const target = document.getElementById(targetId)
    if (!target) return

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading, location.hash, reviews])

  const sortedReviews = useMemo(() => {
    const nextReviews = reviews.slice()

    if (reviewSort === 'latest') {
      return nextReviews.sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime()
      )
    }

    if (reviewSort === 'rating_desc') {
      return nextReviews.sort(
        (left, right) =>
          right.rating - left.rating ||
          new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime()
      )
    }

    return nextReviews.sort(
      (left, right) =>
        right.likes - left.likes ||
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )
  }, [reviews, reviewSort])

  if (loading) {
    return <FullPageSpinner />
  }
  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg px-4">
        <div className="max-w-lg rounded-xl border border-gray-800 bg-cardBg p-8 text-center">
          <h1 className="text-2xl font-orbitron font-bold text-white mb-3">
            Game not found
          </h1>
          <p className="text-gray-400 mb-6">
            The selected game could not be loaded from the API.
          </p>
          <a
            href="/games"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 font-bold text-darkBg hover:bg-accent/90 transition-colors"
          >
            Back to games
          </a>
        </div>
      </div>
    )
  }
  const releaseDate = new Date(game.releaseDate)
  const isReleaseDateValid = !Number.isNaN(releaseDate.getTime())
  const releaseYear = isReleaseDateValid ? releaseDate.getFullYear() : 'N/A'
  const formattedDate = isReleaseDateValid
    ? new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(releaseDate)
    : 'Date inconnue'
  const platforms = Array.isArray(game.platform) ? game.platform : []
  const developerLabel = game.developer?.trim() || 'Inconnu'
  const genreLabel = game.genre?.trim() || 'Inconnu'
  const descriptionLabel =
    game.description?.trim() || 'Description indisponible.'
  const galleryImages =
    game.screenshots && game.screenshots.length > 0
      ? game.screenshots.filter(Boolean)
      : [game.bannerImage || game.image].filter(Boolean)
  const trailerPreview = galleryImages[0] || game.bannerImage || game.image
  const steamUrl = game.steamAppId
    ? `https://store.steampowered.com/app/${game.steamAppId}`
    : null
  const handleImageFallback = (
    event: React.SyntheticEvent<HTMLImageElement>
  ) => {
    event.currentTarget.src = game.image
  }

  const canWriteReview = Boolean(
    user && (user.role === 'admin' || user.isCurator)
  )

  const openReviewForm = () => {
    setReviewError('')
    if (!isAuthenticated) {
      setReviewError('You need to log in to write a review.')
      return
    }
    if (!canWriteReview) {
      setReviewError('Only curator or admin accounts can publish reviews.')
      return
    }

    setIsReviewFormOpen(true)
    window.requestAnimationFrame(() => {
      const target = document.getElementById(REVIEW_FORM_ANCHOR_ID)
      if (!target) {
        return
      }

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    })
  }

  return (
    <div className="min-h-screen bg-darkBg pb-20">
      <GameHeroBanner
        game={game}
        releaseYear={releaseYear}
        steamUrl={steamUrl}
        statusSummary={statusSummary}
        onImageFallback={handleImageFallback}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Left Sidebar - Actions */}
          <div className="lg:col-span-1 space-y-8">
            <GameStatusPanel
              canWriteReview={canWriteReview}
              onOpenReviewForm={openReviewForm}
              statusError={statusError}
              isLoadingStatuses={isLoadingStatuses}
              statusLoadingByType={statusLoadingByType}
              gameStatus={gameStatus}
              gameFavorite={gameFavorite}
              onToggleStatus={toggleStatus}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-10">
            {/* Game Info */}
            <section className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="rounded-lg border border-gray-800 bg-cardBg px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                    Studio
                  </p>
                  <p className="text-sm text-gray-100">{developerLabel}</p>
                </div>
                <div className="rounded-lg border border-gray-800 bg-cardBg px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                    Date de sortie
                  </p>
                  <p className="text-sm text-gray-100">{formattedDate}</p>
                </div>
                <div className="rounded-lg border border-gray-800 bg-cardBg px-4 py-3 sm:col-span-2 lg:col-span-1">
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                    Genre
                  </p>
                  <p className="text-sm text-gray-100">{genreLabel}</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-800 bg-cardBg/70 p-5">
                <div className="pb-4 border-b border-gray-800">
                  <p className="mb-2 text-[11px] uppercase tracking-wider text-gray-500">
                    Plateformes
                  </p>
                  <p className="text-sm text-gray-200">
                    {platforms.length > 0
                      ? platforms.join(' • ')
                      : 'Platforms unavailable'}
                  </p>
                </div>

                <div className="pt-4">
                  <p className="mb-2 text-[11px] uppercase tracking-wider text-gray-500">
                    Description
                  </p>
                  <p className="text-base leading-relaxed text-gray-100">
                    {descriptionLabel}
                  </p>
                </div>
              </div>
            </section>

            {/* Media Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-bold mb-4 uppercase tracking-wider">
                  Bandes-Annonces
                </h3>
                <div className="relative aspect-video bg-gray-900 rounded overflow-hidden group cursor-pointer border border-gray-800">
                  <img
                    src={`${API_BASE_URL}/v1/${trailerPreview}`}
                    alt="Trailer"
                    onError={handleImageFallback}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Play
                        className="w-6 h-6 text-black ml-1"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-gray-900/80 px-2 py-1 text-xs text-white rounded">
                    VOST 1
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <h3 className="text-white font-bold uppercase tracking-wider">
                    Images
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {galleryImages.slice(0, 6).map((imageUrl, index) => (
                    <div
                      key={imageUrl}
                      className="aspect-square bg-gray-800 rounded overflow-hidden"
                    >
                      <img
                        src={`${API_BASE_URL}/v1/${imageUrl}`}
                        alt={`${game.title} screenshot ${index + 1}`}
                        loading="lazy"
                        onError={handleImageFallback}
                        className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Reviews Section */}
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-2">
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                  Critiques : Avis d'internautes ({reviews.length})
                </h2>
                {canWriteReview && (
                  <button
                    onClick={openReviewForm}
                    className="text-sm text-blue-400 hover:underline"
                  >
                    Écrire une critique
                  </button>
                )}
              </div>

              {reviewError && (
                <ErrorBanner message={reviewError} className="mb-4" />
              )}

              <div id={REVIEW_FORM_ANCHOR_ID} className="scroll-mt-28">
                <ReviewForm
                  gameId={game.id}
                  isOpen={isReviewFormOpen}
                  isSubmitting={isSubmittingReview}
                  onSubmittingChange={setIsSubmittingReview}
                  onCreated={(createdReview: Review) => {
                    setReviews((currentReviews) => [
                      createdReview,
                      ...currentReviews
                    ])
                    setIsReviewFormOpen(false)
                    setReviewError('')
                    setStatusError('')
                  }}
                  onCancel={() => {
                    setIsReviewFormOpen(false)
                    setReviewError('')
                  }}
                />
              </div>

              <div className="mb-6">
                <select
                  title="Sort reviews"
                  aria-label="Sort reviews"
                  value={reviewSort}
                  onChange={(event) =>
                    setReviewSort(event.target.value as ReviewSortOption)
                  }
                  className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-gray-500"
                >
                  <option value="most_liked">Plus likées</option>
                  <option value="latest">Plus récentes</option>
                  <option value="rating_desc">Note déposée (10 → 0)</option>
                </select>
              </div>

              <div className="space-y-4">
                {sortedReviews.map((review) => (
                  <div
                    key={review.id}
                    id={`review-${review.id}`}
                    className="scroll-mt-28"
                  >
                    <ReviewCard review={review} showGameInfo={false} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
