import type {
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAudioFeatures,
  RecentlyPlayedItem,
  TimeRange,
  AccountData,
} from '../types/spotify'
import { refreshAccessToken } from './auth'
import { useStore } from '../store/useStore'

const BASE = 'https://api.spotify.com/v1'

async function apiFetch<T>(
  endpoint: string,
  accessToken: string,
  accountId: string
): Promise<T> {
  let token = accessToken

  // Check if token is about to expire (within 60s)
  const account = useStore.getState().accounts.find((a) => a.id === accountId)
  if (account && Date.now() > account.expiresAt - 60_000) {
    if (account.refreshToken) {
      try {
        const refreshed = await refreshAccessToken(account.refreshToken)
        useStore.getState().updateToken(accountId, refreshed.access_token, refreshed.expires_in)
        token = refreshed.access_token
      } catch {
        // token expired, user must re-auth
      }
    }
  }

  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (res.status === 401) throw new Error('UNAUTHORIZED')
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`)
  return res.json()
}

export async function getMe(token: string) {
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to get user profile')
  return res.json()
}

async function getTopTracks(
  token: string,
  accountId: string,
  timeRange: TimeRange
): Promise<SpotifyTrack[]> {
  const data = await apiFetch<{ items: SpotifyTrack[] }>(
    `/me/top/tracks?limit=50&time_range=${timeRange}`,
    token,
    accountId
  )
  return data.items
}

async function getTopArtists(
  token: string,
  accountId: string,
  timeRange: TimeRange
): Promise<SpotifyArtist[]> {
  const data = await apiFetch<{ items: SpotifyArtist[] }>(
    `/me/top/artists?limit=50&time_range=${timeRange}`,
    token,
    accountId
  )
  return data.items
}

async function getAudioFeatures(
  token: string,
  accountId: string,
  trackIds: string[]
): Promise<SpotifyAudioFeatures[]> {
  if (trackIds.length === 0) return []
  // Batch up to 100 ids
  const ids = trackIds.slice(0, 100).join(',')
  const data = await apiFetch<{ audio_features: SpotifyAudioFeatures[] }>(
    `/audio-features?ids=${ids}`,
    token,
    accountId
  )
  return (data.audio_features ?? []).filter(Boolean)
}

async function getRecentlyPlayed(
  token: string,
  accountId: string
): Promise<RecentlyPlayedItem[]> {
  const data = await apiFetch<{ items: RecentlyPlayedItem[] }>(
    '/me/player/recently-played?limit=50',
    token,
    accountId
  )
  return data.items ?? []
}

export async function fetchAllAccountData(
  accountId: string,
  accessToken: string
): Promise<AccountData> {
  const ranges: TimeRange[] = ['short_term', 'medium_term', 'long_term']

  const [shortTracks, medTracks, longTracks, shortArtists, medArtists, longArtists, recentlyPlayed] =
    await Promise.all([
      getTopTracks(accessToken, accountId, 'short_term'),
      getTopTracks(accessToken, accountId, 'medium_term'),
      getTopTracks(accessToken, accountId, 'long_term'),
      getTopArtists(accessToken, accountId, 'short_term'),
      getTopArtists(accessToken, accountId, 'medium_term'),
      getTopArtists(accessToken, accountId, 'long_term'),
      getRecentlyPlayed(accessToken, accountId),
    ])

  // Fetch audio features for short-term tracks (most recent)
  const allTrackIds = [
    ...shortTracks.map((t) => t.id),
    ...medTracks.map((t) => t.id),
    ...longTracks.map((t) => t.id),
  ]
  const uniqueIds = [...new Set(allTrackIds)]
  const audioFeatures = await getAudioFeatures(accessToken, accountId, uniqueIds.slice(0, 100))

  const featureMap = new Map(audioFeatures.map((f) => [f.id, f]))

  return {
    accountId,
    short_term: {
      tracks: shortTracks,
      artists: shortArtists,
      audioFeatures: shortTracks.map((t) => featureMap.get(t.id)).filter(Boolean) as SpotifyAudioFeatures[],
    },
    medium_term: {
      tracks: medTracks,
      artists: medArtists,
      audioFeatures: medTracks.map((t) => featureMap.get(t.id)).filter(Boolean) as SpotifyAudioFeatures[],
    },
    long_term: {
      tracks: longTracks,
      artists: longArtists,
      audioFeatures: longTracks.map((t) => featureMap.get(t.id)).filter(Boolean) as SpotifyAudioFeatures[],
    },
    recentlyPlayed,
    fetchedAt: Date.now(),
  }
}
