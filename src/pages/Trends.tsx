import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { aggregateProfiles, computeEras } from '../lib/aggregate'
import AudioFeaturesChart from '../components/AudioFeaturesChart'
import GenreChart from '../components/GenreChart'
import type { TimeRange } from '../types/spotify'
import clsx from 'clsx'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const ERA_COLORS: Record<TimeRange, string> = {
  short_term: '#1DB954',
  medium_term: '#1e90ff',
  long_term: '#9b59b6',
}

const ERA_LABELS: Record<TimeRange, string> = {
  short_term: 'Last 4 Weeks',
  medium_term: 'Last 6 Months',
  long_term: 'All Time',
}

export default function Trends() {
  const navigate = useNavigate()
  const { accounts, accountData, selectedAccountIds } = useStore()
  const [selectedEra, setSelectedEra] = useState<TimeRange | null>(null)

  const selectedData = useMemo(
    () => selectedAccountIds.map((id) => accountData[id]).filter(Boolean),
    [selectedAccountIds, accountData]
  )

  const eras = useMemo(() => {
    if (selectedData.length === 0) return []
    return computeEras(selectedData)
  }, [selectedData])

  const profiles = useMemo(() => {
    if (selectedData.length === 0) return null
    return {
      short_term: aggregateProfiles(selectedData, 'short_term'),
      medium_term: aggregateProfiles(selectedData, 'medium_term'),
      long_term: aggregateProfiles(selectedData, 'long_term'),
    }
  }, [selectedData])

  if (accounts.length === 0) {
    navigate('/')
    return null
  }

  if (selectedData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center py-20 text-spotify-text">
        <p className="text-4xl mb-4">📈</p>
        <p>No data yet. Go to Dashboard to load your listening data.</p>
      </div>
    )
  }

  // Build genre overlap data (genres that appear across multiple time ranges)
  const genreOverlap = computeGenreOverlap(profiles!)

  // Build artist trajectory data (artists that appear across multiple time ranges)
  const artistTrajectory = computeArtistTrajectory(profiles!)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Trends & Eras</h1>
        <p className="text-spotify-text mt-1">
          How your listening has evolved across time
        </p>
      </div>

      {/* Era cards */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-4">Your Listening Eras</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {eras.map((era) => (
            <button
              key={era.timeRange}
              onClick={() =>
                setSelectedEra(selectedEra === era.timeRange ? null : era.timeRange)
              }
              className={clsx(
                'text-left p-5 rounded-2xl border-2 transition-all',
                selectedEra === era.timeRange
                  ? 'border-spotify-green bg-spotify-green/10'
                  : 'border-white/10 bg-spotify-dark hover:border-white/30'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                  style={{
                    background: ERA_COLORS[era.timeRange] + '20',
                    color: ERA_COLORS[era.timeRange],
                  }}
                >
                  {ERA_LABELS[era.timeRange]}
                </span>
                <span className="text-2xl">{eraEmoji(era.timeRange)}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-xs text-spotify-text uppercase tracking-wide mb-1">
                    Dominant Decade
                  </p>
                  <p className="font-bold text-lg">{era.dominantDecade}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-spotify-text mb-1">Top Artists</p>
                  <p className="text-sm font-medium truncate">{era.topArtists.slice(0, 3).join(', ')}</p>
                </div>
                <div>
                  <p className="text-xs text-spotify-text mb-1">Top Genres</p>
                  <p className="text-sm capitalize truncate">{era.topGenres.slice(0, 3).join(', ')}</p>
                </div>
              </div>

              {era.avgFeatures && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <MiniStat
                    label="Energy"
                    value={Math.round(era.avgFeatures.energy * 100) + '%'}
                    color={ERA_COLORS[era.timeRange]}
                  />
                  <MiniStat
                    label="Mood"
                    value={Math.round(era.avgFeatures.valence * 100) + '%'}
                    color={ERA_COLORS[era.timeRange]}
                  />
                  <MiniStat
                    label="Dance"
                    value={Math.round(era.avgFeatures.danceability * 100) + '%'}
                    color={ERA_COLORS[era.timeRange]}
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Audio profile comparison */}
      {profiles && (
        <section className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-spotify-dark rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-1">Sound Profile Over Time</h2>
              <p className="text-spotify-text text-sm mb-5">
                How your music taste has shifted
              </p>
              <AudioFeaturesChart
                features={[
                  {
                    label: 'Last 4 Weeks',
                    features: profiles.short_term.avgAudioFeatures,
                    color: ERA_COLORS.short_term,
                  },
                  {
                    label: 'Last 6 Months',
                    features: profiles.medium_term.avgAudioFeatures,
                    color: ERA_COLORS.medium_term,
                  },
                  {
                    label: 'All Time',
                    features: profiles.long_term.avgAudioFeatures,
                    color: ERA_COLORS.long_term,
                  },
                ].filter((f) => f.features != null)}
              />
            </div>

            {/* Genre evolution */}
            <div className="bg-spotify-dark rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-1">Genre Shifts</h2>
              <p className="text-spotify-text text-sm mb-5">
                {selectedEra
                  ? `Top genres for ${ERA_LABELS[selectedEra]}`
                  : 'Select an era above to drill down'}
              </p>
              <GenreChart
                genres={
                  selectedEra
                    ? profiles[selectedEra].topGenres
                    : profiles.medium_term.topGenres
                }
                maxItems={10}
              />
            </div>
          </div>
        </section>
      )}

      {/* Artist trajectory */}
      {artistTrajectory.length > 0 && (
        <section className="mb-10 bg-spotify-dark rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-1">Artist Trajectory</h2>
          <p className="text-spotify-text text-sm mb-6">
            Artists that appear across multiple time periods (lower rank = more prominent)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={[
              { period: '4 Weeks', ...buildArtistRankData(artistTrajectory, profiles!, 'short_term') },
              { period: '6 Months', ...buildArtistRankData(artistTrajectory, profiles!, 'medium_term') },
              { period: 'All Time', ...buildArtistRankData(artistTrajectory, profiles!, 'long_term') },
            ]}>
              <CartesianGrid stroke="#282828" strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fill: '#B3B3B3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                reversed
                domain={[1, 50]}
                tick={{ fill: '#B3B3B3', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Rank', angle: -90, position: 'insideLeft', fill: '#B3B3B3', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: '#282828',
                  border: '1px solid #3E3E3E',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 13,
                }}
                formatter={(value: number, name: string) => [`#${value}`, name]}
              />
              {artistTrajectory.slice(0, 6).map((artist, i) => (
                <Line
                  key={artist.id}
                  type="monotone"
                  dataKey={artist.name}
                  stroke={TRAJECTORY_COLORS[i % TRAJECTORY_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: TRAJECTORY_COLORS[i % TRAJECTORY_COLORS.length] }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-4">
            {artistTrajectory.slice(0, 6).map((artist, i) => (
              <div key={artist.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: TRAJECTORY_COLORS[i % TRAJECTORY_COLORS.length] }}
                />
                <span className="text-sm text-spotify-text">{artist.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Genre overlap - artists in common */}
      {genreOverlap.length > 0 && (
        <section className="bg-spotify-dark rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-1">Consistent Genres</h2>
          <p className="text-spotify-text text-sm mb-5">
            Genres that have stayed in your top 20 across all time periods
          </p>
          <div className="flex flex-wrap gap-2">
            {genreOverlap.map(({ genre, count }) => (
              <span
                key={genre}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-sm font-medium capitalize',
                  count === 3
                    ? 'bg-spotify-green text-black'
                    : count === 2
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-spotify-card text-spotify-text'
                )}
              >
                {genre}
                {count === 3 && <span className="ml-1.5 text-xs">✓ All eras</span>}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const TRAJECTORY_COLORS = ['#1DB954', '#1e90ff', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c']

function eraEmoji(range: TimeRange) {
  return { short_term: '🔥', medium_term: '📻', long_term: '🏆' }[range]
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-black/20 rounded-lg p-2 text-center">
      <p className="text-xs text-spotify-text mb-0.5">{label}</p>
      <p className="text-sm font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  )
}

type ProfilesMap = {
  short_term: ReturnType<typeof aggregateProfiles>
  medium_term: ReturnType<typeof aggregateProfiles>
  long_term: ReturnType<typeof aggregateProfiles>
}

function computeGenreOverlap(profiles: ProfilesMap) {
  const counts = new Map<string, number>()
  for (const range of ['short_term', 'medium_term', 'long_term'] as TimeRange[]) {
    profiles[range].topGenres.slice(0, 20).forEach(({ genre }) => {
      counts.set(genre, (counts.get(genre) ?? 0) + 1)
    })
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => ({ genre, count }))
}

function computeArtistTrajectory(profiles: ProfilesMap) {
  const artistRanks = new Map<string, { id: string; name: string; ranges: Set<TimeRange> }>()

  for (const range of ['short_term', 'medium_term', 'long_term'] as TimeRange[]) {
    profiles[range].artists.slice(0, 30).forEach((artist) => {
      if (!artistRanks.has(artist.id)) {
        artistRanks.set(artist.id, { id: artist.id, name: artist.name, ranges: new Set() })
      }
      artistRanks.get(artist.id)!.ranges.add(range)
    })
  }

  return [...artistRanks.values()]
    .filter((a) => a.ranges.size >= 2)
    .slice(0, 8)
}

function buildArtistRankData(
  artists: Array<{ id: string; name: string }>,
  profiles: ProfilesMap,
  range: TimeRange
): Record<string, number | undefined> {
  const result: Record<string, number | undefined> = {}
  for (const artist of artists) {
    const idx = profiles[range].artists.findIndex((a) => a.id === artist.id)
    result[artist.name] = idx >= 0 ? idx + 1 : undefined
  }
  return result
}
