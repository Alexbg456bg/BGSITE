import { Link } from 'react-router-dom'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[linear-gradient(180deg,rgba(237,242,235,0.84),rgba(255,255,255,0.96))]">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-xl font-semibold text-[var(--forest-deep)]">
              Открий България
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              Туристически портал с 28 области, реална карта на България и фокус
              върху места, които си заслужава да бъдат открити.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">Раздели</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/regions" className="text-[var(--forest)] hover:underline">
                  Области
                </Link>
              </li>
              <li>
                <Link
                  to="/destinations"
                  className="text-[var(--forest)] hover:underline"
                >
                  Дестинации
                </Link>
              </li>
              <li>
                <Link
                  to="/favorites"
                  className="text-[var(--forest)] hover:underline"
                >
                  Любими
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="text-[var(--forest)] hover:underline"
                >
                  Админ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">Източници</p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              Снимки: Unsplash и Wikimedia Commons. Областни граници:{' '}
              <a
                href="https://www.naturalearthdata.com/"
                className="text-[var(--forest)] underline"
                target="_blank"
                rel="noreferrer"
              >
                Natural Earth
              </a>
              .
            </p>
          </div>
        </div>

        <p className="mt-12 border-t border-[var(--border)] pt-8 text-center text-xs text-[var(--muted)]">
          © {year} · React · Vite · TypeScript · Tailwind
        </p>
      </div>
    </footer>
  )
}
