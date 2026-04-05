import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { initiateLogin } from '../lib/auth'
import { fetchAllAccountData } from '../lib/spotify'
import clsx from 'clsx'

export default function Accounts() {
  const navigate = useNavigate()
  const { accounts, accountData, removeAccount, setAccountData, selectedAccountIds, toggleAccountSelection } =
    useStore()
  const [refreshing, setRefreshing] = useState<string | null>(null)
  const [addingAccount, setAddingAccount] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (accounts.length === 0) {
    navigate('/')
    return null
  }

  const handleRefresh = async (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    if (!account) return

    setRefreshing(accountId)
    setError(null)
    try {
      const data = await fetchAllAccountData(account.id, account.accessToken)
      setAccountData(account.id, data)
    } catch (e) {
      setError(`Failed to refresh ${account.displayName}. Try re-connecting.`)
    } finally {
      setRefreshing(null)
    }
  }

  const handleAddAccount = async () => {
    setAddingAccount(true)
    try {
      await initiateLogin()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start login')
      setAddingAccount(false)
    }
  }

  const handleRemove = (id: string) => {
    const account = accounts.find((a) => a.id === id)
    if (!account) return
    if (
      window.confirm(
        `Remove ${account.displayName} from SpotifAI? Their data will be deleted locally.`
      )
    ) {
      removeAccount(id)
      if (useStore.getState().accounts.length === 0) navigate('/')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-spotify-text mt-1">Manage your connected Spotify accounts</p>
        </div>
        <button
          onClick={handleAddAccount}
          disabled={addingAccount}
          className="flex items-center gap-2 bg-spotify-green hover:bg-[#1ed760] disabled:opacity-60 text-black font-bold px-5 py-2.5 rounded-full transition-all text-sm"
        >
          {addingAccount ? (
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="black">
              <path d="M8 1.5a.5.5 0 0 1 .5.5v5.5H14a.5.5 0 0 1 0 1H8.5V14a.5.5 0 0 1-1 0V8.5H2a.5.5 0 0 1 0-1h5.5V2a.5.5 0 0 1 .5-.5z" />
            </svg>
          )}
          Add Account
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-8">
        {accounts.map((account) => {
          const data = accountData[account.id]
          const isSelected = selectedAccountIds.includes(account.id)
          const isRefreshing = refreshing === account.id
          const isExpired = Date.now() > account.expiresAt
          const dataAge = data ? Math.round((Date.now() - data.fetchedAt) / 60000) : null

          return (
            <div
              key={account.id}
              className={clsx(
                'bg-spotify-dark rounded-2xl p-5 border-2 transition-colors',
                isSelected ? 'border-spotify-green/50' : 'border-transparent'
              )}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-spotify-hover">
                    {account.imageUrl ? (
                      <img
                        src={account.imageUrl}
                        alt={account.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-spotify-green">
                        {account.displayName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-spotify-green rounded-full flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="black">
                        <path d="M1.5 5l2.5 2.5L8.5 2" strokeWidth="1.5" stroke="black" fill="none" strokeLinecap="round" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base">{account.displayName}</h3>
                    {isExpired && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                        Token expired
                      </span>
                    )}
                  </div>
                  <p className="text-spotify-text text-sm mt-0.5 truncate">{account.email}</p>
                  {dataAge != null && (
                    <p className="text-spotify-text text-xs mt-1">
                      Data {dataAge < 1 ? 'just updated' : `updated ${dataAge}m ago`}
                    </p>
                  )}
                  {!data && (
                    <p className="text-yellow-400 text-xs mt-1">No data loaded yet — go to Dashboard</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleAccountSelection(account.id)}
                    className={clsx(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                      isSelected
                        ? 'bg-spotify-green/20 text-spotify-green'
                        : 'bg-spotify-card text-spotify-text hover:text-white'
                    )}
                  >
                    {isSelected ? 'In Profile' : 'Include'}
                  </button>
                  <button
                    onClick={() => handleRefresh(account.id)}
                    disabled={isRefreshing}
                    title="Refresh data"
                    className="p-2 rounded-full text-spotify-text hover:text-white hover:bg-spotify-card transition-colors disabled:opacity-50"
                  >
                    <RefreshIcon spinning={isRefreshing} />
                  </button>
                  <button
                    onClick={() => handleRemove(account.id)}
                    title="Remove account"
                    className="p-2 rounded-full text-spotify-text hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>

              {/* Data summary */}
              {data && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <DataBadge
                    label="Short Term"
                    tracks={data.short_term.tracks.length}
                    artists={data.short_term.artists.length}
                  />
                  <DataBadge
                    label="Medium Term"
                    tracks={data.medium_term.tracks.length}
                    artists={data.medium_term.artists.length}
                  />
                  <DataBadge
                    label="Long Term"
                    tracks={data.long_term.tracks.length}
                    artists={data.long_term.artists.length}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Aggregate info */}
      {accounts.length > 1 && (
        <div className="bg-spotify-dark rounded-2xl p-5">
          <h3 className="font-bold mb-2">Aggregate Profile</h3>
          <p className="text-spotify-text text-sm">
            {selectedAccountIds.length} of {accounts.length} accounts included in your aggregate profile.{' '}
            {selectedAccountIds.length < accounts.length && (
              <button
                onClick={() => useStore.getState().selectAllAccounts()}
                className="text-spotify-green hover:underline"
              >
                Include all
              </button>
            )}
          </p>
          <p className="text-spotify-text text-xs mt-2">
            Songs and artists that appear in multiple accounts get higher scores in the aggregate ranking.
          </p>
        </div>
      )}
    </div>
  )
}

function DataBadge({
  label,
  tracks,
  artists,
}: {
  label: string
  tracks: number
  artists: number
}) {
  return (
    <div className="bg-spotify-black/50 rounded-xl p-3 text-center">
      <p className="text-xs text-spotify-text mb-1">{label}</p>
      <p className="text-sm font-semibold">{tracks} tracks</p>
      <p className="text-xs text-spotify-text">{artists} artists</p>
    </div>
  )
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={spinning ? 'animate-spin' : ''}
    >
      <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
      <path
        fillRule="evenodd"
        d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
      />
    </svg>
  )
}
