import { Check, Heart, Bookmark, ListPlus, Play, BarChart2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { getRatingColor } from '../components/GameCard'
import { ReviewCard } from '../components/ReviewCard'
import { useAuth } from '../context/AuthContext'
import { Game, Review, gameService, reviewService } from '../services/api'
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
    if (loading || reviews.length === 0) return

    const hash = location.hash
    if (!hash) return

    const targetId = hash.startsWith('#') ? hash.slice(1) : hash
    const target = document.getElementById(targetId)
    if (!target) return

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading, location.hash, reviews])
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
  const reviewCount = reviews.length
  const totalLikes = reviews.reduce((sum, review) => sum + review.likes, 0)
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : '0.0'
  const releaseYear = new Date(game.releaseDate).getFullYear()
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(game.releaseDate))
  const galleryImages =
    game.screenshots && game.screenshots.length > 0
      ? game.screenshots
      : [game.bannerImage || game.image]
  const trailerPreview = galleryImages[0] || game.bannerImage || game.image
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
              src={game.bannerImage || game.image}
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
                src={game.image}
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
              <p className="text-xl text-gray-300 mb-6">{releaseYear}</p>

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
                    <Heart className="w-4 h-4" /> {totalLikes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-4 h-4" /> {reviewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart2 className="w-4 h-4" /> {averageRating}
                  </span>
                  <button
                    title="Open statistics"
                    aria-label="Open statistics"
                    className="p-2 border border-gray-700 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
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

              <button
                onClick={openReviewForm}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded mb-4 transition-colors"
              >
                ÉCRIRE UNE CRITIQUE
              </button>

              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors">
                  <Check className="w-4 h-4" /> Joué
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors">
                  <Bookmark className="w-4 h-4" /> Envie d'y jouer
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors">
                  <Play className="w-4 h-4" /> En cours
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors">
                  <Heart className="w-4 h-4" /> Coup de coeur
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors">
                  <ListPlus className="w-4 h-4" /> Ajouter à une liste
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-3 uppercase text-sm tracking-wider">
                Accès Rapide
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-blue-400">Description</span>
                </li>
                <li>
                  <span className="text-blue-400">Medias</span>
                </li>
                <li>
                  <span className="text-blue-400">Tops</span>
                </li>
                <li>
                  <span className="text-blue-400">Critiques</span>
                </li>
                <li>
                  <span className="text-blue-400">Listes</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-10">
            {/* Game Info */}
            <section className="text-gray-300 text-sm leading-relaxed space-y-4">
              <p>
                Jeu de <span className="text-white">{game.developer}</span> •{' '}
                {game.platform.length > 0
                  ? game.platform.join(', ')
                  : 'Platforms unavailable'}{' '}
                • {formattedDate} (France)
              </p>
              <p>
                <span className="text-white font-medium">Genres :</span>{' '}
                {game.genre}
              </p>
              <span className="text-blue-400 block mb-4">
                Toutes les informations
              </span>

              <p className="text-base">{game.description}</p>
            </section>

            {/* Media Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-bold mb-4 uppercase tracking-wider">
                  Bandes-Annonces
                </h3>
                <div className="relative aspect-video bg-gray-900 rounded overflow-hidden group cursor-pointer border border-gray-800">
                  <img
                    src={trailerPreview}
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold uppercase tracking-wider">
                    Images
                  </h3>
                  <span className="text-blue-400 text-sm">Voir les images</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {galleryImages.slice(0, 6).map((imageUrl, index) => (
                    <div
                      key={imageUrl}
                      className="aspect-square bg-gray-800 rounded overflow-hidden"
                    >
                      <img
                        src={imageUrl}
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
                <button
                  onClick={openReviewForm}
                  className="text-sm text-blue-400 hover:underline"
                >
                  Écrire une critique
                </button>
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
                  className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-gray-500"
                >
                  <option>Recommandées</option>
                  <option>Plus récentes</option>
                  <option>Mieux notées</option>
                </select>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
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
