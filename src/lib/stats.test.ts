import { describe, expect, it } from 'vitest'
import { SCORED_TASK_IDS, emptyLog, isRestDay, type DailyLog } from './schema'
import { getProgress, grade } from './stats'

const MON = '2026-10-19' // Senin, hari latihan
const SAT = '2026-10-17' // Sabtu, hari istirahat
const SUN = '2026-10-18' // Minggu, hari istirahat

const ALL_ITEMS = { '0': true, '1': true, '2': true, '3': true, '4': true }

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

describe('getProgress — denominator per tanggal', () => {
  it('hari latihan: 8 task', () => {
    expect(getProgress(filled(MON, { latihan_items: ALL_ITEMS }))).toEqual({
      done: 8,
      total: 8,
      pct: 100,
    })
  })

  it('hari istirahat: 7 task, latihan_done tidak dihitung', () => {
    expect(getProgress(filled(SAT))).toEqual({ done: 7, total: 7, pct: 100 })
  })

  it('nilai latihan_done tersimpan tidak boleh dihitung di hari istirahat', () => {
    // Kalau latihan_done ikut dihitung di hari istirahat, istirahat dapat
    // poin gratis dan progres akhir pekan tidak akan pernah 100%.
    const g = getProgress(filled(SAT, { latihan_done: true }))
    expect(g.total).toBe(7)
    expect(g.pct).toBe(100)
  })

  it('hari istirahat tanpa catatan -> 6/7', () => {
    expect(getProgress(filled(SAT, { catatan: '' }))).toEqual({ done: 6, total: 7, pct: 86 })
  })

  it('hari latihan tanpa catatan -> 7/8', () => {
    expect(getProgress(filled(MON, { catatan: '', latihan_items: ALL_ITEMS }))).toEqual({
      done: 7,
      total: 8,
      pct: 88,
    })
  })

  it('log kosong -> 0', () => {
    expect(getProgress(emptyLog(MON))).toEqual({ done: 0, total: 8, pct: 0 })
  })

  it('total mengikuti scoredTaskIdsFor untuk kedua jenis hari', () => {
    for (const d of [MON, SAT, SUN]) {
      const expected = isRestDay(d) ? SCORED_TASK_IDS.length - 1 : SCORED_TASK_IDS.length
      expect(getProgress(filled(d)).total).toBe(expected)
    }
  })
})

describe('getProgress — kompatibilitas log lama', () => {
  it('log tanpa latihan_items memakai nilai latihan_done tersimpan', () => {
    const legacy = filled(MON, { latihan_done: true })
    delete legacy.latihan_items
    expect(getProgress(legacy)).toEqual({ done: 8, total: 8, pct: 100 })
  })

  it('log lama dengan latihan_done false -> 7/8', () => {
    const legacy = filled(MON, { latihan_done: false })
    delete legacy.latihan_items
    expect(getProgress(legacy)).toEqual({ done: 7, total: 8, pct: 88 })
  })

  it('log lama di hari istirahat tetap 7/7 (aturan menang atas nilai tersimpan)', () => {
    const legacy = filled(SAT, { latihan_done: false })
    delete legacy.latihan_items
    expect(getProgress(legacy)).toEqual({ done: 7, total: 7, pct: 100 })
  })
})

describe('getProgress — rentang aman', () => {
  it('tidak pernah melebihi 100% walau field ekstrem', () => {
    const g = getProgress(
      filled(MON, {
        protein_g: 9999,
        air_L: 99,
        langkah: 999999,
        tidur_jam: 99,
        postur_done: true,
        makanan_clean: true,
        catatan: 'x',
        latihan_items: ALL_ITEMS,
      }),
    )
    expect(g.pct).toBeLessThanOrEqual(100)
    expect(g.pct).toBeGreaterThanOrEqual(0)
  })
})

describe('grade', () => {
  it('memetakan ambang ke label yang benar', () => {
    expect(grade(100)).toMatch(/^S/)
    expect(grade(75)).toMatch(/^A/) // S hanya mulai 100, tidak 99
    expect(grade(74)).toMatch(/^B/)
    expect(grade(50)).toMatch(/^B/)
    expect(grade(49)).toMatch(/^C/)
    expect(grade(25)).toMatch(/^C/)
    expect(grade(24)).toMatch(/^D/)
    expect(grade(0)).toMatch(/^D/)
  })
})
