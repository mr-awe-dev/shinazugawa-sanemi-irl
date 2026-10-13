import { useState } from 'react'
import { motion } from 'motion/react'
import type { DailyLog } from '../lib/schema'
import { currentMonthKey, getMonthMeta, type MonthMeta } from '../lib/meta'
import { monthLabel, monthStat, shiftMonth } from '../lib/recap'
import { IconChevLeft, IconChevRight, IconWind } from './icons'

type Props = {
  all: Record<string, DailyLog>
  meta: Record<string, MonthMeta>
  onMeta: (ym: string, patch: Partial<MonthMeta>) => void
}

function deltaStr(d: number, unit: string, invert = false): { text: string; cls: string } {
  if (d === 0) return { text: `stabil`, cls: 'neutral' }
  const good = invert ? d < 0 : d > 0
  return {
    text: `${d > 0 ? '+' : ''}${d} ${unit} (${good ? 'membaik' : 'waspada'})`,
    cls: good ? 'up' : 'down',
  }
}

export default function MonthlyRecap({ all, meta, onMeta }: Props) {
  const [ym, setYm] = useState(() => currentMonthKey())
  const stat = monthStat(all, ym)
  const mm = getMonthMeta(meta, ym)
  const isCurrent = ym === currentMonthKey()
  const deloadSuggest = stat.monthsActive >= 2 && !mm.deloadDone

  const w = stat.weight ? deltaStr(stat.weight.delta, 'kg', true) : null
  const p = stat.waist ? deltaStr(stat.waist.delta, 'cm', true) : null

  return (
    <motion.section
      className="card wide"
      aria-label="Rekap bulanan"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="card-head">
        <span className="field-icon"><IconWind /></span>
        <div>
          <div className="card-title">Rekap Bulanan • {monthLabel(ym)}</div>
          <div className="card-target">
            {stat.logged === 0
              ? 'belum ada data bulan ini'
              : `${stat.logged} hari terisi • rata-rata ${stat.avgPct}% • ${stat.latihanCount} sesi latihan`}
          </div>
        </div>
      </div>

      <div className="datebar">
        <button onClick={() => setYm((v) => shiftMonth(v, -1))} aria-label="Bulan sebelumnya">
          <IconChevLeft size={16} /> <span className="lbl-full">Bulan lalu</span><span className="lbl-short">Lalu</span>
        </button>
        <strong>{monthLabel(ym)}</strong>
        <button onClick={() => setYm(currentMonthKey())} disabled={isCurrent}>Bulan ini</button>
        <button onClick={() => setYm((v) => shiftMonth(v, 1))} disabled={ym >= currentMonthKey()} aria-label="Bulan berikutnya">
          <span className="lbl-full">Bulan depan</span><span className="lbl-short">Depan</span> <IconChevRight size={16} />
        </button>
      </div>

      {stat.logged === 0 ? (
        <p className="chart-empty">Bulan ini kosong — pola dan tren muncul setelah data terkumpul.</p>
      ) : (
        <>
          <div className="compare-grid">
            <div className="card metric-card">
              <div>
                <div className="metric-value">
                  {stat.weight ? `${stat.weight.first} → ${stat.weight.last} kg` : '—'}
                </div>
                <div className="card-target">Berat badan</div>
                {w && <span className={`delta ${w.cls}`}>{w.text}</span>}
                {!stat.weight && <span className="delta neutral">isi tiap Minggu pagi</span>}
              </div>
            </div>
            <div className="card metric-card">
              <div>
                <div className="metric-value">
                  {stat.waist ? `${stat.waist.first} → ${stat.waist.last} cm` : '—'}
                </div>
                <div className="card-target">Lingkar pinggang</div>
                {p && <span className={`delta ${p.cls}`}>{p.text}</span>}
                {!stat.waist && <span className="delta neutral">isi tiap Minggu pagi</span>}
              </div>
            </div>
          </div>
          <p className="recap-line">
            Pola: BB tetap + pinggang mengecil = recomposition sukses. BB naik + latihan turun = cek defisit kalori.
          </p>
        </>
      )}

      {deloadSuggest && (
        <p className="nudge">
          <IconWind size={16} />
          Sudah {stat.monthsActive} bulan berjalan — pertimbangkan deload week (beban 50%) untuk pulihkan saraf & sendi.
        </p>
      )}

      <label className="card-target" htmlFor={`eval-${ym}`}>Evaluasi Hashira bulan ini</label>
      <textarea
        id={`eval-${ym}`}
        className="text"
        rows={3}
        value={mm.eval}
        placeholder="Progress foto? Beban naik? Kalori perlu disesuaikan?"
        onChange={(e) => onMeta(ym, { eval: e.target.value })}
      />
      <label className="row">
        <input
          type="checkbox"
          checked={mm.deloadDone}
          onChange={(e) => onMeta(ym, { deloadDone: e.target.checked })}
        />
        Deload week bulan ini sudah dilakukan
      </label>
    </motion.section>
  )
}
