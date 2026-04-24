import { useMemo, useState } from 'react'

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
  const optimizedSrc = useMemo(
    () => optimizeImageUrl(src, maxWidth, quality),
    [src, maxWidth, quality],
  )

  if (!src) {
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
