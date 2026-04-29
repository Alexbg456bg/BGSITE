import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { FavoritesProvider } from './context/FavoritesProvider'
import { CustomDestinationsProvider } from './context/CustomDestinationsProvider'
import { DestinationRatingsProvider } from './context/DestinationRatingsProvider'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { ScrollToTop } from './components/ScrollToTop'
import { LanguageProvider } from './i18n/LanguageContext'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AppErrorBoundary>
      <FavoritesProvider>
        <LanguageProvider>
          <CustomDestinationsProvider>
            <DestinationRatingsProvider>
              <ScrollToTop />
              <App />
            </DestinationRatingsProvider>
          </CustomDestinationsProvider>
        </LanguageProvider>
      </FavoritesProvider>
    </AppErrorBoundary>
  </BrowserRouter>,
)
