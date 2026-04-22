import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Region } from '../types'

type Props = {
  region: Region
  index?: number
}

export function RegionCard({ region, index = 0 }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.06, duration: 0.24 }}
      className="content-card group overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={region.bannerImage}
          alt={region.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest-deep)]/88 via-[var(--forest-deep)]/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <h3 className="font-display text-xl font-semibold text-white">
            {region.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-white/85">
            {region.description}
          </p>
          <Link
            to={`/region/${region.slug}`}
            className="mt-4 inline-flex w-fit items-center rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-[var(--forest-deep)] transition hover:bg-white"
          >
            Виж обектите →
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
