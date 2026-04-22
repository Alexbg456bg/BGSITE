import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HeroSection } from '../components/HeroSection'
import { BulgariaMap } from '../components/BulgariaMap'
import { RegionCard } from '../components/RegionCard'
import { regions } from '../data/regions'

const recommendedSlugs = [
  'plovdiv',
  'veliko-tarnovo',
  'varna',
  'blagoevgrad',
  'sofia-grad',
]

const navTiles = [
  {
    to: '/map',
    title: 'Карта на България',
    desc: '28 области с реална форма и граници — клик за детайли.',
    emoji: '🗺️',
  },
  {
    to: '/regions',
    title: 'Области',
    desc: 'Пълен списък с карти и описания.',
    emoji: '📍',
  },
  {
    to: '/destinations',
    title: 'Дестинации',
    desc: 'Филтри по категория и област.',
    emoji: '🧭',
  },
  {
    to: '/categories',
    title: 'Категории',
    desc: 'Манастири, пещери, музеи и др.',
    emoji: '🏷️',
  },
  {
    to: '/favorites',
    title: 'Любими',
    desc: 'Запазени места в браузъра.',
    emoji: '♥',
  },
]

export function HomePage() {
  const recommended = regions.filter((r) => recommendedSlugs.includes(r.slug))

  return (
    <>
      <HeroSection />

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <h2 className="text-center font-display text-2xl font-semibold text-[var(--forest-deep)] md:text-3xl">
          Къде да продължиш
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--muted)] md:text-base">
          Всяка секция е на собствена страница — без безкрайно скролване.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {navTiles.map((tile, i) => (
            <motion.div
              key={tile.to}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={tile.to}
                className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--forest)]/30 hover:shadow-md"
              >
                <span className="text-2xl" aria-hidden>
                  {tile.emoji}
                </span>
                <span className="mt-3 font-display text-lg font-semibold text-[var(--ink)]">
                  {tile.title}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {tile.desc}
                </span>
                <span className="mt-4 text-sm font-semibold text-[var(--forest)]">
                  Отвори →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[var(--surface-2)] py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[var(--forest-deep)] md:text-3xl">
                Преглед на картата
              </h2>
              <p className="mt-2 max-w-xl text-sm text-[var(--muted)] md:text-base">
                Умален изглед. За пълен екран и по-добри етикети отворете
                страницата „Карта“.
              </p>
            </div>
            <Link
              to="/map"
              className="rounded-full bg-[var(--forest)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--forest-deep)]"
            >
              Пълна карта
            </Link>
          </div>
          <div className="mt-8">
            <BulgariaMap id="map-preview" compact />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="text-center font-display text-2xl font-semibold text-[var(--forest-deep)] md:text-3xl">
          Препоръчани области
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--muted)]">
          Подбрани отправни точки — останалите са в списъка и на картата.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {recommended.map((r, i) => (
            <RegionCard key={r.id} region={r} index={i} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/regions"
            className="inline-flex rounded-full border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--forest)] transition hover:border-[var(--forest)]"
          >
            Всички 28 области
          </Link>
        </div>
      </section>
    </>
  )
}
