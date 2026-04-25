import { motion } from 'framer-motion'
import { SmartImage } from './SmartImage'

const heroImage =
  'https://commons.wikimedia.org/wiki/Special:FilePath/View%20from%20Seven%20Rila%20Lakes.jpg?width=2400'

const highlights = [
  { value: '28', label: 'области' },
  { value: '160+', label: 'места за откриване' },
  { value: '1 карта', label: 'която води нататък' },
]

export function HeroSection() {
  return (
    <section className="relative isolate min-h-[680px] overflow-hidden">
      <motion.div
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.3, ease: 'easeOut' }}
        className="absolute inset-0 will-change-transform"
        aria-hidden
      >
        <SmartImage
          src={heroImage}
          alt="Панорамна гледка към планински пейзаж в България"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          maxWidth={1600}
          className="h-full w-full"
          imgClassName="object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--forest-deep)]/88 via-[var(--forest-deep)]/40 to-[var(--sky-deep)]/14" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,189,76,0.16),transparent_26%),radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_20%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bg)] to-transparent" />

      <div className="relative mx-auto flex min-h-[680px] max-w-6xl items-end px-4 pb-22 pt-24 md:pb-28">
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="text-sm font-semibold uppercase tracking-[0.34em] text-[var(--sky-pale)]"
          >
            България по области
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-tight text-white md:text-6xl"
          >
            Пътуването започва от картата
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white/88 md:text-xl"
          >
            Открий области, маршрути и места със силен характер, подредени около
            най-важното за този сайт: картата на България и картите на всяка
            отделна област.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-9 flex flex-wrap gap-4"
          >
            <a
              href="#home-map"
              className="inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[var(--forest-deep)] shadow-[0_20px_40px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--mist)]"
            >
              Към картата
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3"
          >
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.7rem] border border-white/16 bg-white/10 px-5 py-4 backdrop-blur-md"
              >
                <p className="font-display text-3xl font-semibold text-white">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-white/72">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
