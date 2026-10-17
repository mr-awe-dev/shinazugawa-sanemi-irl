// Schema inti Sanemi IRL — Web App saja (localStorage, tanpa auth/cloud).
// Sumber: shinazugawa-sanemi-irl.md (PRD) + shinazugawa-sanemi-irl/*.md + CSV Notion.

export type DailyLog = {
  date: string // YYYY-MM-DD
  protein_g: number
  air_L: number
  langkah: number
  tidur_jam: number
  latihan_done: boolean
  latihan_menu: string
  // Indeks item WEEKLY_MENU -> sudah dicentang. Opsional supaya log lama (tanpa
  // field ini) tetap valid; workoutDoneCount() menganggapnya {}.
  latihan_items?: Record<string, boolean>
  postur_done: boolean
  makanan_clean: boolean
  berat_kg?: number
  pinggang_cm?: number
  catatan?: string
}

export type TaskType = 'number' | 'check'

export type TaskDef = {
  id: keyof DailyLog | 'defisit_note'
  label: string
  target: string
  hint: string
  type: TaskType
  min?: number
  max?: number
  step?: number
}

// 8 item sesuai Database Notion (Tanggal, Protein, Air, Langkah, Tidur, Latihan, Postur, Makanan, Catatan)
export const TASK_MASTER: TaskDef[] = [
  { id: 'protein_g', label: 'Ransum Hashira (Protein)', target: '140–160 g', hint: 'Ayam, telur, tempe, ikan, whey', type: 'number', min: 0, max: 300, step: 5 },
  { id: 'air_L', label: 'Hidrasi Total Concentration', target: '3–4 L', hint: 'Air putih saja', type: 'number', min: 0, max: 10, step: 0.25 },
  { id: 'langkah', label: 'NEAT (Jalan Kaki)', target: '8.000–10.000', hint: 'Cara utama bakar lemak tanpa lelah', type: 'number', min: 0, max: 50000, step: 500 },
  { id: 'tidur_jam', label: 'Tidur Pemulihan', target: '7–8 jam', hint: 'Otot tumbuh saat tidur', type: 'number', min: 0, max: 24, step: 0.5 },
  { id: 'latihan_done', label: 'Sesi Latihan', target: 'sesuai jadwal', hint: 'Cek tab Latihan per hari', type: 'check' },
  { id: 'postur_done', label: 'Postur Sanemi', target: 'dada busung, bahu ke belakang', hint: 'Sadar postur sepanjang hari', type: 'check' },
  { id: 'makanan_clean', label: 'Makan Bersih', target: 'defisit 300–500 kkal', hint: 'Whole foods, hindari gula/olahan', type: 'check' },
  { id: 'catatan', label: 'Catatan / Refleksi', target: 'bebas', hint: '"Lukai dirimu hari ini..."', type: 'check' },
]

export type WorkoutDay = { title: string; items: string[]; rest?: boolean }

// Jadwal dari Notion MD: 4-5 hari latihan + 2 hari istirahat. key = JS getDay() (0=Minggu)
export const WEEKLY_MENU: Record<number, WorkoutDay> = {
  1: {
    title: 'Hari 1: Upper Pull & Grip',
    items: [
      'Pull-ups / Chin-ups — 4 set x max (bantu kursi, turun 3–5 dtk)',
      'Gallon 15L Bent-Over Row — 4x10–15 / tangan',
      'Dumbbell Bicep Curls — 3x12–15',
      "Gallon Farmer's Carry — 3x30–60 dtk jalan",
      'Sanemi Special: Dead Hang selama mungkin',
    ],
  },
  2: {
    title: 'Hari 2: Lower & Plyo',
    items: [
      'Gallon Goblet Squats — 4x12–15',
      'Bulgarian Split Squats — 3x8–12 / kaki',
      'Jump Squats — 3x10–15',
      'Single-Leg Calf Raises — 3x15–20 / kaki',
    ],
  },
  3: { title: 'Hari 3: Active Recovery', items: ['Jalan santai / stretching / yoga', 'Mobility bahu + pinggul'] },
  4: {
    title: 'Hari 4: Upper Push',
    items: [
      'Push-up variasi — 4x max (standard, diamond, decline)',
      'Dumbbell/Gallon Overhead Press — 4x10–12',
      'Dumbbell Lateral Raises — 4x15–20 (botol 1.5L bila berat)',
      'Floor Skullcrushers — 3x12–15',
    ],
  },
  5: {
    title: 'Hari 5: Core & HIIT',
    items: [
      'Hanging Knee/Leg Raises — 3x8–12',
      'Gallon Russian Twists — 3x20 total',
      'Mountain Climbers — 3x40 dtk',
      'HIIT 10–15 mnt (30 dtk on / 30 dtk off x10–15)',
    ],
  },
  6: { title: 'Hari 6: Istirahat', items: ['Istirahat total atau aktivitas ringan'], rest: true },
  0: { title: 'Hari 7 (Minggu): Istirahat + Evaluasi', items: ['Timbang BB pagi (habis BAK, sebelum makan)', 'Ukur lingkar pinggang'], rest: true },
}

