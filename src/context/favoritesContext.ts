import { createContext } from 'react'

export type FavoritesContextValue = {
  favorites: Set<string>
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null)
