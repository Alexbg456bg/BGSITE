import { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { DestinationCard } from '../components/DestinationCard'
import { FilterBar } from '../components/FilterBar'
import { useSiteData } from '../hooks/useSiteData'
import type { DestinationCategory } from '../types'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../data/categoryLabels'

function parseCategory(value: string | null): DestinationCategory | 'all' {
  if (value && ALL_CATEGORIES.includes(value as DestinationCategory)) {
    return value as DestinationCategory
  }

  return 'all'
}

export function DestinationsPage() {
  const navigate = useNavigate()
  const resultsRef = useRef<HTMLDivElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const { allDestinations, destinationIdsByRegionSlug, regionByDestinationId } =
    useSiteData()
  const [category, setCategoryState] = useState<DestinationCategory | 'all'>(
    () => parseCategory(searchParams.get('category')),
  )
  const [regionSlug, setRegionSlugState] = useState<string | 'all'>(
    () => searchParams.get('region') || 'all',
  )

  const updateFilters = (next: {
    category?: DestinationCategory | 'all'
    regionSlug?: string | 'all'
  }, scrollToResults = false) => {
    const nextCategory = next.category ?? category
    const nextRegionSlug = next.regionSlug ?? regionSlug
    const params = new URLSearchParams()

    if (nextCategory !== 'all') params.set('category', nextCategory)
    if (nextRegionSlug !== 'all') params.set('region', nextRegionSlug)

    setCategoryState(nextCategory)
    setRegionSlugState(nextRegionSlug)
    setSearchParams(params, { replace: true, preventScrollReset: true })

    if (scrollToResults) {
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 80)
    }
  }

  const filtered = useMemo(() => {
    let list = allDestinations
    if (category !== 'all') {
      list = list.filter((d) => d.category === category)
    }
    if (regionSlug !== 'all') {
      const ids = destinationIdsByRegionSlug.get(regionSlug)
      if (ids) {
        list = list.filter((d) => ids.has(d.id))
      } else {
        list = []
      }
    }
    return list
  }, [allDestinations, category, destinationIdsByRegionSlug, regionSlug])

  const activeCategoryLabel =
    category === 'all' ? 'Всички категории' : CATEGORY_LABELS[category]

  return (
    <div className="pb-14 md:pb-20">
      <div className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(227,238,230,0.78))] py-7 md:bg-[var(--surface-2)] md:py-10">
        <div
          className="pointer-events-none absolute -right-16 top-2 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(79,140,171,0.18),transparent_70%)] blur-2xl md:hidden"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs
            items={[{ label: 'Начало', to: '/' }, { label: 'Дестинации' }]}
          />
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 font-display text-[1.9rem] font-semibold leading-tight text-[var(--forest-deep)] md:text-4xl"
          >
            Всички дестинации
          </motion.h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)] md:text-base">
            Филтрирай по категория и област, после отвори конкретно място с
            описание и снимки.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 md:hidden">
            <div className="rounded-2xl border border-white/70 bg-white/72 px-3 py-3 shadow-sm">
              <p className="font-display text-xl font-semibold text-[var(--forest-deep)]">
                {allDestinations.length}
              </p>
              <p className="text-[11px] text-[var(--muted)]">общо</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/72 px-3 py-3 shadow-sm">
              <p className="font-display text-xl font-semibold text-[var(--forest-deep)]">
                {filtered.length}
              </p>
              <p className="text-[11px] text-[var(--muted)]">показани</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/72 px-3 py-3 shadow-sm">
              <p className="font-display text-xl font-semibold text-[var(--forest-deep)]">
                28
              </p>
              <p className="text-[11px] text-[var(--muted)]">области</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="sticky top-[4.4rem] z-30 -mx-1 rounded-[1.5rem] bg-[var(--bg)]/82 p-1 backdrop-blur-xl md:static md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-0">
          <FilterBar
            category={category}
            onCategoryChange={(nextCategory) =>
              updateFilters({ category: nextCategory }, true)
            }
            regionSlug={regionSlug}
            onRegionChange={(slug) => updateFilters({ regionSlug: slug }, true)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">
            <span className="font-semibold text-[var(--forest-deep)]">
              {filtered.length}
            </span>{' '}
            обекта · {activeCategoryLabel}
          </p>
          {regionSlug !== 'all' && (
            <button
              type="button"
              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--forest)] shadow-sm"
              onClick={() => navigate(`/region/${regionSlug}`)}
            >
              Отвори областта
            </button>
          )}
        </div>

        <div
          ref={resultsRef}
          className="mt-6 scroll-mt-24 grid gap-4 sm:grid-cols-2 md:mt-10 md:scroll-mt-28 md:gap-6 lg:grid-cols-3"
        >
          {filtered.map((d, i) => {
            const region = regionByDestinationId.get(d.id)
            if (!region) return null
            return (
              <DestinationCard
                key={d.id}
                destination={d}
                regionSlug={region.slug}
                index={i}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
