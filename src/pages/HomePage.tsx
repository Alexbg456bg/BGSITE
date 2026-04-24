import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HeroSection } from '../components/HeroSection'
import { BulgariaMap } from '../components/BulgariaMap'
import { RegionCard } from '../components/RegionCard'
import { regions } from '../data/regions'

const featuredRegionSlugs = [
  'sofia-grad',
  'plovdiv',
  'veliko-tarnovo',
  'varna',
  'smolyan',
  'burgas',
  'blagoevgrad',
  'ruse',
]

const mapTraits = [
  'Реални очертания на всички 28 области',
  'Пряк преход от страната към всяка област',
  'Отделна карта във всяка областна страница',
]

export function HomePage() {
  const featuredRegions = regions.filter((r) =>
    featuredRegionSlugs.includes(r.slug),
  )

  return (
    <>
      <HeroSection />

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-18">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--forest)]">
              Основен акцент
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-[var(--forest-deep)] md:text-4xl">
              Картата е сърцето на сайта
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-base">
              Вместо претрупване, навигацията започва от географията. Първо
              България, после областта, след това конкретните места.
            </p>
          </div>
          <Link
            to="/map"
            className="inline-flex rounded-full border border-[var(--forest)]/18 bg-white px-6 py-3 text-sm font-semibold text-[var(--forest-deep)] shadow-[0_14px_30px_rgba(15,61,46,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--forest)]/40"
          >
            Отвори голямата карта
          </Link>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {mapTraits.map((trait) => (
            <div
              key={trait}
              className="rounded-[1.7rem] border border-[var(--border)] bg-white/82 px-5 py-5 text-sm leading-relaxed text-[var(--ink-soft)] shadow-[0_18px_34px_rgba(15,61,46,0.05)]"
            >
              {trait}
            </div>
          ))}
        </div>

        <BulgariaMap id="home-map" />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-18">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--forest)]">
              Области
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-[var(--forest-deep)] md:text-4xl">
              Продължи към регионите
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-base">
              Всяка област има собствена атмосфера, собствена карта и собствен
              подбор от дестинации.
            </p>
          </div>
          <Link
            to="/regions"
            className="text-sm font-semibold text-[var(--forest)] hover:underline"
          >
            Всички области →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featuredRegions.map((region, index) => (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
            >
              <RegionCard region={region} index={index} />
            </motion.div>
          ))}
        </div>
      </section>
    </>
  )
}
