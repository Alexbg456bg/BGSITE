import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { BulgariaMap } from '../components/BulgariaMap'

export function MapPage() {
  return (
    <div className="pb-20">
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)] py-8 md:py-10">
        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs items={[{ label: 'Начало', to: '/' }, { label: 'Карта' }]} />
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 font-display text-3xl font-semibold text-[var(--forest-deep)] md:text-4xl"
          >
            Карта на България
          </motion.h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Избери област направо от картата и продължи към нейната страница.
          </p>
          <Link
            to="/regions"
            className="mt-6 inline-block text-sm font-semibold text-[var(--forest)] hover:underline"
          >
            Всички области →
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-10">
        <BulgariaMap id="map-main" large />
      </div>
    </div>
  )
}
