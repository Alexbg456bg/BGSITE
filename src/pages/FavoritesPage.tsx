import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { DestinationCard } from '../components/DestinationCard'
import { useTheme } from '../contexts/ThemeContext'
import { useFavorites } from '../hooks/useFavorites'
import { useSiteData } from '../hooks/useSiteData'
import { useI18n } from '../i18n/LanguageContext'

export function FavoritesPage() {
  const { favorites } = useFavorites()
  const { getDestinationWithRegion } = useSiteData()
  const { language, t } = useI18n()
  const { theme } = useTheme()
  const list = [...favorites]
    .map((id) => getDestinationWithRegion(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getDestinationWithRegion>>[]

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--mobile-hero-panel-bg)] py-8 md:py-14">
        <div className="hero-orb hero-orb-left" />
        <div className="hero-orb hero-orb-right" />

        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs
            variant={theme === 'dark' ? 'onDark' : 'default'}
            items={[{ label: t('navHome'), to: '/' }, { label: t('navFavorites') }]}
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 md:mt-6"
          >
            <motion.h1 className="max-w-3xl font-display text-3xl font-semibold leading-[0.95] text-[var(--mobile-hero-title)] drop-shadow-[0_8px_22px_rgba(0,0,0,0.18)] md:text-5xl md:drop-shadow-none">
              {language === 'en' ? 'Saved places' : 'Запазени места'}
            </motion.h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--mobile-hero-copy)] drop-shadow-[0_4px_14px_rgba(0,0,0,0.14)] md:text-lg md:drop-shadow-none">
              {language === 'en'
                ? 'Saved locally in your browser. Add hearts from destination cards and come back later.'
                : 'Запазват се локално в браузъра. Добавяй сърце от картите на дестинациите и се върни тук по-късно.'}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border)] bg-white py-16 text-center text-[var(--muted)]">
            {language === 'en' ? 'No favorites yet. ' : 'Още няма любими. '}
            <Link to="/destinations" className="font-semibold text-[var(--forest)] underline">
              {language === 'en' ? 'Browse destinations' : 'Разгледай дестинации'}
            </Link>
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map(({ destination, region }, i) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                regionSlug={region.slug}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
