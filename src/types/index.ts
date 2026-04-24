export type DestinationCategory =
  | 'monument'
  | 'cave'
  | 'eco_trail'
  | 'waterfall'
  | 'monastery'
  | 'museum'
  | 'historical'
  | 'natural'
  | 'reservoir_lake_view'
  | 'resort'

export interface Destination {
  id: string
  name: string
  category: DestinationCategory
  shortDescription: string
  location: string
  image: string
  images?: string[]
  coords?: { lat: number; lng: number }
  mapsUrl?: string
}

export interface Region {
  id: string
  name: string
  slug: string
  description: string
  bannerImage: string
  images?: string[]
  /** Кратки акценти за hero на областта */
  highlights: string[]
  destinations: Destination[]
}

/** Геометрия за SVG картата — лесно се добавят нови области */
export interface MapRegionGeometry {
  slug: string
  name: string
  path: string
  label: { x: number; y: number }
}
