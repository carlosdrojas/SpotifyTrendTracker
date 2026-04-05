export interface SpotifyAccount {
  id: string
  displayName: string
  email: string
  imageUrl?: string
  accessToken: string
  refreshToken: string | null
  expiresAt: number
  codeVerifier?: string
}

export interface SpotifyImage {
  url: string
  width: number
  height: number
}

export interface SpotifyArtistSimple {
  id: string
  name: string
}

export interface SpotifyAlbum {
  id: string
  name: string
  images: SpotifyImage[]
  release_date: string
  artists: SpotifyArtistSimple[]
  album_type: string
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtistSimple[]
  album: SpotifyAlbum
  duration_ms: number
  popularity: number
  external_urls: { spotify: string }
}

export interface SpotifyArtist {
  id: string
  name: string
  genres: string[]
  images: SpotifyImage[]
  popularity: number
  followers: { total: number }
  external_urls: { spotify: string }
}

export interface SpotifyAudioFeatures {
  id: string
  danceability: number
  energy: number
  valence: number
  tempo: number
  acousticness: number
  instrumentalness: number
  speechiness: number
  liveness: number
}

export interface RecentlyPlayedItem {
  track: SpotifyTrack
  played_at: string
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term'

export interface TimeRangeData {
  tracks: SpotifyTrack[]
  artists: SpotifyArtist[]
  audioFeatures?: SpotifyAudioFeatures[]
}

export interface AccountData {
  accountId: string
  short_term: TimeRangeData
  medium_term: TimeRangeData
  long_term: TimeRangeData
  recentlyPlayed: RecentlyPlayedItem[]
  fetchedAt: number
}

export interface AggregatedAlbum {
  id: string
  name: string
  artist: string
  imageUrl: string
  releaseDate: string
  score: number
  accountCount: number
  trackCount: number
}

export interface AggregatedTrack extends SpotifyTrack {
  score: number
  accountCount: number
  rank: number
}

export interface AggregatedArtist extends SpotifyArtist {
  score: number
  accountCount: number
  rank: number
}

export interface AggregatedProfile {
  tracks: AggregatedTrack[]
  artists: AggregatedArtist[]
  albums: AggregatedAlbum[]
  topGenres: Array<{ genre: string; score: number }>
  avgAudioFeatures: SpotifyAudioFeatures | null
}
