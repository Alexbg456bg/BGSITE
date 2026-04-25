import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchBar } from './SearchBar'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-full px-3 py-2 text-sm font-medium transition lg:px-4',
    isActive
      ? 'bg-[var(--forest)] text-white shadow-sm'
      : 'text-[var(--forest-deep)] [text-shadow:0_1px_10px_rgba(255,255,255,0.72)] hover:bg-white/48 hover:text-[var(--forest-deep)]',
  ].join(' ')

const links: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Начало', end: true },
  { to: '/regions', label: 'Области' },
  { to: '/destinations', label: 'Дестинации' },
  { to: '/favorites', label: 'Любими' },
  { to: '/admin', label: 'Админ' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <header
      className={`top-0 z-50 border-b border-white/45 bg-white/54 shadow-[0_10px_36px_rgba(15,61,46,0.1)] backdrop-blur-2xl ${
        isHome ? 'fixed left-0 right-0' : 'sticky'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2 font-display text-lg font-semibold tracking-tight text-[var(--forest-deep)] [text-shadow:0_1px_10px_rgba(255,255,255,0.72)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--forest)] to-[var(--sky-deep)] text-sm text-white shadow-md">
            BG
          </span>
          <span className="hidden sm:inline">Открий България</span>
        </Link>

        <nav
          className="hidden items-center gap-0.5 lg:flex xl:gap-1"
          aria-label="Основна навигация"
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

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--ink)] lg:hidden"
          aria-expanded={open}
          aria-label={open ? 'Затвори меню' : 'Отвори меню'}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="text-xl leading-none">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/45 bg-white/72 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex flex-col gap-2 px-4 py-4">
              <SearchBar />
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
