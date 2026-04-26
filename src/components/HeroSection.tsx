import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SmartImage } from './SmartImage'

const heroImages = [
  {
    src: '/images/hero/rhodope-village.jpg',
    alt: 'Родопско село с каменни къщи',
  },
  {
    src: '/images/hero/tsarevets-lion.jpg',
    alt: 'Лъв пред крепостта Царевец във Велико Търново',
  },
  {
    src: '/images/hero/belogradchik-balloons.jpg',
    alt: 'Белоградчишки скали с балони във въздуха',
  },
  {
    src: '/images/hero/buzludzha.jpg',
    alt: 'Паметник Бузлуджа',
  },
  {
    src: '/images/hero/rila-crocus.jpg',
    alt: 'Рилски минзухари и планинско езеро',
  },
  {
    src: '/images/hero/devil-bridge.jpg',
    alt: 'Дяволски мост в Родопите',
  },
  {
    src: '/images/hero/shipka-sunrise.jpg',
    alt: 'Паметникът Шипка при залез',
  },
]

function shuffledHeroImages() {
  return [...heroImages].sort(() => Math.random() - 0.5)
}

const highlights = [
  { value: '28', label: 'области' },
  { value: '160+', label: 'места за откриване' },
]

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const candidates = useMemo(() => shuffledHeroImages(), [])
  const [heroImage, setHeroImage] = useState(candidates[0])
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.18])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -72])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0])
  const shadeOpacity = useTransform(scrollYProgress, [0, 1], [0.08, 0.42])

  useEffect(() => {
    let cancelled = false

    const loadCandidate = (index: number) => {
      const candidate = candidates[index]
      if (!candidate) return

      const image = new Image()
      image.onload = () => {
        if (!cancelled) setHeroImage(candidate)
      }
      image.onerror = () => loadCandidate(index + 1)
      image.src = candidate.src
    }

    loadCandidate(0)

    return () => {
      cancelled = true
    }
  }, [candidates])

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[640px] overflow-hidden md:min-h-[760px]"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ y: imageY, scale: imageScale }}
        className="absolute inset-0 will-change-transform"
        aria-hidden
      >
        <SmartImage
          src={heroImage.src}
          alt={heroImage.alt}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          maxWidth={1600}
          className="h-full w-full"
          imgClassName="object-center brightness-[0.92] saturate-[1.08]"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--forest-deep)]/90 via-[var(--forest-deep)]/46 to-[var(--sky-deep)]/16" />
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(15,61,46,0.72))]"
        style={{ opacity: shadeOpacity }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,189,76,0.16),transparent_26%),radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_20%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bg)] to-transparent" />
      <motion.div
        className="absolute left-0 top-0 z-10 h-1 origin-left bg-[var(--sand)] shadow-[0_0_24px_rgba(236,216,164,0.52)]"
        style={{ scaleX: scrollYProgress, width: '100%' }}
        aria-hidden
      />

      <motion.div
        className="relative mx-auto flex min-h-[640px] max-w-6xl items-end px-4 pb-14 pt-24 md:min-h-[760px] md:pb-28"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--sky-pale)] md:text-sm md:tracking-[0.34em]"
          >
            Места за отдих
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-4xl font-display text-[2.65rem] font-semibold leading-[0.96] tracking-tight text-white md:mt-5 md:text-6xl"
          >
            Разгледай България
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-4 max-w-2xl text-base leading-relaxed text-white/88 md:mt-6 md:text-xl"
          >
            Тук ще намериш различни места из страната - за разходка,
            почивка или просто да смениш обстановката.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-7 flex flex-wrap gap-3 md:mt-9 md:gap-4"
          >
            <a
              href="#home-map"
              className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--forest-deep)] shadow-[0_20px_40px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--mist)] md:px-8 md:py-3.5"
            >
              Към картата
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 grid max-w-3xl grid-cols-2 gap-3 md:mt-32 sm:grid-cols-3"
          >
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.35rem] border border-white/16 bg-white/10 px-4 py-3 backdrop-blur-md md:rounded-[1.7rem] md:px-5 md:py-4"
              >
                <p className="font-display text-2xl font-semibold text-white md:text-3xl">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-white/72">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
