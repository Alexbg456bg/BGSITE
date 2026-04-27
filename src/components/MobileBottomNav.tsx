import { NavLink } from 'react-router-dom'

const items = [
  {
    to: '/',
    label: 'Начало',
    end: true,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    to: '/regions',
    label: 'Области',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5-2.5V5l5 2.5m0 12.5 6-3m-6 3V7.5m6 9.5 5 2.5V7l-5-2.5m0 12.5V4.5m0 0-6 3" />
      </svg>
    ),
  },
  {
    to: '/destinations',
    label: 'Места',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      </svg>
    ),
  },
  {
    to: '/favorites',
    label: 'Любими',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.8 8.6a5 5 0 0 0-8.1-3.9L12 5.4l-.7-.7a5 5 0 0 0-7.1 7.1L12 19.6l7.8-7.8a5 5 0 0 0 1-3.2z" />
      </svg>
    ),
  },
]

export function MobileBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-white/94 px-4 pb-[max(0.7rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-10px_28px_rgba(15,61,46,0.12)] backdrop-blur-xl lg:hidden"
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
                'flex min-h-12 flex-col items-center justify-center rounded-2xl px-2 py-1 text-[11px] font-semibold transition-colors',
                isActive
                  ? 'bg-[var(--forest-deep)] text-white shadow-[0_8px_18px_rgba(15,61,46,0.22)]'
                  : 'text-[var(--muted)] active:bg-[var(--mist)] active:text-[var(--forest-deep)]',
              ].join(' ')
            }
          >
            <span className="mb-1">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
