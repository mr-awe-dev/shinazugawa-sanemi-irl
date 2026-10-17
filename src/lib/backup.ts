import type { DailyLog } from './schema'
import { recomputeLatihanDone } from './schema'
import type { ShiftCode } from './shift'
import type { MonthMeta } from './meta'

// Backup penuh: 3 kunci localStorage dalam 1 file JSON + export CSV untuk Excel/Notion.
// Import menimpa seluruh data (snapshot), jadi UI selalu konfirmasi dulu.

export const BACKUP_APP = 'sanemi-irl-tracker'
export const BACKUP_VERSION = 1

const LOGS_KEY = 'sanemi-logs-v1'
const SHIFTS_KEY = 'sanemi-shifts-v1'
const META_KEY = 'sanemi-meta-v1'

export type BackupFile = {
  app: string
  version: number
  exportedAt: string
  logs: Record<string, DailyLog>
  shifts: Record<string, ShiftCode>
  meta: Record<string, MonthMeta>
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const SHIFT_SET = new Set(['P', 'S', 'M', 'O', 'L', 'T'])

function readKey(key: string): Record<string, never> {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, never>) : {}
  } catch {
    return {}
  }
}

function stamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

function download(filename: string, text: string, mime: string): void {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportJSON(): void {
  const data: BackupFile = {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    logs: readKey(LOGS_KEY) as unknown as Record<string, DailyLog>,
    shifts: readKey(SHIFTS_KEY) as unknown as Record<string, ShiftCode>,
    meta: readKey(META_KEY) as unknown as Record<string, MonthMeta>,
  }
  download(`sanemi-backup-${stamp()}.json`, JSON.stringify(data, null, 2), 'application/json')
}

function csvCell(v: unknown): string {
  const s = v === undefined || v === null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function exportCSV(
  all: Record<string, DailyLog>,
  shifts: Record<string, ShiftCode>,
): void {
  const head = ['tanggal', 'protein_g', 'air_L', 'langkah', 'tidur_jam', 'latihan_done', 'latihan_menu', 'postur_done', 'makanan_clean', 'berat_kg', 'pinggang_cm', 'shift', 'catatan']
  const lines = [head.join(',')]
  for (const k of Object.keys(all).sort()) {
    const l = all[k]
    lines.push(
      [
        k, l.protein_g, l.air_L, l.langkah, l.tidur_jam,
        recomputeLatihanDone(l, k) ? 1 : 0, l.latihan_menu ?? '',
        l.postur_done ? 1 : 0, l.makanan_clean ? 1 : 0,
        l.berat_kg ?? '', l.pinggang_cm ?? '', shifts[k] ?? '', l.catatan ?? '',
      ].map(csvCell).join(','),
    )
  }
  download(`sanemi-logs-${stamp()}.csv`, `sep=,\n${lines.join('\n')}`, 'text/csv;charset=utf-8')
}

export type ParseResult =
  | { ok: true; data: BackupFile; logs: number; shifts: number; meta: number; warnings: string[] }
  | { ok: false; error: string }

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

export function parseBackupText(text: string): ParseResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'File bukan JSON yang valid.' }
  }
  if (!isObj(raw)) return { ok: false, error: 'Format backup tidak dikenali.' }
  if (raw.app !== BACKUP_APP) return { ok: false, error: 'File ini bukan backup Sanemi Tracker.' }
  if (typeof raw.version !== 'number' || raw.version > BACKUP_VERSION) {
    return { ok: false, error: 'Versi backup lebih baru dari app. Update app dulu.' }
  }

  const warnings: string[] = []
  const logs: Record<string, DailyLog> = {}
  if (isObj(raw.logs)) {
    for (const [k, v] of Object.entries(raw.logs)) {
      if (!DATE_RE.test(k) || !isObj(v)) {
        warnings.push(`Log ${k} dilewati (rusak).`)
        continue
      }
      logs[k] = { ...(v as object), date: k } as DailyLog
    }
  }
  const shifts: Record<string, ShiftCode> = {}
  if (isObj(raw.shifts)) {
    for (const [k, v] of Object.entries(raw.shifts)) {
      if (!DATE_RE.test(k) || typeof v !== 'string' || !SHIFT_SET.has(v)) {
        warnings.push(`Shift ${k} dilewati (kode tidak valid).`)
        continue
      }
      shifts[k] = v as ShiftCode
    }
  }
  const meta: Record<string, MonthMeta> = {}
  if (isObj(raw.meta)) {
    for (const [k, v] of Object.entries(raw.meta)) {
      if (!/^\d{4}-\d{2}$/.test(k) || !isObj(v)) {
        warnings.push(`Evaluasi ${k} dilewati (rusak).`)
        continue
      }
      meta[k] = {
        eval: typeof v.eval === 'string' ? v.eval : '',
        deloadDone: v.deloadDone === true,
      }
    }
  }

  return {
    ok: true,
    data: {
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : '',
      logs, shifts, meta,
    },
    logs: Object.keys(logs).length,
    shifts: Object.keys(shifts).length,
    meta: Object.keys(meta).length,
    warnings,
  }
}

/** Tulis hasil import ke localStorage (menimpa penuh). */
export function applyBackup(data: BackupFile): void {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(data.logs))
    localStorage.setItem(SHIFTS_KEY, JSON.stringify(data.shifts))
    localStorage.setItem(META_KEY, JSON.stringify(data.meta))
  } catch {
    throw new Error('Gagal menulis ke penyimpanan (penuh / mode privat?).')
  }
}
