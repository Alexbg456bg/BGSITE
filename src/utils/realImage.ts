const COMMONS_API = 'https://commons.wikimedia.org/w/api.php'
const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'

const resultCache = new Map<string, Promise<string | null>>()

function normalizeText(value: string) {
  return value
    .replace(/\+/g, ' ')
    .replace(/[()[\],]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildQueries(queries: string[]) {
  const expanded = queries.flatMap((query) => {
    const clean = normalizeText(query)
    if (!clean) return []

    const withBulgaria = /bulgaria/i.test(clean) ? clean : `${clean} Bulgaria`
    return [withBulgaria, clean]
  })

  return [...new Set(expanded)].filter(Boolean).slice(0, 6)
}

function isUsableImage(url: string) {
  return /\.(jpe?g|png|webp)(\?|$)/i.test(url)
}

async function searchCommons(query: string, width: number) {
  const url = new URL(COMMONS_API)
  url.searchParams.set('origin', '*')
  url.searchParams.set('action', 'query')
  url.searchParams.set('format', 'json')
  url.searchParams.set('generator', 'search')
  url.searchParams.set('gsrnamespace', '6')
  url.searchParams.set('gsrlimit', '6')
  url.searchParams.set('gsrsearch', query)
  url.searchParams.set('prop', 'imageinfo')
  url.searchParams.set('iiprop', 'url')
  url.searchParams.set('iiurlwidth', String(width))

  const response = await fetch(url.toString())
  if (!response.ok) return null

  const data = (await response.json()) as {
    query?: {
      pages?: Record<
        string,
        {
          title?: string
          imageinfo?: Array<{ thumburl?: string; url?: string }>
        }
      >
    }
  }

  const pages = Object.values(data.query?.pages ?? {})
  for (const page of pages) {
    const info = page.imageinfo?.[0]
    const candidate = info?.thumburl ?? info?.url
    if (candidate && isUsableImage(candidate)) {
      return candidate
    }
  }

  return null
}

async function searchWikipedia(query: string, width: number) {
  const url = new URL(WIKIPEDIA_API)
  url.searchParams.set('origin', '*')
  url.searchParams.set('action', 'query')
  url.searchParams.set('format', 'json')
  url.searchParams.set('generator', 'search')
  url.searchParams.set('gsrlimit', '3')
  url.searchParams.set('gsrsearch', query)
  url.searchParams.set('prop', 'pageimages')
  url.searchParams.set('piprop', 'thumbnail|original')
  url.searchParams.set('pithumbsize', String(width))

  const response = await fetch(url.toString())
  if (!response.ok) return null

  const data = (await response.json()) as {
    query?: {
      pages?: Record<
        string,
        {
          thumbnail?: { source?: string }
          original?: { source?: string }
        }
      >
    }
  }

  const pages = Object.values(data.query?.pages ?? {})
  for (const page of pages) {
    const candidate = page.thumbnail?.source ?? page.original?.source
    if (candidate && isUsableImage(candidate)) {
      return candidate
    }
  }

  return null
}

export function isPlaceholderImage(src: string) {
  return !src || src.includes('images.unsplash.com/')
}

export function extractMapsQuery(mapsUrl?: string) {
  if (!mapsUrl) return ''

  try {
    const parsed = new URL(mapsUrl)
    return normalizeText(parsed.searchParams.get('q') ?? '')
  } catch {
    return ''
  }
}

export function resolveInternetImage(
  queries: string[],
  width = 1200,
): Promise<string | null> {
  const preparedQueries = buildQueries(queries)
  const cacheKey = `${width}:${preparedQueries.join('|')}`

  const cached = resultCache.get(cacheKey)
  if (cached) return cached

  const request = (async () => {
    for (const query of preparedQueries) {
      const commons = await searchCommons(query, width)
      if (commons) return commons

      const wikipedia = await searchWikipedia(query, width)
      if (wikipedia) return wikipedia
    }

    return null
  })()

  resultCache.set(cacheKey, request)
  return request
}
