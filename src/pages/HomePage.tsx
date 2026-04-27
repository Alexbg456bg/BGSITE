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
  const featuredRegions = regions.filter((region) =>
    featuredRegionSlugs.includes(region.slug),
  )
  // Static values for 360 FPS performance - no scroll animations
  const mapFieldBackground = 'linear-gradient(135deg, rgba(15,61,46,0.22), rgba(79,140,171,0.5) 46%, rgba(236,216,164,0.42)), radial-gradient(circle at 18% 30%, rgba(45,106,79,0.72), transparent 30%), radial-gradient(circle at 84% 42%, rgba(79,140,171,0.5), transparent 32%)'
  const mapCardBackground = 'linear-gradient(135deg, rgba(45,106,79,0.72), rgba(79,140,171,0.5) 46%, rgba(236,216,164,0.42)), radial-gradient(circle at 26% 22%, rgba(236,216,164,0.42), transparent 28%), radial-gradient(circle at 80% 74%, rgba(45,106,79,0.72), transparent 34%)'

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
          style={{
            background: mapFieldBackground,
          }}
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
        <motion.div
          className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-white/5 via-white/3 via-white/1 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
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
              className="map-card-color-field pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] shadow-[0_44px_110px_rgba(15,61,46,0.18)]"
              style={{ background: mapCardBackground }}
              aria-hidden
            />
            <BulgariaMap id="home-map" large atmospheric />
          </motion.div>
        </div>
      </motion.section>

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
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--forest)] md:tracking-[0.3em]">
              Области
            </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--forest-deep)] md:text-4xl">
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
