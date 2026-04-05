import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { fetchAllAccountData } from '../lib/spotify'
import { aggregateProfiles } from '../lib/aggregate'
import TrackCard from '../components/TrackCard'
import ArtistCard from '../components/ArtistCard'
import AlbumCard from '../components/AlbumCard'
import GenreChart from '../components/GenreChart'
import TimeRangeSelector from '../components/TimeRangeSelector'
import LoadingSpinner, { SkeletonCard } from '../components/LoadingSpinner'
import { initiateLogin } from '../lib/auth'
import clsx from 'clsx'

type Tab = 'tracks' | 'artists' | 'albums'

export default function Dashboard() {
  const navigate = useNavigate()
  const { accounts, accountData, selectedAccountIds, activeTimeRange, setAccountData } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('tracks')
  const [showCount, setShowCount] = useState(20)

  // Fetch data for accounts that don't have it or it's stale (>30 min)
  useEffect(() => {
    const STALE_MS = 30 * 60 * 1000
    const needsFetch = accounts.filter(
      (a) => !accountData[a.id] || Date.now() - accountData[a.id].fetchedAt > STALE_MS
    )

    if (needsFetch.length === 0) return

    setLoading(true)
    setError(null)

    Promise.allSettled(
      needsFetch.map((account) =>
        fetchAllAccountData(account.id, account.accessToken).then((data) => {
          setAccountData(account.id, data)
        })
      )
    ).then((results) => {
      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length > 0) {
        setError(`Failed to load data for ${failed.length} account(s). They may need to re-authenticate.`)
      }
      setLoading(false)
    })
  }, [accounts])

  const selectedData = useMemo(
    () => selectedAccountIds.map((id) => accountData[id]).filter(Boolean),
    [selectedAccountIds, accountData]
  )

  const profile = useMemo(() => {
    if (selectedData.length === 0) return null
    return aggregateProfiles(selectedData, activeTimeRange)
  }, [selectedData, activeTimeRange])

  const isMultiAccount = selectedAccountIds.length > 1

  if (accounts.length === 0) {
    navigate('/')
    return null
  }

  const isDataLoading = loading || selectedAccountIds.some((id) => !accountData[id])

  const tabs: { value: Tab; label: string; count?: number }[] = [
    { value: 'tracks', label: 'Tracks', count: profile?.tracks.length },
    { value: 'artists', label: 'Artists', count: profile?.artists.length },
    { value: 'albums', label: 'Albums', count: profile?.albums.length },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-spotify-text mt-1">
            {isMultiAccount
              ? `Aggregated from ${selectedAccountIds.length} accounts`
              : accounts.find((a) => a.id === selectedAccountIds[0])?.displayName ?? 'Your listening'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <TimeRangeSelector />
          <button
            onClick={() => initiateLogin()}
            className="text-sm text-spotify-text hover:text-white px-3 py-2 rounded-lg hover:bg-spotify-card transition-colors border border-white/10"
          >
            + Add Account
          </button>
        </div>
      </div>

      {/* Account chips */}
      {accounts.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {accounts.map((account) => {
            const isSelected = selectedAccountIds.includes(account.id)
            return (
              <button
                key={account.id}
                onClick={() => useStore.getState().toggleAccountSelection(account.id)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  isSelected
                    ? 'bg-spotify-green text-black'
                    : 'bg-spotify-card text-spotify-text hover:text-white'
                )}
              >
                {account.imageUrl ? (
                  <img src={account.imageUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                    {account.displayName[0]}
                  </div>
                )}
                {account.displayName}
              </button>
            )
          })}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Stats bar */}
      {profile && !isDataLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Top Genre" value={profile.topGenres[0]?.genre ?? '—'} />
          <StatCard
            label="Avg. Energy"
            value={
              profile.avgAudioFeatures
                ? `${Math.round(profile.avgAudioFeatures.energy * 100)}%`
                : '—'
            }
          />
          <StatCard
            label="Avg. Mood"
            value={
              profile.avgAudioFeatures
                ? moodLabel(profile.avgAudioFeatures.valence)
                : '—'
            }
          />
          <StatCard label="Genres Explored" value={String(profile.topGenres.length)} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-6">
        {tabs.map(({ value, label, count }) => (
          <button
            key={value}
            onClick={() => { setActiveTab(value); setShowCount(20) }}
            className={clsx(
              'px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px',
              activeTab === value
                ? 'border-spotify-green text-white'
                : 'border-transparent text-spotify-text hover:text-white'
            )}
          >
            {label}
            {count != null && (
              <span className="ml-1.5 text-xs opacity-60">{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Main content */}
      {isDataLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : !profile ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2">
            {activeTab === 'tracks' && (
              <div className="space-y-1">
                {profile.tracks.slice(0, showCount).map((track, i) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    index={i}
                    showAccountBadge={isMultiAccount}
                  />
                ))}
                {profile.tracks.length > showCount && (
                  <button
                    onClick={() => setShowCount((c) => c + 20)}
                    className="w-full mt-4 py-3 text-sm text-spotify-text hover:text-white border border-white/10 rounded-lg hover:bg-spotify-card transition-colors"
                  >
                    Show more
                  </button>
                )}
              </div>
            )}

            {activeTab === 'artists' && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {profile.artists.slice(0, showCount).map((artist, i) => (
                    <ArtistCard
                      key={artist.id}
                      artist={artist}
                      index={i}
                      showAccountBadge={isMultiAccount}
                    />
                  ))}
                </div>
                {profile.artists.length > showCount && (
                  <button
                    onClick={() => setShowCount((c) => c + 20)}
                    className="w-full mt-4 py-3 text-sm text-spotify-text hover:text-white border border-white/10 rounded-lg hover:bg-spotify-card transition-colors"
                  >
                    Show more
                  </button>
                )}
              </div>
            )}

            {activeTab === 'albums' && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {profile.albums.slice(0, showCount).map((album, i) => (
                    <AlbumCard key={album.id} album={album} index={i} />
                  ))}
                </div>
                {profile.albums.length > showCount && (
                  <button
                    onClick={() => setShowCount((c) => c + 20)}
                    className="w-full mt-4 py-3 text-sm text-spotify-text hover:text-white border border-white/10 rounded-lg hover:bg-spotify-card transition-colors"
                  >
                    Show more
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Genres */}
            <div className="bg-spotify-dark rounded-xl p-5">
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-spotify-text">
                Top Genres
              </h3>
              <GenreChart genres={profile.topGenres} maxItems={8} />
            </div>

            {/* Top tracks quick list */}
            {activeTab !== 'tracks' && (
              <div className="bg-spotify-dark rounded-xl p-5">
                <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-spotify-text">
                  Quick Top Tracks
                </h3>
                <div className="space-y-2">
                  {profile.tracks.slice(0, 5).map((track, i) => (
                    <div key={track.id} className="flex items-center gap-3">
                      <span className="text-xs text-spotify-text w-4 text-right">{i + 1}</span>
                      <img
                        src={track.album.images[2]?.url ?? track.album.images[0]?.url}
                        alt=""
                        className="w-8 h-8 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{track.name}</p>
                        <p className="text-xs text-spotify-text truncate">
                          {track.artists[0].name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-spotify-dark rounded-xl p-4">
      <p className="text-spotify-text text-xs mb-1 uppercase tracking-wider">{label}</p>
      <p className="font-bold text-lg capitalize truncate">{value}</p>
    </div>
  )
}

function moodLabel(valence: number): string {
  if (valence >= 0.7) return 'Happy'
  if (valence >= 0.5) return 'Upbeat'
  if (valence >= 0.3) return 'Neutral'
  if (valence >= 0.15) return 'Melancholic'
  return 'Dark'
}

function EmptyState() {
  return (
    <div className="text-center py-20 text-spotify-text">
      <p className="text-4xl mb-4">🎵</p>
      <p className="font-semibold">No accounts selected</p>
      <p className="text-sm mt-1">Select at least one account above to see your profile.</p>
    </div>
  )
}
