import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SearchBar } from './SearchBar'
import { SmartImage } from './SmartImage'
import { CATEGORY_LABELS } from '../data/categoryLabels'
import { useSiteData } from '../hooks/useSiteData'
import type { DestinationCategory, Region } from '../types'

const featureRegionSlugs = [
  'sofia-grad',
  'plovdiv',
  'varna',
  'veliko-tarnovo',
  'smolyan',
  'burgas',
]

const categoryOrder: DestinationCategory[] = [
  'natural',
  'historical',
  'monastery',
  'waterfall',
  'eco_trail',
  'museum',
]

const categoryTone: Record<DestinationCategory, string> = {
  monument: 'from-[#f4d58d] to-[#8f6b2f]',
  cave: 'from-[#b8c6db] to-[#4b5f77]',
  eco_trail: 'from-[#a7d7a9] to-[#2d6a4f]',
  waterfall: 'from-[#9bd8ee] to-[#1f5973]',
  monastery: 'from-[#e7c7a0] to-[#8a4f2d]',
  museum: 'from-[#d8c6ff] to-[#5a4a8f]',
  historical: 'from-[#f0c987] to-[#8b5e34]',
  natural: 'from-[#b7e4c7] to-[#1b5e3c]',
  reservoir_lake_view: 'from-[#a8dadc] to-[#2b6777]',
  resort: 'from-[#ffd6a5] to-[#b5651d]',
}

