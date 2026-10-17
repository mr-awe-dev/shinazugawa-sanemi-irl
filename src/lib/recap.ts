import {
  SCORED_TASK_IDS,
  addDays,
  isRestDay,
  taskDone,
  toDateKey,
  type DailyLog,
} from './schema'
import { getProgress } from './stats'

// Logika rekap mingguan (Senin–Minggu) & bulanan.
// Semua rata-rata hanya memakai hari yang terisi (jujur, bukan nol).

/** Habit mingguan = task skor harian, jadi weekStat.pct dan monthStat.avgPct
 *  memakai denominator yang sama dan bisa dibandingkan berdampingan.
 *  Diturunkan dari SCORED_TASK_IDS (bukan daftar terpisah) supaya tidak bisa
 *  melenceng lagi; HABIT_LABEL bertipe Record<HabitId, string> jadi penjaga
 *  compile-time — tambah task baru tanpa label = build gagal. */
export const HABIT_IDS = SCORED_TASK_IDS

export type HabitId = (typeof HABIT_IDS)[number]

export const HABIT_LABEL: Record<HabitId, string> = {
  protein_g: 'Protein',
  air_L: 'Hidrasi',
  langkah: 'Langkah',
  tidur_jam: 'Tidur',
  latihan_done: 'Latihan',
  postur_done: 'Postur',
  makanan_clean: 'Makan bersih',
  catatan: 'Catatan',
}

/** Senin awal minggu berjalan (weekStart), format YYYY-MM-DD. */
export function weekStartOf(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7))
  return toDateKey(dt)
}

export function weekRange(startKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startKey, i))
}

export function monthKeyOf(dateKey: string): string {
  return dateKey.slice(0, 7) // YYYY-MM
}

export function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const dt = new Date(y, m - 1 + delta, 1)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}

export function monthRange(ym: string): string[] {
  const [y, m] = ym.split('-').map(Number)
  const count = new Date(y, m, 0).getDate()
  return Array.from({ length: count }, (_, i) => `${ym}-${String(i + 1).padStart(2, '0')}`)
}

export function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export type WeekStat = {
  keys: string[]
  logged: number
  done: number
  total: number
  pct: number | null
  perTask: Record<HabitId, { done: number; of: number }>
  best: { id: HabitId; label: string; done: number; of: number } | null
}

export function weekStat(all: Record<string, DailyLog>, startKey: string): WeekStat {
  const keys = weekRange(startKey)
  const loggedKeys = keys.filter((k) => all[k])
  const of = loggedKeys.length
  // Denominator PER TASK: latihan_done tidak berlaku di hari istirahat latihan
  // (Sabtu/Minggu), jadi minggu penuh menyumbang 5 hari, bukan 7.
  const restlessKeys = loggedKeys.filter((k) => !isRestDay(k))
  const poolFor = (id: HabitId) => (id === 'latihan_done' ? restlessKeys : loggedKeys)
  const perTask = Object.fromEntries(
    HABIT_IDS.map((id) => {
      const pool = poolFor(id)
      return [id, { done: pool.filter((k) => taskDone(all[k], id)).length, of: pool.length }]
    }),
  ) as WeekStat['perTask']
  const done = HABIT_IDS.reduce((a, id) => a + perTask[id].done, 0)
  const total = HABIT_IDS.reduce((a, id) => a + perTask[id].of, 0)
  // "Paling konsisten" pakai RASIO, bukan jumlah mentah — karena of per task
  // bisa berbeda (latihan_done 5 vs task lain 7).
  let best: WeekStat['best'] = null
  for (const id of HABIT_IDS) {
    const t = perTask[id]
    if (t.of === 0) continue
    if (!best || t.done / t.of > best.done / best.of) {
      best = { id, label: HABIT_LABEL[id], done: t.done, of: t.of }
    }
  }
  if (of === 0) best = null
  return { keys, logged: of, done, total, pct: total === 0 ? null : Math.round((done / total) * 100), perTask, best }
}

export type MeasureDelta = { first: number; last: number; delta: number } | null

export type MonthStat = {
  keys: string[]
  logged: number
  avgPct: number | null
  latihanCount: number
  weight: MeasureDelta
  waist: MeasureDelta
  monthsActive: number
}

function endpoints(all: Record<string, DailyLog>, keys: string[], field: 'berat_kg' | 'pinggang_cm'): MeasureDelta {
  const pts = keys
    .filter((k) => typeof all[k]?.[field] === 'number')
    .map((k) => ({ k, v: all[k][field] as number }))
    .sort((a, b) => (a.k < b.k ? -1 : 1))
  if (pts.length === 0) return null
  const first = pts[0].v
  const last = pts[pts.length - 1].v
  return { first, last, delta: Math.round((last - first) * 10) / 10 }
}

export function monthStat(all: Record<string, DailyLog>, ym: string): MonthStat {
  const keys = monthRange(ym)
  const loggedKeys = keys.filter((k) => all[k])
  const pcts = loggedKeys.map((k) => getProgress(all[k]).pct)
  // Hari istirahat latihan tidak punya sesi latihan, jadi tidak dihitung sebagai
  // "sesi latihan" — dihitung lewat taskDone() yang sudah aware hari istirahat.
  const latihanCount = loggedKeys.filter((k) => taskDone(all[k], 'latihan_done') && !isRestDay(k)).length
  const monthsActive = new Set(Object.keys(all).map((k) => monthKeyOf(k))).size
  return {
    keys,
    logged: loggedKeys.length,
    avgPct: pcts.length === 0 ? null : Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length),
    latihanCount,
    weight: endpoints(all, keys, 'berat_kg'),
    waist: endpoints(all, keys, 'pinggang_cm'),
    monthsActive,
  }
}
