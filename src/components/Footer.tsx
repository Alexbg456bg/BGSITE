import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/LanguageContext'

export function Footer() {
  const year = new Date().getFullYear()
  const { language, t } = useI18n()
  const footerLinks = [
    { to: '/regions', label: t('navRegions') },
    { to: '/destinations', label: t('navDestinations') },
    { to: '/favorites', label: t('navFavorites') },
  ]

  return (
    <footer className="mt-14 overflow-hidden border-t border-[var(--footer-border)] bg-[var(--footer-bg)] md:mt-24">
      <div className="relative mx-auto max-w-6xl px-4 py-9 md:py-14">
        <div
          className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(236,216,164,0.42),transparent_70%)] blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(79,140,171,0.22),transparent_70%)] blur-2xl"
          aria-hidden
        />

        <div className="relative mt-8 grid gap-7 md:mt-10 md:grid-cols-[1.4fr_0.8fr] md:gap-8">
          <div>
            <Link
              to="/"
              className="font-display text-xl font-semibold text-[var(--footer-heading)] transition hover:text-[var(--footer-link-hover)] md:text-2xl"
            >
              {t('brand')}
            </Link>

            <div className="mt-5 grid max-w-md grid-cols-2 gap-2 md:gap-3">
              <div className="rounded-2xl border border-[var(--footer-border)] bg-[var(--footer-stat-bg)] px-2.5 py-3 md:px-3">
                <p className="font-display text-lg font-semibold text-[var(--footer-stat-text)] md:text-xl">
                  28
                </p>
                <p className="mt-1 text-xs text-[var(--footer-body)]">
                  {language === 'en' ? 'regions' : 'области'}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--footer-border)] bg-[var(--footer-stat-bg)] px-2.5 py-3 md:px-3">
                <p className="font-display text-lg font-semibold text-[var(--footer-stat-text)] md:text-xl">
                  100+
                </p>
                <p className="mt-1 text-xs text-[var(--footer-body)]">
                  {language === 'en' ? 'places' : 'места'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--footer-heading)]">
              {t('footerSections')}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex text-[var(--footer-link)] transition hover:translate-x-1 hover:text-[var(--footer-link-hover)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative mt-8 flex flex-col gap-3 border-t border-[var(--footer-divider)] pt-5 text-xs text-[var(--footer-meta)] sm:flex-row sm:items-center sm:justify-between md:mt-10 md:pt-6">
          <p>
            © {year} {t('brand')}. {t('footerCopy')}
          </p>
          <p>React · Vite · TypeScript · Tailwind</p>
        </div>
      </div>
    </footer>
  )
}
