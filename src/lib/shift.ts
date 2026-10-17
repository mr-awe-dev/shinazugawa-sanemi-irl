// Jadwal shift kerja (tidak tentu) + aturan penyesuaian otomatis.
// Shift Malam (M) dicatat di TANGGAL MULAI kerja (23:00), walau pulang keesokan paginya.

export type ShiftCode = 'P' | 'S' | 'M' | 'O' | 'L' | 'T'

export type ShiftInfo = {
  code: ShiftCode
  nama: string
  mulai: string // HH:MM, '-' bila libur
  selesai: string
  durasiJam: number
}

export const SHIFT_INFO: Record<ShiftCode, ShiftInfo> = {
  // Tabel user: P selesai 15:00 durasi 8 -> mulai 07:00
  P: { code: 'P', nama: 'Pagi', mulai: '07:00', selesai: '15:00', durasiJam: 8 },
  S: { code: 'S', nama: 'Siang', mulai: '15:00', selesai: '23:00', durasiJam: 8 },
  M: { code: 'M', nama: 'Malam', mulai: '23:00', selesai: '07:00', durasiJam: 8 },
  O: { code: 'O', nama: 'Office / Project', mulai: '08:00', selesai: '17:00', durasiJam: 8 },
  L: { code: 'L', nama: 'Libur', mulai: '-', selesai: '-', durasiJam: 0 },
  T: { code: 'T', nama: 'Tengah', mulai: '10:30', selesai: '19:30', durasiJam: 8 },
}

export type WorkoutMode = 'utama' | 'normal' | 'ringan'

export type ShiftAdjustment = {
  workoutMode: WorkoutMode
  workoutNote: string
  sleepWindow: string // jendela tidur SARAN (target durasi tetap 7-8 jam)
  reminderTimes: string[] // jam saran cek checklist (HH:MM)
  reminderNote: string
}

// Aturan inti:
// - L (libur)  -> latihan UTAMA: hari terbaik beban penuh / progressive overload
// - M (malam)  -> latihan RINGAN: volume 50% atau ganti active recovery; tidur digeser siang
// - lainnya    -> NORMAL: ikuti jadwal mingguan; latihan di sela jam bebas
export const SHIFT_ADJUST: Record<ShiftCode, ShiftAdjustment> = {
  P: {
    workoutMode: 'normal',
    workoutNote: 'Latihan sore setelah pulang (±15:30+), ikuti jadwal mingguan.',
    sleepWindow: '22:30–06:00',
    reminderTimes: ['06:30', '16:00'],
    reminderNote: 'Cek pagi sebelum berangkat + sore setelah pulang.',
  },
  S: {
    workoutMode: 'normal',
    workoutNote: 'Latihan pagi sebelum masuk (±09:00–11:00), ikuti jadwal mingguan.',
    sleepWindow: '23:30–07:00',
    reminderTimes: ['09:00', '14:00'],
    reminderNote: 'Cek pagi + siang sebelum berangkat.',
  },
  M: {
    workoutMode: 'ringan',
    workoutNote: 'Mode Malam: turunkan volume 50% atau ganti active recovery. Jangan paksakan PR.',
    sleepWindow: '08:00–16:00',
    reminderTimes: ['16:30', '22:00'],
    reminderNote: 'Cek saat bangun + sebelum berangkat malam.',
  },
  O: {
    workoutMode: 'normal',
    workoutNote: 'Latihan sore setelah pulang (±17:30+), ikuti jadwal mingguan.',
    sleepWindow: '22:30–06:00',
    reminderTimes: ['06:30', '17:30'],
    reminderNote: 'Cek pagi sebelum berangkat + sore setelah pulang.',
  },
  L: {
    workoutMode: 'utama',
    workoutNote: 'Hari LIBUR = hari latihan utama. Beban penuh, kejar progressive overload di sini.',
    sleepWindow: '22:30–06:00',
    reminderTimes: ['08:00', '20:00'],
    reminderNote: 'Cek pagi + malam, waktu longgar.',
  },
  T: {
    workoutMode: 'normal',
    workoutNote: 'Latihan pagi ringan–sedang (±07:30–09:00) atau malam ringan setelah pulang.',
    sleepWindow: '23:00–07:00',
    reminderTimes: ['08:30', '20:00'],
    reminderNote: 'Cek pagi sebelum berangkat + malam setelah pulang.',
  },
}

// ---- storage (localStorage, kunci terpisah dari daily log) ----
const KEY = 'sanemi-shifts-v1'

// Jadwal user 15–31 Okt 2026 (dari chat). Format: [tanggal, kode].
const SEED: Array<[string, ShiftCode]> = [
  ['2026-10-15', 'M'],
  ['2026-10-16', 'M'],
  ['2026-10-17', 'M'],
  ['2026-10-18', 'M'],
  ['2026-10-19', 'L'],
  ['2026-10-20', 'P'],
  ['2026-10-21', 'P'],
  ['2026-10-22', 'P'],
  ['2026-10-23', 'S'],
  ['2026-10-24', 'L'],
  ['2026-10-25', 'L'],
  ['2026-10-26', 'P'],
  ['2026-10-27', 'M'],
  ['2026-10-28', 'M'],
  ['2026-10-29', 'L'],
  ['2026-10-30', 'L'],
  ['2026-10-31', 'P'],
]

