import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  DestinationRatingsContext,
  type DestinationRating,
} from './ratingsContext'
import bundledRatings from '../data/destinationRatings.json'

const RATINGS_API = '/api/ratings'
const USER_RATED_STORAGE_KEY = 'bg_destination_rated_ids'
const LAST_RATING_STORAGE_KEY = 'bg_destination_last_rating_at'
const RATING_COOLDOWN_MS = 60 * 1000

function normalizeRating(value: unknown): DestinationRating | null {
  const rating = value as Partial<DestinationRating>
  const id = String(rating?.id ?? '').trim()
  const total = Number(rating?.total ?? 0)
  const count = Number(rating?.count ?? 0)
  const average = Number(rating?.average ?? 0)

  if (!id) return null

  return {
    id,
    total: Number.isFinite(total) && total > 0 ? total : 0,
    count: Number.isFinite(count) && count > 0 ? count : 0,
    average: Number.isFinite(average) && average > 0 ? average : 0,
  }
}

function normalizeRatings(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return new Map<string, DestinationRating>()
  }

  return new Map(
    Object.entries(value)
      .map(([, rating]) => normalizeRating(rating))
      .filter((rating): rating is DestinationRating => Boolean(rating))
      .map((rating) => [rating.id, rating]),
  )
}

function readRatedIds() {
  if (typeof window === 'undefined') return new Set<string>()

  try {
    const parsed = JSON.parse(localStorage.getItem(USER_RATED_STORAGE_KEY) ?? '[]')
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [])
  } catch {
    return new Set<string>()
  }
}

function writeRatedIds(ids: Set<string>) {
  localStorage.setItem(USER_RATED_STORAGE_KEY, JSON.stringify(Array.from(ids)))
}

function readLastRatingAt() {
  if (typeof window === 'undefined') return 0

  const value = Number(localStorage.getItem(LAST_RATING_STORAGE_KEY) ?? 0)
  return Number.isFinite(value) && value > 0 ? value : 0
}

function writeLastRatingAt(value: number) {
  localStorage.setItem(LAST_RATING_STORAGE_KEY, String(value))
}

export function DestinationRatingsProvider({
  children,
}: {
  children: ReactNode
}) {
  const [ratings, setRatings] = useState<Map<string, DestinationRating>>(
    () => normalizeRatings(bundledRatings.ratings),
  )
  const [userRatedIds, setUserRatedIds] = useState<Set<string>>(() => readRatedIds())
  const [lastRatingAt, setLastRatingAt] = useState(() => readLastRatingAt())

  useEffect(() => {
    let cancelled = false

    async function loadRatings() {
      try {
        const response = await fetch(RATINGS_API)
        if (!response.ok) return
        const data = await response.json()
        if (!cancelled) setRatings(normalizeRatings(data))
      } catch {
        // Ratings are optional while browsing from a static build.
      }
    }

    void loadRatings()

    return () => {
      cancelled = true
    }
  }, [])

  const getRating = useCallback(
    (destinationId: string) => ratings.get(destinationId),
    [ratings],
  )
  const hasUserRated = useCallback(
    (destinationId: string) => userRatedIds.has(destinationId),
    [userRatedIds],
  )
  const ratingsList = useMemo(() => Array.from(ratings.values()), [ratings])

  const rememberUserRating = useCallback((destinationId: string) => {
    setUserRatedIds((current) => {
      if (current.has(destinationId)) return current

      const next = new Set(current)
      next.add(destinationId)
      writeRatedIds(next)
      return next
    })
  }, [])

  const submitRating = useCallback(
    async (destinationId: string, rating: number) => {
      const now = Date.now()

      if (userRatedIds.has(destinationId)) {
        const error = new Error('already_rated')
        ;(error as Error & { code?: string }).code = 'already_rated'
        throw error
      }

      if (lastRatingAt && now - lastRatingAt < RATING_COOLDOWN_MS) {
        const error = new Error('rating_cooldown')
        ;(error as Error & { code?: string; retryAfterSeconds?: number }).code =
          'rating_cooldown'
        ;(error as Error & { retryAfterSeconds?: number }).retryAfterSeconds =
          Math.ceil((RATING_COOLDOWN_MS - (now - lastRatingAt)) / 1000)
        throw error
      }

      const response = await fetch(RATINGS_API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: destinationId, rating }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const error = new Error(data?.error ?? 'Rating failed')
        ;(error as Error & { code?: string; retryAfterSeconds?: number }).code =
          data?.code
        ;(error as Error & { retryAfterSeconds?: number }).retryAfterSeconds =
          data?.retryAfterSeconds
        if (data?.code === 'already_rated') {
          rememberUserRating(destinationId)
        }
        throw error
      }

      const saved = normalizeRating(data)
      if (!saved) throw new Error('Invalid rating response')

      setRatings((current) => {
        const next = new Map(current)
        next.set(saved.id, saved)
        return next
      })
      rememberUserRating(destinationId)
      setLastRatingAt(Date.now())
      writeLastRatingAt(Date.now())

      return saved
    },
    [lastRatingAt, rememberUserRating, userRatedIds],
  )

  const value = useMemo(
    () => ({ ratings: ratingsList, getRating, hasUserRated, submitRating }),
    [getRating, hasUserRated, ratingsList, submitRating],
  )

  return (
    <DestinationRatingsContext.Provider value={value}>
      {children}
    </DestinationRatingsContext.Provider>
  )
}
