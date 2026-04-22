import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { DestinationCard } from '../components/DestinationCard'
import { FilterBar } from '../components/FilterBar'
import {
  allDestinations,
  destinationIdsByRegionSlug,
  regionByDestinationId,
} from '../data/regions'
import type { DestinationCategory } from '../types'

export function DestinationsPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<DestinationCategory | 'all'>('all')
  const [regionSlug, setRegionSlug] = useState<string | 'all'>('all')

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
  }, [category, regionSlug])

  return (
    <div className="pb-20">
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)] py-8 md:py-10">
        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs
            items={[{ label: 'Начало', to: '/' }, { label: 'Дестинации' }]}
          />
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 font-display text-3xl font-semibold text-[var(--forest-deep)] md:text-4xl"
          >
            Всички дестинации
          </motion.h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Търсене в навигацията или филтрирайте по категория и област.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <FilterBar
          category={category}
          onCategoryChange={setCategory}
          regionSlug={regionSlug}
          onRegionChange={(slug) => {
            if (slug !== 'all') {
              setRegionSlug(slug)
            } else {
              setRegionSlug('all')
            }
          }}
        />
        <p className="mt-4 text-sm text-[var(--muted)]">
          Показани: {filtered.length} обекта
          {regionSlug !== 'all' && (
            <button
              type="button"
              className="ml-3 font-medium text-[var(--forest)] underline"
              onClick={() => navigate(`/region/${regionSlug}`)}
            >
              Отвори страницата на областта
            </button>
          )}
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
