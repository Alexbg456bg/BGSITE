import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { SmartImage } from '../components/SmartImage'
import { ImageGallery } from '../components/ImageGallery'
import { DestinationRating } from '../components/DestinationRating'
import { DestinationWeather } from '../components/DestinationWeather'
import { getCategoryLabels } from '../data/categoryLabels'
import { TRAIL_DETAILS } from '../data/trailDetails'
import { useSiteData } from '../hooks/useSiteData'
import { useFavorites } from '../hooks/useFavorites'
import { useI18n } from '../i18n/LanguageContext'

export function DestinationPage() {
  const { id } = useParams<{ id: string }>()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { getDestinationWithRegion } = useSiteData()
  const { language, t } = useI18n()
  const labels = getCategoryLabels(language)
  const found = id ? getDestinationWithRegion(id) : undefined

  if (!found) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-[var(--ink)]">
          {language === 'en' ? 'Destination not found' : 'Дестинацията не е намерена'}
        </h1>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-[var(--forest)] px-6 py-3 text-sm font-semibold text-white"
        >
          {language === 'en' ? 'Back home' : 'Към началото'}
        </Link>
      </div>
    )
  }

  const { destination: d, region } = found
  const fav = isFavorite(d.id)
  const trailDetails = d.trailDetails ?? TRAIL_DETAILS[d.id]
  const galleryImages = [d.image, ...(d.images ?? [])].filter(
    (image, index, all): image is string =>
      Boolean(image) && all.indexOf(image) === index,
  )

  return (
    <article className="pb-14 md:pb-20">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <Breadcrumbs
          items={[
            { label: t('navHome'), to: '/' },
            { label: region.name, to: `/region/${region.slug}` },
            { label: d.name },
          ]}
        />
      </div>

      <div className="mx-auto grid max-w-6xl gap-7 px-4 md:gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-w-0"
        >
          {galleryImages.length > 1 ? (
            <ImageGallery
              images={galleryImages}
              alt={`${d.name}, ${region.name}`}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--mist)] shadow-lg md:rounded-3xl"
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--mist)] shadow-lg md:rounded-3xl">
          <SmartImage
            src={d.image}
            alt={`${d.name}, ${region.name}`}
            fetchPriority="high"
            decoding="async"
            maxWidth={1200}
            className="aspect-[4/3] w-full lg:aspect-auto lg:min-h-[420px]"
            imgClassName="object-cover"
          />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-col"
        >
          <span className="w-fit rounded-full bg-[var(--forest)]/10 px-3 py-1 text-xs font-semibold text-[var(--forest)]">
            {labels[d.category]}
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold leading-tight text-[var(--forest-deep)] md:text-4xl">
            {d.name}
          </h1>
          <p className="mt-2 text-sm font-medium text-[var(--forest)]">
            {d.location} · {region.name}
          </p>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted)] md:mt-6 md:text-lg">
            {d.shortDescription}
          </p>
          <DestinationRating destinationId={d.id} />
          {trailDetails && (
            <section className="mt-5 space-y-3 md:mt-6">
              <div className="rounded-2xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                  {language === 'en' ? 'What you will see' : 'Какво ще видиш'}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {trailDetails.sights}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                  {language === 'en' ? 'What the trail is like' : 'Каква е пътеката'}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {trailDetails.route}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                  {language === 'en' ? 'Suitable for' : 'Подходящо за'}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {trailDetails.suitableFor}
                </p>
              </div>
            </section>
          )}
          <DestinationWeather destination={d} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:mt-6">
            <div className="rounded-2xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-4 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                {t('category')}
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-[var(--forest-deep)]">
                {labels[d.category]}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-4 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                {t('region')}
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-[var(--forest-deep)]">
                {region.name}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3 md:mt-8">
            <button
              type="button"
              onClick={() => toggleFavorite(d.id)}
              className="inline-flex w-full items-center justify-center rounded-xl border-2 border-[var(--forest)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--forest)] transition hover:bg-[var(--mist)] sm:w-auto"
            >
              <span className="flex items-center gap-2">
                {fav ? 
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /> 
                  </svg> : 
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /> 
                  </svg>
                }
                {fav ? t('inFavorites') : t('saved')}
              </span>
            </button>
            {d.mapsUrl && (
              <a
                href={d.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--forest)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--forest-deep)] sm:w-auto"
              >
                {language === 'en' ? 'Open in Google Maps' : 'Отвори в Google Maps'}
              </a>
            )}
            <Link
              to={`/region/${region.slug}`}
              className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] px-5 py-3 text-center text-sm font-medium text-[var(--ink-soft)] transition hover:border-[var(--forest)] hover:text-[var(--forest)] sm:w-auto"
            >
              {language === 'en' ? 'All places in the region' : 'Всички обекти в областта'}
            </Link>
          </div>
        </motion.div>
      </div>
    </article>
  )
}
