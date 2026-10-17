import { useState } from 'react'
import { motion } from 'motion/react'
import { addDays, todayKey } from '../lib/schema'
import {
  SHIFT_ADJUST,
  SHIFT_INFO,
  getShift,
  shiftLabel,
  type ShiftCode,
  type ShiftRow,
} from '../lib/shift'
import { riseChild, staggerParent } from '../lib/anim-variants'
import ShiftImportCard from './ShiftImportCard'
import { IconBed, IconClock } from './icons'

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const CODES: Array<ShiftCode | ''> = ['', 'P', 'S', 'M', 'O', 'T', 'L']

function dayName(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return DAY_NAMES[new Date(y, m - 1, d).getDay()]
}

const MODE_BADGE: Record<string, string> = {
  utama: 'UTAMA',
  normal: 'NORMAL',
  ringan: 'RINGAN',
}

type Props = {
  shifts: Record<string, ShiftCode>
  onChange: (date: string, code: ShiftCode | null) => void
  onSelectDate: (date: string) => void
  onImport: (rows: ShiftRow[]) => void
}

export default function ShiftTab({ shifts, onChange, onSelectDate, onImport }: Props) {
  const [anchor, setAnchor] = useState(todayKey())
  const days = Array.from({ length: 7 }, (_, i) => addDays(anchor, i))

  return (
    <div>
      <div className="datebar weeknav" role="group" aria-label="Pilih minggu">
        <button onClick={() => setAnchor((a) => addDays(a, -7))}>
          <span className="lbl-full">← Minggu lalu</span><span className="lbl-short">← Lalu</span>
        </button>
        <strong>{anchor} s/d {addDays(anchor, 6)}</strong>
        <button onClick={() => setAnchor(todayKey())}>Minggu ini</button>
        <button onClick={() => setAnchor((a) => addDays(a, 7))}>
          <span className="lbl-full">Minggu depan →</span><span className="lbl-short">Depan →</span>
        </button>
      </div>

      <motion.div key={anchor} className="shift-list" variants={staggerParent} initial="hidden" animate="show">
        {days.map((k) => {
          const code = getShift(shifts, k)
          const adj = code ? SHIFT_ADJUST[code] : null
          const isToday = k === todayKey()
          return (
            <motion.div key={k} variants={riseChild} className={`card shift-row ${isToday ? 'today' : ''}`}>
              <button className="shift-date" onClick={() => onSelectDate(k)} title="Buka di tab Hari Ini">
                <strong>{k}</strong>
                <span className="muted">{dayName(k)}{isToday ? ' • hari ini' : ''}</span>
              </button>
              <select
                value={code ?? ''}
                onChange={(e) => onChange(k, (e.target.value || null) as ShiftCode | null)}
                aria-label={`Shift tanggal ${k}`}
              >
                {CODES.map((c) => (
                  <option key={c || 'none'} value={c}>
                    {c === '' ? '— belum diatur —' : shiftLabel(c)}
                  </option>
                ))}
              </select>
              {adj && code && (
                <div className="shift-adj">
                  <span className={`mode mode-${adj.workoutMode}`}>{MODE_BADGE[adj.workoutMode]}</span>
                  <span><IconBed size={14} /> {adj.sleepWindow}</span>
                  <span><IconClock size={14} /> {adj.reminderTimes.join(' & ')}</span>
                </div>
              )}
            </motion.div>
          )
        })}
      </motion.div>

      <ShiftImportCard onMerge={onImport} />

      <div className="card wide legend">
        <div className="card-title">Legenda shift & aturan otomatis</div>
        <ul>
          {(Object.keys(SHIFT_INFO) as ShiftCode[]).map((c) => (
            <li key={c}>
              <strong>{shiftLabel(c)}</strong> — {SHIFT_ADJUST[c].workoutNote}{' '}
              <span className="muted">(tidur saran {SHIFT_ADJUST[c].sleepWindow}, ingatkan {SHIFT_ADJUST[c].reminderTimes.join(' & ')})</span>
            </li>
          ))}
        </ul>
        <p className="muted">
          Shift M dicatat di tanggal mulai kerja (23:00). Target durasi tidur tetap 7–8 jam, hanya jendelanya yang bergeser.
        </p>
      </div>
    </div>
  )
}
