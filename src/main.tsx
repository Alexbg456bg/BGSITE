import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { FavoritesProvider } from './context/FavoritesProvider'
import { CustomDestinationsProvider } from './context/CustomDestinationsProvider'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { ScrollToTop } from './components/ScrollToTop'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AppErrorBoundary>
      <FavoritesProvider>
        <CustomDestinationsProvider>
          <ScrollToTop />
          <App />
        </CustomDestinationsProvider>
      </FavoritesProvider>
    </AppErrorBoundary>
  </BrowserRouter>,
)
