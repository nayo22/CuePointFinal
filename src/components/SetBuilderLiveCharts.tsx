import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const ORANGE = '#ff7a00'
const GREEN = '#00ff9c'
const AXIS = '#8b93a8'
const GRID = 'rgba(255,255,255,0.07)'

type Props = {
  bpms: number[]
  energySeries: number[]
}

export function SetBuilderLiveCharts({ bpms, energySeries }: Props) {
  const bpmData = bpms.map((bpm, i) => ({ index: i + 1, bpm }))
  const nrgData = energySeries.map((energy, i) => ({ index: i + 1, energy }))

  return (
    <>
      <section className="panel panel--accent-orange chart-panel">
        <h2>BPM chart</h2>
        <p className="chart-panel-hint mono">Updates when the track list changes</p>
        <div className="recharts-wrap">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={bpmData}
              margin={{ top: 10, right: 12, left: -8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis
                dataKey="index"
                tick={{ fill: AXIS, fontSize: 11 }}
                tickLine={{ stroke: GRID }}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: AXIS, fontSize: 11 }}
                tickLine={{ stroke: GRID }}
                width={44}
              />
              <Tooltip
                contentStyle={{
                  background: '#12151c',
                  border: `1px solid ${ORANGE}`,
                  borderRadius: 8,
                  fontSize: 13,
                }}
                labelStyle={{ color: AXIS }}
              />
              <Line
                type="monotone"
                dataKey="bpm"
                name="BPM"
                stroke={ORANGE}
                strokeWidth={2}
                dot={{ fill: ORANGE, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="panel panel--accent-green chart-panel">
        <h2>Energy curve</h2>
        <p className="chart-panel-hint mono">Low, Mid, High turned into numbers</p>
        <div className="recharts-wrap">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={nrgData}
              margin={{ top: 10, right: 12, left: -8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
              <XAxis
                dataKey="index"
                tick={{ fill: AXIS, fontSize: 11 }}
                tickLine={{ stroke: GRID }}
              />
              <YAxis
                domain={[0, 1]}
                tick={{ fill: AXIS, fontSize: 11 }}
                tickLine={{ stroke: GRID }}
                width={44}
              />
              <Tooltip
                contentStyle={{
                  background: '#12151c',
                  border: `1px solid ${GREEN}`,
                  borderRadius: 8,
                  fontSize: 13,
                }}
                labelStyle={{ color: AXIS }}
                formatter={(v) => [
                  typeof v === 'number' ? v.toFixed(2) : '—',
                  'Energy',
                ]}
              />
              <Line
                type="monotone"
                dataKey="energy"
                name="Energy"
                stroke={GREEN}
                strokeWidth={2}
                dot={{ fill: GREEN, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  )
}
