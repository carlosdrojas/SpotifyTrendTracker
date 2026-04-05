import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Trends from './pages/Trends'
import Accounts from './pages/Accounts'
import Callback from './pages/Callback'
import Layout from './components/Layout'
import { useStore } from './store/useStore'

export default function App() {
  const accounts = useStore((s) => s.accounts)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/callback" element={<Callback />} />
        <Route
          path="/"
          element={accounts.length === 0 ? <Landing /> : <Navigate to="/dashboard" replace />}
        />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/accounts" element={<Accounts />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
