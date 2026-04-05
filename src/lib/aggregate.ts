import type {
  AccountData,
  AggregatedProfile,
  AggregatedTrack,
  AggregatedArtist,
  AggregatedAlbum,
  SpotifyAudioFeatures,
  TimeRange,
} from '../types/spotify'

// Score = 50 for rank 1, decreasing by 1 each rank. Multiple accounts add together.
function rankScore(rank: number): number {
  return Math.max(0, 51 - rank)
}

export function aggregateProfiles(
  accountDataList: AccountData[],
  timeRange: TimeRange
): AggregatedProfile {
  const trackScores = new Map<string, { track: AggregatedTrack; score: number; count: number }>()
  const artistScores = new Map<string, { artist: AggregatedArtist; score: number; count: number }>()
  const albumScores = new Map<
    string,
    { album: AggregatedAlbum; score: number; count: number; trackCount: number }
  >()
  const genreScores = new Map<string, number>()

  for (const data of accountDataList) {
    const rangeData = data[timeRange]

    // Tracks
    rangeData.tracks.forEach((track, idx) => {
      const score = rankScore(idx + 1)
      const existing = trackScores.get(track.id)
      if (existing) {
        existing.score += score
        existing.count += 1
      } else {
        trackScores.set(track.id, {
          track: { ...track, score, accountCount: 1, rank: idx + 1 },
          score,
          count: 1,
        })
      }

      // Album scores from track rankings
      const albumId = track.album.id
      const albumExisting = albumScores.get(albumId)
      const albumImageUrl = track.album.images[0]?.url ?? ''
      if (albumExisting) {
        albumExisting.score += score * 0.8
        albumExisting.trackCount += 1
      } else {
        albumScores.set(albumId, {
          album: {
            id: albumId,
            name: track.album.name,
            artist: track.album.artists[0]?.name ?? '',
            imageUrl: albumImageUrl,
            releaseDate: track.album.release_date,
            score: score * 0.8,
            accountCount: 1,
            trackCount: 1,
          },
          score: score * 0.8,
          count: 1,
          trackCount: 1,
        })
      }
    })

    // Artists
    rangeData.artists.forEach((artist, idx) => {
      const score = rankScore(idx + 1)
      const existing = artistScores.get(artist.id)
      if (existing) {
        existing.score += score
        existing.count += 1
      } else {
        artistScores.set(artist.id, {
          artist: { ...artist, score, accountCount: 1, rank: idx + 1 },
          score,
          count: 1,
        })
      }

      // Genre scores
      ;(artist.genres ?? []).forEach((genre) => {
        genreScores.set(genre, (genreScores.get(genre) ?? 0) + score)
      })
    })
  }

  // Sort and finalize tracks
  const tracks: AggregatedTrack[] = [...trackScores.values()]
    .sort((a, b) => b.score - a.score)
    .map(({ track, score, count }, idx) => ({
      ...track,
      score,
      accountCount: count,
      rank: idx + 1,
    }))

  // Sort and finalize artists
  const artists: AggregatedArtist[] = [...artistScores.values()]
    .sort((a, b) => b.score - a.score)
    .map(({ artist, score, count }, idx) => ({
      ...artist,
      score,
      accountCount: count,
      rank: idx + 1,
    }))

  // Sort and finalize albums
  const albums: AggregatedAlbum[] = [...albumScores.values()]
    .sort((a, b) => b.score - a.score)
    .map(({ album, score, count, trackCount }) => ({
      ...album,
      score,
      accountCount: count,
      trackCount,
    }))

  // Sort genres
  const topGenres = [...genreScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([genre, score]) => ({ genre, score }))

  // Average audio features across all accounts
  const avgAudioFeatures = computeAvgAudioFeatures(accountDataList, timeRange)

  return { tracks, artists, albums, topGenres, avgAudioFeatures }
}

function computeAvgAudioFeatures(
  accountDataList: AccountData[],
  timeRange: TimeRange
): SpotifyAudioFeatures | null {
  const allFeatures: SpotifyAudioFeatures[] = []
  for (const data of accountDataList) {
    const features = data[timeRange].audioFeatures
    if (features) allFeatures.push(...features)
  }
  if (allFeatures.length === 0) return null

  const keys: (keyof SpotifyAudioFeatures)[] = [
    'danceability',
    'energy',
    'valence',
    'acousticness',
    'instrumentalness',
    'speechiness',
    'liveness',
    'tempo',
  ]

  const avg: Record<string, string | number> = { id: 'aggregate' }
  for (const key of keys) {
    const values = allFeatures.map((f) => f[key] as number).filter((v) => v != null)
    avg[key as string] = values.reduce((s, v) => s + v, 0) / values.length
  }

  return avg as unknown as SpotifyAudioFeatures
}

export interface EraSnapshot {
  label: string
  timeRange: TimeRange
  topTracks: string[]
  topArtists: string[]
  topGenres: string[]
  avgFeatures: SpotifyAudioFeatures | null
  dominantDecade: string
}

export function computeEras(accountDataList: AccountData[]): EraSnapshot[] {
  const ranges: { range: TimeRange; label: string }[] = [
    { range: 'short_term', label: 'Last 4 Weeks' },
    { range: 'medium_term', label: 'Last 6 Months' },
    { range: 'long_term', label: 'All Time' },
  ]

  return ranges.map(({ range, label }) => {
    const profile = aggregateProfiles(accountDataList, range)

    // Find dominant release decade
    const decades: Record<string, number> = {}
    profile.tracks.slice(0, 20).forEach((t) => {
      const year = parseInt(t.album.release_date?.slice(0, 4) ?? '0', 10)
      if (year > 0) {
        const decade = `${Math.floor(year / 10) * 10}s`
        decades[decade] = (decades[decade] ?? 0) + 1
      }
    })
    const dominantDecade =
      Object.entries(decades).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Unknown'

    return {
      label,
      timeRange: range,
      topTracks: profile.tracks.slice(0, 5).map((t) => t.name),
      topArtists: profile.artists.slice(0, 5).map((a) => a.name),
      topGenres: profile.topGenres.slice(0, 5).map((g) => g.genre),
      avgFeatures: profile.avgAudioFeatures,
      dominantDecade,
    }
  })
}
