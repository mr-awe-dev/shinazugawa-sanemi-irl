import type { DailyLog } from './schema'
import { scoredTaskIdsFor, taskDone } from './schema'

/** Progres harian. Denominator ikut tanggal: 8 task pada hari latihan, 7 pada
 *  hari istirahat latihan (lihat scoredTaskIdsFor). */
export function getProgress(log: DailyLog): { done: number; total: number; pct: number } {
  const ids = scoredTaskIdsFor(log.date)
  const done = ids.filter((id) => taskDone(log, id)).length
  const total = ids.length
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) }
}

export function grade(pct: number): string {
  if (pct >= 100) return 'S — Wind Hashira'
  if (pct >= 75) return 'A — Pilar'
  if (pct >= 50) return 'B — Pemburu'
  if (pct >= 25) return 'C — Kakunoshin'
  return 'D — Latihan lagi'
}
