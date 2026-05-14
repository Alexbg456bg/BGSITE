import { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { DestinationCard } from '../components/DestinationCard'
import { FilterBar } from '../components/FilterBar'
import { useTheme } from '../contexts/ThemeContext'
import { useSiteData } from '../hooks/useSiteData'
import type { DestinationCategory } from '../types'
import { ALL_CATEGORIES, getCategoryLabels } from '../data/categoryLabels'
import { useI18n } from '../i18n/LanguageContext'

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
  const { language, t } = useI18n()
  const { theme } = useTheme()
  const labels = getCategoryLabels(language)
  const [category, setCategoryState] = useState<DestinationCategory | 'all'>(
    () => parseCategory(searchParams.get('category')),
  )
  const [regionSlug, setRegionSlugState] = useState<string | 'all'>(
    () => searchParams.get('region') || 'all',
  )

  const updateFilters = (
    next: {
      category?: DestinationCategory | 'all'
      regionSlug?: string | 'all'
    },
    scrollToResults = false,
  ) => {
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
    category === 'all'
      ? language === 'en'
        ? 'All categories'
        : 'Всички категории'
      : labels[category]

  return (
    <div className="pb-14 md:pb-20">
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--mobile-hero-panel-bg)] py-8 md:py-14">
        <div className="hero-orb hero-orb-left" />
        <div className="hero-orb hero-orb-right" />

        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs
            variant={theme === 'dark' ? 'onDark' : 'default'}
            items={[{ label: t('navHome'), to: '/' }, { label: t('navDestinations') }]}
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 md:mt-6"
          >
            <motion.h1 className="max-w-3xl font-display text-[1.9rem] font-semibold leading-[0.95] text-[var(--mobile-hero-title)] drop-shadow-[0_8px_22px_rgba(0,0,0,0.18)] md:text-5xl md:drop-shadow-none">
              {language === 'en' ? 'All destinations' : 'Всички дестинации'}
            </motion.h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--mobile-hero-copy)] drop-shadow-[0_4px_14px_rgba(0,0,0,0.14)] md:text-lg md:drop-shadow-none">
              {language === 'en'
                ? 'Filter by category and region, then open a specific place with descriptions and photos.'
                : 'Филтрирай по категория и област, после отвори конкретно място с описание и снимки.'}
            </p>
          </motion.div>

          <div className="mt-5 grid grid-cols-3 gap-2 md:hidden">
            <div className="rounded-2xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-3 py-3 shadow-sm">
              <p className="font-display text-xl font-semibold text-[var(--mobile-hero-title)]">
                {allDestinations.length}
              </p>
              <p className="text-[11px] text-[var(--muted)]">
                {language === 'en' ? 'total' : 'общо'}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-3 py-3 shadow-sm">
              <p className="font-display text-xl font-semibold text-[var(--mobile-hero-title)]">
                {filtered.length}
              </p>
              <p className="text-[11px] text-[var(--muted)]">
                {language === 'en' ? 'shown' : 'показани'}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-3 py-3 shadow-sm">
              <p className="font-display text-xl font-semibold text-[var(--mobile-hero-title)]">
                28
              </p>
              <p className="text-[11px] text-[var(--muted)]">
                {language === 'en' ? 'regions' : 'области'}
              </p>
            </div>
          </div>
        </div>
      </section>

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
            <span className="font-semibold text-[var(--mobile-hero-title)]">
              {filtered.length}
            </span>{' '}
            {language === 'en' ? 'places' : 'обекта'} · {activeCategoryLabel}
          </p>
          {regionSlug !== 'all' && (
            <button
              type="button"
              className="rounded-full border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--forest)] shadow-sm"
              onClick={() => navigate(`/region/${regionSlug}`)}
            >
              {language === 'en' ? 'Open region' : 'Отвори областта'}
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
