import type { DailyLog } from './schema'
import { emptyLog, defaultMenuForDate } from './schema'

const KEY = 'sanemi-logs-v1'

export function loadAll(): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seedIfEmpty()
    const parsed = JSON.parse(raw) as Record<string, DailyLog>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveAll(all: Record<string, DailyLog>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    // storage penuh / mode privat — abaikan agar UI tidak crash
  }
}

export function getLog(all: Record<string, DailyLog>, date: string): DailyLog {
  if (all[date]) return all[date]
  return emptyLog(date, defaultMenuForDate(date))
}

// Seed dari CSV Notion: 13 Okt 2026 (semua target tercapai sebagai contoh awal).
function seedIfEmpty(): Record<string, DailyLog> {
  const seed: DailyLog = {
    date: '2026-10-13',
    protein_g: 150,
    air_L: 3.5,
    langkah: 9000,
    tidur_jam: 7.5,
    latihan_done: true,
    latihan_menu: 'Hari 2: Lower & Plyo',
    postur_done: true,
    makanan_clean: true,
    catatan: 'Lukai dirimu hari ini, agar kau bisa lebih kuat besok.',
  }
  const initial = { '2026-10-13': seed }
  try {
    localStorage.setItem(KEY, JSON.stringify(initial))
  } catch {
    /* abaikan */
  }
  return initial
}