export function MobileHomeExperience() {
  const { regions, allDestinations } = useSiteData()
  const featuredRegions = featureRegionSlugs
    .map((slug) => regions.find((region) => region.slug === slug))
    .filter((region): region is Region => Boolean(region))
  const regionDirectory = regions
    .filter((region) => !featureRegionSlugs.includes(region.slug))
    .slice(0, 10)
  const featuredDestinations = allDestinations.slice(0, 6)
  const categoryCounts = categoryOrder.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    count: allDestinations.filter((destination) => destination.category === category)
      .length,
  }))

  return (
    <div className="bg-[var(--bg)]">
      <section className="relative isolate min-h-[680px] overflow-hidden px-4 pb-8 pt-24">
        <SmartImage
          src="/images/hero/rhodope-village.jpg"
          alt="България"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          maxWidth={900}
          className="absolute inset-0 -z-20 h-full w-full"
          imgClassName="object-cover brightness-[0.86] saturate-[1.08]"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,61,46,0.36),rgba(15,61,46,0.88)_72%,var(--bg)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-[var(--bg)] to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mx-auto flex min-h-[560px] max-w-md flex-col justify-end"
        >
          <p className="w-fit rounded-full border border-white/24 bg-white/14 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/86 backdrop-blur">
            Пътеводител за България
          </p>
          <h1 className="mt-4 font-display text-[2.85rem] font-semibold leading-[0.92] text-white">
            Откривай места по-лесно
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/84">
            Области, категории и подбрани места в структура, направена за
            телефон.
          </p>

          <div className="mt-6 rounded-[1.35rem] border border-white/24 bg-white/18 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            <SearchBar className="w-full" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Link
              to="/regions"
              className="rounded-2xl border border-white/18 bg-white/14 px-3 py-3 text-center text-white backdrop-blur transition active:scale-[0.98]"
            >
              <span className="block font-display text-2xl font-semibold">28</span>
              <span className="mt-1 block text-[11px] text-white/74">области</span>
            </Link>
            <Link
              to="/destinations"
              className="rounded-2xl border border-white/18 bg-white/14 px-3 py-3 text-center text-white backdrop-blur transition active:scale-[0.98]"
            >
              <span className="block font-display text-2xl font-semibold">
                {allDestinations.length}
              </span>
              <span className="mt-1 block text-[11px] text-white/74">места</span>
            </Link>
            <a
              href="#mobile-regions"
              className="rounded-2xl border border-white/18 bg-white/14 px-3 py-3 text-center text-white backdrop-blur transition active:scale-[0.98]"
            >
              <span className="block font-display text-xl font-semibold">области</span>
              <span className="mt-1 block text-[11px] text-white/74">директория</span>
            </a>
          </div>
        </motion.div>
      </section>

      <section className="py-6">
        <div className="mx-auto max-w-md">
          <div className="flex items-end justify-between gap-4 px-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                Категории
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--forest-deep)]">
                Избери преживяване
              </h2>
            </div>
            <Link to="/destinations" className="text-sm font-semibold text-[var(--forest)]">
              всички
            </Link>
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto px-4 pb-3 [scroll-snap-type:x_mandatory]">
            {categoryCounts.map((item) => (
              <Link
                key={item.category}
                to={`/destinations?category=${item.category}`}
                className={`relative min-h-36 min-w-[58%] overflow-hidden rounded-[1.35rem] bg-gradient-to-br ${categoryTone[item.category]} p-4 text-white shadow-[0_18px_42px_rgba(15,61,46,0.14)] transition active:scale-[0.98] [scroll-snap-align:start]`}
              >
                <span className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/18" />
                <span className="relative text-xs font-semibold uppercase tracking-[0.12em] text-white/72">
                  {item.count} места
                </span>
                <span className="relative mt-8 block font-display text-xl font-semibold leading-tight">
                  {item.label}
                </span>
                <span className="relative mt-3 inline-flex rounded-full bg-white/18 px-3 py-1 text-xs font-semibold backdrop-blur">
                  разгледай
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="mobile-regions" className="py-6">
        <div className="mx-auto max-w-md px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                Области
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--forest-deep)]">
                Избери област
              </h2>
            </div>
            <Link to="/regions" className="text-sm font-semibold text-[var(--forest)]">
              всички
            </Link>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Подредени като удобни карти за докосване, без тежка карта на малък
            екран.
          </p>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto px-4 pb-4 [scroll-snap-type:x_mandatory]">
          {featuredRegions.map((region) => (
            <Link
              key={region.id}
              to={`/region/${region.slug}`}
              className="relative h-72 min-w-[82%] overflow-hidden rounded-[1.65rem] bg-[var(--forest-deep)] shadow-[0_22px_52px_rgba(15,61,46,0.2)] [scroll-snap-align:start]"
            >
              <SmartImage
                src={region.bannerImage}
                alt={region.name}
                loading="lazy"
                decoding="async"
                maxWidth={720}
                className="absolute inset-0 h-full w-full"
                imgClassName="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest-deep)]/90 via-[var(--forest-deep)]/34 to-transparent" />
              <div className="absolute left-4 top-4 rounded-full border border-white/18 bg-white/18 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {region.destinations.length} места
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <h3 className="font-display text-3xl font-semibold leading-tight">
                  {region.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/78">
                  {region.description}
                </p>
                <span className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-[var(--forest-deep)]">
                  Отвори областта
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mx-auto max-w-md px-4">
          <div className="grid grid-cols-2 gap-3">
            {regionDirectory.map((region) => (
              <Link
                key={region.id}
                to={`/region/${region.slug}`}
                className="rounded-[1.2rem] border border-[var(--border)] bg-white/86 p-3 shadow-[0_12px_30px_rgba(15,61,46,0.06)] transition active:scale-[0.98]"
              >
                <span className="block truncate font-display text-lg font-semibold text-[var(--forest-deep)]">
                  {region.name}
                </span>
                <span className="mt-1 block text-xs text-[var(--muted)]">
                  {region.destinations.length} места
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6">
        <div className="mx-auto max-w-md">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                Подбрано
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--forest-deep)]">
                Места за старт
              </h2>
            </div>
            <Link to="/destinations" className="text-sm font-semibold text-[var(--forest)]">
              още
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {featuredDestinations.map((destination) => (
              <Link
                key={destination.id}
                to={`/destination/${destination.id}`}
                className="grid grid-cols-[6rem_1fr] gap-3 rounded-[1.25rem] border border-[var(--border)] bg-white/88 p-2 shadow-[0_14px_32px_rgba(15,61,46,0.06)] transition active:scale-[0.99]"
              >
                <SmartImage
                  src={destination.image}
                  alt={destination.name}
                  loading="lazy"
                  decoding="async"
                  maxWidth={360}
                  className="aspect-square overflow-hidden rounded-[1rem]"
                  imgClassName="object-cover"
                />
                <div className="min-w-0 py-1 pr-1">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--forest)]">
                    {CATEGORY_LABELS[destination.category]}
                  </p>
                  <h3 className="mt-1 line-clamp-2 font-display text-lg font-semibold leading-tight text-[var(--forest-deep)]">
                    {destination.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                    {destination.shortDescription}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
