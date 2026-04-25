import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { SmartImage } from '../components/SmartImage'
import { ImageGallery } from '../components/ImageGallery'
import { CATEGORY_LABELS } from '../data/categoryLabels'
import { useSiteData } from '../hooks/useSiteData'
import { useFavorites } from '../hooks/useFavorites'

export function DestinationPage() {
  const { id } = useParams<{ id: string }>()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { getDestinationWithRegion } = useSiteData()
  const found = id ? getDestinationWithRegion(id) : undefined

  if (!found) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-[var(--ink)]">
          Дестинацията не е намерена
        </h1>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-[var(--forest)] px-6 py-3 text-sm font-semibold text-white"
        >
          Към началото
        </Link>
      </div>
    )
  }

  const { destination: d, region } = found
  const fav = isFavorite(d.id)
  const galleryImages = [d.image, ...(d.images ?? [])].filter(
    (image, index, all): image is string =>
      Boolean(image) && all.indexOf(image) === index,
  )

  return (
    <article className="pb-20">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <Breadcrumbs
          items={[
            { label: 'Начало', to: '/' },
            { label: region.name, to: `/region/${region.slug}` },
            { label: d.name },
          ]}
        />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {galleryImages.length > 1 ? (
            <ImageGallery
              images={galleryImages}
              alt={`${d.name}, ${region.name}`}
              className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--mist)] shadow-lg"
            />
          ) : (
            <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--mist)] shadow-lg">
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
            {CATEGORY_LABELS[d.category]}
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-[var(--forest-deep)] md:text-4xl">
            {d.name}
          </h1>
          <p className="mt-2 text-sm font-medium text-[var(--forest)]">
            {d.location} · {region.name}
          </p>
          <p className="mt-6 text-lg leading-relaxed text-[var(--muted)]">
            {d.shortDescription}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                Категория
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-[var(--forest-deep)]">
                {CATEGORY_LABELS[d.category]}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
                Област
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-[var(--forest-deep)]">
                {region.name}
              </p>
            </div>
          </div>

          {d.coords && (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Координати: {d.coords.lat.toFixed(4)}, {d.coords.lng.toFixed(4)}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => toggleFavorite(d.id)}
              className="inline-flex items-center justify-center rounded-xl border-2 border-[var(--forest)] bg-white px-5 py-3 text-sm font-semibold text-[var(--forest)] transition hover:bg-[var(--mist)]"
            >
              {fav ? '♥ В любими' : '♡ Запази'}
            </button>
            {d.mapsUrl && (
              <a
                href={d.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-[var(--forest)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--forest-deep)]"
              >
                Отвори в Google Maps
              </a>
            )}
            <Link
              to={`/region/${region.slug}`}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--ink-soft)] transition hover:border-[var(--forest)] hover:text-[var(--forest)]"
            >
              Всички обекти в областта
            </Link>
          </div>
        </motion.div>
      </div>
    </article>
  )
}
