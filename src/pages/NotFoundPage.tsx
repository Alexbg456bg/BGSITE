import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-[var(--forest)]">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--forest-deep)]">
        Страницата не съществува
      </h1>
      <p className="mt-3 max-w-md text-[var(--muted)]">
        Проверете адреса или се върнете към началната страница и картата на
        България.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-[var(--forest)] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[var(--forest-deep)]"
      >
        Начало
      </Link>
    </div>
  )
}
