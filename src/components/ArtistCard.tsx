import type { AggregatedArtist } from '../types/spotify'

interface Props {
  artist: AggregatedArtist
  index: number
  showAccountBadge?: boolean
}

export default function ArtistCard({ artist, index, showAccountBadge }: Props) {
  const imageUrl = artist.images[0]?.url

  return (
    <a
      href={artist.external_urls.spotify}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-spotify-card transition-colors text-center"
    >
      <div className="relative">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-spotify-hover flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={artist.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PersonIcon />
            </div>
          )}
        </div>
        <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-spotify-green flex items-center justify-center text-black text-xs font-bold">
          {index + 1}
        </div>
      </div>

      <div className="min-w-0 w-full">
        <p className="font-semibold text-sm truncate">{artist.name}</p>
        <p className="text-spotify-text text-xs truncate capitalize mt-0.5">
          {artist.genres.slice(0, 2).join(' · ') || 'Artist'}
        </p>
        {showAccountBadge && artist.accountCount > 1 && (
          <span className="inline-block mt-1 text-xs bg-spotify-green/20 text-spotify-green px-2 py-0.5 rounded-full">
            {artist.accountCount} accounts
          </span>
        )}
      </div>
    </a>
  )
}

function PersonIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#535353"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}
