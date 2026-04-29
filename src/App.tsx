import { Suspense, lazy, useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ThemeProvider } from './contexts/ThemeContext'
import { loadBulgariaGeoJson } from './data/bulgariaGeoJson'
import { useI18n } from './i18n/LanguageContext'

const loadHomePage = () => import('./pages/HomePage')
const loadRegionsPage = () => import('./pages/RegionsPage')
const loadDestinationsPage = () => import('./pages/DestinationsPage')
const loadFavoritesPage = () => import('./pages/FavoritesPage')
const loadAdminPage = () => import('./pages/AdminPage')
const loadRegionPage = () => import('./pages/RegionPage')
const loadDestinationPage = () => import('./pages/DestinationPage')
const loadNotFoundPage = () => import('./pages/NotFoundPage')

const HomePage = lazy(async () => ({
  default: (await loadHomePage()).HomePage,
}))
const RegionsPage = lazy(async () => ({
  default: (await loadRegionsPage()).RegionsPage,
}))
const DestinationsPage = lazy(async () => ({
  default: (await loadDestinationsPage()).DestinationsPage,
}))
const FavoritesPage = lazy(async () => ({
  default: (await loadFavoritesPage()).FavoritesPage,
}))
const AdminPage = lazy(async () => ({
  default: (await loadAdminPage()).AdminPage,
}))
const RegionPage = lazy(async () => ({
  default: (await loadRegionPage()).RegionPage,
}))
const DestinationPage = lazy(async () => ({
  default: (await loadDestinationPage()).DestinationPage,
}))
const NotFoundPage = lazy(async () => ({
  default: (await loadNotFoundPage()).NotFoundPage,
}))

function RouteLoader() {
  const { t } = useI18n()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-[var(--muted)]">
      {t('loading')}
    </div>
  )
}

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>
}

export default function App() {
  const location = useLocation()

  useEffect(() => {
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string }
      }
    ).connection
    const isConstrainedConnection =
      connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')

    if (isConstrainedConnection) return

    const preloadCoreRoutes = () => {
      void loadRegionsPage()
      void loadDestinationsPage()
      void loadFavoritesPage()
      void loadRegionPage()
      void loadDestinationPage()
    }

    const preloadColdRoutes = () => {
      void loadNotFoundPage()
      void loadAdminPage()
      void loadBulgariaGeoJson()
    }

    const scheduleIdle = (callback: () => void, timeout: number) => {
      if ('requestIdleCallback' in window) {
        const id = window.requestIdleCallback(callback, { timeout })
        return () => window.cancelIdleCallback(id)
      }

      const id = globalThis.setTimeout(callback, timeout)
      return () => globalThis.clearTimeout(id)
    }

    const cancelCore = scheduleIdle(preloadCoreRoutes, 1800)
    const cancelCold = scheduleIdle(preloadColdRoutes, 6500)

    return () => {
      cancelCore()
      cancelCold()
    }
  }, [])

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return

    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Sofia',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
    const trackedKey = `bg_analytics_tracked_${today}`

    if (sessionStorage.getItem(trackedKey)) return

    const visitorStorageKey = 'bg_analytics_visitor_id'
    let visitorId = localStorage.getItem(visitorStorageKey)
    if (!visitorId) {
      visitorId =
        crypto.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(visitorStorageKey, visitorId)
    }

    sessionStorage.setItem(trackedKey, '1')
    void fetch('/api/analytics', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ visitorId }),
    }).catch(() => {
      sessionStorage.removeItem(trackedKey)
    })
  }, [location.pathname])

  return (
    <ThemeProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <LazyRoute>
                <HomePage />
              </LazyRoute>
            }
          />
          <Route
            path="/regions"
            element={
              <LazyRoute>
                <RegionsPage />
              </LazyRoute>
            }
          />
          <Route
            path="/destinations"
            element={
              <LazyRoute>
                <DestinationsPage />
              </LazyRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <LazyRoute>
                <FavoritesPage />
              </LazyRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <LazyRoute>
                <AdminPage />
              </LazyRoute>
            }
          />
          <Route
            path="/region/sofia"
            element={<Navigate to="/region/sofia-oblast" replace />}
          />
          <Route
            path="/region/:slug"
            element={
              <LazyRoute>
                <RegionPage />
              </LazyRoute>
            }
          />
          <Route
            path="/destination/:id"
            element={
              <LazyRoute>
                <DestinationPage />
              </LazyRoute>
            }
          />
          <Route
            path="*"
            element={
              <LazyRoute>
                <NotFoundPage />
              </LazyRoute>
            }
          />
        </Route>
      </Routes>
    </ThemeProvider>
  )}
