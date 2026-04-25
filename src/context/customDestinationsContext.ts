import { createContext, useContext } from 'react'
import type { Destination } from '../types'

export type CustomDestinationEntry = {
  regionSlug: string
  destination: Destination
  deleted?: boolean
}

type CustomDestinationsContextValue = {
  customDestinations: CustomDestinationEntry[]
  saveCustomDestination: (entry: CustomDestinationEntry) => Promise<void>
  removeCustomDestination: (
    id: string,
    options?: { regionSlug?: string; name?: string },
  ) => Promise<void>
  reloadCustomDestinations: () => Promise<void>
}

export const CustomDestinationsContext =
  createContext<CustomDestinationsContextValue | null>(null)

export function useCustomDestinations() {
  const value = useContext(CustomDestinationsContext)
  if (!value) {
    throw new Error(
      'useCustomDestinations must be used within CustomDestinationsProvider',
    )
  }
  return value
}
