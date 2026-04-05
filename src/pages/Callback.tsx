import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exchangeCode } from '../lib/auth'
import { getMe } from '../lib/spotify'
import { useStore } from '../store/useStore'
import type { SpotifyAccount } from '../types/spotify'

export default function Callback() {
  const navigate = useNavigate()
  const addAccount = useStore((s) => s.addAccount)
  const [error, setError] = useState<string | null>(null)
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const errorParam = params.get('error')

    if (errorParam) {
      setError(`Spotify denied access: ${errorParam}`)
      return
    }

    if (!code || !state) {
      setError('Missing code or state in callback URL')
      return
    }

    ;(async () => {
      try {
        const tokenData = await exchangeCode(code, state)

        // Get user profile
        const profile = await getMe(tokenData.access_token)

        const account: SpotifyAccount = {
          id: profile.id,
          displayName: profile.display_name ?? profile.id,
          email: profile.email ?? '',
          imageUrl: profile.images?.[0]?.url,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: Date.now() + tokenData.expires_in * 1000,
        }

        addAccount(account)

        // Clean URL and navigate
        window.history.replaceState({}, '', '/')
        navigate('/dashboard', { replace: true })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Authentication failed')
      }
    })()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-spotify-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-spotify-dark rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-3">Authentication Error</h2>
          <p className="text-spotify-text text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-spotify-green text-black font-bold px-6 py-3 rounded-full hover:bg-[#1ed760] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-spotify-black flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-spotify-card" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-spotify-green animate-spin" />
      </div>
      <p className="text-spotify-text">Connecting your account…</p>
    </div>
  )
}
