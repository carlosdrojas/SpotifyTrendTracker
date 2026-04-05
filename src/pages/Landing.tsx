import { useState } from 'react'
import { initiateLogin } from '../lib/auth'

export default function Landing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setError(null)
    setLoading(true)
    try {
      await initiateLogin()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const hasClientId = !!import.meta.env.VITE_SPOTIFY_CLIENT_ID

  return (
    <div className="min-h-screen bg-spotify-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-spotify-green/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center animate-fade-in">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-spotify-green flex items-center justify-center shadow-lg shadow-spotify-green/30">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="black">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-3 tracking-tight">
          Spotif<span className="text-spotify-green">AI</span>
        </h1>
        <p className="text-spotify-text text-lg mb-2">
          Your complete Spotify listening profile
        </p>
        <p className="text-spotify-text text-sm mb-10">
          Connect one or more accounts to see your top tracks, artists, and albums — with trends across time.
        </p>

        {!hasClientId && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-left">
            <p className="text-yellow-400 text-sm font-semibold mb-1">Setup required</p>
            <p className="text-yellow-300/80 text-xs leading-relaxed">
              Create a <code className="bg-yellow-500/20 px-1 rounded">.env</code> file in the project root with:
              <br />
              <code className="block mt-1 bg-yellow-500/10 p-2 rounded font-mono">
                VITE_SPOTIFY_CLIENT_ID=your_client_id
              </code>
              <br />
              Get your Client ID from the{' '}
              <a
                href="https://developer.spotify.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-yellow-400"
              >
                Spotify Developer Dashboard
              </a>
              . Set redirect URI to{' '}
              <code className="bg-yellow-500/20 px-1 rounded">http://localhost:5173/callback</code>
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={loading || !hasClientId}
          className="inline-flex items-center gap-3 bg-spotify-green hover:bg-[#1ed760] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-8 py-4 rounded-full text-base transition-all hover:scale-105 active:scale-95 shadow-lg shadow-spotify-green/30"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="black">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Connect with Spotify
            </>
          )}
        </button>

        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          {[
            { icon: '🎵', label: 'Top Tracks', desc: 'See your most played songs' },
            { icon: '🎤', label: 'Top Artists', desc: 'Discover who you listen to most' },
            { icon: '📈', label: 'Trends & Eras', desc: 'Explore your listening over time' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="bg-spotify-dark rounded-xl p-4">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="font-semibold text-sm mb-1">{label}</div>
              <div className="text-spotify-text text-xs">{desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-spotify-dark/50 rounded-xl">
          <p className="text-spotify-text text-xs">
            <span className="text-spotify-green font-medium">Multi-account support</span> — Connect multiple Spotify accounts and view an
            aggregated profile. Perfect if you split listening between personal and work accounts.
          </p>
        </div>
      </div>
    </div>
  )
}
