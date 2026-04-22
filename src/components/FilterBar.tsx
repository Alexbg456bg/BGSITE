import { useMemo } from 'react'
import type { DestinationCategory } from '../types'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../data/categoryLabels'
import { regions } from '../data/regions'

type Props = {
  category: DestinationCategory | 'all'
  onCategoryChange: (c: DestinationCategory | 'all') => void
  regionSlug: string | 'all'
  onRegionChange: (slug: string | 'all') => void
  /** Когато е false, скрива филтъра по област (напр. на страницата на област) */
  showRegionFilter?: boolean
}

export function FilterBar({
  category,
  onCategoryChange,
  regionSlug,
  onRegionChange,
  showRegionFilter = true,
}: Props) {
  const categoryEntries = useMemo(
    () =>
      ALL_CATEGORIES.map((key) => ({
        key,
        label: CATEGORY_LABELS[key],
      })),
    [],
  )

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-6 md:p-5">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Категория
        </p>
        <div className="mt-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto md:max-h-none">
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className={[
              'rounded-full px-3 py-1.5 text-xs font-medium transition',
              category === 'all'
                ? 'bg-[var(--forest)] text-white'
                : 'bg-[var(--mist)] text-[var(--ink-soft)] hover:bg-[var(--border)]',
            ].join(' ')}
          >
            Всички
          </button>
          {categoryEntries.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => onCategoryChange(key)}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-medium transition',
                category === key
                  ? 'bg-[var(--forest)] text-white'
                  : 'bg-[var(--mist)] text-[var(--ink-soft)] hover:bg-[var(--border)]',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
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
            onChange={(e) =>
              onRegionChange(e.target.value as string | 'all')
            }
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none ring-[var(--forest)]/20 focus:ring-4"
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
