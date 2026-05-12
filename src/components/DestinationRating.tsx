import { useState } from 'react'
import { useDestinationRatings } from '../hooks/useDestinationRatings'
import { useI18n } from '../i18n/LanguageContext'

type Props = {
  destinationId: string
  compact?: boolean
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      aria-hidden
    >
      <path d="m12 3.2 2.7 5.47 6.03.88-4.36 4.25 1.03 6-5.4-2.84-5.4 2.84 1.03-6-4.36-4.25 6.03-.88L12 3.2Z" />
    </svg>
  )
}

export function DestinationRating({ destinationId, compact = false }: Props) {
  const { getRating, hasUserRated, submitRating } = useDestinationRatings()
  const { t, language } = useI18n()
  const rating = getRating(destinationId)
  const alreadyRated = hasUserRated(destinationId)
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(0)
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const displayValue =
    alreadyRated || isSubmitting
      ? Math.round(rating?.average ?? 0)
      : hovered || selected || Math.round(rating?.average ?? 0)

  if (compact) {
    return (
      <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--destination-card-body)]">
        <span className="text-[var(--sand)]" style={{
            fontFamily: 'DM Sans, sans-serif',
            opacity: 0.98,
          }}>
          <StarIcon filled={Boolean(rating?.count)} />
        </span>
        <span className="font-semibold text-[var(--destination-card-title)]">
          {rating?.count ? rating.average.toFixed(1) : '0.0'}
        </span>
        <span style={{
            fontFamily: 'DM Sans, sans-serif',
            opacity: 0.98,
        }}>({rating?.count ?? 0})</span>
      </div>
    )
  }

  return (
    <section className="mt-5 rounded-2xl border border-[var(--border)] bg-white px-4 py-4 shadow-sm md:mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
            {t('rating')}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {rating?.count
              ? `${rating.average.toFixed(1)} ${language === 'en' ? 'out of' : 'от'} 5 · ${rating.count} ${
                  language === 'en' ? 'ratings' : 'оценки'
                }`
              : t('noRatings')}
          </p>
        </div>
        <div
          className="flex items-center gap-1 text-[var(--sand)]"
          onMouseLeave={() => setHovered(0)}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className="rounded-lg p-1 transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting || alreadyRated}
              onMouseEnter={() => setHovered(value)}
              onFocus={() => setHovered(value)}
              onBlur={() => setHovered(0)}
              onClick={async () => {
                if (alreadyRated) return

                setSelected(value)
                setStatus('')
                setIsSubmitting(true)
                try {
                  await submitRating(destinationId, value)
                  setStatus(t('thanksForRating'))
                } catch (error) {
                  const { code, retryAfterSeconds } = error as Error & {
                    code?: string
                    retryAfterSeconds?: number
                  }
                  setStatus(
                    code === 'already_rated'
                      ? t('alreadyRated')
                      : code === 'rating_cooldown'
                        ? language === 'en'
                          ? `You can rate another destination after ${retryAfterSeconds ?? 60} sec.`
                          : `Може да оцениш друга дестинация след ${retryAfterSeconds ?? 60} сек.`
                        : t('rateAgainLater'),
                  )
                } finally {
                  setIsSubmitting(false)
                }
              }}
              aria-label={
                language === 'en' ? `Rate ${value} out of 5` : `Оцени с ${value} от 5`
              }
              title={
                language === 'en' ? `Rate ${value} out of 5` : `Оцени с ${value} от 5`
              }
            >
              <StarIcon filled={value <= displayValue} />
            </button>
          ))}
        </div>
      </div>
      {status && (
        <p className="mt-3 text-sm font-medium text-[var(--forest)]">{status}</p>
      )}
      {!status && alreadyRated && (
        <p className="mt-3 text-sm font-medium text-[var(--forest)]">
          {t('alreadyRated')}
        </p>
      )}
    </section>
  )
}
