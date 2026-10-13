import { useState } from 'react'
import { motion } from 'motion/react'
import { addDays, todayKey, type DailyLog } from '../lib/schema'
import { HABIT_IDS, HABIT_LABEL, weekRange, weekStartOf, weekStat } from '../lib/recap'
import { IconChevLeft, IconChevRight, IconClock } from './icons'

function shortRange(keys: string[]): string {
  const s = keys[0].slice(8)
  const e = keys[6].slice(8)
  const m = Number(keys[0].slice(5, 7))
  const month = new Date(Number(keys[0].slice(0, 4)), m - 1, 1)
    .toLocaleDateString('id-ID', { month: 'short' })
  return `${Number(s)}–${Number(e)} ${month}`
}

export default function WeeklyRecap({ all }: { all: Record<string, DailyLog> }) {
  const [offset, setOffset] = useState(0) // 0 = minggu ini, -1 = lalu, dst
  const start = weekStartOf(addDays(todayKey(), offset * 7))
  const stat = weekStat(all, start)
  const prev = weekStat(all, addDays(start, -7))
  const tKey = todayKey()
  const inWeek = stat.keys.includes(tKey)
  const sunday = stat.keys[6]
  const sundayLog = all[sunday]
  const needMeasure = inWeek && (!sundayLog || typeof sundayLog.berat_kg !== 'number')

  const delta = stat.pct !== null && prev.pct !== null ? stat.pct - prev.pct : null

  return (
    <motion.section
      className="card wide"
      aria-label="Rekap mingguan"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="card-head">
        <span className="field-icon"><IconClock /></span>
        <div>
          <div className="card-title">Rekap Mingguan • {shortRange(stat.keys)}</div>
          <div className="card-target">
            {stat.logged === 0
              ? 'belum ada data minggu ini'
              : `${stat.done}/${stat.total} tugas • ${stat.pct}% • ${stat.logged}/7 hari terisi`}
          </div>
        </div>
      </div>

      <div className="datebar">
        <button onClick={() => setOffset((o) => o - 1)} aria-label="Minggu sebelumnya">
          <IconChevLeft size={16} /> <span className="lbl-full">Minggu lalu</span><span className="lbl-short">Lalu</span>
        </button>
        <strong>{offset === 0 ? 'Minggu ini' : offset === -1 ? 'Minggu lalu' : `${-offset} minggu lalu`}</strong>
        <button onClick={() => setOffset(0)} disabled={offset === 0}>Minggu ini</button>
        <button onClick={() => setOffset((o) => Math.min(0, o + 1))} disabled={offset === 0} aria-label="Minggu berikutnya">
          <span className="lbl-full">Minggu depan</span><span className="lbl-short">Depan</span> <IconChevRight size={16} />
        </button>
      </div>

      {stat.logged === 0 ? (
        <p className="chart-empty">Minggu ini kosong — isi checklist harian agar rekap terisi.</p>
      ) : (
        <>
          <p className="recap-line">
            {delta === null || prev.logged === 0 ? (
              <>Minggu pembanding kosong — jadikan minggu ini baseline.</>
            ) : delta > 0 ? (
              <><span className="delta up">+{delta}% vs minggu lalu</span> — tren naik, pertahankan.</>
            ) : delta < 0 ? (
              <><span className="delta down">{delta}% vs minggu lalu</span> — turun, cek apa yang bolong.</>
            ) : (
              <>Stabil di {stat.pct}% — sama seperti minggu lalu.</>
            )}
          </p>
          {stat.best && (
            <p className="recap-line">
              Paling konsisten: <strong>{stat.best.label}</strong> ({stat.best.done}/{stat.best.of} hari).
            </p>
          )}
          <div className="task-bars">
            {HABIT_IDS.map((id) => {
              const t = stat.perTask[id]
              const p = t.of === 0 ? 0 : Math.round((t.done / t.of) * 100)
              return (
                <div key={id} className="task-bar-row">
                  <span className="task-bar-label">{HABIT_LABEL[id]}</span>
                  <span className="mini-bar task-bar"><span style={{ width: `${p}%` }} /></span>
                  <span className="task-bar-val">{t.done}/{t.of}</span>
                </div>
              )
            })}
          </div>
          <p className="muted">Jadwal acuan: {weekRange(start)[0]} s/d {weekRange(start)[6]}</p>
        </>
      )}

      {needMeasure && (
        <p className="nudge">
          <IconClock size={16} />
          Evaluasi Minggu ({sunday}): timbang BB pagi + ukur pinggang di tab Hari Ini agar tren bulanan akurat.
        </p>
      )}
    </motion.section>
  )
}
