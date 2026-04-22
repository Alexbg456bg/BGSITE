import type { DestinationCategory } from '../types'

export const CATEGORY_LABELS: Record<DestinationCategory, string> = {
  monument: 'Паметници',
  cave: 'Пещери',
  eco_trail: 'Екопътеки',
  waterfall: 'Водопади',
  monastery: 'Манастири',
  museum: 'Музеи',
  historical: 'Исторически забележителности',
  natural: 'Природни забележителности',
  reservoir_lake_view: 'Язовири, езера и гледки',
  resort: 'Курорти и отдих',
}

export const ALL_CATEGORIES: DestinationCategory[] = [
  'monument',
  'cave',
  'eco_trail',
  'waterfall',
  'monastery',
  'museum',
  'historical',
  'natural',
  'reservoir_lake_view',
  'resort',
]
