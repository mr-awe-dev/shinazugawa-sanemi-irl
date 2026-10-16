import { useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { addDays, todayKey, type DailyLog } from '../lib/schema'
import { getProgress } from '../lib/stats'
import { riseChild, staggerParent } from '../lib/anim-variants'
import { IconActivity, IconChart, IconDroplet, IconFlame, IconMoon } from './icons'

// Grafik perkembangan murni SVG (tanpa dependensi) + perbandingan vs periode sebelumnya.
// Periode berjalan N hari terakhir, pembanding N hari sebelumnya. Domain tiap metrik
// dibuat tetap agar perbandingan antar-periode jujur.

type Range = 7 | 30

function lastKeys(n: number, end: string): string[] {
  return Array.from({ length: n }, (_, i) => addDays(end, i - n + 1))
}

function shortDate(key: string): string {
  const [, m, d] = key.split('-')
  return `${Number(d)}/${Number(m)}`
}

function avgOf(nums: Array<number | undefined>): number | null {
  const v = nums.filter((x): x is number => typeof x === 'number' && Number.isFinite(x))
  if (v.length === 0) return null
  return v.reduce((a, b) => a + b, 0) / v.length
}

function fmtID(n: number): string {
  return n.toLocaleString('id-ID')
}

type MetricDef = {
  key: 'protein_g' | 'air_L' | 'langkah' | 'tidur_jam'
  label: string
  unit: string
  icon: ReactNode
  domain: [number, number]
  band: [number, number] // pita target (zona Sanemi)
  decimals: number
}

const METRICS: MetricDef[] = [
  { key: 'protein_g', label: 'Protein', unit: 'g', icon: <IconFlame />, domain: [0, 250], band: [140, 160], decimals: 0 },
  { key: 'air_L', label: 'Air', unit: 'L', icon: <IconDroplet />, domain: [0, 6], band: [3, 4], decimals: 1 },
  { key: 'langkah', label: 'Langkah', unit: '', icon: <IconActivity />, domain: [0, 15000], band: [8000, 10000], decimals: 0 },
  { key: 'tidur_jam', label: 'Tidur', unit: 'jam', icon: <IconMoon />, domain: [0, 12], band: [7, 8], decimals: 1 },
]

function fmtVal(v: number, m: MetricDef): string {
  const num = m.decimals === 0 ? fmtID(Math.round(v)) : v.toFixed(m.decimals)
  return m.unit ? `${num} ${m.unit}` : num
}

// ---------- Sparkline SVG ----------
function Sparkline({
  label, values, keys, domain, band, decimals,
}: {
  label: string; values: Array<number | undefined>; keys: string[]
  domain: [number, number]; band: [number, number]; decimals: number
}) {
  const W = 320, H = 150, PL = 30, PR = 8, PT = 10, PB = 22
  const plotW = W - PL - PR, plotH = H - PT - PB
  const [d0, d1] = domain
  const n = values.length
  const x = (i: number) => (n === 1 ? PL + plotW / 2 : PL + (i / (n - 1)) * plotW)
  const y = (v: number) => PT + (1 - (Math.min(d1, Math.max(d0, v)) - d0) / (d1 - d0)) * plotH
  const yBand0 = y(band[0]), yBand1 = y(band[1])

  // Pecah garis pada hari yang belum diisi (jujur: gap, bukan nol)
  const segments: string[] = []
  let cur: string[] = []
  values.forEach((v, i) => {
    if (v === undefined) {
      if (cur.length > 1) segments.push(`M${cur.join('L')}`)
      cur = []
    } else {
      cur.push(`${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    }
  })
  if (cur.length === 1) cur.push(cur[0]) // satu titik: gambar dot saja via circle
  if (cur.length > 1) segments.push(`M${cur.join('L')}`)

  const defined = values.filter((v) => v !== undefined).length
  const idx = [0, Math.floor((n - 1) / 2), n - 1]

  return (
    <svg
      className="spark" viewBox={`0 0 ${W} ${H}`} role="img"
      aria-label={`Grafik ${label}: ${defined} dari ${n} hari terisi`}
    >
      <title>{label} — {defined}/{n} hari terisi</title>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={PL} x2={W - PR} y1={PT + plotH * f} y2={PT + plotH * f}
          className="chart-grid-line" />
      ))}
      <rect x={PL} y={yBand1} width={plotW} height={Math.max(2, yBand0 - yBand1)}
        className="chart-band" />
      <line x1={PL} x2={W - PR} y1={yBand0} y2={yBand0} className="chart-band-line" />
      {segments.map((d, i) => (
        <motion.path key={i} d={d} className="chart-line"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }} />
      ))}
      {segments.length > 0 && (
        <motion.path d={`${segments.join(' ')}L${x(n - 1).toFixed(1)},${(PT + plotH).toFixed(1)}L${x(0).toFixed(1)},${(PT + plotH).toFixed(1)}Z`}
          className="chart-area"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.3 }} />
      )}
      {values.map((v, i) =>
        v === undefined ? null : (
          <circle key={i} cx={x(i)} cy={y(v)} r={n > 10 ? 2 : 3.2} className="chart-dot">
            <title>{shortDate(keys[i])}: {decimals === 0 ? fmtID(Math.round(v)) : v.toFixed(decimals)}</title>
          </circle>
        ),
      )}
      <text x={4} y={PT + 8} className="spark-y">{d1}</text>
      <text x={4} y={PT + plotH} className="spark-y">{d0}</text>
      {idx.map((i) => (
        <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="spark-x">
          {shortDate(keys[i])}
        </text>
      ))}
    </svg>
  )
}

function Delta({ cur, prev, m }: { cur: number | null; prev: number | null; m: Pick<MetricDef, 'decimals' | 'unit'> }) {
  if (cur === null) return <span className="delta neutral">belum ada data</span>
  if (prev === null) return <span className="delta neutral">periode pembanding kosong</span>
  const d = cur - prev
  const sign = d > 0 ? '+' : d < 0 ? '−' : '±'
  const mag = Math.abs(d).toFixed(m.decimals)
  const cls = d > 0 ? 'up' : d < 0 ? 'down' : 'neutral'
  const word = d > 0 ? 'naik' : d < 0 ? 'turun' : 'stabil'
  return (
    <span className={`delta ${cls}`} aria-label={`${word} ${mag} dibanding periode sebelumnya`}>
      {sign}{m.decimals === 0 ? fmtID(Math.round(Math.abs(d))) : mag}{m.unit ? ` ${m.unit}` : ''} vs lalu
    </span>
  )
}

// ---------- Tab utama ----------
export default function Charts({ all }: { all: Record<string, DailyLog> }) {
  const [range, setRange] = useState<Range>(7)
  const end = todayKey()
  const keys = lastKeys(range, end)
  const prevKeys = lastKeys(range, addDays(end, -range))

  const metricData = METRICS.map((m) => {
    const cur = keys.map((k) => all[k]?.[m.key] as number | undefined)
    const prev = prevKeys.map((k) => all[k]?.[m.key] as number | undefined)
    return { m, cur, prev, avgCur: avgOf(cur), avgPrev: avgOf(prev), filled: cur.filter((v) => v !== undefined).length }
  })

  const compCur = keys.map((k) => (all[k] ? getProgress(all[k]).pct : undefined))
  const compPrev = prevKeys.map((k) => (all[k] ? getProgress(all[k]).pct : undefined))
  const compAvgCur = avgOf(compCur)
  const compAvgPrev = avgOf(compPrev)
  const compFilled = compCur.filter((v) => v !== undefined).length

  return (
    <div>
      <div className="charts-head">
        <p className="muted">
          {range} hari terakhir vs {range} hari sebelumnya. Pita ungu = zona target Sanemi. Hari kosong = belum diisi, bukan nol.
        </p>
        <div className="range-seg" role="group" aria-label="Rentang grafik">
          {([7, 30] as Range[]).map((r) => (
            <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}
              aria-pressed={range === r}>
              {r} hari
            </button>
          ))}
        </div>
      </div>

      <motion.div className="compare-grid" variants={staggerParent} initial="hidden" animate="show">
        {metricData.map(({ m, avgCur, avgPrev }) => (
          <motion.div key={m.key} variants={riseChild} className="card metric-card">
            <span className="field-icon">{m.icon}</span>
            <div>
              <div className="metric-value">{avgCur === null ? '—' : fmtVal(avgCur, m)}</div>
              <div className="card-target">{m.label} • rata-rata</div>
              <Delta cur={avgCur} prev={avgPrev} m={m} />
            </div>
          </motion.div>
        ))}
        <motion.div variants={riseChild} className="card metric-card">
          <span className="field-icon"><IconChart /></span>
          <div>
            <div className="metric-value">{compAvgCur === null ? '—' : `${Math.round(compAvgCur)}%`}</div>
            <div className="card-target">Completion • rata-rata</div>
            <Delta cur={compAvgCur} prev={compAvgPrev} m={{ decimals: 0, unit: '%' }} />
          </div>
        </motion.div>
      </motion.div>

      <div className="charts-grid" key={range}>
        {metricData.map(({ m, cur, filled }) => (
          <section key={m.key} className="card chart-card" aria-label={`Grafik ${m.label}`}>
            <div className="card-head">
              <span className="field-icon">{m.icon}</span>
              <div>
                <div className="card-title">{m.label}</div>
                <div className="card-target">{filled}/{range} hari terisi</div>
              </div>
            </div>
            {filled === 0 ? (
              <p className="chart-empty">Belum ada data — isi checklist harian agar grafik terisi.</p>
            ) : (
              <Sparkline label={m.label} values={cur} keys={keys}
                domain={m.domain} band={m.band} decimals={m.decimals} />
            )}
          </section>
        ))}

        <section className="card chart-card wide" aria-label="Grafik completion harian">
          <div className="card-head">
            <span className="field-icon"><IconChart /></span>
            <div>
              <div className="card-title">Completion harian</div>
              <div className="card-target">{compFilled}/{range} hari terisi • hijau ≥75% • ungu 50–74% • merah &lt;50%</div>
            </div>
          </div>
          {compFilled === 0 ? (
            <p className="chart-empty">Belum ada data — isi checklist harian agar grafik terisi.</p>
          ) : (
            <div className={`bars cols-${range}`} role="img"
              aria-label={`Completion ${range} hari terakhir, rata-rata ${compAvgCur === null ? 0 : Math.round(compAvgCur)} persen`}>
              {keys.map((k, bi) => {
                const v = all[k] ? getProgress(all[k]).pct : 0
                const filled = all[k] !== undefined
                const cls = !filled ? 'empty' : v >= 75 ? 'good' : v >= 50 ? 'mid' : 'low'
                return (
                  <div key={k} className="bar-col" title={`${shortDate(k)}: ${filled ? `${v}%` : 'belum diisi'}`}>
                    <div className="bar-track">
                      <motion.div
                        className={`bar-fill ${cls}`}
                        style={{ height: `${v}%`, transformOrigin: 'bottom' }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.45, delay: Math.min(bi * 0.02, 0.4), ease: 'easeOut' }}
                      />
                    </div>
                    <span className="bar-x">{shortDate(k)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
