import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-spotify-black flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <footer className="text-center py-4 text-spotify-text text-xs">
        made by carlos "carlos bandz" rojas
      </footer>
    </div>
  )
}
