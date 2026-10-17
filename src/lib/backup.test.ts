import { describe, expect, it } from 'vitest'
import { BACKUP_APP, BACKUP_VERSION, parseBackupText } from './backup'
import { emptyLog, type DailyLog } from './schema'
import { currentMonthKey, getMonthMeta } from './meta'
import { monthKeyOf } from './recap'

function backupJson(over: Record<string, unknown> = {}): string {
  return JSON.stringify({
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: '2026-10-17T00:00:00.000Z',
    logs: {},
    shifts: {},
    meta: {},
    ...over,
  })
}

const VALID_LOG: DailyLog = { ...emptyLog('2026-10-13'), catatan: 'catatan uji' }

describe('parseBackupText — jalur menolak input tak dikenal', () => {
  it('menolak JSON rusak', () => {
    const r = parseBackupText('{bukan json')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/JSON/)
  })

  it('menolak file dari app lain', () => {
    const r = parseBackupText(JSON.stringify({ app: 'aplikasi_lain', version: 1 }))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/bukan backup/i)
  })

  it('menolak versi yang lebih baru dari app', () => {
    const r = parseBackupText(backupJson({ version: BACKUP_VERSION + 1 }))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/lebih baru/i)
  })

  it('menolak payload yang bukan objek', () => {
    expect(parseBackupText('[]').ok).toBe(false)
    expect(parseBackupText('"teks"').ok).toBe(false)
  })
})

describe('parseBackupText — validasi isi', () => {
  it('menerima backup kosong yang valid', () => {
    const r = parseBackupText(backupJson())
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.logs).toBe(0)
    expect(r.shifts).toBe(0)
    expect(r.meta).toBe(0)
    expect(r.warnings).toEqual([])
  })

  it('menyimpan log, shift, dan meta yang valid', () => {
    const r = parseBackupText(
      backupJson({
        logs: { '2026-10-13': VALID_LOG },
        shifts: { '2026-10-13': 'P', '2026-10-14': 'M' },
        meta: { '2026-10': { eval: 'ok', deloadDone: true } },
      }),
    )
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.logs).toBe(1)
    expect(r.shifts).toBe(2)
    expect(r.meta).toBe(1)
    expect(r.warnings).toEqual([])
  })

  it('menormalisasi date log dari kunci entri', () => {
    const r = parseBackupText(backupJson({ logs: { '2026-10-13': { ...VALID_LOG, date: 'SALAH' } } }))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.data.logs['2026-10-13'].date).toBe('2026-10-13')
  })
})

describe('parseBackupText — baris rusak dilewati, bukan membatalkan import', () => {
  it('melempar kunci tanggal tidak valid', () => {
    const r = parseBackupText(
      backupJson({ logs: { 'bukan-tanggal': VALID_LOG, '2026-10-13': VALID_LOG } }),
    )
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.logs).toBe(1)
    expect(r.warnings).toHaveLength(1)
    expect(r.warnings[0]).toContain('bukan-tanggal')
  })

  it('melempar kode shift tidak dikenal', () => {
    const r = parseBackupText(backupJson({ shifts: { '2026-10-13': 'Z', '2026-10-14': 'P' } }))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.shifts).toBe(1)
    expect(r.warnings).toHaveLength(1)
    expect(r.warnings[0]).toContain('kode tidak valid')
  })

  it('melempar kunci meta yang bukan YYYY-MM', () => {
    const r = parseBackupText(backupJson({ meta: { '2026-10-13': { eval: '', deloadDone: false } } }))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.meta).toBe(0)
    expect(r.warnings).toHaveLength(1)
  })

  it('membersihkan tipe meta yang salah', () => {
    const r = parseBackupText(backupJson({ meta: { '2026-10': { eval: 123, deloadDone: 'ya' } } }))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.data.meta['2026-10']).toEqual({ eval: '', deloadDone: false })
  })
})

describe('meta', () => {
  it('getMonthMeta mengembalikan default untuk bulan yang belum ada', () => {
    expect(getMonthMeta({}, '2026-10')).toEqual({ eval: '', deloadDone: false })
  })

  it('getMonthMeta mengembalikan nilai yang tersimpan', () => {
    const all = { '2026-10': { eval: 'baik', deloadDone: true } }
    expect(getMonthMeta(all, '2026-10')).toEqual({ eval: 'baik', deloadDone: true })
  })

  it('currentMonthKey_format YYYY-MM', () => {
    const k = currentMonthKey()
    expect(k).toMatch(/^\d{4}-\d{2}$/)
    expect(k.length).toBe(7)
  })
})

describe('monthKeyOf dipakai meta & recap konsisten', () => {
  it('menghasilkan kunci yang cocok', () => {
    expect(monthKeyOf(`${currentMonthKey()}-15`)).toBe(currentMonthKey())
  })
})
