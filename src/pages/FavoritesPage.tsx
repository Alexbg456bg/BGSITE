import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { DestinationCard } from '../components/DestinationCard'
import { getDestinationWithRegion } from '../data/regions'
import { useFavorites } from '../hooks/useFavorites'

export function FavoritesPage() {
  const { favorites } = useFavorites()
  const list = [...favorites]
    .map((id) => getDestinationWithRegion(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getDestinationWithRegion>>[]

  return (
    <div className="pb-20">
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)] py-8 md:py-10">
        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs
            items={[{ label: 'Начало', to: '/' }, { label: 'Любими' }]}
          />
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 font-display text-3xl font-semibold text-[var(--forest-deep)] md:text-4xl"
          >
            Запазени места
          </motion.h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Локално в браузъра (localStorage). Добавяйте сърце от картичките на
            дестинации.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        {list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border)] bg-white py-16 text-center text-[var(--muted)]">
            Още няма любими.{' '}
            <Link to="/destinations" className="font-semibold text-[var(--forest)] underline">
              Разгледай дестинации
            </Link>
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map(({ destination, region }, i) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                regionSlug={region.slug}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
