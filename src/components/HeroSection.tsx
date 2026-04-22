import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--forest-deep)]/92 via-[var(--forest)]/80 to-[var(--sky-deep)]/75" />
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[var(--sky)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

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
            className="inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[var(--forest-deep)] shadow-lg transition hover:bg-[var(--mist)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Разгледай картата
          </Link>
          <Link
            to="/destinations"
            className="inline-flex rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Всички дестинации
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
