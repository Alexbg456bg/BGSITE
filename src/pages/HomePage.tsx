import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HeroSection } from '../components/HeroSection'
import { BulgariaMap } from '../components/BulgariaMap'
import { RegionCard } from '../components/RegionCard'
import { useSiteData } from '../hooks/useSiteData'

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

export function HomePage() {
  const { regions } = useSiteData()
  const featuredRegions = regions.filter((r) =>
    featuredRegionSlugs.includes(r.slug),
  )

  return (
    <>
      <HeroSection />

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-18">
  {false && (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--forest)]">
          Основен акцент
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-[var(--forest-deep)] md:text-4xl">
          Картата е сърцето на сайта
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-base">
          Вместо претрупване, навигацията започва от географията. Първо България, после областта, след това конкретните места.
        </p>
      </div>
    </div>
  )}

  <BulgariaMap id="home-map" large />
</section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-18">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--forest)]">
              Области
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-[var(--forest-deep)] md:text-4xl">
              Разгледай регионите
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-base">
            Всяка област предлага различни места за посещение.
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
