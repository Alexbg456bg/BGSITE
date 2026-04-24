import { useEffect, useMemo, useState } from 'react'

type Props = {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  fallbackClassName?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  decoding?: 'async' | 'sync' | 'auto'
  sizes?: string
  maxWidth?: number
  quality?: number
}

function optimizeImageUrl(src: string, maxWidth?: number, quality = 76) {
  if (!maxWidth) return src

  if (src.includes('images.unsplash.com/')) {
    try {
      const url = new URL(src)
      url.searchParams.set('auto', 'format')
      url.searchParams.set('fit', 'crop')
      url.searchParams.set('w', String(maxWidth))
      url.searchParams.set('q', String(quality))
      return url.toString()
    } catch {
      return src
    }
  }

  if (src.includes('commons.wikimedia.org/wiki/Special:FilePath/')) {
    const [base] = src.split('?')
    return `${base}?width=${maxWidth}`
  }

  return src
}

const WIKI_SEARCH_PREFIX = 'wiki-search:'

const isWikiSearchToken = (src: string) => src.startsWith(WIKI_SEARCH_PREFIX)

const wikiCommonsSearchUrl = (query: string) =>
  `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
    `${query} file`,
  )}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json&origin=*`

const wikiPageImageUrl = (host: 'bg' | 'en', title: string) =>
  `https://${host}.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=original&titles=${encodeURIComponent(
    title,
  )}&format=json&origin=*`

async function resolveWikiSearchToken(src: string): Promise<string | null> {
  const query = src.slice(WIKI_SEARCH_PREFIX.length).trim()
  if (!query) return null

  try {
    const commonsResp = await fetch(wikiCommonsSearchUrl(query))
    if (commonsResp.ok) {
      const commonsJson = (await commonsResp.json()) as {
        query?: { pages?: Record<string, { imageinfo?: Array<{ url?: string }> }> }
      }
      const pages = commonsJson.query?.pages ?? {}
      const firstPage = Object.values(pages)[0]
      const firstUrl = firstPage?.imageinfo?.[0]?.url
      if (firstUrl) return firstUrl
    }
  } catch {
    // continue with fallback sources
  }

  const titleCandidate = query.replace(/\s+Bulgaria$/i, '').trim()
  for (const host of ['bg', 'en'] as const) {
    try {
      const resp = await fetch(wikiPageImageUrl(host, titleCandidate))
      if (!resp.ok) continue
      const json = (await resp.json()) as {
        query?: { pages?: Record<string, { original?: { source?: string } }> }
      }
      const pages = json.query?.pages ?? {}
      const firstPage = Object.values(pages)[0]
      const source = firstPage?.original?.source
      if (source) return source
    } catch {
      // try next source
    }
  }

  return null
}

export function SmartImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  fallbackClassName = '',
  loading = 'lazy',
  fetchPriority = 'auto',
  decoding = 'async',
  sizes,
  maxWidth,
  quality,
}: Props) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setResolvedSrc(null)
    setFailed(false)
    setLoaded(false)

    if (!isWikiSearchToken(src)) {
      setResolvedSrc(src)
      return () => {
        cancelled = true
      }
    }

    resolveWikiSearchToken(src).then((resolved) => {
      if (cancelled) return
      if (resolved) {
        setResolvedSrc(resolved)
      } else {
        setFailed(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [src])

  const displaySrc = resolvedSrc ?? (isWikiSearchToken(src) ? '' : src)
  const optimizedSrc = useMemo(
    () => optimizeImageUrl(displaySrc, maxWidth, quality),
    [displaySrc, maxWidth, quality],
  )

  if (!displaySrc) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className="relative flex h-full w-full items-end bg-[linear-gradient(160deg,rgba(61,124,158,0.65),rgba(15,61,46,0.92))] p-4 text-white">
          <span className="max-w-[16rem] text-sm font-medium leading-relaxed text-white/92">
            {alt}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        aria-hidden
        className={`absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_45%),linear-gradient(135deg,rgba(61,124,158,0.24),rgba(15,61,46,0.3))] transition duration-500 ${loaded && !failed ? 'opacity-0' : 'opacity-100'} ${fallbackClassName}`}
      />
      {!failed ? (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding={decoding}
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`relative h-full w-full object-cover transition duration-700 ${loaded ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0'} ${imgClassName}`}
        />
      ) : (
        <div className="relative flex h-full w-full items-end bg-[linear-gradient(160deg,rgba(61,124,158,0.65),rgba(15,61,46,0.92))] p-4 text-white">
          <span className="max-w-[16rem] text-sm font-medium leading-relaxed text-white/92">
            {alt}
          </span>
        </div>
      )}
    </div>
  )
}
