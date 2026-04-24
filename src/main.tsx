import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { FavoritesProvider } from './context/FavoritesProvider'
import { AppErrorBoundary } from './components/AppErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppErrorBoundary>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </AppErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
