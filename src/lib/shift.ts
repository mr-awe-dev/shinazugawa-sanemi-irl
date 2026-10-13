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
