import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { geoBounds, geoContains, geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { motion } from 'framer-motion'
import type { Destination } from '../types'
import { GEOCODED_COORDS } from '../data/geocodedCoords'

const PAD = 8
const FOCUS_EXPAND = 0.18

type OblastProps = { slug: string; nameBg?: string; name?: string }
type OblastFeature = Feature<Geometry, OblastProps>

type Marker = {
  id: string
  name: string
  location: string
  image: string
  shortDescription: string
  mapsUrl?: string
  x: number
  y: number
}

type Props = {
  slug: string
  regionName: string
  destinations: Destination[]
}

let cachedGeoJson: FeatureCollection | null = null
let geoJsonRequest: Promise<FeatureCollection> | null = null

type LngLat = [number, number]

type FocusResult = {
  backgroundPaths: { slug: string; name: string; d: string }[]
  pathD: string
  markers: Marker[]
}

function getOuterRings(geometry: Geometry): LngLat[][] {
  if (geometry.type === 'Polygon') {
    const ring = geometry.coordinates[0] as LngLat[] | undefined
    return ring ? [ring] : []
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates
      .map((poly) => poly[0] as LngLat[] | undefined)
      .filter((ring): ring is LngLat[] => Boolean(ring))
  }
  return []
}

function nearestBoundaryPoint(
  point: LngLat,
  geometry: Geometry,
): LngLat | null {
  const rings = getOuterRings(geometry)
  let nearest: LngLat | null = null
  let best = Number.POSITIVE_INFINITY

  for (const ring of rings) {
    for (const candidate of ring) {
      const dx = candidate[0] - point[0]
      const dy = candidate[1] - point[1]
      const distSq = dx * dx + dy * dy
      if (distSq < best) {
        best = distSq
        nearest = [candidate[0], candidate[1]]
      }
    }
  }

  return nearest
}

function findRegionFeature(
  data: FeatureCollection,
  slug: string,
): OblastFeature | null {
  const features = data.features as OblastFeature[]
  return features.find((f) => f.properties?.slug === slug) ?? null
}

function expandedBoundsFeature(feature: OblastFeature): Feature {
  const [[minLng, minLat], [maxLng, maxLat]] = geoBounds(feature)
  const lngSpan = Math.max(0.18, maxLng - minLng)
  const latSpan = Math.max(0.18, maxLat - minLat)
  const lngPad = lngSpan * FOCUS_EXPAND
  const latPad = latSpan * FOCUS_EXPAND

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiPoint',
      coordinates: [
        [minLng - lngPad, minLat - latPad],
        [maxLng + lngPad, minLat - latPad],
        [maxLng + lngPad, maxLat + latPad],
        [minLng - lngPad, maxLat + latPad],
      ],
    },
  }
}

