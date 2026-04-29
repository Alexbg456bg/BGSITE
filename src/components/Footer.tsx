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
    <footer className="mt-14 overflow-hidden border-t border-[var(--border)] bg-[linear-gradient(180deg,rgba(237,242,235,0.86),rgba(255,255,255,0.98))] md:mt-24">
      <div className="relative mx-auto max-w-6xl px-4 py-9 md:py-14">
        <div
          className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(236,216,164,0.42),transparent_70%)] blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 bottom-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(79,140,171,0.22),transparent_70%)] blur-2xl"
          aria-hidden
        />

        <div className="relative mt-8 grid gap-7 md:mt-10 md:grid-cols-[1.4fr_0.8fr_1fr] md:gap-8">
          <div>
            <Link
              to="/"
              className="font-display text-xl font-semibold text-[var(--forest-deep)] transition hover:text-[var(--forest)] md:text-2xl"
            >
              {t('brand')}
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              {language === 'en'
                ? 'A travel portal with 28 regions, a real map of Bulgaria and a focus on places worth discovering.'
                : 'Туристически портал с 28 области, реална карта на България и фокус върху места, които си заслужава да бъдат открити.'}
            </p>

            <div className="mt-5 grid max-w-md grid-cols-3 gap-2 md:gap-3">
              <div className="rounded-2xl border border-[var(--border)] bg-white/70 px-2.5 py-3 md:px-3">
                <p className="font-display text-lg font-semibold text-[var(--forest-deep)] md:text-xl">
                  28
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {language === 'en' ? 'regions' : 'области'}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-white/70 px-2.5 py-3 md:px-3">
                <p className="font-display text-lg font-semibold text-[var(--forest-deep)] md:text-xl">
                  100+
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {language === 'en' ? 'places' : 'места'}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-white/70 px-2.5 py-3 md:px-3">
                <p className="font-display text-base font-semibold text-[var(--forest-deep)] md:text-xl">
                  {language === 'en' ? 'map' : 'карта'}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {language === 'en' ? 'navigation' : 'навигация'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">
              {t('footerSections')}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex text-[var(--forest)] transition hover:translate-x-1 hover:text-[var(--forest-deep)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">
              {t('footerSources')}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              {language === 'en'
                ? 'Photos: Unsplash and Wikimedia Commons. Regional borders: '
                : 'Снимки: Unsplash и Wikimedia Commons. Областни граници: '}
              <a
                href="https://www.naturalearthdata.com/"
                className="text-[var(--forest)] underline"
                target="_blank"
                rel="noreferrer"
              >
                Natural Earth
              </a>
              .
            </p>
            <p className="mt-4 rounded-2xl border border-[var(--border)] bg-white/64 p-4 text-sm leading-relaxed text-[var(--ink-soft)]">
              {language === 'en'
                ? 'Tip: add contact details, social profiles and a short suggestion form to make the site feel more complete.'
                : 'Съвет: добави контакт, социални профили и кратка форма за предложения, за да изглежда сайтът по-завършен.'}
            </p>
          </div>
        </div>

        <div className="relative mt-8 flex flex-col gap-3 border-t border-[var(--border)] pt-5 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between md:mt-10 md:pt-6">
          <p>
            © {year} {t('brand')}. {t('footerCopy')}
          </p>
          <p>React · Vite · TypeScript · Tailwind</p>
        </div>
      </div>
    </footer>
  )
}
