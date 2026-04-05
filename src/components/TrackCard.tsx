import clsx from 'clsx'
import type { AggregatedTrack } from '../types/spotify'

interface Props {
  track: AggregatedTrack
  index: number
  showAccountBadge?: boolean
}

export default function TrackCard({ track, index, showAccountBadge }: Props) {
  const imageUrl = track.album.images[1]?.url ?? track.album.images[0]?.url
  const minutes = Math.floor(track.duration_ms / 60000)
  const seconds = Math.floor((track.duration_ms % 60000) / 1000)
    .toString()
    .padStart(2, '0')

  return (
    <a
      href={track.external_urls.spotify}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-spotify-card transition-colors group"
    >
      <span className="w-6 text-right text-spotify-text text-sm flex-shrink-0 font-medium">
        {index + 1}
      </span>
      <div className="relative flex-shrink-0">
        <img
          src={imageUrl}
          alt={track.album.name}
          className="w-12 h-12 rounded object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded">
          <PlayIcon />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate text-white">{track.name}</p>
        <p className="text-spotify-text text-xs truncate">
          {track.artists.map((a) => a.name).join(', ')}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {showAccountBadge && track.accountCount > 1 && (
          <span className="text-xs bg-spotify-green/20 text-spotify-green px-2 py-0.5 rounded-full">
            {track.accountCount} accts
          </span>
        )}
        <span className="text-spotify-text text-xs tabular-nums">
          {minutes}:{seconds}
        </span>
      </div>
    </a>
  )
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
      <path d="M3 2.69a.5.5 0 0 1 .752-.432l10 5.31a.5.5 0 0 1 0 .864l-10 5.31A.5.5 0 0 1 3 13.31V2.69z" />
    </svg>
  )
}

interface AlbumArtGridProps {
  imageUrls: string[]
  size?: 'sm' | 'md' | 'lg'
}

export function AlbumArtGrid({ imageUrls, size = 'md' }: AlbumArtGridProps) {
  const sizeClass = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-24 h-24' }[size]
  const imgs = imageUrls.slice(0, 4)

  if (imgs.length === 1) {
    return (
      <img src={imgs[0]} alt="" className={clsx(sizeClass, 'rounded object-cover flex-shrink-0')} />
    )
  }

  return (
    <div className={clsx(sizeClass, 'grid grid-cols-2 gap-px rounded overflow-hidden flex-shrink-0')}>
      {[0, 1, 2, 3].map((i) => (
        <img
          key={i}
          src={imgs[i] ?? imgs[imgs.length - 1]}
          alt=""
          className="w-full h-full object-cover"
        />
      ))}
    </div>
  )
}
