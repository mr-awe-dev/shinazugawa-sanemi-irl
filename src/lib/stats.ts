import type { DailyLog } from './schema'
import { TOTAL_TASKS, taskDone } from './schema'

export function getProgress(log: DailyLog): { done: number; total: number; pct: number } {
  const ids = ['protein_g', 'air_L', 'langkah', 'tidur_jam', 'latihan_done', 'postur_done', 'makanan_clean', 'catatan']
  const done = ids.filter((id) => taskDone(log, id)).length
  return { done, total: TOTAL_TASKS, pct: Math.round((done / TOTAL_TASKS) * 100) }
}

export function grade(pct: number): string {
  if (pct >= 100) return 'S — Wind Hashira'
  if (pct >= 75) return 'A — Pilar'
  if (pct >= 50) return 'B — Pemburu'
  if (pct >= 25) return 'C — Kakunoshin'
  return 'D — Latihan lagi'
}
