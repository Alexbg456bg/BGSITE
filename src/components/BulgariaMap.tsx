import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { geoCentroid, geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { motion } from 'framer-motion'
import { loadBulgariaGeoJson } from '../data/bulgariaGeoJson'

const PAD = 14

type OblastProps = { slug: string; nameBg?: string; name?: string }
type OblastFeature = Feature<Geometry, OblastProps>

type Props = {
  id?: string
  compact?: boolean
  large?: boolean
}

export function BulgariaMap({ id = 'map', compact = false, large = false }: Props) {
  const navigate = useNavigate()
  const wrapRef = useRef<HTMLDivElement>(null)
  const glowId = `map-glow-${useId().replace(/:/g, '')}`
  const waterId = `map-water-${useId().replace(/:/g, '')}`
  const activeId = `map-active-${useId().replace(/:/g, '')}`

  const [size, setSize] = useState({ w: 980, h: 580 })
  const [fc, setFc] = useState<FeatureCollection | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    loadBulgariaGeoJson()
      .then((data) => {
        if (!cancelled) setFc(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError('Картата не може да се зареди.')
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const measure = () => {
      const w = Math.max(320, el.clientWidth)
      const ratio = compact ? 0.54 : large ? 0.72 : 0.6
      const minHeight = compact ? 320 : large ? 560 : 420
      setSize({ w, h: Math.max(minHeight, w * ratio) })
    }

    measure()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }

    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [compact, large])

  const { pathGen, features, labels } = useMemo(() => {
    if (!fc?.features?.length) {
      return {
        pathGen: null as ReturnType<typeof geoPath> | null,
        features: [] as OblastFeature[],
        labels: [] as { slug: string; x: number; y: number; text: string }[],
      }
    }

    const projection = geoMercator().fitExtent(
      [
        [PAD, PAD],
        [size.w - PAD, size.h - PAD],
      ],
      fc as FeatureCollection,
    )

    const pathGen = geoPath(projection)
    const features = fc.features as OblastFeature[]
    const labels: { slug: string; x: number; y: number; text: string }[] = []

    for (const feature of features) {
      const slug = feature.properties?.slug
      if (!slug) continue

      const center = projection(geoCentroid(feature))
      if (!center) continue

      const raw =
        feature.properties?.nameBg ?? feature.properties?.name ?? feature.properties?.slug
      const clean = raw.replace(' област', '')
      const text = clean.length > 11 ? `${clean.slice(0, 10)}…` : clean
      labels.push({ slug, x: center[0], y: center[1], text })
    }

    return { pathGen, features, labels }
  }, [fc, size.w, size.h])

  const hoveredFeature = features.find((feature) => feature.properties?.slug === hovered)
  const hoveredName =
    hoveredFeature?.properties?.nameBg ??
    hoveredFeature?.properties?.name ??
    ''

  return (
    <section id={id} className="scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        className="overflow-hidden rounded-[2.2rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(231,240,234,0.92))] p-4 shadow-[0_34px_70px_rgba(15,61,46,0.10)] md:p-8"
      >
        {!compact && (
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-semibold text-[var(--forest-deep)] md:text-3xl">
                Карта на България
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] md:text-base">
                Избери област направо от картата и продължи към нейната страница.
              </p>
            </div>
            <div className="rounded-full border border-[var(--border)] bg-white/84 px-4 py-2 text-sm font-semibold text-[var(--forest-deep)] shadow-[0_10px_20px_rgba(15,61,46,0.06)]">
              {hoveredName || '28 области'}
            </div>
          </div>
        )}

        <div
          ref={wrapRef}
          className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-[rgba(214,230,220,0.36)] p-2 md:p-4"
        >
          {loadError && (
            <p className="py-16 text-center text-sm text-red-600">{loadError}</p>
          )}

          {!loadError && (!fc || !pathGen) && (
            <p className="py-16 text-center text-sm text-[var(--muted)]">
              Зареждане на картата...
            </p>
          )}

          {!loadError && fc && pathGen && (
            <svg
              viewBox={`0 0 ${size.w} ${size.h}`}
              className="h-auto w-full max-w-full select-none"
              role="img"
              aria-label="Карта на България с 28 области"
            >
              <defs>
                <linearGradient id={waterId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#eef6f2" />
                  <stop offset="100%" stopColor="#dcebe2" />
                </linearGradient>
                <linearGradient id={activeId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6aa4bf" />
                  <stop offset="100%" stopColor="#1f5d46" />
                </linearGradient>
                <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect width={size.w} height={size.h} rx="26" fill={`url(#${waterId})`} />

              {features.map((feature) => {
                const slug = feature.properties?.slug
                if (!slug) return null

                const active = hovered === slug
                const d = pathGen(feature) ?? ''

                return (
                  <path
                    key={slug}
                    d={d}
                    fill={active ? `url(#${activeId})` : 'rgba(69, 126, 99, 0.34)'}
                    stroke={active ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.92)'}
                    strokeWidth={active ? 2.1 : 1.1}
                    strokeLinejoin="round"
                    className="cursor-pointer transition-[fill,stroke-width,opacity] duration-200"
                    style={{
                      filter: active ? `url(#${glowId})` : undefined,
                      opacity: hovered && !active ? 0.78 : 1,
                    }}
                    onMouseEnter={() => setHovered(slug)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate(`/region/${slug}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/region/${slug}`)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Област ${feature.properties?.nameBg ?? slug}`}
                  />
                )
              })}

              {labels.map((label) => {
                const active = hovered === label.slug
                return (
                  <text
                    key={label.slug}
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    fill={active ? '#ffffff' : '#173126'}
                    fontSize={compact ? 7 : 8.4}
                    fontWeight={active ? 700 : 600}
                    className="pointer-events-none transition-all"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {label.text}
                  </text>
                )
              })}
            </svg>
          )}
        </div>
      </motion.div>
    </section>
  )
}
