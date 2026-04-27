import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { FilterBar } from '../components/FilterBar'
import { DestinationCard } from '../components/DestinationCard'
import { RegionFocusMap } from '../components/RegionFocusMap'
import { SmartImage } from '../components/SmartImage'
import { ImageGallery } from '../components/ImageGallery'
import { useSiteData } from '../hooks/useSiteData'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../data/categoryLabels'
import { LOCAL_REGION_MOBILE_BANNERS } from '../data/localRegionImages'
import type { DestinationCategory } from '../types'

function parseCategory(s: string | null): DestinationCategory | 'all' {
  if (!s) return 'all'
  if (ALL_CATEGORIES.includes(s as DestinationCategory)) {
    return s as DestinationCategory
  }
  return 'all'
}

export function RegionPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { getRegionBySlug, regions } = useSiteData()
  const region = slug ? getRegionBySlug(slug) : undefined

  const category = parseCategory(searchParams.get('category'))
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(min-width: 768px)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)')
    const onChange = () => setIsDesktop(media.matches)

    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const setCategory = (c: DestinationCategory | 'all') => {
    if (c === 'all') setSearchParams({})
    else setSearchParams({ category: c })
  }

  const filteredDestinations = useMemo(() => {
    if (!region) return []
    if (category === 'all') return region.destinations
    return region.destinations.filter((d) => d.category === category)
  }, [region, category])
  const heroImage = region
    ? isDesktop
      ? region.bannerImage
      : (LOCAL_REGION_MOBILE_BANNERS[region.slug] ?? '')
    : ''

  if (!region) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-[var(--ink)]">
          Областта не е намерена
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Провери адреса или се върни към картата.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-[var(--forest)] px-6 py-3 text-sm font-semibold text-white"
        >
          Към началото
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div
        className="relative min-h-[78svh] overflow-hidden md:h-[min(54vh,440px)] md:min-h-0"
        style={
          heroImage && !isDesktop
            ? {
                backgroundImage: `url(${heroImage})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
              }
            : undefined
        }
        role="img"
        aria-label={region.name}
      >
        {heroImage && isDesktop && (
          <SmartImage
            src={heroImage}
            alt={region.name}
            fetchPriority="high"
            decoding="async"
            maxWidth={1400}
            className="absolute inset-0 h-full w-full"
            imgClassName="object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest-deep)]/98 via-[var(--forest-deep)]/58 to-black/22 md:from-[var(--forest-deep)]/94 md:via-[var(--forest-deep)]/46 md:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[62%] bg-[linear-gradient(180deg,transparent,rgba(5,28,21,0.72)_42%,rgba(5,28,21,0.9)_100%)] md:hidden" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_24%)]" />

        <div className="relative mx-auto flex min-h-[78svh] max-w-6xl flex-col justify-end px-4 pb-8 pt-24 md:h-full md:min-h-0 md:pb-12">
          <Breadcrumbs
            variant="onDark"
            items={[
              { label: 'Начало', to: '/' },
              { label: region.name },
            ]}
          />

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 font-display text-3xl font-semibold text-white drop-shadow-[0_3px_14px_rgba(0,0,0,0.7)] md:text-5xl"
          >
            {region.name}
          </motion.h1>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.72)] md:mt-4 md:text-lg md:font-normal md:text-white/90">
            {region.description}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 md:mt-6">
            {region.highlights.map((highlight) => (
              <li
                key={highlight}
                className="rounded-full bg-white/28 px-3 py-1 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm md:bg-white/18 md:font-medium"
              >
                {highlight}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/88 md:mt-6 md:gap-3">
            <span className="rounded-full border border-white/28 bg-white/22 px-3 py-1.5 font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm md:bg-white/10 md:font-normal">
              {region.destinations.length} обекта
            </span>
            <span className="rounded-full border border-white/28 bg-white/22 px-3 py-1.5 font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm md:bg-white/10 md:font-normal">
              Собствена карта на областта
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-9 pt-7 md:py-16">
        {isDesktop && (
          <RegionFocusMap
            slug={region.slug}
            regionName={region.name}
            destinations={region.destinations}
          />
        )}

        <div className="md:mt-10">
          <FilterBar
            category={category}
            onCategoryChange={setCategory}
            regionSlug={region.slug}
            onRegionChange={(s) => {
              if (s === 'all') navigate('/regions')
              else {
                const next = new URLSearchParams(searchParams)
                const qs = next.toString()
                navigate(qs ? `/region/${s}?${qs}` : `/region/${s}`)
              }
            }}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 md:mt-6 md:gap-4">
          <p className="text-sm text-[var(--muted)]">
            {filteredDestinations.length}{' '}
            {filteredDestinations.length === 1 ? 'обект' : 'обекта'}
            {category !== 'all' && (
              <>
                {' '}
                · филтър:{' '}
                <span className="font-medium text-[var(--forest)]">
                  {CATEGORY_LABELS[category]}
                </span>
              </>
            )}
          </p>
          <Link
            to="/#home-map"
            className="hidden text-sm font-medium text-[var(--forest)] hover:underline md:inline"
          >
            ← Към картата
          </Link>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 md:mt-10 md:gap-6 lg:grid-cols-3">
          {filteredDestinations.map((destination, index) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              regionSlug={region.slug}
              index={index}
            />
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <p className="mt-12 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--mist)]/50 py-12 text-center text-[var(--muted)]">
            Няма обекти в тази категория за област {region.name}. Избери друга
            категория или{' '}
            <button
              type="button"
              className="font-medium text-[var(--forest)] underline"
              onClick={() => setCategory('all')}
            >
              виж всички
            </button>
            .
          </p>
        )}

        {region.images && region.images.length > 1 && (
          <section className="mt-12 md:mt-16">
            <h2 className="font-display text-xl font-semibold text-[var(--forest-deep)]">
              Галерия {region.name}
            </h2>
            <div className="mt-6">
              <ImageGallery
                images={region.images}
                alt={`Галерия ${region.name}`}
              />
            </div>
          </section>
        )}

        <section className="mt-14 border-t border-[var(--border)] pt-8 md:mt-20 md:pt-12">
          <h2 className="font-display text-xl font-semibold text-[var(--forest-deep)]">
            Други области
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {regions
              .filter((r) => r.slug !== region.slug)
              .map((r) => (
                <Link
                  key={r.id}
                  to={`/region/${r.slug}`}
                  className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--ink-soft)] transition hover:border-[var(--forest)] hover:text-[var(--forest)]"
                >
                  {r.name}
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  )
}
