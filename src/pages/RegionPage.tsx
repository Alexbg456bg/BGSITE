import { useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { FilterBar } from '../components/FilterBar'
import { DestinationCard } from '../components/DestinationCard'
import { RegionFocusMap } from '../components/RegionFocusMap'
import { SmartImage } from '../components/SmartImage'
import { ImageGallery } from '../components/ImageGallery'
import { getRegionBySlug, regions } from '../data/regions'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../data/categoryLabels'
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
  const region = slug ? getRegionBySlug(slug) : undefined

  const category = parseCategory(searchParams.get('category'))

  const setCategory = (c: DestinationCategory | 'all') => {
    if (c === 'all') setSearchParams({})
    else setSearchParams({ category: c })
  }

  const filteredDestinations = useMemo(() => {
    if (!region) return []
    if (category === 'all') return region.destinations
    return region.destinations.filter((d) => d.category === category)
  }, [region, category])

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
        className="relative h-[min(54vh,440px)] overflow-hidden"
        role="img"
        aria-label={region.name}
      >
        <SmartImage
          src={region.bannerImage}
          alt={region.name}
          fetchPriority="high"
          decoding="async"
          maxWidth={1400}
          className="absolute inset-0 h-full w-full"
          imgClassName="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest-deep)]/94 via-[var(--forest-deep)]/46 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_24%)]" />

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-12 pt-24">
          <Breadcrumbs
            items={[
              { label: 'Начало', to: '/' },
              { label: region.name },
            ]}
          />

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 font-display text-4xl font-semibold text-white md:text-5xl"
          >
            {region.name}
          </motion.h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/90">
            {region.description}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {region.highlights.map((highlight) => (
              <li
                key={highlight}
                className="rounded-full bg-white/18 px-3 py-1 text-xs font-medium text-white backdrop-blur"
              >
                {highlight}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/88">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur">
              {region.destinations.length} обекта
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur">
              Собствена карта на областта
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <RegionFocusMap
          slug={region.slug}
          regionName={region.name}
          destinations={region.destinations}
        />

        <div className="mt-10">
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

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
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
            className="text-sm font-medium text-[var(--forest)] hover:underline"
          >
            ← Към картата
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <section className="mt-16">
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

        <section className="mt-20 border-t border-[var(--border)] pt-12">
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
