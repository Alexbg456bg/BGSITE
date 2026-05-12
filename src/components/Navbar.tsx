import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchBar } from './SearchBar'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'
import { BrandMark } from './BrandMark'
import { useI18n } from '../i18n/LanguageContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'navbar-link rounded-full px-3 py-2 text-sm font-medium transition lg:px-4',
    isActive
      ? 'bg-[var(--forest)] text-white shadow-sm'
      : '',
  ].join(' ')

const mobileSocialLinks = [
  {
    href: 'https://www.tiktok.com/@izgubisebg',
    label: 'TikTok',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="h-4.5 w-4.5 fill-current">
        <path d="M14.2 3c.2 1.7 1.2 3.3 2.8 4.2 1 .6 2 .9 3.1.9v3.2c-1.4 0-2.8-.4-4-1.1v5.6c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.3 0 .7 0 1 .1V13a3.3 3.3 0 0 0-1-.2 3.1 3.1 0 1 0 3.1 3.1V3h3Z" />
      </svg>
    ),
  },
  {
    href: 'https://www.instagram.com/izgubisebg/',
    label: 'Instagram',
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-4.5 w-4.5 fill-none stroke-current"
        strokeWidth="1.8"
      >
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="4.1" />
        <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: 'mailto:izgubisebg@gmail.com',
    label: 'Email',
    icon: (
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-4.5 w-4.5 fill-none stroke-current"
        strokeWidth="1.8"
      >
        <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
        <path d="m5 7 7 5 7-5" />
      </svg>
    ),
  },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const { t } = useI18n()
  const links: { to: string; label: string; end?: boolean }[] = [
    { to: '/', label: t('navHome'), end: true },
    { to: '/regions', label: t('navRegions') },
    { to: '/destinations', label: t('navDestinations') },
    { to: '/favorites', label: t('navFavorites') },
  ]

  return (
    <header
      className={`navbar-shell top-0 z-50 backdrop-blur-2xl ${
        isHome
          ? 'fixed left-0 right-0'
          : 'sticky border-b border-[var(--nav-border)]'
      }`}
    >
      {isHome && (
        <div
          className="navbar-glow pointer-events-none absolute inset-x-0 bottom-[-24px] h-6"
          aria-hidden
        />
      )}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 md:gap-4 md:py-4">
        <Link
          to="/"
          className="navbar-brand group flex shrink-0 items-center gap-2 font-display text-lg font-semibold tracking-tight"
        >
<BrandMark />
          <span className="hidden sm:inline">{t('brand')}</span>
        </Link>

        <div className="min-w-0 flex-1 md:max-w-sm lg:hidden">
          <SearchBar className="mobile-top-search w-full" />
        </div>

        <nav
          className="hidden items-center gap-0.5 lg:flex xl:gap-1"
          aria-label={t('navAria')}
        >
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden min-w-[180px] flex-1 justify-end lg:flex lg:max-w-sm xl:max-w-md">
          <SearchBar className="w-full" />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
          <div className="hidden lg:block">
            <LanguageToggle />
          </div>
          
          <button
            type="button"
            className="navbar-menu-toggle flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm lg:hidden"
            aria-expanded={open}
            aria-label={open ? t('closeMenu') : t('openMenu')}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> 
              </svg> : 
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /> 
              </svg>
            }
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="navbar-panel max-h-[calc(100svh-4rem)] overflow-auto border-t backdrop-blur-2xl lg:hidden"
          >
            <div className="flex flex-col gap-2 px-4 py-4">
              <div className="flex items-center justify-end gap-2">
                <div className="mr-auto flex items-center gap-2">
                  {mobileSocialLinks.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                      aria-label={item.label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--nav-border)] bg-[var(--nav-surface)] text-[var(--nav-text)] shadow-sm backdrop-blur-sm transition active:scale-[0.96]"
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
                <LanguageToggle />
                <ThemeToggle />
              </div>
              {links.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={navLinkClass}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
