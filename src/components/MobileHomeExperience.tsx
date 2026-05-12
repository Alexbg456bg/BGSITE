import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { SmartImage } from './SmartImage'
import { TopRatedDestinationsSection } from './TopRatedDestinationsSection'
import { getCategoryLabels } from '../data/categoryLabels'
import { useSiteData } from '../hooks/useSiteData'
import { useI18n } from '../i18n/LanguageContext'
import type { DestinationCategory } from '../types'

const heroImages = [
  '/images/hero-rotation/image1.jpg',
  '/images/hero-rotation/image2.jpg',
  '/images/hero-rotation/image3.jpg',
  '/images/hero-rotation/image4.jpg',
  '/images/hero-rotation/image5.jpg',
  '/images/hero-rotation/image6.jpg',
  '/images/hero-rotation/image7.jpg',
  '/images/hero-rotation/image8.jpg',
  '/images/hero-rotation/image9.jpg',
  '/images/hero-rotation/image10.jpg',
]

const categoryOrder: DestinationCategory[] = [
  'cave',
  'eco_trail',
  'waterfall',
  'monastery',
  'museum',
  'monument',
  'reservoir_lake_view',
  'resort',
  'natural',
  'historical',
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

const categoryIconShell: Record<DestinationCategory, string> = {
  monument: 'bg-white/16 text-white',
  cave: 'bg-slate-900/18 text-white',
  eco_trail: 'bg-emerald-950/18 text-white',
  waterfall: 'bg-sky-950/18 text-white',
  monastery: 'bg-amber-950/16 text-white',
  museum: 'bg-violet-950/18 text-white',
  historical: 'bg-amber-950/18 text-white',
  natural: 'bg-emerald-950/18 text-white',
  reservoir_lake_view: 'bg-cyan-950/16 text-white',
  resort: 'bg-orange-950/18 text-white',
}

function CategoryIcon({ category }: { category: DestinationCategory }) {
  const commonProps = {
    className: 'h-5 w-5',
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (category) {
    case 'cave':
      return (
        <svg {...commonProps}>
          <path d="M4 18c1.5-4.4 4.4-8.1 8-10 3.6 1.9 6.5 5.6 8 10" />
          <path d="M8 18v-2.2" />
          <path d="M12 18v-3.3" />
          <path d="M16 18v-2.2" />
        </svg>
      )
    case 'eco_trail':
      return (
        <svg {...commonProps}>
          <path d="M6 18c4.5-1.4 7.7-4.9 9.4-10 2.3 1.5 3.6 4.2 2.6 7-1.4 3.8-6.3 5.5-12 3Z" />
          <path d="M8 16c2.8-1.1 5.3-3.4 7-6.7" />
        </svg>
      )
    case 'waterfall':
      return (
        <svg {...commonProps}>
          <path d="M9 4c1.8 1.8 2 3.6 2 5.4S10.4 13 9 14.8" />
          <path d="M14 5c1.4 1.4 1.7 2.9 1.7 4.3S15.2 12 14 13.4" />
          <path d="M5 18c1.7-1.7 4.1-2.5 7-2.5s5.3.8 7 2.5" />
        </svg>
      )
    case 'monastery':
      return (
        <svg {...commonProps}>
          <path d="M5 18h14" />
          <path d="M7 18v-7l5-3 5 3v7" />
          <path d="M12 5v4" />
          <path d="M10.5 6.5h3" />
        </svg>
      )
    case 'museum':
      return (
        <svg {...commonProps}>
          <path d="M4 9h16" />
          <path d="M6 18V9" />
          <path d="M10 18V9" />
          <path d="M14 18V9" />
          <path d="M18 18V9" />
          <path d="M3 18h18" />
          <path d="m12 4 8 4H4l8-4Z" />
        </svg>
      )
    case 'monument':
      return (
        <svg {...commonProps}>
          <path d="M12 4 7 9h10l-5-5Z" />
          <path d="M8.5 9V18" />
          <path d="M15.5 9V18" />
          <path d="M6 18h12" />
        </svg>
      )
    case 'reservoir_lake_view':
      return (
        <svg {...commonProps}>
          <path d="M4 15c1.7 0 1.7-1 3.4-1s1.7 1 3.3 1 1.7-1 3.4-1 1.7 1 3.3 1 1.7-1 3.6-1" />
          <path d="M6 11c1.2-2.8 3.3-4.6 6-5.8 2.2 1 4 2.6 5.3 5" />
        </svg>
      )
    case 'resort':
      return (
        <svg {...commonProps}>
          <path d="M6 18h12" />
          <path d="m12 5 4 8H8l4-8Z" />
          <path d="M12 13v5" />
        </svg>
      )
    case 'natural':
      return (
        <svg {...commonProps}>
          <path d="M6 18c0-3.2 2.6-5.8 5.8-5.8 1.2 0 2.3.4 3.2 1" />
          <path d="M12 12c0-3.8 2.5-6.5 6-7.7-.2 4.4-1.9 7.6-5.3 9.7" />
          <path d="M9.5 18c0-2.3.9-4.4 2.5-6" />
        </svg>
      )
    case 'historical':
      return (
        <svg {...commonProps}>
          <path d="M5 18h14" />
          <path d="M7 18V8h10v10" />
          <path d="M9 8V6h6v2" />
          <path d="M10 12h4" />
        </svg>
      )
  }
}

function formatMobileCategoryLabel(label: string, language: 'bg' | 'en') {
  if (language === 'bg') {
    return label.replace(/забележителности/gi, 'обекти')
  }

  return label
}

export function MobileHomeExperience() {
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [heroIndex, setHeroIndex] = useState(() =>
    heroImages.length > 0 ? Math.floor(Math.random() * heroImages.length) : 0,
  )
  const { regions, allDestinations } = useSiteData()
  const { language, t } = useI18n()
  const labels = getCategoryLabels(language)
  const currentHeroImage = heroImages[heroIndex]
  const featuredRegions = useMemo(
    () =>
      [...regions]
        .sort((a, b) => {
          const difference = b.destinations.length - a.destinations.length
          if (difference !== 0) return difference
          return a.name.localeCompare(b.name, language === 'en' ? 'en' : 'bg')
        })
        .slice(0, 6),
    [language, regions],
  )
  const categoryCounts = useMemo(() => {
    const counts = new Map<DestinationCategory, number>()
    allDestinations.forEach((destination) => {
      counts.set(destination.category, (counts.get(destination.category) ?? 0) + 1)
    })

    return categoryOrder.map((category) => ({
      category,
      label: formatMobileCategoryLabel(labels[category], language),
      count: counts.get(category) ?? 0,
    }))
  }, [allDestinations, labels, language])

  const visibleCategories = showAllCategories ? categoryCounts : categoryCounts.slice(0, 6)

  useEffect(() => {
    if (heroImages.length < 2) return

    const preloadImage = (src: string) => {
      const image = new Image()
      image.src = src
    }

    preloadImage(heroImages[(heroIndex + 1) % heroImages.length])

    const intervalId = window.setInterval(() => {
      setHeroIndex((currentIndex) => (currentIndex + 1) % heroImages.length)
    }, 5500)

    return () => window.clearInterval(intervalId)
  }, [heroIndex])

  return (
    <div className="bg-[var(--bg)]">
      <section className="relative isolate min-h-[500px] overflow-hidden pb-4 pt-16 lg:min-h-[600px] lg:pb-0 lg:pt-20">
        <motion.div
          key={currentHeroImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute inset-0 -z-20"
          style={{
            backgroundImage: `url(${currentHeroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-[var(--forest)]/25" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.4)_40%,rgba(0,0,0,0.7)_80%,rgba(0,0,0,0.85)_100%)]" />
        <div className="hidden lg:absolute lg:inset-0 lg:-z-10 lg:bg-gradient-to-r lg:from-black/40 lg:via-black/25 lg:to-transparent" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 bg-[linear-gradient(180deg,transparent,rgba(244,246,242,0.22)_46%,var(--bg)_100%)]"
          aria-hidden
        />
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 flex min-h-[400px] flex-col justify-end lg:mx-auto lg:min-h-[500px] lg:max-w-7xl lg:flex-row lg:items-center lg:justify-between lg:gap-12 xl:gap-16"
        >
          <div className="flex flex-col justify-center px-4 lg:flex-1 lg:px-0 lg:pr-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-fit rounded-full border border-white/50 bg-black/30 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_20px_rgba(0,0,0,0.3)] backdrop-blur-md"
            >
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                {language === 'en' ? 'Guide to Bulgaria' : 'Пътеводител за България'}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-6 font-display text-[3.2rem] font-black leading-[0.9] text-white drop-shadow-2xl lg:text-[4.5rem] xl:text-[5rem]"
            >
              {language === 'en' ? 'Discover' : 'Откривай'}
              <br />
              <span className="text-white">
                {language === 'en' ? 'places more easily' : 'места по-лесно'}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-lg font-semibold leading-relaxed text-white drop-shadow-xl lg:text-xl"
            >
              {language === 'en'
                ? 'Regions, categories and selected places in a structure made for mobile.'
                : 'Области, категории и подбрани места в структура, направена за телефон.'}
            </motion.p>
          </div>

          <div className="flex flex-col justify-center px-4 lg:flex-1 lg:max-w-md lg:px-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 grid grid-cols-2 gap-3 lg:mt-8"
            >
              <motion.div whileTap={{ scale: 0.98 }} className="group relative">
                <Link
                  to="/regions"
                  className="block rounded-2xl border border-white/50 bg-white/18 px-3 py-4 text-center text-white backdrop-blur-sm transition-colors active:bg-white/24"
                >
                  <span className="relative z-10 block font-display text-2xl font-black drop-shadow-xl">
                    {regions.length}
                  </span>
                  <span className="relative z-10 mt-1 block text-[11px] font-bold uppercase tracking-[0.05em] text-white">
                    {language === 'en' ? 'regions' : 'области'}
                  </span>
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }} className="group relative">
                <Link
                  to="/destinations"
                  className="block rounded-2xl border border-white/50 bg-white/18 px-3 py-4 text-center text-white backdrop-blur-sm transition-colors active:bg-white/24"
                >
                  <span className="relative z-10 block font-display text-2xl font-black drop-shadow-xl">
                    {allDestinations.length}
                  </span>
                  <span className="relative z-10 mt-1 block text-[11px] font-bold uppercase tracking-[0.05em] text-white">
                    {language === 'en' ? 'places' : 'места'}
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-20 -mt-px bg-[var(--bg)] pb-6 pt-6">
        <div
          className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-[linear-gradient(180deg,transparent,rgba(244,246,242,0.58)_62%,var(--bg)_100%)]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-md">
          <div className="flex items-end justify-between gap-4 px-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                {t('categories')}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--forest-deep)]">
                {language === 'en' ? 'Choose an experience' : 'Избери преживяване'}
              </h2>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 px-4">
            {visibleCategories.map((item, index) => (
              <Link
                key={item.category}
                to={`/destinations?category=${item.category}`}
                className={`group relative min-h-[9.75rem] overflow-hidden rounded-[1.35rem] bg-gradient-to-br ${categoryTone[item.category]} p-3.5 text-white shadow-[0_16px_38px_rgba(15,61,46,0.14)] active:scale-[0.98]`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: showAllCategories && index >= 6 ? 'slideUp 0.5s ease-out forwards' : undefined,
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_42%,rgba(0,0,0,0.16)_100%)]" />
                <span className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/14" />
                <span className="absolute bottom-3 right-3 h-14 w-14 rounded-full border border-white/12 bg-white/8 backdrop-blur-[2px]" />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex rounded-full bg-white/14 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/84 backdrop-blur-sm">
                      {item.count} {language === 'en' ? 'places' : 'места'}
                    </span>
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/14 shadow-[0_10px_22px_rgba(0,0,0,0.16)] backdrop-blur-md ${categoryIconShell[item.category]}`}
                    >
                      <CategoryIcon category={item.category} />
                    </span>
                  </div>

                  <div className="mt-3 min-h-[3.35rem]">
                    <span className="block text-balance font-display text-[1.3rem] font-semibold leading-[1.02] drop-shadow-[0_4px_10px_rgba(0,0,0,0.16)] sm:text-[1.38rem]">
                      {item.label}
                    </span>
                  </div>

                  <div className="mt-auto pt-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/18 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white shadow-[0_8px_18px_rgba(0,0,0,0.12)] backdrop-blur-md">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/90" />
                      {language === 'en' ? 'Explore' : 'Разгледай'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {categoryCounts.length > 6 && (
            <div className="mt-4 px-4">
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-xs font-bold text-[var(--ink-soft)] shadow-sm active:scale-[0.99]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {showAllCategories
                    ? language === 'en'
                      ? 'Fewer categories'
                      : 'По-малко категории'
                    : language === 'en'
                      ? 'More categories'
                      : 'Още категории'}
                  <svg
                    className={`h-4 w-4 transition-transform duration-300 ${showAllCategories ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      <section id="mobile-regions" className="py-6">
        <div className="mx-auto max-w-md px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                {t('navRegions')}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--forest-deep)]">
                {language === 'en' ? 'Choose a region' : 'Избери област'}
              </h2>
            </div>
            <Link to="/regions" className="text-sm font-semibold text-[var(--forest)]">
              {language === 'en' ? 'all' : 'всички'}
            </Link>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            {language === 'en'
              ? 'Regions with the most destinations, arranged as touch-friendly cards.'
              : 'Области с най-много дестинации, подредени като удобни карти за докосване.'}
          </p>
        </div>

        <div className="mt-4 flex gap-4 overflow-x-auto px-4 pb-4 [scroll-snap-type:x_mandatory]">
          {featuredRegions.map((region, index) => (
            <Link
              key={region.id}
              to={`/region/${region.slug}`}
              className="relative h-80 min-w-[85%] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[var(--forest-deep)] to-[var(--forest)] shadow-[0_20px_46px_rgba(15,61,46,0.22)] [scroll-snap-align:start] active:scale-[0.99]"
              style={{
                animationDelay: `${index * 150}ms`,
              }}
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
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest-deep)]/95 via-[var(--forest-deep)]/40 to-transparent" />
              <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/20 px-4 py-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  {region.destinations.length} {language === 'en' ? 'places' : 'места'}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="space-y-3">
                  <h3 className="font-display text-3xl font-bold leading-tight drop-shadow-lg">
                    {region.name}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-white/85 drop-shadow">
                    {region.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-xs font-bold text-[var(--forest-deep)] shadow-[0_10px_20px_rgba(0,0,0,0.14)] backdrop-blur-sm">
                    <span>{language === 'en' ? 'Open region' : 'Отвори областта'}</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <TopRatedDestinationsSection variant="mobile" />
    </div>
  )
}
