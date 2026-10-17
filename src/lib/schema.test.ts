import { describe, expect, it } from 'vitest'
import {
  SCORED_TASK_IDS,
  THRESHOLD,
  WEEKLY_MENU,
  addDays,
  canEdit,
  defaultMenuForDate,
  emptyLog,
  isRestDay,
  recomputeLatihanDone,
  scoredTaskIdsFor,
  taskDone,
  toDateKey,
  todayKey,
  workoutDoneCount,
  workoutItemsFor,
  type DailyLog,
} from './schema'

// 2026-10-19 = Senin, 2026-10-17 = Sabtu, 2026-10-18 = Minggu.
const MON = '2026-10-19'
const SAT = '2026-10-17'
const SUN = '2026-10-18'

/** Log dengan semua task non-latihan terpenuhi. */
function filled(date: string, over: Partial<DailyLog> = {}): DailyLog {
  return {
    ...emptyLog(date),
    protein_g: 150,
    air_L: 3.5,
    langkah: 9000,
    tidur_jam: 7.5,
    postur_done: true,
    makanan_clean: true,
    catatan: 'x',
    ...over,
  }
}

const ALL_ITEMS = { '0': true, '1': true, '2': true, '3': true, '4': true }

describe('date utils', () => {
  it('toDateKey memformat YYYY-MM-DD dengan nol di depan', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toDateKey(new Date(2026, 11, 31))).toBe('2026-12-31')
  })

  it('addDays.handle batas bulan, tahun leap, dan mundur', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDays(MON, 0)).toBe(MON)
  })

  it('canEdit hanya mengizinkan hari ini + H-1', () => {
    const now = MON // Senin 2026-10-19
    expect(canEdit(MON, now)).toBe(true) // hari ini
    expect(canEdit('2026-10-18', now)).toBe(true) // H-1 (Minggu)
    expect(canEdit('2026-10-17', now)).toBe(false) // H-2 (Sabtu)
    expect(canEdit('2026-10-15', now)).toBe(false)
    expect(canEdit('2026-10-20', now)).toBe(false) // masa depan
  })

  it('todayKey memakai format yang konsisten', () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('emptyLog', () => {
  it('mengisi default dan menyediakan kunci latihan_items', () => {
    const l = emptyLog(MON)
    expect(l.date).toBe(MON)
    expect(l.latihan_done).toBe(false)
    expect(l.postur_done).toBe(false)
    expect(l.makanan_clean).toBe(false)
    expect(l.catatan).toBe('')
    // Kunci harus ADA (walau kosong) supaya recomputeLatihanDone bisa
    // membedakan log baru dari log lama yang belum punya field ini.
    expect(l.latihan_items).toEqual({})
  })

  it('menerima menu latihan opsional', () => {
    expect(emptyLog(MON, 'Hari 1: Upper Pull & Grip').latihan_menu).toBe('Hari 1: Upper Pull & Grip')
  })
})

describe('WEEKLY_MENU', () => {
  it('lengkap untuk 7 hari dan menandai tepat 2 hari istirahat', () => {
    const restDays = Object.values(WEEKLY_MENU).filter((w) => w.rest === true)
    expect(restDays).toHaveLength(2)
    for (const day of [0, 1, 2, 3, 4, 5, 6]) {
      const w = WEEKLY_MENU[day]
      expect(w, `WEEKLY_MENU[${day}] harus ada`).toBeDefined()
      expect(w.items.length).toBeGreaterThan(0)
    }
  })

  it('hari istirahat = Sabtu & Minggu', () => {
    expect(isRestDay(SAT)).toBe(true)
    expect(isRestDay(SUN)).toBe(true)
    expect(isRestDay(MON)).toBe(false)
  })

  it('hari kerja punya minimal 2 item latihan', () => {
    // Active Recovery (Rabu) cuma punya 2 item — itu angka minimum di menu.
    for (const d of [MON, '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23']) {
      expect(workoutItemsFor(d).length).toBeGreaterThanOrEqual(2)
    }
    expect(workoutItemsFor('2026-10-21')).toHaveLength(2)
  })
})

describe('scoredTaskIdsFor', () => {
  it('hari latihan menyertakan latihan_done', () => {
    expect(scoredTaskIdsFor(MON)).toContain('latihan_done')
    expect(scoredTaskIdsFor(MON)).toHaveLength(8)
  })

  it('hari istirahat latihan mengeluarkan latihan_done', () => {
    // Ini BUKAN shift L (libur shift = hari latihan UTAMA, lihat shift.test.ts).
    expect(scoredTaskIdsFor(SAT)).not.toContain('latihan_done')
    expect(scoredTaskIdsFor(SAT)).toHaveLength(7)
  })

  it('tidak menghasilkan duplikat dan selalu menyalin array', () => {
    expect(new Set(scoredTaskIdsFor(SAT)).size).toBe(7)
    expect(scoredTaskIdsFor(SAT)).not.toBe(SCORED_TASK_IDS)
  })
})

describe('workoutDoneCount', () => {
  it('menghitung item yang dicentang', () => {
    expect(workoutDoneCount(emptyLog(MON), MON)).toBe(0)
    expect(workoutDoneCount({ ...emptyLog(MON), latihan_items: { '0': true } }, MON)).toBe(1)
    expect(workoutDoneCount({ ...emptyLog(MON), latihan_items: ALL_ITEMS }, MON)).toBe(5)
  })

  it('hari istirahat dihitung tuntas walau tidak ada yang dicentang', () => {
    expect(workoutDoneCount(emptyLog(SAT), SAT)).toBe(1)
    expect(workoutDoneCount(emptyLog(SUN), SUN)).toBe(2)
  })

  it('log lama tanpa latihan_items memakai nilai tersimpan', () => {
    const legacy: DailyLog = { ...filled(MON), latihan_done: true }
    delete legacy.latihan_items
    expect(workoutDoneCount(legacy, MON)).toBe(5)

    const legacyOff: DailyLog = { ...filled(MON), latihan_done: false }
    delete legacyOff.latihan_items
    expect(workoutDoneCount(legacyOff, MON)).toBe(0)
  })
})

describe('recomputeLatihanDone', () => {
  it('true hanya bila semua item hari latihan tercentang', () => {
    expect(recomputeLatihanDone(emptyLog(MON), MON)).toBe(false)
    expect(recomputeLatihanDone({ ...emptyLog(MON), latihan_items: { '0': true } }, MON)).toBe(false)
    expect(recomputeLatihanDone({ ...emptyLog(MON), latihan_items: ALL_ITEMS }, MON)).toBe(true)
  })

  it('hari istirahat otomatis true walau nilai tersimpan false', () => {
    const l: DailyLog = { ...emptyLog(SAT), latihan_done: false }
    expect(recomputeLatihanDone(l, SAT)).toBe(true)
  })

  it('log lama memakai nilai tersimpan', () => {
    const on: DailyLog = { ...filled(MON), latihan_done: true }
    delete on.latihan_items
    expect(recomputeLatihanDone(on, MON)).toBe(true)

    const off: DailyLog = { ...filled(MON), latihan_done: false }
    delete off.latihan_items
    expect(recomputeLatihanDone(off, MON)).toBe(false)
  })
})

describe('taskDone', () => {
  it('angka memakai THRESHOLD', () => {
    expect(taskDone(filled(MON, { protein_g: THRESHOLD.protein_min - 1 }), 'protein_g')).toBe(false)
    expect(taskDone(filled(MON, { protein_g: THRESHOLD.protein_min }), 'protein_g')).toBe(true)
    expect(taskDone(filled(MON, { air_L: THRESHOLD.air_min - 0.5 }), 'air_L')).toBe(false)
    expect(taskDone(filled(MON, { langkah: THRESHOLD.langkah_min - 1 }), 'langkah')).toBe(false)
    expect(taskDone(filled(MON, { tidur_jam: THRESHOLD.tidur_max + 1 }), 'tidur_jam')).toBe(false)
  })

  it('protein punya batas atas keras di protein_max', () => {
    // CATATAN: komentar di THRESHOLD protein_max bilang ">250 dianggap over tapi
    // tetap done", tapi kode memakai `<= protein_max` jadi >250 TIDAK done.
    // Tes ini mengikuti KODE (yang otoritatif). Komentarnya yang basi — lihat
    // catatan di laporan setup test.
    expect(taskDone(filled(MON, { protein_g: THRESHOLD.protein_max }), 'protein_g')).toBe(true)
    expect(taskDone(filled(MON, { protein_g: THRESHOLD.protein_max + 1 }), 'protein_g')).toBe(false)
    expect(taskDone(filled(MON, { protein_g: THRESHOLD.protein_max + 20 }), 'protein_g')).toBe(false)
  })

  it('catatan considers non-whitespace', () => {
    expect(taskDone(filled(MON, { catatan: '   ' }), 'catatan')).toBe(false)
    expect(taskDone(filled(MON, { catatan: 'x' }), 'catatan')).toBe(true)
    expect(taskDone(filled(MON, { catatan: undefined }), 'catatan')).toBe(false)
  })

  it('latihan_done diturunkan dari aturan, bukan nilai tersimpan', () => {
    // Nilai tersimpan sengaja bertentangan dengan aturan.
    expect(taskDone(filled(SAT, { latihan_done: false }), 'latihan_done')).toBe(true)
  })

  it('id task tidak dikenal -> false', () => {
    expect(taskDone(filled(MON), 'tidak_ada')).toBe(false)
  })
})

describe('defaultMenuForDate', () => {
  it('mengembalikan judul menu sesuai hari', () => {
    expect(defaultMenuForDate(MON)).toBe(WEEKLY_MENU[1].title)
    expect(defaultMenuForDate(SAT)).toBe(WEEKLY_MENU[6].title)
  })
})
