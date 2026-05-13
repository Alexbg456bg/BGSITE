import { Link } from 'react-router-dom'
import { useRef, useState } from 'react'
import {
  motion,
  AnimatePresence,
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
  const [isMapOpen, setIsMapOpen] = useState(false)
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
        <div
          className="absolute inset-0 -z-5 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, transparent 1px, transparent 39px, rgba(0,0,0,0.2) 40px),
              repeating-linear-gradient(90deg, rgba(0,0,0,0.2) 0px, transparent 1px, transparent 39px, rgba(0,0,0,0.2) 40px)
            `,
            mask: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.3) 60%, transparent 100%), linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.3) 60%, transparent 100%), radial-gradient(circle at 85% 75%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 60%, transparent 30%)',
            WebkitMask: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.3) 60%, transparent 100%), linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.3) 60%, transparent 100%), radial-gradient(circle at 85% 75%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3) 60%, transparent 30%)'
          }}
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
            <div className="mb-6 flex justify-center md:mb-8">
              <button
                type="button"
                onClick={() => setIsMapOpen((current) => !current)}
                className="inline-flex items-center rounded-full border border-white/70 bg-white/84 px-6 py-3 text-sm font-semibold text-[var(--forest-deep)] shadow-[0_18px_36px_rgba(15,61,46,0.12)] backdrop-blur-sm transition hover:bg-white"
                aria-expanded={isMapOpen}
                aria-controls="home-map-panel"
              >
                {isMapOpen
                  ? (language === 'en' ? 'Hide map' : 'Скрий картата')
                  : (language === 'en' ? 'Open map of Bulgaria' : 'Отвори картата на България')}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isMapOpen && (
                <motion.div
                  id="home-map-panel"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: smoothEase }}
                  className="overflow-hidden"
                >
                  <div
                    className="map-card-color-field pointer-events-none absolute -inset-10 -z-10 rounded-[3rem]"
                    aria-hidden
                  />
                  <BulgariaMap
                    id="home-map"
                    large
                    atmospheric
                    headerClassName="md:mt-12 md:mb-2"
                    centeredHeader
                    largeDesktopRatio={0.64}
                    largeDesktopMinHeight={520}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.section>

      <TopRatedDestinationsSection variant="desktop" />

      <div className="relative">
        <div 
          className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"
          aria-hidden
        />
      </div>

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
