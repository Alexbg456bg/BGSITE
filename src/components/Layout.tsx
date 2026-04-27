import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'

export function Layout() {
  const { pathname } = useLocation()
  const isAdminPage = pathname.startsWith('/admin')

  return (
    <div className="flex min-h-svh flex-col overflow-x-hidden bg-[var(--bg)] pb-16 lg:pb-0">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAdminPage && <Footer />}
      <MobileBottomNav />
    </div>
  )
}
