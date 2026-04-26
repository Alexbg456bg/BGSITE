import { useMemo, useState } from 'react'
import type { DestinationCategory } from '../types'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../data/categoryLabels'
import { regions } from '../data/regions'

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

  const categoryEntries = useMemo(
    () =>
      ALL_CATEGORIES.map((key) => ({
        key,
        label: CATEGORY_LABELS[key],
      })),
    [],
  )

  const visibleCategories = useMemo(() => {
    if (showAllCategories) {
      return categoryEntries
    } else {
      return categoryEntries.slice(0, 5) // Show first 5 categories by default
    }
  }, [categoryEntries, showAllCategories])

  return (
    <div className="flex flex-col gap-4 rounded-[1.35rem] border border-[var(--border)] bg-white/88 p-3 shadow-[0_16px_38px_rgba(15,61,46,0.06)] backdrop-blur md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-6 md:rounded-2xl md:bg-[var(--surface)] md:p-5 md:shadow-none">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Категория
        </p>
        <div className="mt-2 flex gap-2.5 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible md:pb-0">
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className={[
              'group relative shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-300 md:py-2 md:font-semibold',
              category === 'all'
                ? 'bg-gradient-to-r from-[var(--forest-deep)] to-[var(--forest)] text-white shadow-[0_8px_20px_rgba(15,61,46,0.25)] scale-105'
                : 'bg-white/80 text-[var(--ink-soft)] hover:bg-gradient-to-r hover:from-[var(--mist)] hover:to-white hover:text-[var(--forest-deep)] hover:scale-105 hover:shadow-[0_6px_16px_rgba(15,61,46,0.12)] border border-[var(--border)]/50',
            ].join(' ')}
          >
            {/* Active indicator */}
            {category === 'all' && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
            
            {/* Shimmer effect for active state */}
            {category === 'all' && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
            
            <span className="relative z-10 flex items-center gap-1.5">
              {category === 'all' && <span className="w-1 h-1 bg-white rounded-full"></span>}
              Всички
            </span>
          </button>
          {visibleCategories.map(({ key, label }, index) => (
            <button
              key={key}
              type="button"
              onClick={() => onCategoryChange(key)}
              className={[
                'group relative shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-300 md:py-2 md:font-semibold',
                category === key
                  ? 'bg-gradient-to-r from-[var(--forest-deep)] to-[var(--forest)] text-white shadow-[0_8px_20px_rgba(15,61,46,0.25)] scale-105'
                  : 'bg-white/80 text-[var(--ink-soft)] hover:bg-gradient-to-r hover:from-[var(--mist)] hover:to-white hover:text-[var(--forest-deep)] hover:scale-105 hover:shadow-[0_6px_16px_rgba(15,61,46,0.12)] border border-[var(--border)]/50',
              ].join(' ')}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Active indicator */}
              {category === key && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
              
              {/* Shimmer effect for active state */}
              {category === key && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              )}
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--forest)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <span className="relative z-10 flex items-center gap-1.5">
                {category === key && <span className="w-1 h-1 bg-white rounded-full"></span>}
                {label}
              </span>
            </button>
          ))}
          {categoryEntries.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllCategories(!showAllCategories)}
              className={[
                'group relative shrink-0 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-300 md:py-2 md:font-semibold',
                'bg-white/80 text-[var(--ink-soft)] hover:bg-gradient-to-r hover:from-[var(--mist)] hover:to-white hover:text-[var(--forest-deep)] hover:scale-105 hover:shadow-[0_6px_16px_rgba(15,61,46,0.12)] border border-[var(--border)]/50',
              ].join(' ')}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                {showAllCategories ? 'По-малко' : 'Още'}
                <svg 
                  className={`w-3 h-3 transition-transform duration-300 ${showAllCategories ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
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
            Област
          </label>
          <select
            id="filter-region"
            value={regionSlug}
            onChange={(e) => onRegionChange(e.target.value as string | 'all')}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-3 text-sm font-medium text-[var(--ink)] outline-none ring-[var(--forest)]/20 focus:ring-4 md:rounded-xl md:py-2.5"
          >
            <option value="all">Всички области</option>
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
