import { useContext } from 'react'
import { DestinationRatingsContext } from '../context/ratingsContext'

export function useDestinationRatings() {
  const context = useContext(DestinationRatingsContext)

  if (!context) {
    throw new Error('useDestinationRatings must be used inside DestinationRatingsProvider')
  }

  return context
}
