import { Link } from 'react-router-dom'
import { useSiteData } from '../hooks/useSiteData'
import { useI18n } from '../i18n/LanguageContext'

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
      <path d="M14.2 3c.2 1.7 1.2 3.3 2.8 4.2 1 .6 2 .9 3.1.9v3.2c-1.4 0-2.8-.4-4-1.1v5.6c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.3 0 .7 0 1 .1V13a3.3 3.3 0 0 0-1-.2 3.1 3.1 0 1 0 3.1 3.1V3h3Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m5 7 7 5 7-5" />
    </svg>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  const { language, t } = useI18n()
  const { regions, allDestinations } = useSiteData()
  const footerLinks = [
    { to: '/regions', label: t('navRegions') },
    { to: '/destinations', label: t('navDestinations') },
    { to: '/favorites', label: t('navFavorites') },
  ]
  const contactLinks = [
    {
      href: 'https://www.tiktok.com/@izgubisebg',
      label: 'TikTok',
      value: '@izgubisebg',
      icon: <TikTokIcon />,
      accent: 'from-slate-900 via-slate-800 to-emerald-900',
    },
    {
      href: 'https://www.instagram.com/izgubisebg/',
      label: 'Instagram',
      value: '@izgubisebg',
      icon: <InstagramIcon />,
      accent: 'from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
    },
    {
      href: 'mailto:izgubisebg@gmail.com',
      label: language === 'en' ? 'Email' : 'Имейл',
      value: 'izgubisebg@gmail.com',
      icon: <MailIcon />,
      accent: 'from-[var(--forest-deep)] via-[var(--forest)] to-[var(--sky)]',
    },
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

        <div className="relative mt-8 grid gap-7 md:mt-10 md:grid-cols-[1.05fr_0.75fr_1.2fr] md:gap-8">
          <div className="order-2 md:order-1">
            <Link
              to="/"
              className="font-display text-xl font-semibold text-[var(--footer-heading)] transition hover:text-[var(--footer-link-hover)] md:text-2xl"
            >
              {language === 'en' ? 'Discover Bulgaria' : 'Открий България'}
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--footer-body)]">
              {language === 'en'
                ? 'A visual guide to regions, routes and places worth saving for your next trip.'
                : 'Визуален пътеводител с области, маршрути и места, които си струва да запазиш за следващото пътуване.'}
            </p>

            <div className="mt-5 grid max-w-md grid-cols-2 gap-2 md:gap-3">
              <div className="rounded-2xl border border-[var(--footer-border)] bg-[var(--footer-stat-bg)] px-3 py-3.5 md:px-4">
                <p className="font-display text-lg font-semibold text-[var(--footer-stat-text)] md:text-xl">
                  {regions.length}
                </p>
                <p className="mt-1 text-xs text-[var(--footer-body)]">
                  {language === 'en' ? 'regions' : 'области'}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--footer-border)] bg-[var(--footer-stat-bg)] px-3 py-3.5 md:px-4">
                <p className="font-display text-lg font-semibold text-[var(--footer-stat-text)] md:text-xl">
                  {allDestinations.length}
                </p>
                <p className="mt-1 text-xs text-[var(--footer-body)]">
                  {language === 'en' ? 'places' : 'места'}
                </p>
              </div>
            </div>
          </div>

          <div className="order-3 md:order-2">
            <p className="text-sm font-semibold text-[var(--footer-heading)]">
              {language === 'en' ? 'Explore' : 'Разгледай'}
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

          <div className="order-1 md:order-3 md:min-w-0">
            <div className="rounded-[1.75rem] border border-white/55 bg-white/78 p-4 shadow-[0_24px_50px_rgba(15,61,46,0.12)] backdrop-blur-xl md:rounded-[2rem] md:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--forest)]">
                    {language === 'en' ? 'Contacts' : 'Контакти'}
                  </p>
                  <h3 className="mt-2 font-display text-[1.7rem] font-semibold leading-tight text-[var(--footer-heading)] md:text-2xl">
                    {language === 'en' ? 'Find us online' : 'Намери ни онлайн'}
                  </h3>
                </div>
              </div>

              <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--footer-body)]">
                {language === 'en'
                  ? 'For ideas, collaborations and new routes, write to us or follow the project on social media.'
                  : 'За идеи, сътрудничества и нови маршрути ни пиши или следи проекта в социалните мрежи.'}
              </p>

              <div className="mt-5 grid gap-3">
                {contactLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="group relative overflow-hidden rounded-[1.35rem] border border-white/60 bg-white/84 px-4 py-3.5 shadow-[0_12px_24px_rgba(15,61,46,0.08)] transition active:scale-[0.99] md:rounded-[1.5rem] md:hover:-translate-y-0.5 md:hover:shadow-[0_18px_34px_rgba(15,61,46,0.14)]"
                  >
                    <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${item.accent}`} />
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--forest-deep)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition md:group-hover:scale-105">
                        {item.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--footer-heading)]">
                          {item.label}
                        </p>
                        <p className="truncate text-[13px] text-[var(--footer-body)] md:text-sm">
                          {item.value}
                        </p>
                      </div>
                      <span className="text-[var(--footer-link)] transition md:group-hover:translate-x-1 md:group-hover:text-[var(--footer-link-hover)]">
                        →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-8 flex flex-col gap-3 border-t border-[var(--footer-divider)] pt-5 text-xs text-[var(--footer-meta)] sm:flex-row sm:items-center sm:justify-between md:mt-10 md:pt-6">
          <p>
            © {year} {language === 'en' ? 'Discover Bulgaria' : 'Открий България'}. {t('footerCopy')}
          </p>
          <p>React · Vite · TypeScript · Tailwind</p>
        </div>
      </div>
    </footer>
  )
}