export function loadShifts(): Record<string, ShiftCode> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const initial = Object.fromEntries(SEED) as Record<string, ShiftCode>
      try {
        localStorage.setItem(KEY, JSON.stringify(initial))
      } catch {
        /* abaikan */
      }
      return initial
    }
    const parsed = JSON.parse(raw) as Record<string, ShiftCode>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveShifts(all: Record<string, ShiftCode>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* abaikan */
  }
}

export function getShift(all: Record<string, ShiftCode>, dateKey: string): ShiftCode | null {
  return all[dateKey] ?? null
}

export function shiftLabel(code: ShiftCode): string {
  const info = SHIFT_INFO[code]
  return code === 'L' ? `${code} — ${info.nama}` : `${code} — ${info.nama} (${info.mulai}–${info.selesai})`
}

/** Apakah "sekarang" dekat jam pengingat saran (toleransi ±60 mnt)? Dipakai untuk nudge di tab Hari Ini. */
export function isReminderDue(reminderTimes: string[], now = new Date()): string | null {
  const cur = now.getHours() * 60 + now.getMinutes()
  for (const t of reminderTimes) {
    const [h, m] = t.split(':').map(Number)
    if (Math.abs(cur - (h * 60 + m)) <= 60) return t
  }
  return null
}

// ---- Import jadwal: | Tanggal | Kode Jadwal | ----
// File dari Excel/Notion bisa "|" (mengikuti format user) atau "," (CSV biasa),
// jadi delimiter dideteksi dari baris pertama. Baris rusak DILEWATI + dicatat di
// warnings — import tetap jalan agar user tidak terblokir satu barian salah ketik.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const SHIFT_SET = new Set<string>(['P', 'S', 'M', 'O', 'L', 'T'])

const HEAD_DATE = ['tanggal', 'date', 'tgl']
const HEAD_CODE = ['kode jadwal', 'kode shift', 'kode', 'shift', 'codeshift']

export const SHIFT_TABLE_SAMPLE = '| Tanggal | Kode Jadwal |\n| 2026-11-02 | P |\n| 2026-11-03 | M |\n| 2026-11-04 | L |'

export type ShiftRow = { date: string; code: ShiftCode }

export type ShiftParseResult =
  | { ok: true; rows: ShiftRow[]; warnings: string[] }
  | { ok: false; error: string }

function normHeader(s: string): string {
  return s.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function stripQuotes(s: string): string {
  return s.trim().replace(/^"(.*)"$/s, '$1').trim()
}

/** Pisahkan satu baris; delimiter "," hormati tanda kutip (CSV Excel), "|" tidak. */
function splitRow(line: string, delim: '|' | ','): string[] {
  if (delim === '|') return line.split('|')
  const out: string[] = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (ch === '"') inQ = false
      else cur += ch
    } else if (ch === '"') inQ = true
    else if (ch === ',') { out.push(cur); cur = '' }
    else cur += ch
  }
  out.push(cur)
  return out
}

/** Uji round-trip supaya '2026-02-30' / '2026-13-01' ditolak, bukan diterima diam-diam. */
function isValidDateKey(key: string): boolean {
  if (!DATE_RE.test(key)) return false
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}

export function parseShiftTable(text: string): ShiftParseResult {
  const lines = text.split(/\r\n|\r|\n/)
  const first = lines.find((l) => l.trim() !== '')
  if (!first) return { ok: false, error: 'Isi kosong — tidak ada baris untuk dibaca.' }
  const delim: '|' | ',' = first.includes('|') ? '|' : ','

  const warnings: string[] = []
  const rows = new Map<string, ShiftCode>()
  let colDate = -1
  let colCode = -1

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim()
    if (raw === '' || raw.startsWith('#')) continue
    const cells = splitRow(raw, delim).map(stripQuotes)

    if (colDate === -1) {
      const head = cells.map(normHeader)
      colDate = head.findIndex((c) => HEAD_DATE.includes(c))
      colCode = head.findIndex((c) => HEAD_CODE.includes(c))
      if (colDate === -1 || colCode === -1) {
        return {
          ok: false,
          error: 'Header tidak dikenali. Harapkan kolom "Tanggal" dan "Kode Jadwal" (dipisah "|" atau ",").',
        }
      }
      continue
    }

    const no = i + 1
    const date = cells[colDate] ?? ''
    const code = (cells[colCode] ?? '').toUpperCase()
    if (date === '' && code === '') continue
    if (!isValidDateKey(date)) {
      warnings.push(`Baris ${no}: tanggal "${date}" tidak valid (harus YYYY-MM-DD) — dilewati.`)
      continue
    }
    if (!SHIFT_SET.has(code)) {
      warnings.push(`Baris ${no}: kode "${code}" tidak dikenal (P/S/M/O/L/T) — dilewati.`)
      continue
    }
    if (rows.has(date)) warnings.push(`Baris ${no}: ${date} dobel — memakai kode "${code}".`)
    rows.set(date, code as ShiftCode)
  }

  if (colDate === -1) return { ok: false, error: 'Header "Tanggal" / "Kode Jadwal" tidak ditemukan.' }
  if (rows.size === 0) return { ok: false, error: 'Tidak ada baris valid untuk diimport.' }
  return { ok: true, rows: [...rows].map(([date, code]) => ({ date, code })), warnings }
}

/** Merge: hanya tanggal yang ADA DI FILE yang berubah; jadwal lain tetap utuh. */
export function mergeShiftRows(
  current: Record<string, ShiftCode>,
  rows: ShiftRow[],
): Record<string, ShiftCode> {
  const next = { ...current }
  for (const r of rows) next[r.date] = r.code
  return next
}
