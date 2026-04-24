import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { Region } from '../types'
import { SmartImage } from './SmartImage'

type Props = { region: Region; index?: number }

function RegionCardComponent({ region }: Props) {
  return (
    <article className="content-card group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white/96 shadow-[0_24px_46px_rgba(15,61,46,0.08)] transition hover:-translate-y-1 hover:border-[var(--forest)]/28 hover:shadow-[0_30px_70px_rgba(15,61,46,0.12)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <SmartImage
          src={region.bannerImage}
          alt={region.name}
          loading="lazy"
          decoding="async"
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw"
          maxWidth={720}
          className="absolute inset-0 h-full w-full"
          imgClassName="transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest-deep)]/45 via-[var(--forest-deep)]/12 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--forest-deep)] shadow-sm backdrop-blur-sm">
          {region.destinations.length} места
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[1.45rem] font-semibold leading-tight text-[var(--forest-deep)]">
          {region.name}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">
          {region.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {region.highlights.slice(0, 3).map((highlight) => (
            <span
              key={highlight}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-xs font-medium text-[var(--ink-soft)]"
            >
              {highlight}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--forest)]">
            {region.destinations.length} места
          </span>
          <Link
            to={`/region/${region.slug}`}
            className="inline-flex w-fit items-center rounded-full bg-[var(--forest-deep)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--forest)]"
          >
            Към областта →
          </Link>
        </div>
      </div>
    </article>
  )
}

export const RegionCard = memo(RegionCardComponent)
