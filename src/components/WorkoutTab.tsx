import { motion } from 'motion/react'
import { WEEKLY_MENU } from '../lib/schema'
import { SHIFT_ADJUST, shiftLabel, type ShiftCode } from '../lib/shift'
import { Fade } from './anim'
import { riseChild, staggerParent } from '../lib/anim-variants'
import { IconWind } from './icons'

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export default function WorkoutTab({ dateKey, shift }: { dateKey: string; shift: ShiftCode | null }) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const today = new Date(y, m - 1, d).getDay()
  const adj = shift ? SHIFT_ADJUST[shift] : null
  return (
    <div>
      <p className="muted">
        Jadwal dinamis mengikuti tanggal yang dipilih ({dateKey} = {DAYS[today]}). Latihan inti 4–5 hari/minggu.
      </p>
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
          return (
            <motion.section key={day} variants={riseChild} className={`card ${day === today ? 'today' : ''} ${w.rest ? 'rest' : ''}`} aria-label={w.title}>
              <div className="card-head">
                <span className="field-icon"><IconWind /></span>
                <div>
                  <div className="card-title">
                    {w.title} <span className="card-target">({DAYS[day]})</span>
                    {day === today && <span className="badge">HARI INI</span>}
                  </div>
                </div>
              </div>
              <ul>
                {w.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
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
