import { describe, expect, it } from 'vitest'
import { SCORED_TASK_IDS, emptyLog, type DailyLog } from './schema'
import {
  HABIT_IDS,
  HABIT_LABEL,
  monthKeyOf,
  monthLabel,
  monthRange,
  monthStat,
  shiftMonth,
  weekRange,
  weekStartOf,
  weekStat,
} from './recap'

const MON = '2026-10-19' // Senin
const SAT = '2026-10-17' // Sabtu
const SUN = '2026-10-18' // Minggu
const WEEK_START = '2026-10-12' // Senin

const ALL_ITEMS = { '0': true, '1': true, '2': true, '3': true, '4': true }

function day(date: string, over: Partial<DailyLog> = {}): DailyLog {
  return {
    ...emptyLog(date),
    protein_g: 150,
    air_L: 3.5,
    langkah: 9000,
    tidur_jam: 7.5,
    postur_done: true,
    makanan_clean: true,
    catatan: 'x',
    latihan_items: ALL_ITEMS,
    ...over,
  }
}

function weekFilled(over: Partial<DailyLog> = {}): Record<string, DailyLog> {
  const out: Record<string, DailyLog> = {}
  for (const k of weekRange(WEEK_START)) out[k] = day(k, over)
  return out
}

describe('rentang tanggal', () => {
  it('weekStartOf mengembalikan hari itu sendiri bila sudah Senin', () => {
    expect(weekStartOf(MON)).toBe(MON)
  })

  it('weekStartOf mundur ke Senin untuk hari lain', () => {
    expect(weekStartOf(SAT)).toBe(WEEK_START)
    expect(weekStartOf(SUN)).toBe(WEEK_START)
    expect(weekStartOf('2026-10-23')).toBe('2026-10-19')
  })

  it('weekRange selalu 7 hari Senin-Minggu', () => {
    const r = weekRange(WEEK_START)
    expect(r).toHaveLength(7)
    expect(r[0]).toBe(WEEK_START)
    expect(r[6]).toBe(SUN)
  })

  it('monthRange panjangnya sesuai jumlah hari bulan', () => {
    expect(monthRange('2026-10')).toHaveLength(31)
    expect(monthRange('2026-02')).toHaveLength(28)
    expect(monthRange('2024-02')).toHaveLength(29)
  })

  it('monthKeyOf mengambil slice YYYY-MM', () => {
    expect(monthKeyOf('2026-10-17')).toBe('2026-10')
  })

  it('shiftMonth navigasi lintas tahun', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
  })

  it('monthLabel menghasilkan label yang bisa dibaca', () => {
    expect(monthLabel('2026-10')).toMatch(/2026/)
  })
})

describe('HABIT_IDS sinkron dengan skor harian', () => {
  it('daftar habit = daftar task yang dihitung harian', () => {
    // Bila melenceng, weekStat.pct dan monthStat.avgPct memakai denominator
    // berbeda padahal tampil berdampingan (regresi 100% vs 87%).
    expect([...HABIT_IDS]).toEqual([...SCORED_TASK_IDS])
  })

  it('setiap habit punya label (dijaga compiler lewat Record<HabitId, string>)', () => {
    for (const id of HABIT_IDS) {
      expect(HABIT_LABEL[id], `label untuk ${id}`).toBeTruthy()
    }
  })
})

describe('weekStat', () => {
  it('minggu lengkap 7 hari -> semua task tuntas -> 100%', () => {
    const w = weekStat(weekFilled(), WEEK_START)
    expect(w.logged).toBe(7)
    expect(w.pct).toBe(100)
  })

  it('latihan_done memakai denominator hari NON-istirahat (of = 5 di minggu penuh)', () => {
    const w = weekStat(weekFilled(), WEEK_START)
    expect(w.perTask.latihan_done.of).toBe(5)
    expect(w.perTask.latihan_done.done).toBe(5)
    // Task lain tetap 7 — tidak semua hari Ada.
    expect(w.perTask.protein_g.of).toBe(7)
    expect(w.total).toBe(5 + 7 * 7) // 54
  })

  it('minggu parsial: of per-task menyesuaikan jumlah hari terisi', () => {
    const w = weekStat({ [WEEK_START]: day(WEEK_START), [SAT]: day(SAT), [SUN]: day(SUN) }, WEEK_START)
    expect(w.logged).toBe(3)
    expect(w.perTask.latihan_done.of).toBe(1) // hanya Senin
    expect(w.perTask.protein_g.of).toBe(3)
    // 8 habit: latihan_done of=1 (hanya hari kerja), 7 lainnya of=3.
    expect(w.total).toBe(1 + 7 * 3)
  })

  it('minggu kosong tidak membagi dengan nol', () => {
    const w = weekStat({}, WEEK_START)
    expect(w.logged).toBe(0)
    expect(w.pct).toBeNull()
    expect(w.best).toBeNull()
    expect(w.total).toBe(0)
  })

  it('best tidak pernah melaporkan done > of', () => {
    const w = weekStat(weekFilled({ catatan: '' }), WEEK_START)
    expect(w.best).not.toBeNull()
    expect(w.best!.done).toBeLessThanOrEqual(w.best!.of)
  })
})

describe('monthStat', () => {
  it('latihanCount tidak menghitung hari istirahat latihan', () => {
    const m = monthStat(weekFilled(), '2026-10')
    expect(m.logged).toBe(7)
    // 5 hari kerja saja; Sabtu/Minggu tidak dihitung meski latihan_done true.
    expect(m.latihanCount).toBe(5)
  })

  it('nilai latihan_done tersimpan di hari istirahat tidak membuat latihanCount naik', () => {
    const cheat: Record<string, DailyLog> = {}
    for (const k of weekRange(WEEK_START)) cheat[k] = { ...day(k), latihan_done: true }
    expect(monthStat(cheat, '2026-10').latihanCount).toBe(5)
  })

  it('bulan kosong avgPct null, bukan 0', () => {
    const m = monthStat({}, '2026-10')
    expect(m.avgPct).toBeNull()
    expect(m.logged).toBe(0)
  })
})

describe('REGRESI: skala mingguan harus sama dengan harian', () => {
  // Bug lama: HABIT_IDS tidak memuat 'catatan' sementara skor harian memuatnya.
  // Akibatnya weekly pct dan monthly avgPct beda denominator untuk data yang
  // sama (100% vs 87%). Keduanya tampil berdampingan di tab Riwayat.
  it('weekly pct === monthly avgPct saat catatan kosong', () => {
    const all = weekFilled({ catatan: '' })
    expect(weekStat(all, WEEK_START).pct).toBe(monthStat(all, '2026-10').avgPct)
  })

  it('weekly pct === monthly avgPct saat semua lengkap', () => {
    const all = weekFilled()
    expect(weekStat(all, WEEK_START).pct).toBe(monthStat(all, '2026-10').avgPct)
  })

  it('bukan 100% kalau ada hari yang bolong (guard agar tes di atas tidak vacuous)', () => {
    const all = weekFilled({ catatan: '' })
    expect(weekStat(all, WEEK_START).pct).toBeLessThan(100)
  })
})
