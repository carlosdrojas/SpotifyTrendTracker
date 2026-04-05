import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'
import clsx from 'clsx'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/trends', label: 'Trends & Eras' },
  { to: '/accounts', label: 'Accounts' },
]

export default function Navbar() {
  const location = useLocation()
  const accounts = useStore((s) => s.accounts)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-spotify-black/90 backdrop-blur border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <SpotifyIcon />
          <span className="font-bold text-lg tracking-tight">
            Spotif<span className="text-spotify-green">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                location.pathname === to
                  ? 'bg-white text-black'
                  : 'text-spotify-text hover:text-white hover:bg-white/10'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Account avatars */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex -space-x-2">
            {accounts.slice(0, 4).map((account) => (
              <div
                key={account.id}
                title={account.displayName}
                className="w-8 h-8 rounded-full border-2 border-spotify-black overflow-hidden bg-spotify-card"
              >
                {account.imageUrl ? (
                  <img
                    src={account.imageUrl}
                    alt={account.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-spotify-green">
                    {account.displayName[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            {accounts.length > 4 && (
              <div className="w-8 h-8 rounded-full border-2 border-spotify-black bg-spotify-card flex items-center justify-center text-xs text-spotify-text">
                +{accounts.length - 4}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function SpotifyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1DB954">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}
