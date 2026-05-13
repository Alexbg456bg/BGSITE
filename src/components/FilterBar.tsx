import { useMemo, useState } from 'react'
import type { DestinationCategory } from '../types'
import { ALL_CATEGORIES, getCategoryLabels } from '../data/categoryLabels'
import { useI18n } from '../i18n/LanguageContext'
import { useSiteData } from '../hooks/useSiteData'

type Props = {
  category: DestinationCategory | 'all'
  onCategoryChange: (c: DestinationCategory | 'all') => void
  regionSlug: string | 'all'
  onRegionChange: (slug: string | 'all') => void
  showRegionFilter?: boolean
}

export function FilterBar({
  category,
  onCategoryChange,
  regionSlug,
  onRegionChange,
  showRegionFilter = true,
}: Props) {
  const [showAllCategories, setShowAllCategories] = useState(false)
  const { language, t } = useI18n()
  const { regions } = useSiteData()
  const labels = getCategoryLabels(language)

  const categoryEntries = useMemo(
    () =>
      ALL_CATEGORIES.map((key) => ({
        key,
        label: labels[key],
      })),
    [labels],
  )

  const visibleCategories = useMemo(
    () => (showAllCategories ? categoryEntries : categoryEntries.slice(0, 5)),
    [categoryEntries, showAllCategories],
  )

  return (
    <div className="flex flex-col gap-5 rounded-[1.45rem] border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] p-3 shadow-[var(--mobile-panel-shadow)] backdrop-blur md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-6 md:rounded-2xl md:bg-[var(--surface)] md:p-5 md:shadow-none">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {t('category')}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className={[
              'min-h-11 rounded-2xl px-3 py-2 text-left text-xs font-bold transition active:scale-[0.98]',
              category === 'all'
                ? 'bg-[var(--forest-deep)] text-white shadow-[0_10px_22px_rgba(15,61,46,0.2)]'
                : 'border border-[var(--mobile-panel-border)] bg-[var(--surface)] text-[var(--ink-soft)] shadow-sm',
            ].join(' ')}
          >
            <span className="flex items-center gap-1.5">
              {category === 'all' && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              {t('all')}
            </span>
          </button>

          {categoryEntries.map(({ key, label }) => {
            const active = category === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => onCategoryChange(key)}
                className={[
                  'min-h-11 rounded-2xl px-3 py-2 text-left text-xs font-bold leading-tight transition active:scale-[0.98]',
                  active
                    ? 'border border-[var(--forest-deep)] bg-[var(--forest-deep)] text-white shadow-[0_10px_22px_rgba(15,61,46,0.2)]'
                    : 'border border-[var(--mobile-panel-border)] bg-[var(--surface)] text-[var(--ink-soft)] shadow-sm',
                ].join(' ')}
              >
                <span className="flex items-center gap-1.5">
                  {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />}
                  <span>{label}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-2 hidden gap-2.5 overflow-x-auto pb-2 md:flex md:flex-wrap md:overflow-visible md:pb-0">
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className={[
              'group relative shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-300 md:py-2 md:font-semibold',
              category === 'all'
                ? 'scale-105 bg-gradient-to-r from-[var(--forest-deep)] to-[var(--forest)] text-white shadow-[0_8px_20px_rgba(15,61,46,0.25)]'
                : 'border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--forest-deep)] hover:shadow-[0_6px_16px_rgba(15,61,46,0.12)]',
            ].join(' ')}
          >
            {t('all')}
          </button>

          {visibleCategories.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onCategoryChange(key)}
              className={[
                'group relative shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-300 md:py-2 md:font-semibold',
                category === key
                  ? 'scale-105 bg-gradient-to-r from-[var(--forest-deep)] to-[var(--forest)] text-white shadow-[0_8px_20px_rgba(15,61,46,0.25)]'
                  : 'border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] text-[var(--ink-soft)] hover:bg-[var(--mist)] hover:text-[var(--forest-deep)] hover:shadow-[0_6px_16px_rgba(15,61,46,0.12)]',
              ].join(' ')}
            >
              {label}
            </button>
          ))}

          {categoryEntries.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="group relative shrink-0 rounded-2xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-4 py-2.5 text-xs font-bold text-[var(--ink-soft)] transition-all duration-300 hover:bg-[var(--mist)] md:py-2 md:font-semibold"
            >
              {showAllCategories ? t('less') : t('more')}
            </button>
          )}
        </div>
      </div>

      {showRegionFilter && (
        <div className="w-full md:w-56">
          <label
            htmlFor="filter-region"
            className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
          >
            {t('region')}
          </label>
          <select
            id="filter-region"
            value={regionSlug}
            onChange={(e) => onRegionChange(e.target.value as string | 'all')}
            className="mt-2 w-full rounded-2xl border border-[var(--mobile-panel-border)] bg-[var(--surface)] px-3 py-3 text-sm font-medium text-[var(--ink)] outline-none ring-[var(--forest)]/20 focus:ring-4 md:rounded-xl md:py-2.5"
          >
            <option value="all">{t('allRegions')}</option>
            {regions.map((r) => (
              <option key={r.id} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
