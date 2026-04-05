import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import type { SpotifyAudioFeatures } from '../types/spotify'

interface Props {
  features: Array<{
    label: string
    features: SpotifyAudioFeatures | null
    color: string
  }>
}

const featureKeys: { key: keyof SpotifyAudioFeatures; label: string }[] = [
  { key: 'energy', label: 'Energy' },
  { key: 'danceability', label: 'Dance' },
  { key: 'valence', label: 'Mood' },
  { key: 'acousticness', label: 'Acoustic' },
  { key: 'instrumentalness', label: 'Instrumental' },
  { key: 'liveness', label: 'Live' },
  { key: 'speechiness', label: 'Speech' },
]

export default function AudioFeaturesChart({ features }: Props) {
  const data = featureKeys.map(({ key, label }) => {
    const entry: Record<string, string | number> = { feature: label }
    for (const { label: seriesLabel, features: f } of features) {
      if (f) {
        entry[seriesLabel] = Math.round((f[key] as number) * 100)
      }
    }
    return entry
  })

  if (features.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-spotify-text text-sm">
        Audio features unavailable for this app
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data}>
        <PolarGrid stroke="#3E3E3E" />
        <PolarAngleAxis
          dataKey="feature"
          tick={{ fill: '#B3B3B3', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            background: '#282828',
            border: '1px solid #3E3E3E',
            borderRadius: 8,
            color: '#fff',
            fontSize: 13,
          }}
          formatter={(value: number) => [`${value}%`]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#B3B3B3' }}
        />
        {features.map(({ label, color }) => (
          <Radar
            key={label}
            name={label}
            dataKey={label}
            stroke={color}
            fill={color}
            fillOpacity={0.2}
            dot={false}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  )
}
