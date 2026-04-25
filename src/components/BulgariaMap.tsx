import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { geoCentroid, geoMercator, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { motion } from 'framer-motion'
import { loadBulgariaGeoJson } from '../data/bulgariaGeoJson'

const PAD = 3

const LABEL_OVERRIDES: Record<
  string,
  { dx?: number; dy?: number; fontSize?: { compact?: number; default?: number; large?: number } }
> = {
  'sofia-oblast': {
    dx: 44,
  },
  'sofia-grad': {
    dx: -16,
    fontSize: {
      compact: 7.2,
      default: 9,
      large: 9.5,
    },
  },
}

function splitLabelLines(name: string) {
  if (name.length <= 12) return [name]

  const words = name.split(' ').filter(Boolean)
  if (words.length < 2) return [name]

  const midpoint = Math.ceil(name.length / 2)
  let bestIndex = 1
  let bestDistance = Number.POSITIVE_INFINITY
  let currentLength = 0

  for (let index = 0; index < words.length - 1; index += 1) {
    currentLength += words[index].length + (index > 0 ? 1 : 0)
    const distance = Math.abs(midpoint - currentLength)
    if (distance < bestDistance) {
      bestDistance = distance
      bestIndex = index + 1
    }
  }

  return [words.slice(0, bestIndex).join(' '), words.slice(bestIndex).join(' ')]
}

type OblastProps = { slug: string; nameBg?: string; name?: string }
type OblastFeature = Feature<Geometry, OblastProps>
type Label = {
  slug: string
  x: number
  y: number
  lines: string[]
  fontSize?: { compact?: number; default?: number; large?: number }
}

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
  const wheelUnlockRef = useRef<number | null>(null)
  const isWheelLockedRef = useRef(false)
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
      const ratio = compact ? 0.58 : large ? 0.82 : 0.72
      const minHeight = compact ? 360 : large ? 680 : 540
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
        labels: [] as Label[],
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
    const labels: Label[] = []
    const nameBySlug = new Map<string, string>()

    for (const feature of features) {
      const slug = feature.properties?.slug
      if (!slug) continue

      const center = projection(geoCentroid(feature))
      if (!center) continue

      const raw =
        feature.properties?.nameBg ?? feature.properties?.name ?? feature.properties?.slug
      const clean = raw.replace(' област', '')
      const override = LABEL_OVERRIDES[slug]

      nameBySlug.set(slug, raw)
      labels.push({
        slug,
        x: center[0] + (override?.dx ?? 0),
        y: center[1] + (override?.dy ?? 0),
        lines: splitLabelLines(clean),
        fontSize: override?.fontSize,
      })
    }

    return { pathGen, features, labels, nameBySlug }
  }, [fc, size.w, size.h])

  const setPathState = (node: SVGPathElement | undefined, state: 'idle' | 'active') => {
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
    node.style.opacity = '1'
  }

  const setLabelState = (node: SVGTextElement | undefined, state: 'idle' | 'active') => {
    if (!node) return

    if (state === 'active') {
      node.setAttribute('fill', '#ffffff')
      node.setAttribute('font-weight', '700')
      node.style.opacity = '1'
      return
    }

    node.setAttribute('fill', '#0f1720')
    node.setAttribute('font-weight', '700')
    node.style.opacity = '0.98'
  }

  const updateHovered = (slug: string | null) => {
    const current = activeSlugRef.current
    if (current === slug) return

    if (!current && slug) {
      setPathState(pathRefs.current.get(slug), 'active')
      setLabelState(labelRefs.current.get(slug), 'active')
    } else if (current && slug) {
      setPathState(pathRefs.current.get(current), 'idle')
      setLabelState(labelRefs.current.get(current), 'idle')
      setPathState(pathRefs.current.get(slug), 'active')
      setLabelState(labelRefs.current.get(slug), 'active')
    } else if (current && !slug) {
      setPathState(pathRefs.current.get(current), 'idle')
      setLabelState(labelRefs.current.get(current), 'idle')
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

  useEffect(() => {
    return () => {
      if (wheelUnlockRef.current !== null) {
        window.clearTimeout(wheelUnlockRef.current)
      }
    }
  }, [])

  const handleWheelActivity = () => {
    if (wheelUnlockRef.current !== null) {
      window.clearTimeout(wheelUnlockRef.current)
    }

    isWheelLockedRef.current = true
    updateHovered(null)

    wheelUnlockRef.current = window.setTimeout(() => {
      isWheelLockedRef.current = false
      wheelUnlockRef.current = null
    }, 130)
  }

  const updateHoveredIfUnlocked = (slug: string | null) => {
    if (isWheelLockedRef.current) return
    updateHovered(slug)
  }

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
                Избери си област и разгледай местата в нея.
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
          onWheelCapture={handleWheelActivity}
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
                      outline: 'none',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    onPointerEnter={() => updateHoveredIfUnlocked(slug)}
                    onFocus={() => updateHoveredIfUnlocked(slug)}
                    onBlur={() => updateHoveredIfUnlocked(null)}
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

              {labels.map((label) => (
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
                  dominantBaseline="middle"
                  fill="#0f1720"
                  fontSize={
                    compact
                      ? (label.fontSize?.compact ?? 8.2)
                      : large
                        ? (label.fontSize?.large ?? 11.8)
                        : (label.fontSize?.default ?? 10.4)
                  }
                  fontWeight={700}
                  stroke="rgba(255,255,255,0.92)"
                  strokeWidth={0.9}
                  paintOrder="stroke"
                  className="pointer-events-none transition-[fill,opacity] duration-75 ease-out"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    opacity: 0.98,
                    willChange: 'fill, opacity',
                  }}
                >
                  {label.lines.map((line, index) => (
                    <tspan
                      key={`${label.slug}-${index}`}
                      x={label.x}
                      dy={index === 0 ? `${label.lines.length === 1 ? 0 : -0.55}em` : '1.1em'}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              ))}
            </svg>
          )}
        </div>
      </motion.div>
    </section>
  )
}
