import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface Props {
  genres: Array<{ genre: string; score: number }>
  maxItems?: number
}

const COLORS = [
  '#1DB954',
  '#1ed760',
  '#2ebd59',
  '#4caf6e',
  '#60a87a',
  '#74a186',
  '#889a91',
  '#9a9398',
  '#ab8da0',
  '#b877a8',
]

export default function GenreChart({ genres, maxItems = 10 }: Props) {
  const data = genres.slice(0, maxItems).map((g, i) => ({
    genre: g.genre.length > 18 ? g.genre.slice(0, 16) + '…' : g.genre,
    score: Math.round(g.score),
    fullGenre: g.genre,
    color: COLORS[i % COLORS.length],
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="genre"
          tick={{ fill: '#B3B3B3', fontSize: 12 }}
          width={130}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#282828',
            border: '1px solid #3E3E3E',
            borderRadius: 8,
            color: '#fff',
            fontSize: 13,
          }}
          formatter={(_: number, __: string, props: { payload?: { fullGenre?: string } }) => [
            props.payload?.fullGenre ?? '',
            '',
          ]}
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        />
        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
