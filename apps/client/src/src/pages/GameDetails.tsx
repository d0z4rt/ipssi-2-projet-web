import { Check, Heart, Bookmark, Play, ExternalLink } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { getRatingColor } from '../components/GameCard'
import { ReviewCard } from '../components/ReviewCard'
import { useAuth } from '../context/AuthContext'
import {
  API_BASE_URL,
  Game,
  GameStatusSummary,
  GameUserStatus,
  Review,
  gameService,
  reviewService
} from '../services/api'

type StatusButtonConfig = {
  status: GameUserStatus | 'favorite'
  label: string
  icon: React.ComponentType<{ className?: string }>
}

type ReviewSortOption = 'most_liked' | 'latest' | 'rating_desc'

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

const createStatusLoadingState = (): Record<
  GameUserStatus | 'favorite',
  boolean
> => ({
  played: false,
  want_to_play: false,
  playing: false,
  favorite: false
})

const createEmptyStatusSummary = (): GameStatusSummary => ({
  played: 0,
  want_to_play: 0,
  playing: 0,
  favorite: 0
})

export const GameDetails: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const { slug } = useParams<{
    slug: string
  }>()
  const [game, setGame] = useState<Game | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewRating, setReviewRating] = useState(7)
  const [reviewContent, setReviewContent] = useState('')
  const [reviewTags, setReviewTags] = useState('')
  const [reviewSort, setReviewSort] = useState<ReviewSortOption>('most_liked')
  const [gameStatus, setGameStatus] = useState<GameUserStatus | null>(null)
  const [gameFavorite, setGameFavorite] = useState<boolean>(false)
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false)
  const [statusSummary, setStatusSummary] = useState<GameStatusSummary>(
    createEmptyStatusSummary
  )
  const [statusError, setStatusError] = useState('')
  const [statusLoadingByType, setStatusLoadingByType] = useState<
    Record<GameUserStatus | 'favorite', boolean>
  >(createStatusLoadingState)
  useEffect(() => {
    const fetchGameData = async () => {
      if (!slug) return
      try {
        setLoading(true)
        const gameData = await gameService.getGameBySlug(slug)
        if (!gameData) {
          setGame(null)
          setReviews([])
          return
        }

        setGame(gameData)

        try {
          const reviewsData = await reviewService.getReviewsByGame(gameData.id)
          setReviews(reviewsData)
        } catch {
          setReviews([])
        }
      } catch {
        setGame(null)
        setReviews([])
      } finally {
        setLoading(false)
      }
    }
    fetchGameData()
  }, [slug])

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

  useEffect(() => {
    const fetchStatus = async () => {
      if (!game || !isAuthenticated) {
        setGameStatus(null)
        return
      }

      setIsLoadingStatuses(true)
      setStatusError('')
      try {
        const status = await gameService.getMyStatus(game.id)
        setGameStatus(status.status)
      } catch (error) {
        setStatusError(
          error instanceof Error
            ? error.message
            : 'Impossible de charger vos statuts pour ce jeu.'
        )
      } finally {
        setIsLoadingStatuses(false)
      }
    }

    void fetchStatus()
  }, [game, isAuthenticated])

  useEffect(() => {
    if (!game) {
      setStatusSummary(createEmptyStatusSummary())
      return
    }

    let isMounted = true

    const fetchStatusSummary = async () => {
      try {
        const summary = await gameService.getStatusSummary(game.id)
        if (isMounted) {
          setStatusSummary(summary)
        }
      } catch {
        if (isMounted) {
          setStatusSummary(createEmptyStatusSummary())
        }
      }
    }

    void fetchStatusSummary()
    const intervalId = window.setInterval(() => {
      void fetchStatusSummary()
    }, 10000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [game])

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
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

  const toggleStatus = async (status: GameUserStatus | 'favorite') => {
    if (!game) {
      return
    }

    if (!isAuthenticated) {
      setStatusError('Connectez-vous pour gerer vos statuts de jeu.')
      return
    }

    setStatusError('')
    setStatusLoadingByType((current) => ({
      ...current,
      [status]: true
    }))

    try {
      if (status === 'favorite') {
        const res = await gameService.setMyStatus(
          game.id,
          gameStatus,
          !gameFavorite,
          true
        )
        setGameStatus(res.status)
        setGameFavorite(res.is_favorite)
      } else {
        let newStatus: GameUserStatus | null = status
        if (gameStatus === status) {
          setGameStatus(null)
          newStatus = null
        }
        const res = await gameService.setMyStatus(
          game.id,
          newStatus,
          gameFavorite,
          true
        )
        setGameStatus(res.status)
        setGameFavorite(res.is_favorite)
      }

      try {
        const summary = await gameService.getStatusSummary(game.id)
        setStatusSummary(summary)
      } catch {
        // keep previous summary if live refresh fails
      }
    } catch (error) {
      setStatusError(
        error instanceof Error
          ? error.message
          : 'Impossible de mettre a jour ce statut.'
      )
    } finally {
      setStatusLoadingByType((current) => ({
        ...current,
        [status]: false
      }))
    }
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
  }

  const resetReviewForm = () => {
    setReviewTitle('')
    setReviewRating(7)
    setReviewContent('')
    setReviewTags('')
    setReviewError('')
  }

  const handleCreateReview = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!game) return

    const title = reviewTitle.trim()
    const content = reviewContent.trim()
    const tags = reviewTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    if (!title) {
      setReviewError('Title is required.')
      return
    }
    if (reviewRating < 0 || reviewRating > 10) {
      setReviewError('Rating must be between 0 and 10.')
      return
    }

    setIsSubmittingReview(true)
    setReviewError('')
    try {
      const createdReview = await reviewService.addReview({
        title,
        content,
        rating: reviewRating,
        gameId: game.id,
        tags
      })
      setReviews((currentReviews) => [createdReview, ...currentReviews])
      setIsReviewFormOpen(false)
      resetReviewForm()
    } catch (error) {
      setReviewError(
        error instanceof Error
          ? error.message
          : 'Unable to publish review. Please try again.'
      )
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <div className="min-h-screen bg-darkBg pb-20">
      {/* Hero Banner Area */}
      <div className="relative h-[400px] w-full bg-gray-900 border-b border-gray-800">
        <div className="absolute inset-0 overflow-hidden">
          {game.bannerImage || game.image ? (
            <img
              src={`${API_BASE_URL}/v1/${game.bannerImage || game.image}`}
              alt={game.title}
              onError={handleImageFallback}
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
            {/* Cover Image */}
            <div className="w-[220px] shrink-0 rounded-md overflow-hidden border border-gray-700 shadow-2xl relative z-10 translate-y-16">
              <img
                src={`${API_BASE_URL}/v1/${game.image}`}
                alt={game.title}
                onError={handleImageFallback}
                className="w-full h-auto object-cover aspect-[2/3]"
              />
            </div>

            {/* Title & Basic Info */}
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
                    <Bookmark className="w-4 h-4" />{' '}
                    {statusSummary.want_to_play}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Left Sidebar - Actions */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-cardBg border border-gray-800 rounded-lg p-5">
              <h3 className="text-white font-bold mb-3">Ma note</h3>

              {canWriteReview && (
                <button
                  onClick={openReviewForm}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded mb-4 transition-colors"
                >
                  ÉCRIRE UNE CRITIQUE
                </button>
              )}

              {statusError && (
                <div className="mb-3 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {statusError}
                </div>
              )}

              {isLoadingStatuses && (
                <p className="mb-3 text-xs text-gray-400">
                  Chargement de vos statuts...
                </p>
              )}

              <div className="space-y-1">
                {STATUS_BUTTONS.map(({ status, label, icon: Icon }) => {
                  const active =
                    gameStatus === status ||
                    (status === 'favorite' && gameFavorite)
                  const loadingStatus = statusLoadingByType[status]

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => void toggleStatus(status)}
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
                <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {reviewError}
                </div>
              )}

              {isReviewFormOpen && (
                <form
                  onSubmit={handleCreateReview}
                  className="mb-6 rounded-xl border border-gray-800 bg-cardBg p-5 space-y-4"
                >
                  <div>
                    <label
                      htmlFor="review-title"
                      className="block mb-2 text-sm text-gray-300"
                    >
                      Title
                    </label>
                    <input
                      id="review-title"
                      type="text"
                      value={reviewTitle}
                      onChange={(event) => setReviewTitle(event.target.value)}
                      className="w-full rounded-lg border border-gray-700 bg-darkBg px-3 py-2 text-white focus:outline-none focus:border-accent"
                      placeholder="Your review title"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-sm text-gray-300">Rating / 10</span>
                      <span className="text-sm font-medium text-white">
                        {reviewRating}/10
                      </span>
                    </div>
                    <div
                      className="grid grid-cols-10 gap-1"
                      role="radiogroup"
                      aria-label="Select review rating"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                        const isSelected = score <= reviewRating
                        return (
                          <button
                            key={score}
                            type="button"
                            aria-label={`Set rating to ${score} out of 10`}
                            onClick={() => setReviewRating(score)}
                            className={`flex h-10 items-center justify-center rounded-md border transition-colors ${isSelected ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-gray-700 bg-darkBg text-gray-600 hover:border-gray-500 hover:text-gray-300'}`}
                          >
                            ★
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="review-content"
                      className="block mb-2 text-sm text-gray-300"
                    >
                      Content
                    </label>
                    <textarea
                      id="review-content"
                      value={reviewContent}
                      onChange={(event) => setReviewContent(event.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-gray-700 bg-darkBg px-3 py-2 text-white focus:outline-none focus:border-accent"
                      placeholder="Share your experience with this game"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="review-tags"
                      className="block mb-2 text-sm text-gray-300"
                    >
                      Tags (comma separated)
                    </label>
                    <input
                      id="review-tags"
                      type="text"
                      value={reviewTags}
                      onChange={(event) => setReviewTags(event.target.value)}
                      className="w-full rounded-lg border border-gray-700 bg-darkBg px-3 py-2 text-white focus:outline-none focus:border-accent"
                      placeholder="example: Masterpiece, Great Story"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="rounded-lg bg-accent px-4 py-2 text-darkBg font-bold hover:bg-accent/90 disabled:opacity-60"
                    >
                      {isSubmittingReview ? 'Publishing...' : 'Publish review'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsReviewFormOpen(false)
                        setReviewError('')
                      }}
                      className="rounded-lg border border-gray-700 px-4 py-2 text-gray-300 hover:text-white hover:border-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

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
