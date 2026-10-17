import { getProgress } from './stats'
import { todayKey, type DailyLog } from './schema'

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

/** Notifikasi lengket + getar + beep. Beep hanya bisa di thread halaman (Web Audio),
 *  jadi alarm berbunyi selama tab ini terbuka; notif lengket tetap terlihat walau
 *  app di-minimize. Tanpa push server, app yang DITUTUP total tidak berbunyi. */
export const SNOOZE_MINUTES = 10
export const ALARM_VIBRATE = [220, 120, 220, 120, 500]

const ALARM_ACTIONS: AlarmAction[] = [
  { action: 'snooze', title: `Snooze ${SNOOZE_MINUTES} mnt` },
  { action: 'dismiss', title: 'Sudah Recall' },
]

let audioCtx: AudioContext | null = null
let lastReminder: { time: string; dateKey: string; label: string } | null = null
let snoozeTimer: ReturnType<typeof setTimeout> | null = null
let snoozeUntil = 0

type Tone = { hz: number; at: number; dur: number }

/** lib DOM bawaan TS belum mendeklarasikan field notifikasi alarm ini (actions /
 *  vibrate / renotify) meski sudah didukung browser — dideklarasikan lokal agar
 *  config tsconfig tidak perlu disentuh. */
type AlarmAction = { action: string; title: string }

type AlarmNotificationOptions = NotificationOptions & {
  renotify?: boolean
  vibrate?: number[]
  actions?: AlarmAction[]
}

export function vibrate(pattern: number[] = ALARM_VIBRATE): boolean {
  try {
    return navigator.vibrate?.(pattern) ?? false
  } catch {
    return false
  }
}

/** Tutup context sinkron (WAJIB sinkron — kalau await, referensinya tertimpa
 *  context baru yang startAlarm() baru saja buat, sehingga tak bisa dihentikan). */
function closeAudio(): void {
  const ctx = audioCtx
  audioCtx = null
  if (ctx) {
    try {
      void ctx.close()
    } catch {
      /* abaikan */
    }
  }
}

/** Beep berulang tanpa file audio (AudioContext, oscillator sine). */
export function startAlarm(times = 3): void {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return
  closeAudio()
  try {
    const ctx = new Ctor()
    audioCtx = ctx
    void ctx.resume()
    for (let i = 0; i < times; i++) {
      const at = ctx.currentTime + i * 0.65
      const tones: Tone[] = [
        { hz: 880, at, dur: 0.16 },
        { hz: 660, at: at + 0.2, dur: 0.22 },
      ]
      for (const t of tones) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(t.hz, t.at)
        gain.gain.setValueAtTime(0.0001, t.at)
        gain.gain.exponentialRampToValueAtTime(0.2, t.at + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, t.at + t.dur)
        osc.connect(gain).connect(ctx.destination)
        osc.start(t.at)
        osc.stop(t.at + t.dur + 0.02)
      }
    }
  } catch {
    audioCtx = null
  }
}

/** Hentikan bunyi + tutup notifikasi yang masih menempel di layar. */
export async function stopAlarm(): Promise<void> {
  closeAudio()
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    const list = await reg?.getNotifications()
    list?.forEach((n) => n.close())
  } catch {
    /* abaikan */
  }
}

export function clearSnooze(): void {
  if (snoozeTimer !== null) clearTimeout(snoozeTimer)
  snoozeTimer = null
  snoozeUntil = 0
}

/** Menyesuaikan ulang pengingat terakhir; false kalau belum ada pengingat yang bunyi. */
export function scheduleSnooze(minutes = SNOOZE_MINUTES): boolean {
  if (!lastReminder) return false
  clearSnooze()
  const target = lastReminder
  snoozeUntil = Date.now() + minutes * 60000
  snoozeTimer = setTimeout(() => {
    snoozeTimer = null
    snoozeUntil = 0
    void fireReminder(target.time, target.dateKey, target.label)
  }, minutes * 60000)
  return true
}

/** Sisa waktu snooze dalam ms, atau null kalau tidak ada snooze aktif. */
export function snoozeRemainingMs(): number | null {
  if (snoozeTimer === null) return null
  return Math.max(0, snoozeUntil - Date.now())
}

/** Tampilkan notifikasi — diutamakan via Service Worker (tetap jalan saat tab
 *  di-background), fallback ke Notification halaman. Kembalikan status agar UI
 *  bisa melapor ke pengguna bila gagal. */
async function showNotification(
  title: string,
  body: string,
  tag: string,
  opts: { sticky?: boolean; alarm?: boolean } = {},
): Promise<ShowResult> {
  if (!supportNotification() || Notification.permission !== 'granted') return 'denied'
  const sticky = opts.sticky === true
  const options: AlarmNotificationOptions = {
    body,
    tag,
    icon: 'icon.svg',
    requireInteraction: sticky,
    renotify: sticky,
    data: { tag },
  }
  if (opts.alarm) {
    options.vibrate = ALARM_VIBRATE
    options.actions = ALARM_ACTIONS
  }
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
  lastReminder = { time, dateKey, label: shiftLabelText }
  const r = await showNotification(
    'Sanemi IRL Tracker',
    `Pengingat ${time} (${shiftLabelText}) — progres ${pct}%. Lukai dirimu hari ini, agar lebih kuat besok.`,
    `sanemi-${dateKey}-${time}`,
    { sticky: true, alarm: true },
  )
  if (r === 'shown') {
    vibrate()
    startAlarm()
  }
  return r
}

export async function sendTest(): Promise<ShowResult> {
  return showNotification(
    'Sanemi IRL Tracker',
    'Notifikasi uji — kalau ini muncul, pengingat otomatis siap jalan.',
    'sanemi-test',
  )
}

/** Uji alarm: notif lengket + getar + beep 3x, persis seperti pengingat sungguhan. */
export async function sendAlarmTest(): Promise<ShowResult> {
  const pct = todayProgress(todayKey())
  lastReminder = { time: 'uji', dateKey: todayKey(), label: 'Uji alarm' }
  const r = await showNotification(
    'Uji Alarm — Sanemi IRL',
    `Ini bunyi + getar seperti pengingat sungguhan${pct === null ? '' : ` (progres ${pct}%)`}. Tekan Snooze atau Sudah Recall.`,
    'sanemi-alarm-test',
    { sticky: true, alarm: true },
  )
  if (r === 'shown') {
    vibrate()
    startAlarm()
  }
  return r
}
