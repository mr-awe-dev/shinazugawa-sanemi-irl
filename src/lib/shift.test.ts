import { describe, expect, it } from 'vitest'
import {
  SHIFT_ADJUST,
  SHIFT_INFO,
  SHIFT_TABLE_SAMPLE,
  isReminderDue,
  mergeShiftRows,
  parseShiftTable,
  shiftLabel,
  type ShiftCode,
} from './shift'

const CODES = Object.keys(SHIFT_INFO) as ShiftCode[]

describe('SHIFT_INFO & SHIFT_ADJUST', () => {
  it('setiap kode punya info + adjustment (tidak ada kode tanpa aturan)', () => {
    expect(CODES.sort()).toEqual(['L', 'M', 'O', 'P', 'S', 'T'])
    for (const c of CODES) {
      expect(SHIFT_INFO[c], `SHIFT_INFO[${c}]`).toBeDefined()
      expect(SHIFT_ADJUST[c], `SHIFT_ADJUST[${c}]`).toBeDefined()
      expect(SHIFT_ADJUST[c].reminderTimes.length).toBeGreaterThan(0)
      for (const t of SHIFT_ADJUST[c].reminderTimes) {
        expect(t, `jam pengingat ${c}`).toMatch(/^\d{2}:\d{2}$/)
      }
    }
  })

  it('libur shift (L) berarti latihan UTAMA, bukan hari istirahat', () => {
    //Regression guard: skor harian mengecualikan HARI ISTIRAH LATIHAN
    // (WEEKLY_MENU rest = Sabtu/Minggu), BUKAN shift L. Kalau ini berubah,
    // aturan di schema.ts ikut salah.
    expect(SHIFT_ADJUST.L.workoutMode).toBe('utama')
  })

  it('hanya L yang berworkoutMode utama', () => {
    const utama = CODES.filter((c) => SHIFT_ADJUST[c].workoutMode === 'utama')
    expect(utama).toEqual(['L'])
  })

  it('jam shift berformat HH:MM dan L tidak punya jam', () => {
    for (const c of CODES) {
      const info = SHIFT_INFO[c]
      if (c === 'L') {
        expect(info.mulai).toBe('-')
        expect(info.durasiJam).toBe(0)
      } else {
        expect(info.mulai, `${c}.mulai`).toMatch(/^\d{2}:\d{2}$/)
        expect(info.selesai, `${c}.selesai`).toMatch(/^\d{2}:\d{2}$/)
        expect(info.durasiJam).toBeGreaterThan(0)
      }
    }
  })
})

describe('shiftLabel', () => {
  it('libur tidak menampilkan jam', () => {
    expect(shiftLabel('L')).toBe('L — Libur')
    expect(shiftLabel('L')).not.toContain('-')
  })

  it('kode lain menampilkan jam', () => {
    expect(shiftLabel('P')).toContain('07:00')
    expect(shiftLabel('M')).toContain('23:00')
  })
})

describe('isReminderDue', () => {
  it('true dalam toleransi ±60 menit', () => {
    const at0945 = new Date(2026, 9, 17, 9, 45) // 585 menit
    expect(isReminderDue(['10:00'], at0945)).toBe('10:00') // beda 15 menit
    expect(isReminderDue(['09:00'], at0945)).toBe('09:00') // beda 45 menit
    expect(isReminderDue(['09:00'], new Date(2026, 9, 17, 9, 0))).toBe('09:00')
  })

  it('tepat di batas ±60 menit masih dianggap due', () => {
    // 08:45 vs 09:45 = tepat 60 menit, syaratnya "<= 60".
    expect(isReminderDue(['08:45'], new Date(2026, 9, 17, 9, 45))).toBe('08:45')
  })

  it('di luar toleransi -> null', () => {
    // 09:45 vs 08:30 = 75 menit, melewati batas ±60.
    expect(isReminderDue(['08:30'], new Date(2026, 9, 17, 9, 45))).toBeNull()
    // 09:45 vs 11:00 = 75 menit.
    expect(isReminderDue(['11:00'], new Date(2026, 9, 17, 9, 45))).toBeNull()
    expect(isReminderDue(['10:00'], new Date(2026, 9, 17, 12, 0))).toBeNull()
  })

  it('daftar kosong -> null', () => {
    expect(isReminderDue([], new Date(2026, 9, 17, 10, 0))).toBeNull()
  })
})