export function RegionFocusMap({ slug, regionName, destinations }: Props) {
  const navigate = useNavigate()
  const gradientId = `region-fill-${useId().replace(/:/g, '')}`
  const pulseId = `region-pulse-${useId().replace(/:/g, '')}`
  const bgId = `region-bg-${useId().replace(/:/g, '')}`
  const wrapRef = useRef<HTMLDivElement>(null)

  const [size, setSize] = useState({ w: 900, h: 560 })
  const [geoData, setGeoData] = useState<FeatureCollection | null>(cachedGeoJson)
  const [regionFeature, setRegionFeature] = useState<OblastFeature | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const applyRegionFeature = (data: FeatureCollection) => {
      const feature = findRegionFeature(data, slug)
      if (cancelled) return
      if (!feature) {
        setRegionFeature(null)
        setLoadError('Region map is not available right now.')
        return
      }
      setLoadError(null)
      setRegionFeature(feature)
    }

    if (cachedGeoJson) {
      setGeoData(cachedGeoJson)
      applyRegionFeature(cachedGeoJson)
      return () => {
        cancelled = true
      }
    }

    geoJsonRequest ??= fetch('/data/bulgaria-oblasti.geojson')
      .then((r) => {
        if (!r.ok) throw new Error('HTTP')
        return r.json() as Promise<FeatureCollection>
      })

    geoJsonRequest
      .then((data) => {
        cachedGeoJson = data
        if (!cancelled) setGeoData(data)
        applyRegionFeature(data)
      })
      .catch(() => {
        if (!cancelled) {
          setRegionFeature(null)
          setLoadError('Region map is not available right now.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const w = Math.max(280, el.clientWidth)
      setSize({ w, h: Math.max(440, w * 0.68) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { backgroundPaths, pathD, markers } = useMemo<FocusResult>(() => {
    if (!geoData || !regionFeature) {
      return { backgroundPaths: [], pathD: '', markers: [] }
    }

    const projection = geoMercator().fitExtent(
      [
        [PAD, PAD],
        [size.w - PAD, size.h - PAD],
      ],
      expandedBoundsFeature(regionFeature),
    )
    const pathGen = geoPath(projection)
    const pathD = pathGen(regionFeature) ?? ''
    const backgroundPaths = (geoData.features as OblastFeature[])
      .filter((f) => f.properties?.slug !== slug)
      .map((f) => ({
        slug: f.properties?.slug ?? f.properties?.name ?? 'region',
        name: f.properties?.nameBg ?? f.properties?.name ?? '',
        d: pathGen(f) ?? '',
      }))
      .filter((f) => f.d)

    const markers: Marker[] = []
    for (const d of destinations) {
      const preferred = GEOCODED_COORDS[d.id] ?? d.coords
      if (!preferred) continue

      let lngLat: LngLat = [preferred.lng, preferred.lat]
      if (!geoContains(regionFeature, lngLat)) {
        const nearest = nearestBoundaryPoint(lngLat, regionFeature.geometry)
        if (nearest) lngLat = nearest
      }

      const point = projection(lngLat)
      if (!point) continue
      markers.push({
        id: d.id,
        name: d.name,
        location: d.location,
        image: d.image,
        shortDescription: d.shortDescription,
        mapsUrl: d.mapsUrl,
        x: point[0],
        y: point[1],
      })
    }

    return { backgroundPaths, pathD, markers }
  }, [geoData, regionFeature, destinations, size.w, size.h, slug])

  const hoveredMarker = hovered ? markers.find((m) => m.id === hovered) : null
  const hoveredPos = useMemo(() => {
    if (!hoveredMarker) return null
    const leftPct = (hoveredMarker.x / size.w) * 100
    const topPct = (hoveredMarker.y / size.h) * 100
    return {
      left: Math.min(86, Math.max(14, leftPct)),
      top: Math.min(88, Math.max(14, topPct)),
    }
  }, [hoveredMarker, size.w, size.h])

  return (
    <section className="animated-surface rounded-3xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)] md:p-8">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--forest-deep)] md:text-3xl">
            Карта на областта
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] md:text-base">
            {regionName} е увеличена, за да се виждат по-ясно реално поставените
            туристически обекти.
          </p>
        </div>
        {hoveredMarker && (
          <p className="text-sm font-semibold text-[var(--forest)]">
            {hoveredMarker.name}
          </p>
        )}
      </div>

      <div ref={wrapRef} className="relative w-full">
        <div className="map-shell overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--mist)]/40">
          {loadError && (
            <p className="py-16 text-center text-sm text-red-600">{loadError}</p>
          )}
          {!loadError && !regionFeature && (
            <p className="py-16 text-center text-sm text-[var(--muted)]">
              Loading region map...
            </p>
          )}
          {!loadError && regionFeature && pathD && (
            <svg
              viewBox={`0 0 ${size.w} ${size.h}`}
              className="h-auto w-full max-w-full"
              role="img"
              aria-label={`Map of ${regionName} with destination markers`}
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3d7c9e" stopOpacity="0.86" />
                  <stop offset="100%" stopColor="#2d6a4f" stopOpacity="0.96" />
                </linearGradient>
                <filter id={pulseId} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.2" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id={bgId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#eef7f1" />
                  <stop offset="100%" stopColor="#dbece3" />
                </linearGradient>
              </defs>

              <rect width={size.w} height={size.h} fill={`url(#${bgId})`} />

              <g opacity={0.3}>
                {backgroundPaths.map((f) => (
                  <path
                    key={f.slug}
                    d={f.d}
                    fill="#d8e7dd"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth={0.85}
                    strokeLinejoin="round"
                    aria-label={f.name}
                  />
                ))}
              </g>

              <motion.path
                d={pathD}
                fill={`url(#${gradientId})`}
                stroke="rgba(255,255,255,0.98)"
                strokeWidth={2.4}
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0.55, scale: 0.985 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                style={{ transformOrigin: 'center' }}
              />

              {markers.map((m, i) => {
                const active = hovered === m.id
                return (
                  <g
                    key={m.id}
                    transform={`translate(${m.x}, ${m.y})`}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open ${m.name}`}
                    onMouseEnter={() => setHovered(m.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(m.id)}
                    onBlur={() => setHovered(null)}
                    onClick={() => navigate(`/destination/${m.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/destination/${m.id}`)
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <title>{m.name}</title>
                    <motion.circle
                      r={active ? 12 : 9}
                      fill="rgba(15,61,46,0.2)"
                      stroke="rgba(255,255,255,0.92)"
                      strokeWidth={active ? 1.6 : 1.2}
                      style={{ filter: `url(#${pulseId})` }}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{
                        opacity: 1,
                        scale: active ? 1.12 : [0.96, 1.08, 0.96],
                      }}
                      transition={
                        active
                          ? { duration: 0.2 }
                          : {
                              delay: 0.14 + i * 0.03,
                              duration: 1.6,
                              repeat: Infinity,
                            }
                      }
                    />
                    <motion.circle
                      r={active ? 5 : 4}
                      fill={active ? '#0f3d2e' : '#2d6a4f'}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.18 + i * 0.03, duration: 0.24 }}
                    />
                  </g>
                )
              })}
            </svg>
          )}
        </div>

        {hoveredMarker && hoveredPos && (
          <motion.article
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.16 }}
            className="pointer-events-none absolute z-30 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-xl"
            style={{
              left: `${hoveredPos.left}%`,
              top: `${hoveredPos.top}%`,
              transform: 'translate(-50%, -115%)',
            }}
            aria-live="polite"
          >
            <img
              src={hoveredMarker.image}
              alt={hoveredMarker.name}
              className="h-24 w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-semibold text-[var(--ink)]">
                {hoveredMarker.name}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                {hoveredMarker.shortDescription}
              </p>
            </div>
          </motion.article>
        )}
      </div>

      {!loadError && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {markers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--border)] bg-white/70 px-4 py-5 text-sm text-[var(--muted)]">
              No destination coordinates found for this region.
            </p>
          ) : (
            markers.map((m, i) => (
              <motion.div
                key={`list-${m.id}`}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="content-card overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex gap-3 p-3">
                  <img
                    src={m.image}
                    alt={m.name}
                    loading="lazy"
                    decoding="async"
                    className="h-20 w-24 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--forest)] text-xs font-semibold text-white">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-semibold leading-snug text-[var(--ink)]">
                          {m.name}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{m.location}</p>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                      {m.shortDescription}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-[var(--border)] bg-[var(--surface-2)]/45 px-3 py-3">
                  <Link
                    to={`/destination/${m.id}`}
                    className="rounded-full bg-[var(--forest)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--forest-deep)]"
                  >
                    Open details
                  </Link>
                  {m.mapsUrl && (
                    <a
                      href={m.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--forest)] hover:text-[var(--forest)]"
                    >
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </section>
  )
}
