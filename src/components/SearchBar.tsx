import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getCategoryLabels } from '../data/categoryLabels'
import { useSiteData } from '../hooks/useSiteData'
import { useI18n } from '../i18n/LanguageContext'

type Props = { className?: string }

export function SearchBar({ className = '' }: Props) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const deferredQuery = useDeferredValue(q)
  const { allDestinations, regionByDestinationId } = useSiteData()
  const { language, t } = useI18n()
  const labels = getCategoryLabels(language)

  const indexedDestinations = useMemo(
    () =>
      allDestinations.map((destination) => ({
        destination,
        haystack: [
          destination.name,
          destination.location,
          destination.shortDescription,
          labels[destination.category],
        ]
          .join(' ')
          .toLowerCase(),
      })),
    [allDestinations, labels],
  )

  const results = useMemo(() => {
    const query = deferredQuery.trim().toLowerCase()
    if (query.length < 2) return []
    return indexedDestinations
      .filter(({ haystack }) => haystack.includes(query))
      .map(({ destination }) => destination)
      .slice(0, 8)
  }, [deferredQuery, indexedDestinations])

  useEffect(() => {
    if (typeof document === 'undefined') return

    const onDoc = (e: MouseEvent) => {
      const target = e.target
      if (!(target instanceof Node)) return
      if (!wrapRef.current?.contains(target)) setOpen(false)
    }

    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <label className="sr-only" htmlFor="site-search">
        {t('searchLabel')}
      </label>
      <div className="relative">
        <span
          className="site-search-icon pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          aria-hidden
        >
          ⌕
        </span>
        <input
          id="site-search"
          type="search"
          autoComplete="off"
          placeholder={t('searchPlaceholder')}
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className="site-search-input w-full rounded-2xl border py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none ring-[var(--forest)]/25 backdrop-blur-xl transition focus:ring-4"
        />
      </div>

      <AnimatePresence>
        {open && q.trim().length >= 2 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="site-search-results absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-auto rounded-2xl border py-2 shadow-xl"
            role="listbox"
          >
            {results.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[var(--muted)]">
                {t('noResults')}
              </li>
            ) : (
              results.map((d) => {
                const region = regionByDestinationId.get(d.id)
                return (
                  <li key={d.id} role="option">
                    <Link
                      to={`/destination/${d.id}`}
                      onClick={() => {
                        setOpen(false)
                        setQ('')
                      }}
                      className="site-search-result flex flex-col gap-0.5 px-4 py-2.5 transition"
                    >
                      <span className="font-medium text-[var(--ink)]" style={{
                        fontFamily: 'DM Sans, sans-serif',
                        opacity: 0.98,
                      }}>
                        {d.name}
                      </span>
                      <span className="text-xs text-[var(--muted)]" style={{
                        fontFamily: 'DM Sans, sans-serif',
                        opacity: 0.98,
                      }}>
                        {region?.name} · {labels[d.category]}
                      </span>
                    </Link>
                  </li>
                )
              })
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
