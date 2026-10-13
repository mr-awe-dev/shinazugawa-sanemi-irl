import { monthKeyOf } from './recap'

// Metadata rekap: evaluasi bulanan + status deload, tersimpan terpisah dari daily log.
export type MonthMeta = { eval: string; deloadDone: boolean }

const KEY = 'sanemi-meta-v1'

function empty(): MonthMeta {
  return { eval: '', deloadDone: false }
}

export function loadMeta(): Record<string, MonthMeta> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, MonthMeta>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveMeta(all: Record<string, MonthMeta>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* abaikan */
  }
}

export function getMonthMeta(all: Record<string, MonthMeta>, ym: string): MonthMeta {
  return all[ym] ?? empty()
}

export function currentMonthKey(): string {
  const now = new Date()
  return monthKeyOf(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`)
}
