export default function LoadingSpinner({ message = 'Loading your music...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-spotify-card" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-spotify-green animate-spin" />
      </div>
      <p className="text-spotify-text text-sm">{message}</p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg animate-pulse">
      <div className="w-6 h-4 bg-spotify-card rounded" />
      <div className="w-12 h-12 rounded bg-spotify-card flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-spotify-card rounded w-3/4" />
        <div className="h-2 bg-spotify-card rounded w-1/2" />
      </div>
    </div>
  )
}
