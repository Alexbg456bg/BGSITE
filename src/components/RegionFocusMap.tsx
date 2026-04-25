import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { geoBounds, geoContains, geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { motion } from 'framer-motion'
import type { Destination } from '../types'
import { loadBulgariaGeoJson } from '../data/bulgariaGeoJson'
import { GEOCODED_COORDS } from '../data/geocodedCoords'
import { SmartImage } from './SmartImage'

const PAD = 2
const FOCUS_EXPAND = 0.06

type OblastProps = { slug: string; nameBg?: string; name?: string }
type OblastFeature = Feature<Geometry, OblastProps>
type LngLat = [number, number]

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

function nearestBoundaryPoint(point: LngLat, geometry: Geometry): LngLat | null {
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
  return features.find((feature) => feature.properties?.slug === slug) ?? null
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
  const wrapRef = useRef<HTMLDivElement>(null)
  const wheelUnlockRef = useRef<number | null>(null)
  const isWheelLockedRef = useRef(false)

  const fillId = `region-fill-${useId().replace(/:/g, '')}`
  const waterId = `region-water-${useId().replace(/:/g, '')}`
  const pulseId = `region-pulse-${useId().replace(/:/g, '')}`

  const [size, setSize] = useState({ w: 920, h: 560 })
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    let cancelled = false

    loadBulgariaGeoJson()
      .then((data) => {
        if (!cancelled) {
          setGeoData(data)
          setFetchError(false)
        }
      })
      .catch(() => {
        if (!cancelled) setFetchError(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      if (wheelUnlockRef.current !== null) {
        window.clearTimeout(wheelUnlockRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const measure = () => {
      const w = Math.max(320, el.clientWidth)
      setSize({ w, h: Math.max(440, w * 0.66) })
    }

    measure()
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }

    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const regionFeature = useMemo(() => {
    if (!geoData) return null
    return findRegionFeature(geoData, slug)
  }, [geoData, slug])

  const loadError =
    fetchError || (geoData && !regionFeature)
      ? 'Картата на областта не е налична в момента.'
      : null

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
      .filter((feature) => feature.properties?.slug !== slug)
      .map((feature) => ({
        slug: feature.properties?.slug ?? 'region',
        name: feature.properties?.nameBg ?? feature.properties?.name ?? '',
        d: pathGen(feature) ?? '',
      }))
      .filter((feature) => feature.d)

    const markers: Marker[] = []

    for (const destination of destinations) {
      const preferred = GEOCODED_COORDS[destination.id] ?? destination.coords
      if (!preferred) continue

      let lngLat: LngLat = [preferred.lng, preferred.lat]
      if (!geoContains(regionFeature, lngLat)) {
        const nearest = nearestBoundaryPoint(lngLat, regionFeature.geometry)
        if (nearest) lngLat = nearest
      }

      const point = projection(lngLat)
      if (!point) continue

      markers.push({
        id: destination.id,
        name: destination.name,
        location: destination.location,
        image: destination.image,
        shortDescription: destination.shortDescription,
        mapsUrl: destination.mapsUrl,
        x: point[0],
        y: point[1],
      })
    }

    return { backgroundPaths, pathD, markers }
  }, [geoData, regionFeature, destinations, size.w, size.h, slug])

  const hoveredMarker = hovered ? markers.find((marker) => marker.id === hovered) : null
  const hoveredPos = useMemo(() => {
    if (!hoveredMarker) return null

    const leftPct = (hoveredMarker.x / size.w) * 100
    const topPct = (hoveredMarker.y / size.h) * 100

    return {
      left: Math.min(86, Math.max(14, leftPct)),
      top: Math.min(88, Math.max(16, topPct)),
    }
  }, [hoveredMarker, size.w, size.h])

  const handleWheelActivity = () => {
    if (wheelUnlockRef.current !== null) {
      window.clearTimeout(wheelUnlockRef.current)
    }

    isWheelLockedRef.current = true
    setHovered(null)

    wheelUnlockRef.current = window.setTimeout(() => {
      isWheelLockedRef.current = false
      wheelUnlockRef.current = null
    }, 140)
  }

  const setHoveredIfUnlocked = (id: string | null) => {
    if (isWheelLockedRef.current) return
    setHovered(id)
  }

  return (
    <section className="overflow-hidden rounded-[2.2rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(232,240,234,0.92))] p-4 shadow-[0_34px_70px_rgba(15,61,46,0.10)] md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold text-[var(--forest-deep)] md:text-3xl">
            Карта на {regionName}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] md:text-base">
            Областта е изведена в контекст, а туристическите места са поставени
            директно върху нея.
          </p>
        </div>
        <div className="rounded-full border border-[var(--border)] bg-white/84 px-4 py-2 text-sm font-semibold text-[var(--forest-deep)] shadow-[0_10px_20px_rgba(15,61,46,0.06)]">
          {`${markers.length} точки`}
        </div>
      </div>

      <div ref={wrapRef} className="relative w-full">
        <div
          className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-[rgba(214,230,220,0.34)] p-2 md:p-4"
          onWheelCapture={handleWheelActivity}
        >
          {loadError && (
            <p className="py-16 text-center text-sm text-red-600">{loadError}</p>
          )}

          {!loadError && !regionFeature && (
            <p className="py-16 text-center text-sm text-[var(--muted)]">
              Зареждане на картата...
            </p>
          )}

          {!loadError && regionFeature && pathD && (
            <svg
              viewBox={`0 0 ${size.w} ${size.h}`}
              className="h-auto w-full max-w-full"
              role="img"
              aria-label={`Карта на ${regionName} с туристически обекти`}
            >
              <defs>
                <linearGradient id={waterId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#eef7f1" />
                  <stop offset="100%" stopColor="#d8e8de" />
                </linearGradient>
                <linearGradient id={fillId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6bacc5" />
                  <stop offset="100%" stopColor="#245f49" />
                </linearGradient>
                <filter id={pulseId} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect width={size.w} height={size.h} rx="28" fill={`url(#${waterId})`} />

              <g opacity={0.28}>
                {backgroundPaths.map((feature) => (
                  <path
                    key={feature.slug}
                    d={feature.d}
                    fill="#d9e8de"
                    stroke="rgba(255,255,255,0.92)"
                    strokeWidth={0.9}
                    strokeLinejoin="round"
                    aria-label={feature.name}
                  />
                ))}
              </g>

              <motion.path
                d={pathD}
                fill={`url(#${fillId})`}
                stroke="rgba(255,255,255,0.98)"
                strokeWidth={2.6}
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0.7 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
              />

              {markers.map((marker, index) => {
                return (
                  <g
                    key={marker.id}
                    transform={`translate(${marker.x}, ${marker.y})`}
                    aria-label={marker.name}
                    onMouseEnter={() => setHoveredIfUnlocked(marker.id)}
                    onMouseLeave={() => setHoveredIfUnlocked(null)}
                    onClick={() => navigate(`/destination/${marker.id}`)}
                    className="cursor-pointer"
                  >
                    <circle
                      r={10}
                      fill="rgba(255,255,255,0.18)"
                      stroke="rgba(255,255,255,0.92)"
                      strokeWidth={1.2}
                      style={{ filter: `url(#${pulseId})` }}
                    />
                    <motion.circle
                      r={4.6}
                      fill="#ffffff"
                      stroke="#2d6a4f"
                      strokeWidth={1.4}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.08 + index * 0.02, duration: 0.26 }}
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
            className="pointer-events-none absolute z-30 w-60 overflow-hidden rounded-[1.2rem] border border-[var(--border)] bg-white shadow-[0_24px_40px_rgba(15,61,46,0.16)]"
            style={{
              left: `${hoveredPos.left}%`,
              top: `${hoveredPos.top}%`,
              transform: 'translate(-50%, -115%)',
            }}
            aria-live="polite"
          >
            <SmartImage
              src={hoveredMarker.image}
              alt={hoveredMarker.name}
              maxWidth={480}
              className="h-24 w-full"
              imgClassName="object-cover"
            />
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-semibold text-[var(--ink)]">
                {hoveredMarker.name}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                {hoveredMarker.shortDescription}
              </p>
            </div>
          </motion.article>
        )}
      </div>

      {!loadError && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {markers.length === 0 ? (
            <p className="rounded-[1.2rem] border border-dashed border-[var(--border)] bg-white/72 px-4 py-5 text-sm text-[var(--muted)]">
              Няма намерени координати за обектите в тази област.
            </p>
          ) : (
            markers.map((marker, index) => (
              <motion.div
                key={`list-${marker.id}`}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                className="content-card overflow-hidden rounded-[1.2rem] border border-[var(--border)] bg-white shadow-[0_16px_30px_rgba(15,61,46,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_36px_rgba(15,61,46,0.08)]"
              >
                <div className="flex gap-3 p-3">
                  <SmartImage
                    src={marker.image}
                    alt={marker.name}
                    maxWidth={320}
                    className="h-20 w-24 shrink-0 rounded-xl"
                    imgClassName="rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--forest)] text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-semibold leading-snug text-[var(--ink)]">
                          {marker.name}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{marker.location}</p>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                      {marker.shortDescription}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-[var(--border)] bg-[var(--surface-2)]/45 px-3 py-3">
                  <Link
                    to={`/destination/${marker.id}`}
                    className="rounded-full bg-[var(--forest)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--forest-deep)]"
                  >
                    Виж детайли
                  </Link>
                  {marker.mapsUrl && (
                    <a
                      href={marker.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--forest)] hover:text-[var(--forest)]"
                    >
                      Google Maps
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
