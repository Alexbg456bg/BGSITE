import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { Destination } from '../types'
import { CATEGORY_LABELS } from '../data/categoryLabels'
import { useFavorites } from '../hooks/useFavorites'
import { SmartImage } from './SmartImage'
import { DestinationRating } from './DestinationRating'

type Props = {
  destination: Destination
  regionSlug: string
  index?: number
}

function DestinationCardComponent({ destination: d, regionSlug }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(d.id)

  return (
    <article className="content-card h-full overflow-hidden rounded-[1.35rem] border border-[var(--border)] bg-white shadow-sm [contain-intrinsic-size:430px] [content-visibility:auto] md:rounded-2xl md:transition md:hover:shadow-md">
      <Link
        to={`/destination/${d.id}`}
        state={{ fromRegion: regionSlug }}
        className="flex h-full flex-col text-inherit"
        aria-label={`Отвори ${d.name}`}
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
            imgClassName="md:transition md:duration-700 md:hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-[var(--forest-deep)] shadow-sm md:px-3 md:text-xs md:backdrop-blur">
            {CATEGORY_LABELS[d.category]}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              toggleFavorite(d.id)
            }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-lg shadow-sm md:backdrop-blur md:transition md:hover:scale-105"
            aria-label={fav ? 'Премахни от любими' : 'Добави в любими'}
            title={fav ? 'В любими' : 'Запази'}
          >
            {fav ? 
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /> 
              </svg> : 
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /> 
              </svg>
            }
          </button>
        </div>

        <div className="flex flex-1 flex-col p-4 md:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--forest)]/75 md:text-[11px] md:tracking-[0.22em]">
            Подбрано място
          </p>
          <h3 className="font-display text-[1.05rem] font-semibold leading-snug text-[var(--ink)] md:text-lg">
            {d.name}
          </h3>
          <p className="mt-1 text-xs font-medium text-[var(--forest)]">
            {d.location}
          </p>
          <DestinationRating destinationId={d.id} compact />
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">
            {d.shortDescription}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex flex-1 items-center justify-center rounded-xl bg-[var(--forest)] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[var(--forest-deep)]">
              Виж повече
            </span>
            {d.mapsUrl && (
              <a
                href={d.mapsUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--ink-soft)] transition hover:border-[var(--forest)] hover:text-[var(--forest)] sm:flex-none"
              >
                Карта
              </a>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}

export const DestinationCard = memo(DestinationCardComponent)
