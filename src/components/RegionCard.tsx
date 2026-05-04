import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { Region } from '../types'
import { SmartImage } from './SmartImage'
import { useI18n } from '../i18n/LanguageContext'

type Props = { region: Region; index?: number; priority?: boolean }

function RegionCardComponent({ region, priority = false }: Props) {
  const { language } = useI18n()
  const openRegionLabel = language === 'en' ? 'Open region' : 'Отвори област'
  const placesLabel = language === 'en' ? 'places' : 'места'
  const ctaLabel = language === 'en' ? 'To region ->' : 'Към областта →'

  return (
    <Link
      to={`/region/${region.slug}`}
      aria-label={`${openRegionLabel} ${region.name}`}
      className="block h-full focus:outline-none"
    >
      <article className="content-card group flex h-full flex-col overflow-hidden rounded-[1.45rem] border border-[var(--region-card-border)] bg-[var(--region-card-bg)] shadow-[var(--region-card-shadow)] transition hover:-translate-y-1 hover:border-[var(--forest)]/28 hover:shadow-[var(--region-card-shadow-strong)] focus-visible:border-[var(--forest)] focus-visible:shadow-[var(--region-card-focus-shadow)] md:rounded-[2rem]">
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
          <div className="absolute inset-0 bg-[var(--region-card-overlay)]" />
          <div className="absolute left-3 top-3 rounded-full bg-[var(--region-card-badge-bg)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--region-card-badge-text)] shadow-sm backdrop-blur-sm transition duration-300 group-hover:-translate-y-0.5 md:left-4 md:top-4 md:px-3 md:text-xs md:tracking-[0.16em]">
            {region.destinations.length} {placesLabel}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 md:p-5">
          <h3 className="font-display text-[1.28rem] font-semibold leading-tight text-[var(--region-card-title)] md:text-[1.45rem]">
            {region.name}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--region-card-body)] md:mt-3">
            {region.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 md:mt-4">
            {region.highlights.slice(0, 3).map((highlight) => (
              <span
                key={highlight}
                className="rounded-full border border-[var(--region-card-chip-border)] bg-[var(--region-card-chip-bg)] px-3 py-1 text-xs font-medium text-[var(--region-card-chip-text)] transition duration-300 group-hover:border-[var(--region-card-chip-hover-border)]"
              >
                {highlight}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--region-card-divider)] pt-4">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--region-card-count)]">
              {region.destinations.length} {placesLabel}
            </span>
            <span className="inline-flex w-fit items-center rounded-full bg-[var(--region-card-cta-bg)] px-3 py-2 text-xs font-semibold text-white transition group-hover:translate-x-0.5 group-hover:bg-[var(--region-card-cta-hover-bg)] md:px-4">
              {ctaLabel}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export const RegionCard = memo(RegionCardComponent)
