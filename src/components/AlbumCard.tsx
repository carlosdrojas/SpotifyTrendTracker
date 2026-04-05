import type { AggregatedAlbum } from '../types/spotify'

interface Props {
  album: AggregatedAlbum
  index: number
}

export default function AlbumCard({ album, index }: Props) {
  const year = album.releaseDate?.slice(0, 4) ?? ''

  return (
    <div className="group flex flex-col gap-3 p-4 rounded-xl hover:bg-spotify-card transition-colors cursor-default">
      <div className="relative">
        <div className="aspect-square w-full rounded-lg overflow-hidden bg-spotify-hover shadow-lg">
          {album.imageUrl ? (
            <img
              src={album.imageUrl}
              alt={album.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MusicIcon />
            </div>
          )}
        </div>
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/70 backdrop-blur flex items-center justify-center text-xs font-bold text-white">
          {index + 1}
        </div>
        {album.accountCount > 1 && (
          <div className="absolute bottom-2 right-2 bg-spotify-green/90 text-black text-xs font-bold px-2 py-0.5 rounded-full">
            {album.accountCount} accts
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm truncate">{album.name}</p>
        <p className="text-spotify-text text-xs truncate mt-0.5">
          {album.artist}
          {year && <span className="text-spotify-hover mx-1">·</span>}
          {year}
        </p>
        <p className="text-spotify-text text-xs mt-0.5">
          {album.trackCount} track{album.trackCount !== 1 ? 's' : ''} in your top
        </p>
      </div>
    </div>
  )
}

function MusicIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#535353"
      strokeWidth="1.5"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}
