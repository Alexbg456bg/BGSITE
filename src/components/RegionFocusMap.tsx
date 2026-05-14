import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { geoBounds, geoContains, geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { motion } from 'framer-motion'
import type { Destination } from '../types'
import { loadBulgariaGeoJson } from '../data/bulgariaGeoJson'
import { GEOCODED_COORDS } from '../data/geocodedCoords'
import { SmartImage } from './SmartImage'
import { useI18n } from '../i18n/LanguageContext'

const PAD = 2
const FOCUS_EXPAND = 0.06
const MIN_ZOOM = 1
const MAX_ZOOM = 2.8
const ZOOM_STEP = 0.22
const CLUSTER_DISTANCE = 22

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
  clusterIndex: number
  clusterSize: number
}

type RenderMarker = Marker & {
  renderX: number
  renderY: number
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
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

function clusterMarkers<T extends { x: number; y: number }>(markers: T[]) {
  const groups: number[][] = []
  const visited = new Set<number>()

  for (let index = 0; index < markers.length; index += 1) {
    if (visited.has(index)) continue

    const queue = [index]
    const group: number[] = []
    visited.add(index)

    while (queue.length > 0) {
      const current = queue.shift()
      if (current === undefined) continue

      group.push(current)
      const source = markers[current]

      for (let next = 0; next < markers.length; next += 1) {
        if (visited.has(next)) continue

        const candidate = markers[next]
        const dx = candidate.x - source.x
        const dy = candidate.y - source.y

        if (Math.hypot(dx, dy) <= CLUSTER_DISTANCE) {
          visited.add(next)
          queue.push(next)
        }
      }
    }

    groups.push(group)
  }

  return groups
}

export function RegionFocusMap({ slug, regionName, destinations }: Props) {
  const navigate = useNavigate()
  const { language, t } = useI18n()
  const wrapRef = useRef<HTMLDivElement>(null)
  const zoomSurfaceRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const rafRef = useRef<number | null>(null)
  const wheelUnlockRef = useRef<number | null>(null)
  const isWheelLockedRef = useRef(false)
  const zoomRef = useRef(1)
  const translateRef = useRef({ x: 0, y: 0 })
  const dragStateRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    startTranslateX: number
    startTranslateY: number
  } | null>(null)

  const fillId = `region-fill-${useId().replace(/:/g, '')}`
  const waterId = `region-water-${useId().replace(/:/g, '')}`
  const pulseId = `region-pulse-${useId().replace(/:/g, '')}`

  const [size, setSize] = useState({ w: 920, h: 560 })
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })

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
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
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
      ? language === 'en'
        ? 'The region map is not available right now.'
        : 'Картата на областта не е налична в момента.'
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

    const projectedMarkers: Omit<Marker, 'clusterIndex' | 'clusterSize'>[] = []

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

      projectedMarkers.push({
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

    const clusters = clusterMarkers(projectedMarkers)
    const clusterLookup = new Map<number, { index: number; size: number }>()

    for (const group of clusters) {
      group.forEach((markerIndex, groupIndex) => {
        clusterLookup.set(markerIndex, {
          index: groupIndex,
          size: group.length,
        })
      })
    }

    const markers = projectedMarkers.map((marker, index) => {
      const clusterMeta = clusterLookup.get(index) ?? { index: 0, size: 1 }
      return {
        ...marker,
        clusterIndex: clusterMeta.index,
        clusterSize: clusterMeta.size,
      }
    })

    return { backgroundPaths, pathD, markers }
  }, [geoData, regionFeature, destinations, size.w, size.h, slug])

  useEffect(() => {
    setZoom(1)
    setTranslate({ x: 0, y: 0 })
    zoomRef.current = 1
    translateRef.current = { x: 0, y: 0 }
  }, [slug])

  const maxTranslateX = Math.max(0, ((zoom - 1) * size.w) / 2)
  const maxTranslateY = Math.max(0, ((zoom - 1) * size.h) / 2)
  const clampedTranslate = useMemo(
    () => ({
      x: clamp(translate.x, -maxTranslateX, maxTranslateX),
      y: clamp(translate.y, -maxTranslateY, maxTranslateY),
    }),
    [translate.x, translate.y, maxTranslateX, maxTranslateY],
  )

  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  useEffect(() => {
    translateRef.current = clampedTranslate
  }, [clampedTranslate])

  const renderMarkers = useMemo<RenderMarker[]>(() => {
    const spreadFactor = clamp((zoom - 1) / 1.25, 0, 1)

    return markers.map((marker) => {
      if (marker.clusterSize <= 1) {
        return { ...marker, renderX: marker.x, renderY: marker.y }
      }

      const radius = 8 + marker.clusterSize * 3 + spreadFactor * 28
      const angle = (Math.PI * 2 * marker.clusterIndex) / marker.clusterSize - Math.PI / 2
      const offsetScale = 0.18 + spreadFactor * 0.82

      return {
        ...marker,
        renderX: marker.x + Math.cos(angle) * radius * offsetScale,
        renderY: marker.y + Math.sin(angle) * radius * offsetScale,
      }
    })
  }, [markers, zoom])

  const hoveredMarker = hovered
    ? renderMarkers.find((marker) => marker.id === hovered) ?? null
    : null

  const hoveredPos = useMemo(() => {
    if (!hoveredMarker) return null

    const screenX =
      (hoveredMarker.renderX - size.w / 2) * zoom + clampedTranslate.x + size.w / 2
    const screenY =
      (hoveredMarker.renderY - size.h / 2) * zoom + clampedTranslate.y + size.h / 2

    return {
      left: Math.min(86, Math.max(14, (screenX / size.w) * 100)),
      top: Math.min(88, Math.max(16, (screenY / size.h) * 100)),
    }
  }, [clampedTranslate.x, clampedTranslate.y, hoveredMarker, size.h, size.w, zoom])

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

  const scheduleViewState = (nextZoom: number, nextTranslate: { x: number; y: number }) => {
    zoomRef.current = nextZoom
    translateRef.current = nextTranslate

    if (rafRef.current !== null) return

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      setZoom(zoomRef.current)
      setTranslate(translateRef.current)
    })
  }

  const setZoomWithAnchor = (nextZoom: number, anchor?: { x: number; y: number }) => {
    const currentZoom = zoomRef.current
    const currentTranslate = translateRef.current
    const targetZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM)
    if (targetZoom === currentZoom) return

    if (!anchor) {
      const ratio = targetZoom / currentZoom
      const nextMaxX = Math.max(0, ((targetZoom - 1) * size.w) / 2)
      const nextMaxY = Math.max(0, ((targetZoom - 1) * size.h) / 2)

      scheduleViewState(targetZoom, {
        x: clamp(currentTranslate.x * ratio, -nextMaxX, nextMaxX),
        y: clamp(currentTranslate.y * ratio, -nextMaxY, nextMaxY),
      })
      return
    }

    const worldX = (anchor.x - currentTranslate.x - size.w / 2) / currentZoom
    const worldY = (anchor.y - currentTranslate.y - size.h / 2) / currentZoom
    const nextTranslateX = anchor.x - size.w / 2 - worldX * targetZoom
    const nextTranslateY = anchor.y - size.h / 2 - worldY * targetZoom
    const nextMaxX = Math.max(0, ((targetZoom - 1) * size.w) / 2)
    const nextMaxY = Math.max(0, ((targetZoom - 1) * size.h) / 2)

    scheduleViewState(targetZoom, {
      x: clamp(nextTranslateX, -nextMaxX, nextMaxX),
      y: clamp(nextTranslateY, -nextMaxY, nextMaxY),
    })
  }

  useEffect(() => {
    const el = zoomSurfaceRef.current
    const svg = svgRef.current
    if (!el || !svg) return

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      handleWheelActivity()

      const rect = svg.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      const anchor = {
        x: ((event.clientX - rect.left) / rect.width) * size.w,
        y: ((event.clientY - rect.top) / rect.height) * size.h,
      }
      const direction = event.deltaY > 0 ? -1 : 1

      setZoomWithAnchor(zoomRef.current + direction * ZOOM_STEP, anchor)
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [size.w, size.h])

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (zoomRef.current <= 1) return

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTranslateX: translateRef.current.x,
      startTranslateY: translateRef.current.y,
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    setHovered(null)
  }

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    scheduleViewState(zoomRef.current, {
      x: clamp(
        dragState.startTranslateX + (event.clientX - dragState.startX),
        -maxTranslateX,
        maxTranslateX,
      ),
      y: clamp(
        dragState.startTranslateY + (event.clientY - dragState.startY),
        -maxTranslateY,
        maxTranslateY,
      ),
    })
  }

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return

    dragStateRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const zoomHint =
    language === 'en'
      ? 'Use the wheel to zoom and drag to inspect dense groups.'
      : 'Използвай колелцето за zoom и влачене за струпани групи.'

  return (
    <section className="overflow-hidden rounded-[2.2rem] border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(232,240,234,0.92))] p-4 shadow-[0_34px_70px_rgba(15,61,46,0.10)] md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold text-[var(--forest-deep)] md:text-3xl">
            {language === 'en' ? `Map of ${regionName} Region` : `Карта на област ${regionName}`}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] md:text-base">
            {language === 'en'
              ? 'The region now follows the same color language as the Bulgaria map, with zoom and marker separation in dense areas.'
              : 'Областта следва същата цветова логика като картата на България, с приближение и разделяне на близки маркери.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-[var(--border)] bg-white/84 px-4 py-2 text-sm font-semibold text-[var(--forest-deep)] shadow-[0_10px_20px_rgba(15,61,46,0.06)]">
            {`${markers.length} ${language === 'en' ? 'points' : 'обекта'}`}
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/84 p-1.5 shadow-[0_10px_20px_rgba(15,61,46,0.06)]">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-[var(--forest-deep)] transition hover:bg-[var(--mist)] disabled:cursor-not-allowed disabled:opacity-45"
              onClick={() => setZoomWithAnchor(zoom - ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
              aria-label={language === 'en' ? 'Zoom out' : 'Намали'}
            >
              -
            </button>
            <div className="min-w-[4.2rem] text-center text-xs font-semibold text-[var(--forest-deep)]">
              {`${Math.round(zoom * 100)}%`}
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-[var(--forest-deep)] transition hover:bg-[var(--mist)] disabled:cursor-not-allowed disabled:opacity-45"
              onClick={() => setZoomWithAnchor(zoom + ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
              aria-label={language === 'en' ? 'Zoom in' : 'Увеличи'}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div ref={wrapRef} className="relative w-full">
        <div
          ref={zoomSurfaceRef}
          className="overflow-hidden rounded-[1.8rem] border border-white/70 bg-[rgba(214,230,220,0.34)] p-2 md:p-4"
        >
          {loadError && (
            <p className="py-16 text-center text-sm text-red-600">{loadError}</p>
          )}

          {!loadError && !regionFeature && (
            <p className="py-16 text-center text-sm text-[var(--muted)]">
              {t('loading')}
            </p>
          )}

          {!loadError && regionFeature && pathD && (
            <svg
              ref={svgRef}
              viewBox={`0 0 ${size.w} ${size.h}`}
              className={`h-auto w-full max-w-full select-none ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
              role="img"
              aria-label={
                language === 'en'
                  ? `Map of ${regionName} Region with tourist places`
                  : `Карта на област ${regionName} с туристически обекти`
              }
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <defs>
                <linearGradient id={waterId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#eef7f1" />
                  <stop offset="100%" stopColor="#d8e8de" />
                </linearGradient>
                <linearGradient id={fillId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6c9478" />
                  <stop offset="52%" stopColor="#4f7f63" />
                  <stop offset="100%" stopColor="#2d6a4f" />
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

              <g
                transform={`translate(${clampedTranslate.x} ${clampedTranslate.y}) scale(${zoom})`}
                style={{ transformOrigin: `${size.w / 2}px ${size.h / 2}px` }}
              >
                <g opacity={0.36}>
                  {backgroundPaths.map((feature) => (
                    <path
                      key={feature.slug}
                      d={feature.d}
                      fill="rgba(69,126,99,0.12)"
                      stroke="rgba(255,255,255,0.92)"
                      strokeWidth={1.1}
                      strokeLinejoin="round"
                      aria-label={feature.name}
                    />
                  ))}
                </g>

                <motion.path
                  d={pathD}
                  fill={`url(#${fillId})`}
                  stroke="rgba(255,255,255,0.98)"
                  strokeWidth={2.2}
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0.7 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.85, ease: 'easeOut' }}
                />

                {renderMarkers.map((marker, index) => {
                  const hasCluster = marker.clusterSize > 1
                  const haloRadius = hasCluster ? 11.5 : 10
                  const innerRadius = hasCluster ? 5.1 : 4.6

                  return (
                    <g
                      key={marker.id}
                      transform={`translate(${marker.renderX}, ${marker.renderY})`}
                      aria-label={marker.name}
                      onMouseEnter={() => setHoveredIfUnlocked(marker.id)}
                      onMouseLeave={() => setHoveredIfUnlocked(null)}
                      onClick={() => navigate(`/destination/${marker.id}`)}
                      className="cursor-pointer"
                    >
                      <circle
                        r={haloRadius}
                        fill="rgba(255,255,255,0.18)"
                        stroke="rgba(255,255,255,0.92)"
                        strokeWidth={1.2}
                        style={{ filter: `url(#${pulseId})` }}
                      />
                      <motion.circle
                        r={innerRadius}
                        fill="#ffffff"
                        stroke="#2d6a4f"
                        strokeWidth={1.4}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.08 + index * 0.02, duration: 0.26 }}
                      />
                      {hasCluster && zoom < 1.45 && marker.clusterIndex === 0 && (
                        <g>
                          <circle
                            cx="16"
                            cy="-16"
                            r="11"
                            fill="rgba(15,61,46,0.92)"
                            stroke="rgba(255,255,255,0.96)"
                            strokeWidth="1.2"
                          />
                          <text
                            x="16"
                            y="-16"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#ffffff"
                            fontSize="10.5"
                            fontWeight="700"
                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                          >
                            {marker.clusterSize}
                          </text>
                        </g>
                      )}
                    </g>
                  )
                })}
              </g>
            </svg>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 px-1 text-xs text-[var(--muted)]">
          <p>{zoomHint}</p>
          {zoom > 1 && (
            <button
              type="button"
              className="rounded-full border border-[var(--border)] bg-white/82 px-3 py-1.5 font-semibold text-[var(--forest-deep)] transition hover:bg-[var(--mist)]"
              onClick={() => {
                scheduleViewState(1, { x: 0, y: 0 })
              }}
            >
              {language === 'en' ? 'Reset view' : 'Нулирай изгледа'}
            </button>
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
    </section>
  )
}
