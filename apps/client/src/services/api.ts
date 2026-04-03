import axios from 'axios'

import type { GameResponse } from '../types/games'
import type { ReviewResponse } from '../types/reviews'

import { gameService } from './games'
import { fetchReviewsRaw } from './reviews'

export type Catalog = {
  games: GameResponse[]
  reviews: ReviewResponse[]
}

export const API_BASE_URL =
  (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL ?? 'http://localhost:4000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

let catalogPromise: Promise<Catalog> | null = null

export const safeParseJson = <T>(value: string | null): T | null => {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export const invalidateCatalog = () => {
  catalogPromise = null
}

export const loadCatalog = async (): Promise<Catalog> => {
  if (!catalogPromise) {
    catalogPromise = Promise.all([
      gameService.fetchGamesRaw(),
      fetchReviewsRaw()
    ]).then(([games, reviews]) => ({
      games,
      reviews
    }))
  }

  try {
    return await catalogPromise
  } catch (error) {
    catalogPromise = null
    throw error
  }
}

export * from './admin'
export * from './auth'
export * from './contact'
export * from './errors'
export * from './games'
export * from './reviews'
