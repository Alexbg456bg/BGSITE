import { motion } from 'framer-motion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { RegionCard } from '../components/RegionCard'
import { useSiteData } from '../hooks/useSiteData'

export function RegionsPage() {
  const { regions } = useSiteData()

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(236,242,235,0.76))] py-10 md:py-14">
        <div className="hero-orb hero-orb-left" />
        <div className="hero-orb hero-orb-right" />

        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs
            items={[
              { label: '\u041d\u0430\u0447\u0430\u043b\u043e', to: '/' },
              { label: '\u041e\u0431\u043b\u0430\u0441\u0442\u0438' },
            ]}
          />

          <div className="mt-6">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-fit rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--forest)] shadow-sm"
            >
              {'\u041f\u044a\u0442\u0435\u0432\u043e\u0434\u0438\u0442\u0435\u043b \u043f\u043e \u0411\u044a\u043b\u0433\u0430\u0440\u0438\u044f'}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[0.95] text-[var(--forest-deep)] md:text-5xl"
            >
              {'\u0412\u0441\u0438\u0447\u043a\u0438 \u043e\u0431\u043b\u0430\u0441\u0442\u0438'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)] md:text-lg"
            >
              {
                '\u0418\u0437\u0431\u0435\u0440\u0438 \u043e\u0431\u043b\u0430\u0441\u0442 \u0438 \u043e\u0442\u0432\u043e\u0440\u0438 \u043d\u0435\u0439\u043d\u0430\u0442\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0441 \u043c\u0435\u0441\u0442\u0430\u0442\u0430, \u0430\u043a\u0446\u0435\u043d\u0442\u0438\u0442\u0435 \u0438 \u0441\u043d\u0438\u043c\u043a\u0438\u0442\u0435 \u0432 \u043d\u0435\u044f. \u041f\u043e\u0434\u0440\u0435\u0434\u0438\u0445\u043c\u0435 \u043a\u0430\u0440\u0442\u0438\u0442\u0435 \u0442\u0430\u043a\u0430, \u0447\u0435 \u0434\u0430 \u0441\u0435 \u0440\u0430\u0437\u0433\u043b\u0435\u0436\u0434\u0430\u0442 \u043f\u043e-\u043b\u0435\u0441\u043d\u043e \u0438 \u043f\u043e-\u043f\u0440\u0438\u044f\u0442\u043d\u043e.'
              }
            </motion.p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-14">
        <div className="mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--forest)]">
              {'\u041a\u043e\u043b\u0435\u043a\u0446\u0438\u044f'}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--forest-deep)] md:text-3xl">
              {'\u0420\u0430\u0437\u0433\u043b\u0435\u0434\u0430\u0439 \u043e\u0431\u043b\u0430\u0441\u0442\u0438\u0442\u0435 \u043f\u043e \u043a\u0430\u0440\u0442\u0438'}
            </h2>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {regions.map((region, index) => (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.24) }}
            >
              <RegionCard region={region} index={index} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
