import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchBar } from './SearchBar'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'
import { useI18n } from '../i18n/LanguageContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'navbar-link rounded-full px-3 py-2 text-sm font-medium transition lg:px-4',
    isActive
      ? 'bg-[var(--forest)] text-white shadow-sm'
      : '',
  ].join(' ')

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
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--forest)] to-[var(--sky-deep)] text-sm text-white shadow-md">
            BG
          </span>
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
