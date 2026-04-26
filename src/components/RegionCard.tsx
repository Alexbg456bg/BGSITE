import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { Region } from '../types'
import { SmartImage } from './SmartImage'

type Props = { region: Region; index?: number; priority?: boolean }

function RegionCardComponent({ region, priority = false }: Props) {
  const openRegionLabel = '\u041e\u0442\u0432\u043e\u0440\u0438 \u043e\u0431\u043b\u0430\u0441\u0442'
  const placesLabel = '\u043c\u0435\u0441\u0442\u0430'
  const ctaLabel =
    '\u041a\u044a\u043c \u043e\u0431\u043b\u0430\u0441\u0442\u0442\u0430 \u2192'

  return (
    <Link
      to={`/region/${region.slug}`}
      aria-label={`${openRegionLabel} ${region.name}`}
      className="block h-full focus:outline-none"
    >
      <article className="content-card group flex h-full flex-col overflow-hidden rounded-[1.45rem] border border-[var(--border)] bg-white/96 shadow-[0_18px_34px_rgba(15,61,46,0.08)] transition hover:-translate-y-1 hover:border-[var(--forest)]/28 hover:shadow-[0_30px_70px_rgba(15,61,46,0.12)] focus-visible:border-[var(--forest)] focus-visible:shadow-[0_0_0_3px_rgba(15,91,63,0.16)] md:rounded-[2rem] md:shadow-[0_24px_46px_rgba(15,61,46,0.08)]">
        <div className="relative aspect-[16/10] overflow-hidden">
          <SmartImage
            src={region.bannerImage}
            alt={region.name}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw"
            maxWidth={720}
            className="absolute inset-0 h-full w-full"
            imgClassName="transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest-deep)]/45 via-[var(--forest-deep)]/12 to-transparent" />
          <div className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--forest-deep)] shadow-sm backdrop-blur-sm transition duration-300 group-hover:-translate-y-0.5 md:left-4 md:top-4 md:px-3 md:text-xs md:tracking-[0.16em]">
            {region.destinations.length} {placesLabel}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 md:p-5">
          <h3 className="font-display text-[1.28rem] font-semibold leading-tight text-[var(--forest-deep)] md:text-[1.45rem]">
            {region.name}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--muted)] md:mt-3">
            {region.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 md:mt-4">
            {region.highlights.slice(0, 3).map((highlight) => (
              <span
                key={highlight}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-xs font-medium text-[var(--ink-soft)] transition duration-300 group-hover:border-[var(--border-strong)]"
              >
                {highlight}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--forest)]">
              {region.destinations.length} {placesLabel}
            </span>
            <span className="inline-flex w-fit items-center rounded-full bg-[var(--forest-deep)] px-3 py-2 text-xs font-semibold text-white transition group-hover:translate-x-0.5 group-hover:bg-[var(--forest)] md:px-4">
              {ctaLabel}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export const RegionCard = memo(RegionCardComponent)
