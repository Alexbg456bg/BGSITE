import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const heroImage =
  'https://commons.wikimedia.org/wiki/Special:FilePath/View%20from%20Seven%20Rila%20Lakes.jpg?width=2200'

export function HeroSection() {
  return (
    <section className="relative min-h-[520px] overflow-hidden">
      <motion.div
        initial={{ scale: 1.04 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--forest-deep)]/82 via-[var(--forest-deep)]/42 to-[var(--sky-deep)]/18" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest-deep)]/35 via-transparent to-black/20" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--bg)] to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 md:pb-28 md:pt-24">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--sky-pale)]"
        >
          Туристически портал
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl md:leading-[1.08]"
        >
          Открий красотата на България
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-white/90 md:text-xl"
        >
          Планини, Черно море, манастири и жива история — разгледай областите,
          дестинации и категории на отделни страници.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link
            to="/map"
            className="inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[var(--forest-deep)] shadow-lg transition hover:-translate-y-0.5 hover:bg-[var(--mist)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Разгледай картата
          </Link>
          <Link
            to="/destinations"
            className="inline-flex rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/20"
          >
            Всички дестинации
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
