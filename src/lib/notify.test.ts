import { describe, expect, it } from 'vitest'
import { SNOOZE_MINUTES, msUntil } from './notify'

// Hanya fungsi murni yang diuji. notify.ts punya banyak API browser (vibrate,
// AudioContext, Notification, service worker) yang butuh jsdom — sengaja di luar
// cakupan environment 'node'. Modul ini aman di-import karena tidak menyentuh
// window/localStorage di level modul.
describe('msUntil', () => {
  const now = new Date(2026, 9, 17, 9, 0, 0) // Sabtu 09:00

  it('menghitung selisih ke jam yang lebih akhir hari ini', () => {
    expect(msUntil('10:00', now)).toBe(60 * 60 * 1000)
    expect(msUntil('09:01', now)).toBe(60 * 1000)
  })

  it('null bila jam sudah lewat', () => {
    expect(msUntil('08:00', now)).toBeNull()
    // Tepat sama dengan jam sekarang = dianggap sudah lewat (tidak dijadwalkan ulang).
    expect(msUntil('09:00', now)).toBeNull()
  })

  it('null untuk input tidak valid', () => {
    expect(msUntil('bukan jam', now)).toBeNull()
    expect(msUntil('', now)).toBeNull()
  })

  it('menormalisasi detik/milidetik pada jam target', () => {
    // Jam target dimulai dari detik 0, jadi sisa detik "sekarang" ikut terbuang.
    // 09:30:45.500 -> 10:00:00.000 = 29 menit 14.5 detik.
    const withSeconds = new Date(2026, 9, 17, 9, 30, 45, 500)
    expect(msUntil('10:00', withSeconds)).toBe(1754500)
  })
})

describe('SNOOZE_MINUTES', () => {
  it('positif dan masuk akal', () => {
    expect(SNOOZE_MINUTES).toBeGreaterThan(0)
    expect(SNOOZE_MINUTES).toBeLessThanOrEqual(60)
  })
})
