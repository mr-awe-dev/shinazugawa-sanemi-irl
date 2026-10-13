import { getProgress } from './stats'
import type { DailyLog } from './schema'

// Notifikasi lokal (tanpa backend): dijadwalkan halaman app mengikuti jam
// pengingat shift hari ini. Hanya bunyi bila progres < 100%.
// Batasan jujur: browser harus/p pernah dibuka agar timer jalan; untuk
// pengingat saat app TERTUTUP total perlu push server (backend) — belum ada.

const PREF_KEY = 'sanemi-notify-v1'
const LOGS_KEY = 'sanemi-logs-v1'

export function supportNotification(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getPermission(): NotificationPermission | 'unsupported' {
  if (!supportNotification()) return 'unsupported'
  return Notification.permission
}

export async function requestPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!supportNotification()) return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

export function loadNotifyPref(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) === '1'
  } catch {
    return false
  }
}

export function saveNotifyPref(on: boolean): void {
  try {
    localStorage.setItem(PREF_KEY, on ? '1' : '0')
  } catch {
    /* abaikan */
  }
}

/** ms dari sekarang ke jam HH:MM hari ini; null bila sudah lewat. */
export function msUntil(time: string, now = new Date()): number | null {
  const [h, m] = time.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  const target = new Date(now)
  target.setHours(h, m, 0, 0)
  const diff = target.getTime() - now.getTime()
  return diff > 0 ? diff : null
}

function todayProgress(dateKey: string): number | null {
  try {
    const raw = localStorage.getItem(LOGS_KEY)
    if (!raw) return null
    const all = JSON.parse(raw) as Record<string, DailyLog>
    const log = all[dateKey]
    return log ? getProgress(log).pct : 0
  } catch {
    return null
  }
}

export type ShowResult = 'shown' | 'skipped-done' | 'denied' | 'unsupported' | 'failed'

/** Tampilkan notifikasi — diutamakan via Service Worker (tetap jalan saat tab
 *  di-background), fallback ke Notification halaman. Kembalikan status agar UI
 *  bisa melapor ke pengguna bila gagal. */
async function showNotification(title: string, body: string, tag: string): Promise<ShowResult> {
  if (!supportNotification() || Notification.permission !== 'granted') return 'denied'
  const options: NotificationOptions = { body, tag, icon: 'icon.svg' }
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, options)
      return 'shown'
    }
  } catch {
    /* jatuh ke fallback halaman */
  }
  try {
    new Notification(title, options)
    return 'shown'
  } catch {
    return 'failed'
  }
}

export function getSWStatus(): Promise<'ready' | 'missing' | 'unsupported'> {
  if (!('serviceWorker' in navigator)) return Promise.resolve('unsupported')
  return navigator.serviceWorker.ready.then(
    () => 'ready' as const,
    () => 'missing' as const,
  )
}

export async function fireReminder(time: string, dateKey: string, shiftLabelText: string): Promise<ShowResult> {
  if (!supportNotification()) return 'unsupported'
  if (Notification.permission !== 'granted') return 'denied'
  const pct = todayProgress(dateKey)
  if (pct === null || pct >= 100) return 'skipped-done' // sudah tuntas / tak ada data → diam
  return showNotification(
    'Sanemi IRL Tracker',
    `Pengingat ${time} (${shiftLabelText}) — progres ${pct}%. Lukai dirimu hari ini, agar lebih kuat besok.`,
    `sanemi-${dateKey}-${time}`,
  )
}

export async function sendTest(): Promise<ShowResult> {
  return showNotification(
    'Sanemi IRL Tracker',
    'Notifikasi uji — kalau ini muncul, pengingat otomatis siap jalan.',
    'sanemi-test',
  )
}
