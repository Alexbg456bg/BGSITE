import { Link } from 'react-router-dom'
import { useRef } from 'react'
import {
  motion,
} from 'framer-motion'
import type { Variants } from 'framer-motion'
import { HeroSection } from '../components/HeroSection'
import { BulgariaMap } from '../components/BulgariaMap'
import { RegionCard } from '../components/RegionCard'
import { MobileHomeExperience } from '../components/MobileHomeExperience'
import { TopRatedDestinationsSection } from '../components/TopRatedDestinationsSection'
import { useSiteData } from '../hooks/useSiteData'
import { useI18n } from '../i18n/LanguageContext'

const smoothEase = [0.22, 1, 0.36, 1] as const

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: smoothEase },
  },
}

const headingReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const },
  },
}

const mapReveal: Variants = {
  hidden: { 
    opacity: 0,
    y: 5,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: 'linear',
    },
  },
}

const gridReveal: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.15,
    },
  },
}

const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 3,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: 'linear',
    },
  },
}

export function HomePage() {
  const mapSectionRef = useRef<HTMLElement>(null)
  const regionsSectionRef = useRef<HTMLElement>(null)
  const { regions } = useSiteData()
  const { language, t } = useI18n()
  const featuredRegions = [...regions]
    .sort((a, b) => {
      const difference = b.destinations.length - a.destinations.length
      if (difference !== 0) return difference
      return a.name.localeCompare(b.name, language === 'en' ? 'en' : 'bg')
    })
    .slice(0, 8)

  return (
    <>
      <div className="md:hidden">
        <MobileHomeExperience />
      </div>

      <div className="hidden md:block">
        <HeroSection />

      <motion.section
        ref={mapSectionRef}
        className="relative isolate overflow-hidden pb-10 pt-8 md:pb-20 md:pt-12"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.22 }}
      >
        <motion.div
          className="map-color-field absolute inset-x-0 top-0 -z-20 h-full min-h-[560px] md:min-h-[820px]"
          aria-hidden
        />
                <div
          className="absolute inset-0 -z-10 hero-background"
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 hero-radial-overlay"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4">
          <motion.div 
            className="relative" 
            variants={mapReveal}
            style={{ 
              transform: 'translateZ(0)',
              willChange: 'transform, opacity',
            }}
          >
            <div
              className="map-card-color-field pointer-events-none absolute -inset-10 -z-10 rounded-[3rem]"
              aria-hidden
            />
            <BulgariaMap id="home-map" large atmospheric />
          </motion.div>
        </div>
      </motion.section>

      <TopRatedDestinationsSection variant="desktop" />

      <motion.section
        ref={regionsSectionRef}
        className="relative mx-auto max-w-6xl px-4 py-10 md:py-18"
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.18 }}
      >
        <motion.div
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          variants={headingReveal}
        >
          <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--home-section-kicker)] md:tracking-[0.3em]">
              {t('navRegions')}
            </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--home-section-heading)] md:text-4xl">
              {language === 'en' ? 'Explore the regions' : 'Разгледай регионите'}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-base">
              {language === 'en'
                ? 'Every region offers different places to visit.'
                : 'Всяка област предлага различни места за посещение.'}
            </p>
          </div>
          <Link
            to="/regions"
            className="text-sm font-semibold text-[var(--forest)] hover:underline"
          >
            {language === 'en' ? 'All regions ->' : 'Всички области →'}
          </Link>
        </motion.div>

        <motion.div className="relative">
                    <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={gridReveal}
            style={{ perspective: 1200 }}
          >
            {featuredRegions.map((region, index) => (
              <motion.div
                key={region.id}
                custom={index}
                initial="hidden"
                whileInView="visible"
                variants={cardReveal}
                viewport={{ once: true, amount: 0.32 }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <RegionCard region={region} index={index} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>
      </div>
    </>
  )
}
