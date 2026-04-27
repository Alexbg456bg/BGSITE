import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export type Crumb = { label: string; to?: string }

type Props = {
  items: Crumb[]
  variant?: 'default' | 'onDark'
}

export function Breadcrumbs({ items, variant = 'default' }: Props) {
  const onDark = variant === 'onDark'

  return (
    <motion.nav
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-sm ${
        onDark
          ? 'text-white/86 drop-shadow-[0_2px_8px_rgba(0,0,0,0.72)]'
          : 'text-[var(--muted)]'
      }`}
      aria-label="Пътека"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && (
              <span
                className={onDark ? 'text-white/62' : 'text-[var(--border-strong)]'}
                aria-hidden
              >
                /
              </span>
            )}
            {item.to ? (
              <Link
                to={item.to}
                className={`rounded-md px-1 py-0.5 transition ${
                  onDark
                    ? 'text-white/82 active:bg-white/12'
                    : 'text-[var(--forest)] hover:bg-[var(--mist)] hover:text-[var(--forest-deep)]'
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span className={`font-medium ${onDark ? 'text-white' : 'text-[var(--ink)]'}`}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </motion.nav>
  )
}
