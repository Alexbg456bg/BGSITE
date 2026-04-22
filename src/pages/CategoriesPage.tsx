import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { CATEGORY_LABELS } from '../data/categoryLabels'
import type { DestinationCategory } from '../types'

const categoryShowcase: {
  category: DestinationCategory
  regionSlug: string
  blurb: string
}[] = [
  {
    category: 'monastery',
    regionSlug: 'plovdiv',
    blurb: 'Манастири и духовни центрове',
  },
  { category: 'cave', regionSlug: 'smolyan', blurb: 'Пещери и подземни реки' },
  {
    category: 'eco_trail',
    regionSlug: 'burgas',
    blurb: 'Екопътеки и природни паркове',
  },
  {
    category: 'waterfall',
    regionSlug: 'veliko-tarnovo',
    blurb: 'Водопади и ждрела',
  },
  { category: 'museum', regionSlug: 'sofia-grad', blurb: 'Музеи и експозиции' },
  {
    category: 'reservoir_lake_view',
    regionSlug: 'smolyan',
    blurb: 'Язовири, езера и гледки',
  },
  { category: 'resort', regionSlug: 'blagoevgrad', blurb: 'Курорти и СПА' },
  {
    category: 'historical',
    regionSlug: 'shumen',
    blurb: 'История и ЮНЕСКО',
  },
  {
    category: 'natural',
    regionSlug: 'vidin',
    blurb: 'Природни феномени',
  },
  {
    category: 'monument',
    regionSlug: 'pleven',
    blurb: 'Паметници и мемориали',
  },
]

export function CategoriesPage() {
  return (
    <div className="pb-20">
      <div className="border-b border-[var(--border)] bg-white py-8 md:py-10">
        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs
            items={[{ label: 'Начало', to: '/' }, { label: 'Категории' }]}
          />
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 font-display text-3xl font-semibold text-[var(--forest-deep)] md:text-4xl"
          >
            Категории туризъм
          </motion.h1>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Изберете тип преживяване — ще ви отведем към област с подходящи
            обекти и филтър по категория.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryShowcase.map((item, i) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={`/region/${item.regionSlug}?category=${item.category}`}
                className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--forest)]/35 hover:shadow-md"
              >
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--forest)]">
                  {CATEGORY_LABELS[item.category]}
                </span>
                <span className="mt-3 font-display text-xl font-semibold text-[var(--ink)]">
                  {item.blurb}
                </span>
                <span className="mt-auto pt-6 text-sm font-semibold text-[var(--forest)]">
                  Разгледай обекти →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
