import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export type Crumb = { label: string; to?: string }

type Props = { items: Crumb[] }

export function Breadcrumbs({ items }: Props) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-sm text-[var(--muted)]"
      aria-label="Пътека"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-[var(--border-strong)]" aria-hidden>
                /
              </span>
            )}
            {item.to ? (
              <Link
                to={item.to}
                className="rounded-md px-1 py-0.5 text-[var(--forest)] transition hover:bg-[var(--mist)] hover:text-[var(--forest-deep)]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-[var(--ink)]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </motion.nav>
  )
}
