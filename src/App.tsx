import { Suspense, lazy, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'

const HomePage = lazy(async () => ({
  default: (await import('./pages/HomePage')).HomePage,
}))
const MapPage = lazy(async () => ({
  default: (await import('./pages/MapPage')).MapPage,
}))
const RegionsPage = lazy(async () => ({
  default: (await import('./pages/RegionsPage')).RegionsPage,
}))
const DestinationsPage = lazy(async () => ({
  default: (await import('./pages/DestinationsPage')).DestinationsPage,
}))
const FavoritesPage = lazy(async () => ({
  default: (await import('./pages/FavoritesPage')).FavoritesPage,
}))
const RegionPage = lazy(async () => ({
  default: (await import('./pages/RegionPage')).RegionPage,
}))
const DestinationPage = lazy(async () => ({
  default: (await import('./pages/DestinationPage')).DestinationPage,
}))
const NotFoundPage = lazy(async () => ({
  default: (await import('./pages/NotFoundPage')).NotFoundPage,
}))

function RouteLoader() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-[var(--muted)]">
      Зареждане...
    </div>
  )
}

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>
}

export default function App() {
  return (
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
          path="/map"
          element={
            <LazyRoute>
              <MapPage />
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
  )
}
