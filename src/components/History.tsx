import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { todayKey, type DailyLog } from '../lib/schema'
import { getShift, type ShiftCode } from '../lib/shift'
import { getProgress } from '../lib/stats'
import { monthLabel, monthRange, shiftMonth } from '../lib/recap'
import { IconChevLeft, IconChevRight } from './icons'

const DOW = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function ymOf(dateKey: string): string {
  return dateKey.slice(0, 7)
}

type Props = {
  all: Record<string, DailyLog>
  shifts: Record<string, ShiftCode>
  onSelectDate: (date: string) => void
}

export default function History({ all, shifts, onSelectDate }: Props) {
  const [ym, setYm] = useState(() => ymOf(todayKey()))
  const [query, setQuery] = useState('')

  const keys = useMemo(() => monthRange(ym), [ym])
  const [y, m] = ym.split('-').map(Number)
  const blanks = (new Date(y, m - 1, 1).getDay() + 6) % 7 // Senin dulu
  const tKey = todayKey()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return Object.keys(all)
      .filter((k) => {
        const l = all[k]
        return (l.catatan ?? '').toLowerCase().includes(q) || (l.latihan_menu ?? '').toLowerCase().includes(q)
      })
      .sort()
      .reverse()
      .slice(0, 30)
  }, [all, query])

  return (
    <motion.section
      className="card wide"
      aria-label="Kalender riwayat"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="card-head">
        <div>
          <div className="card-title">Kalender Riwayat</div>
          <div className="card-target">{monthLabel(ym)} • klik tanggal untuk buka</div>
        </div>
      </div>

      <div className="datebar">
        <button onClick={() => setYm((v) => shiftMonth(v, -1))} aria-label="Bulan sebelumnya">
          <IconChevLeft size={16} /> <span className="lbl-full">Bulan lalu</span><span className="lbl-short">Lalu</span>
        </button>
        <strong>{monthLabel(ym)}</strong>
        <button onClick={() => setYm(ymOf(tKey))}>Bulan ini</button>
        <button onClick={() => setYm((v) => shiftMonth(v, 1))} aria-label="Bulan berikutnya">
          <span className="lbl-full">Bulan depan</span><span className="lbl-short">Depan</span> <IconChevRight size={16} />
        </button>
      </div>

      <div className="cal-grid" role="grid" aria-label={`Kalender ${monthLabel(ym)}`}>
        {DOW.map((d) => (
          <span key={d} className="cal-dow">{d}</span>
        ))}
        {Array.from({ length: blanks }, (_, i) => (
          <span key={`b${i}`} className="cal-blank" />
        ))}
        {keys.map((k) => {
          const log = all[k]
          const pct = log ? getProgress(log).pct : null
          const shift = getShift(shifts, k)
          const hasNote = log && (log.catatan ?? '').trim().length > 0
          const future = k > tKey
          return (
            <button
              key={k}
              className={`cal-cell${k === tKey ? ' today' : ''}${log ? ' filled' : ''}`}
              disabled={future}
              onClick={() => onSelectDate(k)}
              aria-label={`${k}${pct === null ? ', kosong' : `, ${pct} persen`}${shift ? `, shift ${shift}` : ''}`}
            >
              <span className="day-num">{Number(k.slice(8))}</span>
              {pct !== null && (
                <span className="cal-bar"><span style={{ width: `${pct}%` }} /></span>
              )}
              <span className="cal-marks">
                {shift && <span className="cal-shift">{shift}</span>}
                {hasNote && <span className="cal-note" title="Ada catatan" />}
              </span>
            </button>
          )
        })}
      </div>

      <div className="search-wrap">
        <label className="card-target" htmlFor="hist-search">Cari catatan / menu latihan</label>
        <input
          id="hist-search"
          className="text"
          type="search"
          value={query}
          placeholder="cth: pull-up, malas, hujan..."
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {query.trim() && (
        <div className="hist-results">
          {results.length === 0 && <p className="muted">Tidak ketemu. Coba kata lain.</p>}
          {results.map((k) => {
            const l = all[k]
            const pct = getProgress(l).pct
            return (
              <button key={k} className="hist-item" onClick={() => onSelectDate(k)}>
                <strong>{k}</strong>
                <span className="muted">{pct}% • {l.latihan_menu || 'tanpa menu'}</span>
                {(l.catatan ?? '').trim() && <span className="hist-note">“{(l.catatan ?? '').trim().slice(0, 120)}”</span>}
              </button>
            )
          })}
        </div>
      )}
    </motion.section>
  )
}
