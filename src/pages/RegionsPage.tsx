import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { RegionCard } from '../components/RegionCard'
import { SmartImage } from '../components/SmartImage'
import { useSiteData } from '../hooks/useSiteData'
import { useI18n } from '../i18n/LanguageContext'

const smoothEase = [0.22, 1, 0.36, 1] as const

const heroReveal: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
}

const heroItemReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: smoothEase },
  },
}

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: smoothEase },
  },
}

const gridReveal: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.08,
    },
  },
}

const cardReveal: Variants = {
  hidden: (index = 0) => {
    const direction = index % 2 === 0 ? -1 : 1

    return {
      opacity: 0,
      x: direction * 18,
      y: 36,
      scale: 0.96,
    }
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.48,
      ease: smoothEase,
    },
  },
}

export function RegionsPage() {
  const { regions } = useSiteData()
  const { language, t } = useI18n()
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="pb-14 md:pb-20">
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(236,242,235,0.76))] py-8 md:py-14">
        <div className="hero-orb hero-orb-left" />
        <div className="hero-orb hero-orb-right" />

        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs
            items={[
              { label: t('navHome'), to: '/' },
              { label: t('navRegions') },
            ]}
          />

          <motion.div
            className="mt-5 md:mt-6"
            variants={heroReveal}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={heroItemReveal}
              className="w-fit rounded-full border border-[var(--border)] bg-white/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--forest)] shadow-sm md:px-4 md:text-[11px] md:tracking-[0.22em]"
            >
              {language === 'en' ? 'Guide to Bulgaria' : 'Пътеводител по България'}
            </motion.p>

            <motion.h1
              variants={heroItemReveal}
              className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-[0.95] text-[var(--forest-deep)] md:text-5xl"
            >
              {language === 'en' ? 'All regions' : 'Всички области'}
            </motion.h1>

            <motion.p
              variants={heroItemReveal}
              className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)] md:text-lg"
            >
              {language === 'en'
                ? 'Choose a region and open its page with places, highlights and photos. The cards are arranged for easier browsing.'
                : 'Избери област и отвори нейната страница с местата, акцентите и снимките в нея. Подредихме картите така, че да се разглеждат по-лесно и по-приятно.'}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="md:hidden">
        <div className="mx-auto max-w-md px-4 py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                {language === 'en' ? 'Popular regions' : 'Популярни области'}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--forest-deep)]">
                {language === 'en' ? 'Start here' : 'Започни оттук'}
              </h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--muted)] shadow-sm">
              {regions.length}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {regions.map((region, index) => (
              <Link
                key={region.id}
                to={`/region/${region.slug}`}
                className="group grid grid-cols-[7rem_1fr] gap-3 rounded-[1.35rem] border border-[var(--border)] bg-white/90 p-2 shadow-[0_16px_38px_rgba(15,61,46,0.08)] transition active:scale-[0.99]"
              >
                <div className="relative aspect-square overflow-hidden rounded-[1.1rem] bg-[var(--mist)]">
                  <SmartImage
                    src={region.bannerImage}
                    alt={region.name}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    fetchPriority={index < 2 ? 'high' : 'auto'}
                    decoding="async"
                    maxWidth={420}
                    className="absolute inset-0 h-full w-full"
                    imgClassName="object-cover"
                  />
                </div>
                <div className="min-w-0 py-1 pr-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--forest)]">
                    {region.destinations.length} {language === 'en' ? 'places' : 'места'}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold leading-tight text-[var(--forest-deep)]">
                    {region.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                    {region.description}
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-[var(--mist)] px-3 py-1 text-xs font-semibold text-[var(--forest)]">
                    {language === 'en' ? 'open' : 'отвори'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <motion.div
        className="relative mx-auto hidden max-w-6xl px-4 py-9 md:block md:py-14"
        variants={sectionReveal}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="mb-6 md:mb-8" variants={heroItemReveal}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--forest)] md:tracking-[0.2em]">
              {language === 'en' ? 'Collection' : 'Колекция'}
            </p>
            <h2 className="mt-2 font-display text-[1.65rem] font-semibold leading-tight text-[var(--forest-deep)] md:text-3xl">
              {language === 'en' ? 'Browse regions by cards' : 'Разгледай областите по карти'}
            </h2>
          </div>
        </motion.div>

        <motion.div className="relative">
          <motion.div
            className="pointer-events-none absolute -inset-x-4 -top-8 h-56 bg-[radial-gradient(circle_at_28%_45%,rgba(236,216,164,0.34),transparent_46%),radial-gradient(circle_at_78%_32%,rgba(79,140,171,0.18),transparent_44%)] blur-2xl md:-inset-x-8 md:-top-12 md:h-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: prefersReducedMotion ? 0.12 : 0.18 }}
            transition={{ duration: 0.45, ease: smoothEase }}
            aria-hidden
          />
          <div className="pointer-events-none absolute -left-4 top-2 hidden h-[calc(100%-1rem)] w-px bg-[var(--border)] md:block">
            <motion.span
              className="block h-full origin-top bg-[linear-gradient(180deg,var(--sand),var(--forest),var(--sky))]"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.5,
                ease: smoothEase,
              }}
            />
          </div>

          <motion.div
            className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4"
            variants={gridReveal}
            style={{ perspective: 1200 }}
            initial="hidden"
            animate="visible"
          >
            {regions.map((region, index) => (
              <motion.div
                key={region.id}
                custom={index}
                variants={cardReveal}
                whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.01 }}
                transition={{
                  duration: prefersReducedMotion ? 0.01 : 0.24,
                  ease: smoothEase,
                }}
              >
                <RegionCard region={region} index={index} priority={index < 4} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

