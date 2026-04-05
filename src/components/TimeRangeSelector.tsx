import clsx from 'clsx'
import type { TimeRange } from '../types/spotify'
import { useStore } from '../store/useStore'

const RANGES: { value: TimeRange; label: string; desc: string }[] = [
  { value: 'short_term', label: '4 Weeks', desc: 'Last month' },
  { value: 'medium_term', label: '6 Months', desc: 'Half year' },
  { value: 'long_term', label: 'All Time', desc: 'Career best' },
]

export default function TimeRangeSelector() {
  const { activeTimeRange, setActiveTimeRange } = useStore()

  return (
    <div className="flex gap-2">
      {RANGES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setActiveTimeRange(value)}
          className={clsx(
            'px-4 py-2 rounded-full text-sm font-medium transition-all',
            activeTimeRange === value
              ? 'bg-white text-black'
              : 'bg-spotify-card text-spotify-text hover:text-white hover:bg-spotify-hover'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