// Threshold Done (hybrid: angka -> auto done)
export const THRESHOLD = {
  protein_min: 140,
  protein_max: 250, // toleransi atas, >250 dianggap over tapi tetap done
  air_min: 3,
  langkah_min: 8000,
  tidur_min: 7,
  tidur_max: 9,
} as const

export function taskDone(log: DailyLog, taskId: string): boolean {
  switch (taskId) {
    case 'protein_g':
      return log.protein_g >= THRESHOLD.protein_min && log.protein_g <= THRESHOLD.protein_max
    case 'air_L':
      return log.air_L >= THRESHOLD.air_min
    case 'langkah':
      return log.langkah >= THRESHOLD.langkah_min
    case 'tidur_jam':
      return log.tidur_jam >= THRESHOLD.tidur_min && log.tidur_jam <= THRESHOLD.tidur_max
    case 'latihan_done':
      return recomputeLatihanDone(log, log.date)
    case 'postur_done':
      return log.postur_done
    case 'makanan_clean':
      return log.makanan_clean
    case 'catatan':
      return (log.catatan ?? '').trim().length > 0
    default:
      return false
  }
}

export const SCORED_TASK_IDS = [
  'protein_g',
  'air_L',
  'langkah',
  'tidur_jam',
  'latihan_done',
  'postur_done',
  'makanan_clean',
  'catatan',
] as const

export type ScoredTaskId = (typeof SCORED_TASK_IDS)[number]

/** Task yang dihitung untuk tanggal tsb. Hari istirahat latihan (WEEKLY_MENU
 *  rest:true = Sabtu/Minggu) tidak punya sesi latihan, jadi latihan_done
 *  dikeluarkan dari skor — denominator 7, bukan 8 — supaya istirahat tidak
 *  dihitung sebagai usaha dan progres akhir pekan tetap bisa 100%.
 *  BUKAN shift L: libur shift justru hari latihan UTAMA (lihat shift.ts). */
export function scoredTaskIdsFor(dateKey: string): ScoredTaskId[] {
  const ids: ScoredTaskId[] = [...SCORED_TASK_IDS]
  return isRestDay(dateKey) ? ids.filter((i) => i !== 'latihan_done') : ids
}

export function emptyLog(date: string, latihan_menu = ''): DailyLog {
  return {
    date,
    protein_g: 0,
    air_L: 0,
    langkah: 0,
    tidur_jam: 0,
    latihan_done: false,
    latihan_menu,
    latihan_items: {},
    postur_done: false,
    makanan_clean: false,
    catatan: '',
  }
}

// ---- date utils ----
export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + delta)
  return toDateKey(dt)
}

/** Boleh edit hari ini + H-1. Masa depan & H-2+ dikunci (readOnly). */
export function canEdit(dateKey: string, nowKey = todayKey()): boolean {
  if (dateKey > nowKey) return false
  const diff = Math.round(
    (new Date(nowKey).getTime() - new Date(dateKey).getTime()) / 86400000,
  )
  return diff <= 1
}

function weekdayOf(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

export function defaultMenuForDate(dateKey: string): string {
  return WEEKLY_MENU[weekdayOf(dateKey)]?.title ?? ''
}

/** Item latihan (bukan judul) untuk tanggal tsb — sumber checklist di tab Latihan. */
export function workoutItemsFor(dateKey: string): string[] {
  return WEEKLY_MENU[weekdayOf(dateKey)]?.items ?? []
}

export function isRestDay(dateKey: string): boolean {
  return WEEKLY_MENU[weekdayOf(dateKey)]?.rest === true
}

/** Log lama (sebelum fitur checklist) tidak punya `latihan_items` sama sekali —
 *  nilai `latihan_done` yang tersimpan dipakai sebagai gantinya, supaya progres
 *  historis tidak anjlok turun begitu aturan mulai berlaku. Begitu field-nya ada
 *  (termasuk `{}` dari emptyLog), aturan yang berlaku. */
function hasChecklist(log: DailyLog): boolean {
  return log.latihan_items !== undefined
}

/** Berapa item yang sudah dicentang (index items, bukan teks — teks bisa berubah).
 *  Hari istirahat / menu kosong dihitung tuntas: memakai guard yang SAMA dengan
 *  recomputeLatihanDone() supaya angka badge dan flag latihan_done tidak pernah
 *  bertentangan (dulu hari istirahat tampil 0/1 padahal aturannya sudah true). */
export function workoutDoneCount(log: DailyLog, dateKey: string): number {
  const items = workoutItemsFor(dateKey)
  if (items.length === 0 || isRestDay(dateKey)) return items.length
  if (!hasChecklist(log)) return log.latihan_done ? items.length : 0
  const map = log.latihan_items ?? {}
  return items.reduce((n, _, i) => n + (map[String(i)] === true ? 1 : 0), 0)
}

/** Sumber kebenaran tunggal latihan_done (dipakai tab Latihan untuk menulis DAN tab
 *  Hari untuk membaca). Hari istirahat latihan / menu kosong otomatis tuntas. */
export function recomputeLatihanDone(log: DailyLog, dateKey: string): boolean {
  const items = workoutItemsFor(dateKey)
  if (items.length === 0 || isRestDay(dateKey)) return true
  if (!hasChecklist(log)) return log.latihan_done
  return workoutDoneCount(log, dateKey) === items.length
}
