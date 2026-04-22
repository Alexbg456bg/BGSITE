import type { Destination, Region } from '../types'
import { OBLASTI_META } from './oblastiMeta'
import { DESTINATIONS_BY_SLUG } from './destinationsByRegion'

const u = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`

export const regions: Region[] = OBLASTI_META.map((m) => ({
  id: `reg-${m.slug}`,
  name: m.name,
  slug: m.slug,
  description: m.description,
  bannerImage: u(m.banner),
  highlights: [...m.highlights],
  destinations: DESTINATIONS_BY_SLUG[m.slug] ?? [],
}))

export const regionBySlug = new Map(regions.map((r) => [r.slug, r] as const))

const destinationWithRegionEntries: Array<
  [string, { destination: Destination; region: Region }]
> = []

for (const region of regions) {
  for (const destination of region.destinations) {
    destinationWithRegionEntries.push([destination.id, { destination, region }])
  }
}

export const destinationWithRegionById = new Map(destinationWithRegionEntries)

export const regionByDestinationId = new Map(
  destinationWithRegionEntries.map(([id, pair]) => [id, pair.region] as const),
)

export const destinationIdsByRegionSlug = new Map(
  regions.map((r) => [r.slug, new Set(r.destinations.map((d) => d.id))] as const),
)

export const allDestinations = destinationWithRegionEntries.map(
  ([, pair]) => pair.destination,
)

export function getRegionBySlug(slug: string): Region | undefined {
  return regionBySlug.get(slug)
}

export function getAllDestinations(): Destination[] {
  return allDestinations
}

export function getDestinationWithRegion(
  id: string,
): { destination: Destination; region: Region } | undefined {
  return destinationWithRegionById.get(id)
}

export function getPopularDestinations(limit = 8): Destination[] {
  const picks = [
    'dest-tsarevets',
    'dest-vitosha',
    'dest-nessebar',
    'dest-rila-monastery-bg',
    'dest-bachkovo',
    'dest-aladja',
    'dest-etar',
    'dest-devil-throat',
  ]
  const all = allDestinations
  const ordered = picks
    .map((pid) => all.find((d) => d.id === pid))
    .filter(Boolean) as Destination[]
  if (ordered.length >= limit) return ordered.slice(0, limit)
  const rest = all.filter((d) => !ordered.includes(d))
  return [...ordered, ...rest].slice(0, limit)
}
