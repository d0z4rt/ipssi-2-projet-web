import React, { useState } from 'react'

import { Review, reviewService } from '../services/api'
import { textFieldClassName } from '../styles/form'
import { ErrorBanner } from './ErrorBanner'

type ReviewFormProps = {
  gameId: string
  isOpen: boolean
  isSubmitting: boolean
  onSubmittingChange: (isSubmitting: boolean) => void
  onCreated: (review: Review) => void
  onCancel: () => void
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  gameId,
  isOpen,
  isSubmitting,
  onSubmittingChange,
  onCreated,
  onCancel
}) => {
  const [title, setTitle] = useState('')
  const [rating, setRating] = useState(7)
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    const parsedTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    if (!trimmedTitle) {
      setError('Title is required.')
      return
    }

    if (rating < 0 || rating > 10) {
      setError('Rating must be between 0 and 10.')
      return
    }

    onSubmittingChange(true)
    setError('')
    try {
      const createdReview = await reviewService.addReview({
        title: trimmedTitle,
        content: trimmedContent,
        rating,
        gameId,
        tags: parsedTags
      })
      onCreated(createdReview)
      setTitle('')
      setRating(7)
      setContent('')
      setTags('')
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to publish review. Please try again.'
      )
    } finally {
      onSubmittingChange(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-xl border border-gray-800 bg-cardBg p-5 space-y-4"
    >
      {error && <ErrorBanner message={error} className="mb-1" />}

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
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={textFieldClassName}
          placeholder="Your review title"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="text-sm text-gray-300">Rating / 10</span>
          <span className="text-sm font-medium text-white">{rating}/10</span>
        </div>
        <div
          className="grid grid-cols-10 gap-1"
          role="radiogroup"
          aria-label="Select review rating"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
            const isSelected = score <= rating
            return (
              <button
                key={score}
                type="button"
                aria-label={`Set rating to ${score} out of 10`}
                onClick={() => setRating(score)}
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
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          className={textFieldClassName}
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
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          className={textFieldClassName}
          placeholder="example: Masterpiece, Great Story"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-accent px-4 py-2 text-darkBg font-bold hover:bg-accent/90 disabled:opacity-60"
        >
          {isSubmitting ? 'Publishing...' : 'Publish review'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-700 px-4 py-2 text-gray-300 hover:text-white hover:border-gray-500"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
