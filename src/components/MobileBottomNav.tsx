import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const items = [
  { to: '/', label: 'Начало', end: true, mark: '🏠', emoji: '🏠' },
  { to: '/regions', label: 'Области', mark: '🗺️', emoji: '🗺️' },
  { to: '/destinations', label: 'Места', mark: '📍', emoji: '📍' },
  { to: '/favorites', label: 'Любими', mark: '❤️', emoji: '❤️' },
]

export function MobileBottomNav() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-white/95 via-white/92 to-white/88 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_40px_rgba(15,61,46,0.15)] backdrop-blur-2xl lg:hidden border-t border-white/60"
      aria-label="Мобилна навигация"
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest)]/5 via-transparent to-transparent" />
      
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'group relative flex min-h-12 flex-col items-center justify-center rounded-2xl px-2 py-1 text-[11px] font-medium transition-all duration-300 ease-out',
                isActive
                  ? 'bg-gradient-to-br from-[var(--forest-deep)] via-[var(--forest)] to-[var(--forest-deep)] text-white shadow-[0_16px_32px_rgba(15,61,46,0.4)] scale-[1.06] animate-pulse'
                  : 'text-[var(--muted)] hover:bg-gradient-to-br hover:from-[var(--mist)] hover:to-white hover:text-[var(--forest-deep)] hover:scale-[1.10] hover:shadow-[0_12px_24px_rgba(15,61,46,0.18)]',
              ].join(' ')
            }
            onMouseEnter={() => setHoveredItem(item.to)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Multi-layered background effects */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-white/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent to-[var(--forest)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer" />
            
            {/* Emoji icon with enhanced animation */}
            <span className={`mb-1 text-2xl transition-all duration-300 transform ${hoveredItem === item.to ? 'scale-130 rotate-12 drop-shadow-lg' : 'scale-100 rotate-0'}`}
                  style={{
                    filter: hoveredItem === item.to ? 'drop-shadow(0 4px 8px rgba(15,61,46,0.3))' : 'none'
                  }}>
              {item.emoji}
            </span>
            
            {/* Label with animation */}
            <span className="relative z-10 transition-all duration-200 font-semibold">
              {item.label}
            </span>
            
            {/* Enhanced active indicator */}
            {hoveredItem === item.to && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-br from-[var(--forest)] to-[var(--forest-deep)] rounded-full animate-bounce shadow-[0_4px_8px_rgba(15,61,46,0.3)]" />
            )}
            
            {/* Particle effects on hover */}
            {hoveredItem === item.to && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-[var(--forest)]/60 rounded-full animate-ping" />
                <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-[var(--forest)]/40 rounded-full animate-ping" style={{ animationDelay: '200ms' }} />
              </div>
            )}
          </NavLink>
        ))}
      </div>
      
      {/* Enhanced decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--forest-deep)]/40 to-transparent" />
      <div className="absolute top-0 left-1/4 w-px h-4 bg-gradient-to-b from-transparent to-[var(--forest-deep)]/25 animate-pulse" />
      <div className="absolute top-0 left-2/4 w-px h-4 bg-gradient-to-b from-transparent to-[var(--forest-deep)]/25 animate-pulse" style={{ animationDelay: '100ms' }} />
      <div className="absolute top-0 left-3/4 w-px h-4 bg-gradient-to-b from-transparent to-[var(--forest-deep)]/25 animate-pulse" style={{ animationDelay: '200ms' }} />
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-[var(--forest)] to-transparent rounded-full opacity-60 animate-pulse-slow" />
    </nav>
  )
}
