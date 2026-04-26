import { Link } from 'react-router-dom'
import { useRef } from 'react'
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
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
  hidden: { opacity: 0, scale: 0.96, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: smoothEase, delay: 0.12 },
  },
}

const gridReveal: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.08,
    },
  },
}

const cardReveal: Variants = {
  hidden: (index = 0) => {
    const direction = index % 4 < 2 ? -1 : 1

    return {
      opacity: 0,
      x: direction * 22,
      y: 52,
      scale: 0.92,
      rotate: direction * 2.2,
      filter: 'blur(10px)',
    }
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 19,
      mass: 0.82,
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
  const { scrollYProgress: mapScroll } = useScroll({
    target: mapSectionRef,
    offset: ['start 88%', 'end 18%'],
  })
  const { scrollYProgress: regionsScroll } = useScroll({
    target: regionsSectionRef,
    offset: ['start 86%', 'end 20%'],
  })
  const mapBackdropY = useTransform(mapScroll, [0, 1], [42, -36])
  const mapBackdropScale = useTransform(mapScroll, [0, 0.5, 1], [1, 1.06, 1.02])
  const mapAccentX = useTransform(mapScroll, [0, 1], ['-8%', '8%'])
  const mapAccentOpacity = useTransform(mapScroll, [0, 0.42, 1], [0.55, 0.9, 0.62])
  const mapGlowOpacity = useTransform(mapScroll, [0, 0.42, 1], [0.18, 0.42, 0.22])
  const mapForestTone = useTransform(
    mapScroll,
    [0, 0.42, 1],
    ['rgba(45,106,79,0.72)', 'rgba(15,61,46,0.78)', 'rgba(54,128,94,0.68)'],
  )
  const mapSkyTone = useTransform(
    mapScroll,
    [0, 0.48, 1],
    ['rgba(79,140,171,0.5)', 'rgba(31,89,115,0.62)', 'rgba(98,160,184,0.54)'],
  )
  const mapGoldTone = useTransform(
    mapScroll,
    [0, 0.52, 1],
    ['rgba(236,216,164,0.42)', 'rgba(225,184,83,0.58)', 'rgba(245,223,174,0.5)'],
  )
  const mapFieldBackground = useMotionTemplate`linear-gradient(135deg, rgba(15,61,46,0.22), ${mapSkyTone} 46%, ${mapGoldTone}), radial-gradient(circle at 18% 30%, ${mapForestTone}, transparent 30%), radial-gradient(circle at 84% 42%, ${mapSkyTone}, transparent 32%), radial-gradient(circle at 48% 76%, ${mapGoldTone}, transparent 28%)`
  const mapCardBackground = useMotionTemplate`linear-gradient(135deg, ${mapForestTone}, ${mapSkyTone} 46%, ${mapGoldTone}), radial-gradient(circle at 26% 22%, ${mapGoldTone}, transparent 28%), radial-gradient(circle at 80% 74%, ${mapForestTone}, transparent 34%), radial-gradient(circle at 58% 42%, ${mapSkyTone}, transparent 30%)`
  const regionsGlowOpacity = useTransform(regionsScroll, [0, 0.45, 1], [0, 0.22, 0.08])
  const regionsRailScale = useTransform(regionsScroll, [0, 1], [0, 1])

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
            y: mapBackdropY,
            scale: mapBackdropScale,
            background: mapFieldBackground,
          }}
          aria-hidden
        />
        <motion.div
            className="map-color-orb map-color-orb-a absolute -left-32 top-24 -z-10 h-52 w-80 rounded-full blur-3xl md:-left-28 md:h-72 md:w-[34rem]"
          style={{ x: mapAccentX, opacity: mapAccentOpacity }}
          aria-hidden
        />
        <motion.div
            className="map-color-orb map-color-orb-b absolute -right-32 bottom-20 -z-10 h-56 w-80 rounded-full blur-3xl md:-right-28 md:h-80 md:w-[38rem]"
          style={{ x: mapAccentX, opacity: mapAccentOpacity }}
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(244,246,242,0.94),rgba(227,238,230,0.6)_42%,rgba(244,246,242,0.96)),radial-gradient(circle_at_44%_40%,rgba(236,216,164,0.24),transparent_34%)]"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent"
          aria-hidden
        />

        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            className="mb-8 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between"
            variants={headingReveal}
          >
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--forest)] md:tracking-[0.3em]">
                Основен акцент
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--forest-deep)] md:text-4xl">
                Картата е сърцето на сайта
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-base">
                Вместо претрупване, навигацията започва от географията. Първо
                България, после областта, след това конкретните места.
              </p>
            </div>
          </motion.div>

          <motion.div className="relative" variants={mapReveal}>
            <motion.div
              className="map-card-color-field pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] shadow-[0_44px_110px_rgba(15,61,46,0.18)]"
              style={{ opacity: mapAccentOpacity, background: mapCardBackground }}
              aria-hidden
            />
            <motion.div
              className="pointer-events-none absolute -inset-5 rounded-[2.8rem] bg-[radial-gradient(circle_at_50%_30%,rgba(236,216,164,0.34),transparent_50%),radial-gradient(circle_at_80%_68%,rgba(79,140,171,0.18),transparent_44%)] blur-xl"
              style={{ opacity: mapGlowOpacity }}
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
            className="pointer-events-none absolute -inset-x-8 -top-10 h-72 bg-[radial-gradient(circle_at_28%_45%,rgba(236,216,164,0.34),transparent_46%),radial-gradient(circle_at_78%_32%,rgba(79,140,171,0.18),transparent_44%)] blur-2xl"
            style={{ opacity: regionsGlowOpacity }}
            aria-hidden
          />
          <div className="pointer-events-none absolute -left-4 top-2 hidden h-[calc(100%-1rem)] w-px bg-[var(--border)] md:block">
            <motion.span
              className="block h-full origin-top bg-[linear-gradient(180deg,var(--sand),var(--forest),var(--sky))]"
              style={{ scaleY: regionsRailScale }}
            />
          </div>
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
                viewport={{ once: false, amount: 0.32 }}
                whileHover={{ y: -10, scale: 1.018, rotate: 0.35 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
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
