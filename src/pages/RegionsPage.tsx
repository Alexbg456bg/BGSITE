import { motion } from 'framer-motion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { RegionCard } from '../components/RegionCard'
import { regions } from '../data/regions'

export function RegionsPage() {
  return (
    <div className="pb-20">
      <div className="border-b border-[var(--border)] bg-white py-8 md:py-10">
        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs
            items={[{ label: 'Начало', to: '/' }, { label: 'Области' }]}
          />
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 font-display text-3xl font-semibold text-[var(--forest-deep)] md:text-4xl"
          >
            Всички области
          </motion.h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            28 области — всяка с кратко описание и връзка към дестинации в
            нея.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {regions.map((r, i) => (
            <RegionCard key={r.id} region={r} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
