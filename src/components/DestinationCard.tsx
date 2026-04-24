import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { Destination } from '../types'
import { CATEGORY_LABELS } from '../data/categoryLabels'
import { useFavorites } from '../hooks/useFavorites'
import { SmartImage } from './SmartImage'

type Props = {
  destination: Destination
  regionSlug: string
  index?: number
}

function DestinationCardComponent({
  destination: d,
  regionSlug,
}: Props) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(d.id)

  return (
    <article
      className="content-card flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <SmartImage
          src={d.image}
          alt={d.name}
          loading="lazy"
          decoding="async"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          maxWidth={720}
          className="h-full w-full"
          imgClassName="transition duration-700 hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-[var(--forest-deep)] shadow-sm backdrop-blur">
          {CATEGORY_LABELS[d.category]}
        </span>
        <button
          type="button"
          onClick={() => toggleFavorite(d.id)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-lg shadow-sm backdrop-blur transition hover:scale-105"
          aria-label={fav ? 'Премахни от любими' : 'Добави в любими'}
          title={fav ? 'В любими' : 'Запази'}
        >
          {fav ? '♥' : '♡'}
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--forest)]/75">
          Подбрано място
        </p>
        <h3 className="font-display text-lg font-semibold leading-snug text-[var(--ink)]">
          {d.name}
        </h3>
        <p className="mt-1 text-xs font-medium text-[var(--forest)]">
          {d.location}
        </p>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">
          {d.shortDescription}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to={`/destination/${d.id}`}
            state={{ fromRegion: regionSlug }}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--forest)] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[var(--forest-deep)]"
          >
            Виж повече
          </Link>
          {d.mapsUrl && (
            <a
              href={d.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--ink-soft)] transition hover:border-[var(--forest)] hover:text-[var(--forest)]"
            >
              Карта
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
export const DestinationCard = memo(DestinationCardComponent)
