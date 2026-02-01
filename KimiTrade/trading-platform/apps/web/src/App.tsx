import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'

import { Layout } from '@components/Layout'
import { LoadingScreen } from '@components/LoadingScreen'

// Lazy load pages for better performance
const ChartPage = lazy(() => import('@pages/ChartPage'))
const WatchlistPage = lazy(() => import('@pages/WatchlistPage'))
const ScreenerPage = lazy(() => import('@pages/ScreenerPage'))
const SettingsPage = lazy(() => import('@pages/SettingsPage'))

function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<ChartPage />} />
          <Route path="/chart/:symbol?" element={<ChartPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/screener" element={<ScreenerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App
