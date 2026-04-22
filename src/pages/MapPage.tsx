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
            Интерактивна карта
          </motion.h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Всички 28 области на Република България с реални граници. Изберете
            област, за да видите туристически обекти, снимки и описания.
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Геоданни:{' '}
            <a
              href="https://www.naturalearthdata.com/"
              className="text-[var(--forest)] underline"
              target="_blank"
              rel="noreferrer"
            >
              Natural Earth
            </a>{' '}
            (public domain), обработени за уеб.
          </p>
          <Link
            to="/regions"
            className="mt-6 inline-block text-sm font-semibold text-[var(--forest)] hover:underline"
          >
            Списък с всички области →
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pt-10">
        <BulgariaMap id="map-main" />
      </div>
    </div>
  )
}
