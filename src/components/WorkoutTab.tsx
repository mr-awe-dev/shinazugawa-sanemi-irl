import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  WEEKLY_MENU,
  isRestDay,
  recomputeLatihanDone,
  todayKey,
  workoutDoneCount,
  workoutItemsFor,
  type DailyLog,
} from '../lib/schema'
import { SHIFT_ADJUST, shiftLabel, type ShiftCode } from '../lib/shift'
import { Fade } from './anim'
import { riseChild, staggerParent } from '../lib/anim-variants'
import { IconCheck, IconWind } from './icons'

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const REST_PROGRESS_LABEL = 'Istirahat · otomatis'

function weekdayOf(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

type Props = {
  dateKey: string
  shift: ShiftCode | null
  log: DailyLog
  readOnly: boolean
  onChange: (patch: Partial<DailyLog>) => void
}

export default function WorkoutTab({ dateKey, shift, log, readOnly, onChange }: Props) {
  const [openDay, setOpenDay] = useState<number | null>(null)
  const adj = shift ? SHIFT_ADJUST[shift] : null

  // "Hari ini" = tanggal ASLI hari ini, bukan tanggal yang sedang dipilih, jadi
  // membuka H-1 tidak ikut menawarkan checklist.
  const isToday = dateKey === todayKey()
  const weekday = weekdayOf(dateKey)
  const items = workoutItemsFor(dateKey)
  const doneCount = workoutDoneCount(log, dateKey)
  const allDone = recomputeLatihanDone(log, dateKey)
  const rest = isRestDay(dateKey)

  // Hari istirahat latihan tidak punya yang dicentang, jadi "1/1" menyiratkan
  // ada gerakan. Label eksplisit lebih jujur daripada counters.
  const progressText = rest
    ? REST_PROGRESS_LABEL
    : `Klik untuk checklist — ${doneCount}/${items.length} selesai`

  const toggle = (idx: number) => {
    if (readOnly) return
    const next = { ...(log.latihan_items ?? {}), [String(idx)]: log.latihan_items?.[String(idx)] !== true }
    onChange({ latihan_items: next, latihan_done: recomputeLatihanDone({ ...log, latihan_items: next }, dateKey) })
  }

  const reset = () => {
    const cleared = { ...log, latihan_items: {} }
    onChange({ latihan_items: {}, latihan_done: recomputeLatihanDone(cleared, dateKey) })
  }

  return (
    <div>
      <p className="muted">
        Jadwal dinamis mengikuti tanggal yang dipilih ({dateKey} = {DAYS[weekday]}). Latihan inti 4–5 hari/minggu.
      </p>
      {isToday && (
        <p className="muted">
          <strong>Klik card “HARI INI”</strong> untuk membuka checklist latihan hari ini. Kalau semua item
          selesai, “Sesi Latihan” di tab Hari otomatis ke-centang.
        </p>
      )}

      {adj && shift ? (
        <Fade>
          <div className={`shift-banner mode-${adj.workoutMode}`}>
            <strong>
              {adj.workoutMode === 'ringan' && 'Shift Malam: MODE RINGAN'}
              {adj.workoutMode === 'utama' && 'Shift Libur: MODE UTAMA'}
              {adj.workoutMode === 'normal' && `Shift ${shiftLabel(shift)}: MODE NORMAL`}
            </strong>
            <div>{adj.workoutNote}</div>
          </div>
        </Fade>
      ) : (
        <p className="shift-empty">Tanggal ini belum ada shift — tampil menu standar.</p>
      )}

      <motion.div key={dateKey} className="grid" variants={staggerParent} initial="hidden" animate="show">
        {[1, 2, 3, 4, 5, 6, 0].map((day) => {
          const w = WEEKLY_MENU[day]
          const isSelected = day === weekday
          const openable = isToday && isSelected
          const open = openable && openDay === day

          const cls = [
            'card',
            isSelected && isToday ? 'today' : '',
            w.rest ? 'rest' : '',
            openable && allDone ? 'done' : '',
            openable ? 'clickable' : '',
          ].filter(Boolean).join(' ')

          return (
            <motion.section key={day} variants={riseChild} className={cls} aria-label={w.title}>
              <div
                className={openable ? 'card-click' : undefined}
                role={openable ? 'button' : undefined}
                tabIndex={openable ? 0 : undefined}
                aria-expanded={openable ? open : undefined}
                onClick={openable ? () => setOpenDay(open ? null : day) : undefined}
                onKeyDown={openable ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenDay(open ? null : day) }
                } : undefined}
              >
                <div className="card-head">
                  <span className="field-icon"><IconWind /></span>
                  <div>
                    <div className="card-title">
                      {w.title} <span className="card-target">({DAYS[day]})</span>
                      {isSelected && isToday && <span className="badge">HARI INI</span>}
                    </div>
                    {openable && (
                      <div className="card-target">{progressText}</div>
                    )}
                  </div>
                </div>
                <ul>
                  {w.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    className="sheet"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div className="sheet-head">
                      <strong>Checklist {DAYS[day]} — {dateKey}</strong>
                      <span className="done-count">{rest ? REST_PROGRESS_LABEL : `${doneCount}/${items.length}`}</span>
                    </div>
                    {rest ? (
                      <p className="muted">Hari istirahat — tidak ada gerakan wajib.</p>
                    ) : (
                      <ul className="item-check">
                        {items.map((it, i) => {
                          const on = log.latihan_items?.[String(i)] === true
                          return (
                            <li key={it}>
                              <label className="row">
                                <input
                                  type="checkbox"
                                  checked={on}
                                  disabled={readOnly}
                                  onChange={() => toggle(i)}
                                />
                                <span className={on ? 'item-done' : undefined}>{it}</span>
                              </label>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                    {!readOnly && !rest && (
                      <div className="backup-actions">
                        <button className="btn-ghost" onClick={reset}>Reset checklist</button>
                      </div>
                    )}
                    {allDone && (
                      <p className="ok-text">
                        <IconCheck size={14} />
                        {rest
                          ? 'Sesi Latihan otomatis tercentang di tab Hari.'
                          : `Semua selesai — Sesi Latihan tercentang di tab Hari.`}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )
        })}

        <motion.section variants={riseChild} className="card wide" aria-label="Evaluasi mingguan">
          <div className="card-title">Evaluasi Mingguan (Minggu pagi)</div>
          <ul>
            <li>Timbang BB setelah BAK, sebelum makan/minum.</li>
            <li>Ukur lingkar pinggang. BB tetap tapi pinggang mengecil = recomposition sukses.</li>
          </ul>
        </motion.section>
      </motion.div>
    </div>
  )
}
