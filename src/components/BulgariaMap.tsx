import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { geoCentroid, geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { motion } from 'framer-motion'

const PAD = 10

type OblastProps = { slug: string; nameBg?: string; name?: string }

type OblastFeature = Feature<Geometry, OblastProps>

type Props = {
  id?: string
  /** По-малка височина за вграждане в начална страница */
  compact?: boolean
}

export function BulgariaMap({ id = 'map', compact = false }: Props) {
  const filterId = `map-glow-${useId().replace(/:/g, '')}`
  const navigate = useNavigate()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 900, h: 520 })
  const [fc, setFc] = useState<FeatureCollection | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/data/bulgaria-oblasti.geojson')
      .then((r) => {
        if (!r.ok) throw new Error('HTTP')
        return r.json() as Promise<FeatureCollection>
      })
      .then((data) => {
        if (!cancelled) setFc(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError('Картата не можа да се зареди.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const w = Math.max(280, el.clientWidth)
      const ratio = compact ? 0.52 : 0.58
      setSize({ w, h: Math.max(300, w * ratio) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [compact])

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
    const feats = fc.features as OblastFeature[]
    const labels: { slug: string; x: number; y: number; text: string }[] = []
    for (const f of feats) {
      const slug = f.properties?.slug
      if (!slug) continue
      const c = geoCentroid(f)
      const p = projection(c)
      if (!p) continue
      const raw = f.properties.nameBg ?? f.properties.name ?? slug
      const text =
        raw.length > 10 ? `${raw.slice(0, 9)}…` : raw.replace(' област', '')
      labels.push({ slug, x: p[0], y: p[1], text })
    }
    return { pathGen: pathGen, features: feats, labels }
  }, [fc, size.w, size.h])

  const hoverName = useMemo(() => {
    if (!hovered) return ''
    const f = features.find((x) => x.properties?.slug === hovered)
    return f?.properties?.nameBg ?? f?.properties?.name ?? hovered
  }, [hovered, features])

  return (
    <section id={id} className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          className="overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-b from-[var(--mist)] to-white p-4 shadow-[var(--shadow-soft)] md:p-8"
        >
          {!compact && (
            <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[var(--forest-deep)] md:text-3xl">
                  Карта на България по области
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-[var(--muted)] md:text-base">
                  Реална форма на държавата с 28 области. Граници: Natural Earth
                  (public domain). Задръжте мишката за оцветяване, натиснете за
                  страницата на областта.
                </p>
              </div>
              {hovered && (
                <p className="text-sm font-semibold text-[var(--forest)]">
                  {hoverName}
                </p>
              )}
            </div>
          )}

          <div ref={wrapRef} className="w-full">
            {loadError && (
              <p className="py-16 text-center text-sm text-red-600">{loadError}</p>
            )}
            {!loadError && (!fc || !pathGen) && (
              <p className="py-16 text-center text-sm text-[var(--muted)]">
                Зареждане на картата…
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
                  <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="1.2" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {features.map((f) => {
                  const slug = f.properties?.slug
                  if (!slug) return null
                  const d = pathGen(f) ?? ''
                  const active = hovered === slug
                  return (
                    <path
                      key={slug}
                      d={d}
                      fill={active ? '#2d6a4f' : 'rgba(61, 124, 94, 0.36)'}
                      stroke="rgba(255,255,255,0.92)"
                      strokeWidth={active ? 1.6 : 1}
                      strokeLinejoin="round"
                      className="cursor-pointer transition-[fill,stroke-width] duration-150"
                      style={{ filter: active ? `url(#${filterId})` : undefined }}
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
                      aria-label={`Област ${f.properties?.nameBg ?? slug}`}
                    />
                  )
                })}
                {labels.map((l) => (
                  <text
                    key={`t-${l.slug}`}
                    x={l.x}
                    y={l.y}
                    textAnchor="middle"
                    fill="#0f3d2e"
                    fontSize={compact ? 7 : 8}
                    fontWeight={600}
                    className="pointer-events-none"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {l.text}
                  </text>
                ))}
              </svg>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
