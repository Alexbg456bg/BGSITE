import { createContext } from 'react'

export type DestinationRating = {
  id: string
  total: number
  count: number
  average: number
}

export type DestinationRatingsContextValue = {
  ratings: DestinationRating[]
  getRating: (destinationId: string) => DestinationRating | undefined
  submitRating: (destinationId: string, rating: number) => Promise<DestinationRating>
}

export const DestinationRatingsContext =
  createContext<DestinationRatingsContextValue | null>(null)
