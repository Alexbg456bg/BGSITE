import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  DestinationRatingsContext,
  type DestinationRating,
} from './ratingsContext'

const RATINGS_API = '/api/ratings'

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

export function DestinationRatingsProvider({
  children,
}: {
  children: ReactNode
}) {
  const [ratings, setRatings] = useState<Map<string, DestinationRating>>(
    () => new Map(),
  )

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
  const ratingsList = useMemo(() => Array.from(ratings.values()), [ratings])

  const submitRating = useCallback(
    async (destinationId: string, rating: number) => {
      const response = await fetch(RATINGS_API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: destinationId, rating }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const error = new Error(data?.error ?? 'Rating failed')
        ;(error as Error & { retryAfterSeconds?: number }).retryAfterSeconds =
          data?.retryAfterSeconds
        throw error
      }

      const saved = normalizeRating(data)
      if (!saved) throw new Error('Invalid rating response')

      setRatings((current) => {
        const next = new Map(current)
        next.set(saved.id, saved)
        return next
      })

      return saved
    },
    [],
  )

  const value = useMemo(
    () => ({ ratings: ratingsList, getRating, submitRating }),
    [getRating, ratingsList, submitRating],
  )

  return (
    <DestinationRatingsContext.Provider value={value}>
      {children}
    </DestinationRatingsContext.Provider>
  )
}