describe('parseShiftTable — format & delimiter', () => {
  it('menerima delimiter "|" sesuai format yang diminta user', () => {
    const r = parseShiftTable('| Tanggal | Kode Jadwal |\n| 2026-11-02 | P |\n| 2026-11-03 | M |')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.rows).toEqual([
      { date: '2026-11-02', code: 'P' },
      { date: '2026-11-03', code: 'M' },
    ])
    expect(r.warnings).toEqual([])
  })

  it('menerima koma (CSV dari Excel/Notion)', () => {
    const r = parseShiftTable('Tanggal,Kode Jadwal\n2026-11-02,P')
    expect(r.ok && r.rows).toEqual([{ date: '2026-11-02', code: 'P' }])
  })

  it('menghormati sel berkutip', () => {
    const r = parseShiftTable('Tanggal,Kode Jadwal\n"2026-11-02","P"')
    expect(r.ok && r.rows).toEqual([{ date: '2026-11-02', code: 'P' }])
  })

  it('menormalisasi kode huruf kecil', () => {
    const r = parseShiftTable('| Tanggal | Kode Jadwal |\n| 2026-11-02 | p |')
    expect(r.ok && r.rows).toEqual([{ date: '2026-11-02', code: 'P' }])
  })

  it('melewati baris kosong dan komentar', () => {
    const r = parseShiftTable('| Tanggal | Kode Jadwal |\n# catatan\n\n| 2026-11-02 | L |')
    expect(r.ok && r.rows).toEqual([{ date: '2026-11-02', code: 'L' }])
    expect(r.ok && r.warnings).toEqual([])
  })

  it('contoh format yang ditampilkan UI benar-benar bisa di-parse', () => {
    const r = parseShiftTable(SHIFT_TABLE_SAMPLE)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.rows).toHaveLength(3)
    expect(r.warnings).toEqual([])
  })
})

describe('parseShiftTable — validasi & toleransi error', () => {
  it('menolak tanggal kalender yang tidak ada (round-trip check)', () => {
    const r = parseShiftTable('| Tanggal | Kode Jadwal |\n| 2026-02-30 | P |\n| 2026-13-01 | P |\n| 2026-11-02 | P |')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.rows).toEqual([{ date: '2026-11-02', code: 'P' }])
    expect(r.warnings).toHaveLength(2)
    expect(r.warnings[0]).toContain('Baris 2')
  })

  it('menolak kode di luar P/S/M/O/L/T', () => {
    const r = parseShiftTable('| Tanggal | Kode Jadwal |\n| 2026-11-02 | X |\n| 2026-11-03 | S |')
    expect(r.ok && r.rows).toEqual([{ date: '2026-11-03', code: 'S' }])
    expect(r.ok && r.warnings[0]).toContain('tidak dikenal')
  })

  it('tanggal dobel: kode terakhir menang + ada warning', () => {
    const r = parseShiftTable('| Tanggal | Kode Jadwal |\n| 2026-11-02 | P |\n| 2026-11-02 | O |')
    expect(r.ok && r.rows).toEqual([{ date: '2026-11-02', code: 'O' }])
    expect(r.ok && r.warnings).toHaveLength(1)
  })

  it('header tidak dikenal -> ditolak, bukan diam-diam import 0 baris', () => {
    const r = parseShiftTable('foo,bar\n1,2')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/Header tidak dikenali/)
  })

  it('konten kosong / header saja ditolak', () => {
    expect(parseShiftTable('   \n  ').ok).toBe(false)
    expect(parseShiftTable('| Tanggal | Kode Jadwal |').ok).toBe(false)
  })

  it('semua baris tidak valid ditolak (tidak ada import palsu 0 baris)', () => {
    const r = parseShiftTable('| Tanggal | Kode Jadwal |\n| 2026-02-30 | P |')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/tidak ada baris valid/i)
  })
})

describe('mergeShiftRows', () => {
  it('hanya menimpa tanggal yang ada di file', () => {
    expect(mergeShiftRows({ '2026-01-01': 'M', '2026-11-02': 'S' }, [{ date: '2026-11-02', code: 'O' }])).toEqual({
      '2026-01-01': 'M',
      '2026-11-02': 'O',
    })
  })

  it('menambah tanggal baru tanpa menyentuh yang lain', () => {
    expect(mergeShiftRows({ '2026-01-01': 'M' }, [{ date: '2026-12-01', code: 'T' }])).toEqual({
      '2026-01-01': 'M',
      '2026-12-01': 'T',
    })
  })

  it('tidak memutasi input (merge harus immutable)', () => {
    const before = { '2026-01-01': 'M' as const }
    const snapshot = { ...before }
    mergeShiftRows(before, [{ date: '2026-02-02', code: 'L' }])
    expect(before).toEqual(snapshot)
  })
})
