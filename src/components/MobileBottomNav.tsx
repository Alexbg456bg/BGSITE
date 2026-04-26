import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Начало', end: true, mark: 'Н' },
  { to: '/regions', label: 'Области', mark: 'О' },
  { to: '/destinations', label: 'Места', mark: 'М' },
  { to: '/favorites', label: 'Любими', mark: 'Л' },
]

export function MobileBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/70 bg-white/88 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_40px_rgba(15,61,46,0.12)] backdrop-blur-2xl lg:hidden"
      aria-label="Мобилна навигация"
    >
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'flex min-h-12 flex-col items-center justify-center rounded-2xl px-2 py-1 text-[11px] font-semibold transition',
                isActive
                  ? 'bg-[var(--forest-deep)] text-white shadow-[0_10px_22px_rgba(15,61,46,0.18)]'
                  : 'text-[var(--muted)] hover:bg-[var(--mist)] hover:text-[var(--forest-deep)]',
              ].join(' ')
            }
          >
            <span className="mb-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-current/20 text-[10px]">
              {item.mark}
            </span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
