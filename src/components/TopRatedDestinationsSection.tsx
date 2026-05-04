import { Link } from 'react-router-dom'
import { DestinationCard } from './DestinationCard'
import { DestinationRating } from './DestinationRating'
import { SmartImage } from './SmartImage'
import { getCategoryLabels } from '../data/categoryLabels'
import { useDestinationRatings } from '../hooks/useDestinationRatings'
import { useSiteData } from '../hooks/useSiteData'
import { useI18n } from '../i18n/LanguageContext'

type Props = {
  variant?: 'desktop' | 'mobile'
  limit?: number
}

export function TopRatedDestinationsSection({
  variant = 'desktop',
  limit = 6,
}: Props) {
  const { allDestinations, regionByDestinationId } = useSiteData()
  const { getRating, ratings } = useDestinationRatings()
  const { language } = useI18n()
  const labels = getCategoryLabels(language)
  const ratedIds = new Set(ratings.filter((rating) => rating.count > 0).map((rating) => rating.id))
  const topRated = allDestinations
    .filter((destination) => ratedIds.has(destination.id))
    .sort((first, second) => {
      const firstRating = getRating(first.id)
      const secondRating = getRating(second.id)
      const byAverage = (secondRating?.average ?? 0) - (firstRating?.average ?? 0)
      if (byAverage !== 0) return byAverage

      return (secondRating?.count ?? 0) - (firstRating?.count ?? 0)
    })
    .slice(0, limit)

  if (variant === 'mobile') {
    return (
      <section className="px-4 py-6">
        <div className="mx-auto max-w-md">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--home-section-kicker)]">
                {language === 'en' ? 'Top rated' : 'Най-добре оценени'}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-[var(--home-section-heading)]">
                {language === 'en' ? 'Visitor favorites' : 'Любими на посетителите'}
              </h2>
            </div>
            <Link to="/destinations" className="text-sm font-semibold text-[var(--forest)]">
              {language === 'en' ? 'more' : 'още'}
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {topRated.length === 0 ? (
              <div className="rounded-[1.25rem] border border-[var(--border)] bg-white/88 p-4 text-sm leading-relaxed text-[var(--muted)] shadow-[0_14px_32px_rgba(15,61,46,0.06)]">
                {language === 'en'
                  ? 'No ratings yet. The most liked places will appear here after the first votes.'
                  : 'Още няма оценки. След първите гласове тук ще се покажат най-харесваните места.'}
              </div>
            ) : topRated.map((destination) => (
              <Link
                key={destination.id}
                to={`/destination/${destination.id}`}
                className="grid grid-cols-[6rem_1fr] gap-3 rounded-[1.25rem] border border-[var(--border)] bg-white/88 p-2 shadow-[0_14px_32px_rgba(15,61,46,0.06)] transition active:scale-[0.99]"
              >
                <SmartImage
                  src={destination.image}
                  alt={destination.name}
                  loading="lazy"
                  decoding="async"
                  maxWidth={360}
                  className="aspect-square overflow-hidden rounded-[1rem]"
                  imgClassName="object-cover"
                />
                <div className="min-w-0 py-1 pr-1">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--forest)]">
                    {labels[destination.category]}
                  </p>
                  <h3 className="mt-1 line-clamp-2 font-display text-lg font-semibold leading-tight text-[var(--forest-deep)]">
                    {destination.name}
                  </h3>
                  <DestinationRating destinationId={destination.id} compact />
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                    {destination.shortDescription}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-10 md:py-18">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--home-section-kicker)] md:tracking-[0.3em]">
            {language === 'en' ? 'Top rated' : 'Най-добре оценени'}
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-[var(--home-section-heading)] md:text-4xl">
            {language === 'en' ? 'Visitor favorites' : 'Любими на посетителите'}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-base">
            {language === 'en'
              ? 'Destinations with the highest average rating from visitors.'
              : 'Дестинациите с най-висока средна оценка от посетителите.'}
          </p>
        </div>
        <Link
          to="/destinations"
          className="text-sm font-semibold text-[var(--forest)] hover:underline"
        >
          {language === 'en' ? 'All destinations ->' : 'Всички дестинации →'}
        </Link>
      </div>

      {topRated.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white px-5 py-6 text-sm leading-relaxed text-[var(--muted)] shadow-sm">
          {language === 'en'
            ? 'No ratings yet. The most liked places will appear here after the first votes.'
            : 'Още няма оценки. След първите гласове тук ще се покажат най-харесваните места.'}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topRated.map((destination, index) => {
          const region = regionByDestinationId.get(destination.id)
          if (!region) return null

          return (
            <DestinationCard
              key={destination.id}
              destination={destination}
              regionSlug={region.slug}
              index={index}
            />
          )
          })}
        </div>
      )}
    </section>
  )
}
