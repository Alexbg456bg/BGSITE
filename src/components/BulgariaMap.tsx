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
  const badgeRef = useRef<HTMLDivElement>(null)
  const pathRefs = useRef(new Map<string, SVGPathElement>())
  const labelRefs = useRef(new Map<string, SVGTextElement>())
  const activeSlugRef = useRef<string | null>(null)
  const waterId = `map-water-${useId().replace(/:/g, '')}`
  const activeId = `map-active-${useId().replace(/:/g, '')}`

  const [size, setSize] = useState({ w: 980, h: 580 })
  const [fc, setFc] = useState<FeatureCollection | null>(null)
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
      const h = Math.max(minHeight, w * ratio)
      setSize((current) => (current.w === w && current.h === h ? current : { w, h }))
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

  const { pathGen, features, labels, nameBySlug } = useMemo(() => {
    if (!fc?.features?.length) {
      return {
        pathGen: null as ReturnType<typeof geoPath> | null,
        features: [] as OblastFeature[],
        labels: [] as { slug: string; x: number; y: number; text: string }[],
        nameBySlug: new Map<string, string>(),
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
    const nameBySlug = new Map<string, string>()

    for (const feature of features) {
      const slug = feature.properties?.slug
      if (!slug) continue

      const center = projection(geoCentroid(feature))
      if (!center) continue

      const raw =
        feature.properties?.nameBg ?? feature.properties?.name ?? feature.properties?.slug
      nameBySlug.set(slug, raw)
      const clean = raw.replace(' област', '')
      const text = clean.length > 11 ? `${clean.slice(0, 10)}…` : clean
      labels.push({ slug, x: center[0], y: center[1], text })
    }

    return { pathGen, features, labels, nameBySlug }
  }, [fc, size.w, size.h])

  const setPathState = (node: SVGPathElement | undefined, state: 'idle' | 'dimmed' | 'active') => {
    if (!node) return

    if (state === 'active') {
      node.setAttribute('fill', `url(#${activeId})`)
      node.setAttribute('stroke', 'rgba(255,255,255,0.98)')
      node.setAttribute('stroke-width', '1.7')
      node.style.opacity = '1'
      return
    }

    node.setAttribute('fill', 'rgba(69, 126, 99, 0.34)')
    node.setAttribute('stroke', 'rgba(255,255,255,0.92)')
    node.setAttribute('stroke-width', '1.1')
    node.style.opacity = state === 'dimmed' ? '0.84' : '1'
  }

  const setLabelState = (node: SVGTextElement | undefined, state: 'idle' | 'dimmed' | 'active') => {
    if (!node) return

    if (state === 'active') {
      node.setAttribute('fill', '#ffffff')
      node.setAttribute('font-weight', '700')
      node.style.opacity = '1'
      return
    }

    node.setAttribute('fill', '#173126')
    node.setAttribute('font-weight', '600')
    node.style.opacity = state === 'dimmed' ? '0.72' : '0.94'
  }

  const updateHovered = (slug: string | null) => {
    const current = activeSlugRef.current
    if (current === slug) return

    if (!current && slug) {
      for (const [key, node] of pathRefs.current) {
        setPathState(node, key === slug ? 'active' : 'dimmed')
      }
      for (const [key, node] of labelRefs.current) {
        setLabelState(node, key === slug ? 'active' : 'dimmed')
      }
    } else if (current && slug) {
      setPathState(pathRefs.current.get(current), 'dimmed')
      setLabelState(labelRefs.current.get(current), 'dimmed')
      setPathState(pathRefs.current.get(slug), 'active')
      setLabelState(labelRefs.current.get(slug), 'active')
    } else if (current && !slug) {
      for (const node of pathRefs.current.values()) {
        setPathState(node, 'idle')
      }
      for (const node of labelRefs.current.values()) {
        setLabelState(node, 'idle')
      }
    }

    activeSlugRef.current = slug

    if (badgeRef.current) {
      badgeRef.current.textContent = slug
        ? nameBySlug.get(slug) ?? slug
        : badgeRef.current.dataset.defaultLabel ?? ''
    }
  }

  useEffect(() => {
    activeSlugRef.current = null

    if (badgeRef.current) {
      badgeRef.current.textContent = badgeRef.current.dataset.defaultLabel ?? ''
    }
  }, [features, nameBySlug])

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
            <div
              ref={badgeRef}
              data-default-label="28 области"
              className="rounded-full border border-[var(--border)] bg-white/84 px-4 py-2 text-sm font-semibold text-[var(--forest-deep)] shadow-[0_10px_20px_rgba(15,61,46,0.06)]"
            >
              28 области
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
              onPointerLeave={() => updateHovered(null)}
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
              </defs>

              <rect width={size.w} height={size.h} rx="26" fill={`url(#${waterId})`} />

              {features.map((feature) => {
                const slug = feature.properties?.slug
                if (!slug) return null

                const d = pathGen(feature) ?? ''

                return (
                  <path
                    key={slug}
                    ref={(node) => {
                      if (node) {
                        pathRefs.current.set(slug, node)
                        return
                      }

                      pathRefs.current.delete(slug)
                    }}
                    d={d}
                    fill="rgba(69, 126, 99, 0.34)"
                    stroke="rgba(255,255,255,0.92)"
                    strokeWidth={1.1}
                    strokeLinejoin="round"
                    className="cursor-pointer transition-[fill,stroke,stroke-width,opacity] duration-75 ease-out"
                    style={{
                      opacity: 1,
                      transformBox: 'fill-box',
                      transformOrigin: 'center',
                      willChange: 'fill, stroke, stroke-width, opacity',
                    }}
                    onPointerEnter={() => updateHovered(slug)}
                    onFocus={() => updateHovered(slug)}
                    onBlur={() => updateHovered(null)}
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
                return (
                  <text
                    key={label.slug}
                    ref={(node) => {
                      if (node) {
                        labelRefs.current.set(label.slug, node)
                        return
                      }

                      labelRefs.current.delete(label.slug)
                    }}
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    fill="#173126"
                    fontSize={compact ? 7 : 8.4}
                    fontWeight={600}
                    className="pointer-events-none transition-[fill,opacity] duration-75 ease-out"
                    style={{
                      fontFamily: 'DM Sans, sans-serif',
                      opacity: 0.94,
                      willChange: 'fill, opacity',
                    }}
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
