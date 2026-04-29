import type { Destination, Region } from '../types'
import { categoryLabels, type Language } from './translations'

type LocalizedFields<T> = Partial<Record<Language, Partial<T>>>

type TranslatableDestination = Destination & {
  translations?: LocalizedFields<Pick<Destination, 'name' | 'shortDescription' | 'location' | 'trailDetails'>>
}

type TranslatableRegion = Region & {
  translations?: LocalizedFields<Pick<Region, 'name' | 'description' | 'highlights'>>
}

const cyrillicPattern = /[А-Яа-я]/

const transliterationMap: Record<string, string> = {
  А: 'A',
  Б: 'B',
  В: 'V',
  Г: 'G',
  Д: 'D',
  Е: 'E',
  Ж: 'Zh',
  З: 'Z',
  И: 'I',
  Й: 'Y',
  К: 'K',
  Л: 'L',
  М: 'M',
  Н: 'N',
  О: 'O',
  П: 'P',
  Р: 'R',
  С: 'S',
  Т: 'T',
  У: 'U',
  Ф: 'F',
  Х: 'H',
  Ц: 'Ts',
  Ч: 'Ch',
  Ш: 'Sh',
  Щ: 'Sht',
  Ъ: 'A',
  Ь: 'Y',
  Ю: 'Yu',
  Я: 'Ya',
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sht',
  ъ: 'a',
  ь: 'y',
  ю: 'yu',
  я: 'ya',
}

function transliterate(value: string) {
  return value
    .split('')
    .map((char) => transliterationMap[char] ?? char)
    .join('')
    .replace(/[„“]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

function englishFromMapsUrl(value?: string) {
  if (!value) return ''

  try {
    const url = new URL(value)
    const query =
      url.searchParams.get('q') ??
      url.searchParams.get('query') ??
      url.pathname.split('/').filter(Boolean).at(-1) ??
      ''
    return decodeURIComponent(query)
      .replace(/\+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  } catch {
    return ''
  }
}

function cleanEnglish(value: string, fallback: string) {
  const text = value.trim()
  if (!text) return fallback
  return cyrillicPattern.test(text) ? transliterate(text) : text
}

function fallbackEnglishDestination(destination: Destination): Partial<Destination> {
  const name = cleanEnglish(
    englishFromMapsUrl(destination.mapsUrl),
    transliterate(destination.name),
  )
  const location = cleanEnglish(destination.location, 'Bulgaria')
  const category = categoryLabels.en[destination.category].toLowerCase()

  return {
    name,
    location,
    shortDescription: `A ${category} destination in ${location}, Bulgaria. Explore the photos, map location and practical details before you visit.`,
    trailDetails: {
      sights: `Highlights around ${name} include the main landmark, the surrounding scenery and nearby points of interest.`,
      route: `Use the map link and local signs to plan your visit. Check opening hours, access and weather before you go.`,
      suitableFor: `Suitable for travelers who want to explore ${location} and discover more of Bulgaria at their own pace.`,
    },
  }
}

function fallbackEnglishRegion(region: Region): Partial<Region> {
  return {
    name: cleanEnglish(region.name, transliterate(region.name)),
    description: `${cleanEnglish(
      region.name,
      transliterate(region.name),
    )} region brings together notable Bulgarian landmarks, nature routes and places worth exploring.`,
    highlights: region.highlights.map((highlight) =>
      cleanEnglish(highlight, transliterate(highlight)),
    ),
  }
}

export function localizeDestination(
  destination: Destination,
  language: Language,
): Destination {
  const source = destination as TranslatableDestination
  const translation = source.translations?.[language]
  if (!translation && language !== 'en') return destination

  const fallback = language === 'en' ? fallbackEnglishDestination(destination) : {}

  return {
    ...destination,
    ...fallback,
    ...translation,
    trailDetails:
      translation?.trailDetails ?? fallback.trailDetails ?? destination.trailDetails,
  }
}

export function localizeRegion(region: Region, language: Language): Region {
  const source = region as TranslatableRegion
  const translation = source.translations?.[language]
  const destinations = region.destinations.map((destination) =>
    localizeDestination(destination, language),
  )

  if (!translation && language !== 'en') {
    return { ...region, destinations }
  }

  const fallback = language === 'en' ? fallbackEnglishRegion(region) : {}

  return {
    ...region,
    ...fallback,
    ...translation,
    highlights: translation?.highlights ?? fallback.highlights ?? region.highlights,
    destinations,
  }
}
