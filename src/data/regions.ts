import type { Destination, Region } from '../types'
import { OBLASTI_META } from './oblastiMeta'
import { DESTINATIONS_BY_SLUG } from './destinationsByRegion'

const wiki = (fileName: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    fileName,
  )}?width=1600`

const unsplash = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1600&q=82`

const regionImageUrl = (value: string) =>
  value.startsWith('photo-') ? unsplash(value) : wiki(value)

const isWikimediaImage = (url: string) =>
  url.includes('commons.wikimedia.org/wiki/Special:FilePath/')

const isUnsplashImage = (url: string) => url.includes('images.unsplash.com/')

const wikiSearchToken = (query: string) => `wiki-search:${query}`

const withRealDestinationImages = (destination: Destination): Destination => {
  const query = `${destination.name} ${destination.location} Bulgaria`
  const resolvedImage = isUnsplashImage(destination.image)
    ? wikiSearchToken(query)
    : destination.image
  const resolvedImages = destination.images?.map((img) =>
    isUnsplashImage(img) ? wikiSearchToken(query) : img,
  )

  return {
    ...destination,
    image: resolvedImage,
    images: resolvedImages,
  }
}

const REGION_BANNER_OVERRIDE: Record<string, string> = {
  'sofia-grad': 'Boulevard Vitosha in Sofia.JPG',
  'sofia-oblast': 'Vitosha seen from the center of Sofia.jpg',
  vratsa: 'Ledenika cave 024.jpg',
  dobrich: 'Balchik Palace.jpg',
  kardzhali: 'Perperikon, Top view.jpg',
  montana: 'Lopushanski Monastery.jpg',
  pazardzhik: 'Velingrad Areal Image.jpg',
  pernik:
    'Pernik Region - Pernik Municipality - Town of Pernik - Krakra Fortress (21).jpg',
  pleven: 'Pleven-Panorama 2010.jpg',
  razgrad: 'Tomb sveshtari2-1-.jpg',
  silistra: 'Srebarna Nature Reserve 01.jpg',
  sliven: 'Sliven From Karandila.jpg',
  smolyan: 'Smolyan Lakes 01.jpg',
  'stara-zagora': 'Arc at Momini gardi sanctuary Starosel Bulgaria.jpg',
  targovishte: 'Targovishte airview.jpg',
  haskovo: 'Holymother.jpg',
  shumen: 'Madara Rider.jpg',
  yambol: 'Kabile Bulgaria.JPG',
}

export const regions: Region[] = OBLASTI_META.map((m) => {
  const destinations = (DESTINATIONS_BY_SLUG[m.slug] ?? []).map(
    withRealDestinationImages,
  )
  const bannerOverride = REGION_BANNER_OVERRIDE[m.slug]
  const bannerFromDestination =
    destinations.find((d) => isWikimediaImage(d.image))?.image ??
    destinations.find((d) => d.image)?.image
  const bannerImage =
    (bannerOverride ? wiki(bannerOverride) : null) ??
    bannerFromDestination ??
    regionImageUrl(m.banner)

  return {
    id: `reg-${m.slug}`,
    name: m.name,
    slug: m.slug,
    description: m.description,
    bannerImage,
    images: m.images ? m.images.map(regionImageUrl) : undefined,
    highlights: [...m.highlights],
    destinations,
  }
})

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
