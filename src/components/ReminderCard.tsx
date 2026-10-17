import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  SNOOZE_MINUTES,
  clearSnooze,
  getPermission,
  getSWStatus,
  msUntil,
  requestPermission,
  scheduleSnooze,
  sendAlarmTest,
  sendTest,
  snoozeRemainingMs,
  stopAlarm,
  supportNotification,
  type ShowResult,
} from '../lib/notify'
import { IconBell, IconClock } from './icons'

type Props = {
  enabled: boolean
  times: string[] | null
  onToggle: (on: boolean) => void
  onNeedShift: () => void
}

function fmtCountdown(ms: number): string {
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins} mnt lagi`
  const h = Math.floor(mins / 60)
  return `${h} j ${mins % 60} mnt lagi`
}

function fmtSnooze(ms: number): string {
  const total = Math.ceil(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

const RESULT_MSG: Record<ShowResult, { type: 'ok' | 'err'; msg: string }> = {
  shown: { type: 'ok', msg: 'Terkirim ke sistem. Tidak terlihat? Cek Action Center (Win+N) / pastikan Do Not Disturb mati.' },
  'skipped-done': { type: 'ok', msg: 'Dilewati karena progres sudah 100% — memang dirancang diam bila tuntas.' },
  denied: { type: 'err', msg: 'Izin belum granted. Aktifkan dulu lewat tombol di bawah / pengaturan browser.' },
  unsupported: { type: 'err', msg: 'Browser tidak mendukung Notification API.' },
  failed: { type: 'err', msg: 'Gagal tampil (browser memblokir). Coba tutup-buka tab, lalu uji lagi.' },
}

const ALARM_MSG: Record<ShowResult, { type: 'ok' | 'err'; msg: string }> = {
  shown: { type: 'ok', msg: 'Alarm bunyi 3x + getar. Notifikasi ini lengket — pakai tombol Snooze / Sudah Recall di notifikasi, atau tombol di bawah.' },
  'skipped-done': { type: 'ok', msg: 'Alarm tidak dipicu (progres sudah 100%).' },
  denied: { type: 'err', msg: 'Izin notifikasi belum granted — alarm tidak bisa tampil.' },
  unsupported: { type: 'err', msg: 'Browser tidak mendukung Notification API.' },
  failed: { type: 'err', msg: 'Gagal tampil (browser memblokir). Tutup-buka tab, lalu uji lagi.' },
}

/** Countdown terisolasi supaya tick 1 detik tidak me-render ulang seluruh card. */
function SnoozeCountdown({ onExpire }: { onExpire: () => void }) {
  const [ms, setMs] = useState<number | null>(() => snoozeRemainingMs())

  useEffect(() => {
    const t = setInterval(() => {
      const left = snoozeRemainingMs()
      setMs(left)
      if (left === null) onExpire()
    }, 1000)
    return () => clearInterval(t)
  }, [onExpire])

  if (ms === null) return null
  return (
    <span>
      Snooze {SNOOZE_MINUTES} mnt — berbunyi lagi dalam <strong>{fmtSnooze(ms)}</strong>
    </span>
  )
}

export default function ReminderCard({ enabled, times, onToggle, onNeedShift }: Props) {
  const supported = supportNotification()
  const [perm, setPerm] = useState(getPermission())
  const [sw, setSw] = useState<'ready' | 'missing' | 'unsupported' | 'checking'>('checking')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [alarmResult, setAlarmResult] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [alarmState, setAlarmState] = useState<'idle' | 'ringing' | 'snoozed'>('idle')
  const [nowTick, setNowTick] = useState(() => Date.now())

  const refresh = useCallback(() => {
    setPerm(getPermission())
    setNowTick(Date.now())
    if (!supported) {
      setSw('unsupported')
      return
    }
    getSWStatus().then(setSw)
  }, [supported])

  useEffect(() => {
    // Cek awal service worker (setState di callback promise = pola langganan sistem eksternal)
    getSWStatus().then((s) => setSw(s))
    window.addEventListener('focus', refresh)
    const t = setInterval(refresh, 60000)
    return () => {
      window.removeEventListener('focus', refresh)
      clearInterval(t)
    }
  }, [refresh])

  const enable = async () => {
    setBusy(true)
    const p = await requestPermission()
    setPerm(p)
    setBusy(false)
    onToggle(p === 'granted')
    if (p !== 'granted') {
      setResult({ type: 'err', msg: 'Izin tidak diberikan — notifikasi tidak bisa jalan tanpa ini.' })
    }
  }

  const test = async () => {
    setBusy(true)
    const r = await sendTest()
    setBusy(false)
    setResult(RESULT_MSG[r])
  }

  const alarmTest = async () => {
    setBusy(true)
    const r = await sendAlarmTest()
    setBusy(false)
    setAlarmResult(ALARM_MSG[r])
    setAlarmState(r === 'shown' ? 'ringing' : 'idle')
  }

  const snooze = () => {
    if (!scheduleSnooze()) {
      setAlarmResult({ type: 'err', msg: 'Belum ada pengingat yang bunyi — tekan "Uji alarm" dulu.' })
      return
    }
    void stopAlarm()
    setAlarmState('snoozed')
  }

  const stopAll = () => {
    clearSnooze()
    void stopAlarm()
    setAlarmState('idle')
  }

  const expireSnooze = useCallback(() => setAlarmState('ringing'), [])

  // nowTick hanya pemicu render ulang tiap menit agar countdown segar
  const upcoming = useMemo(
    () =>
      (times ?? [])
        .map((t) => ({ t, ms: msUntil(t) }))
        .filter((x): x is { t: string; ms: number } => x.ms !== null)
        .sort((a, b) => a.ms - b.ms),
    // nowTick disengaja: msUntil memakai jam sekarang sehingga perlu dihitung ulang tiap menit
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [times, nowTick],
  )

  return (
    <section className="card wide spaced" aria-label="Pengingat otomatis">
      <div className="card-head">
        <span className="field-icon"><IconBell /></span>
        <div>
          <div className="card-title">Pengingat Otomatis</div>
          <div className="card-target">
            {times ? `Hari ini: ${times.join(' & ')} (ikut shift)` : 'Atur shift dulu agar ada jam pengingat'}
          </div>
        </div>
      </div>

      <ul className="diag-list">
        <li>Browser: {supported ? 'mendukung notifikasi' : 'TIDAK mendukung'}</li>
        <li>Izin: <strong>{perm}</strong>{perm === 'denied' && ' — buka ikon gembok di address bar → Notifications → Allow'}</li>
        <li>Service worker: <strong>{sw === 'checking' ? 'mengecek...' : sw}</strong></li>
        <li>
          {upcoming.length === 0
            ? 'Tidak ada jadwal tersisa hari ini (semua jam sudah lewat / belum ada shift).'
            : `Berikutnya ${upcoming[0].t} (${fmtCountdown(upcoming[0].ms)})${upcoming[1] ? `, lalu ${upcoming[1].t}` : ''}`}
        </li>
        <li>Getar: <strong>{typeof navigator.vibrate === 'function' ? 'didukung perangkat ini' : 'tidak didukung (desktop)'}</strong></li>
      </ul>

      <div className="backup-actions">
        {enabled && perm === 'granted' ? (
          <>
            <button className="btn-ghost" onClick={() => onToggle(false)}>Matikan pengingat</button>
            <button className="btn-ghost" onClick={() => void test()} disabled={busy}>
              {busy ? 'Mengirim...' : 'Kirim notifikasi uji'}
            </button>
            <button className="btn-primary" onClick={() => void alarmTest()} disabled={busy}>
              Uji alarm
            </button>
          </>
        ) : (
          <button className="btn-primary" onClick={() => void enable()} disabled={!supported || busy || !times}>
            {busy ? 'Meminta izin...' : 'Aktifkan pengingat'}
          </button>
        )}
        <button className="btn-ghost" onClick={refresh}><IconClock size={14} /> Perbarui status</button>
      </div>

      {alarmState !== 'idle' && (
        <div className="alarm-bar" role="status">
          {alarmState === 'ringing' && <strong className="warn-text">Alarm sedang berbunyi.</strong>}
          {alarmState === 'snoozed' && <SnoozeCountdown onExpire={expireSnooze} />}
          <div className="backup-actions">
            {alarmState === 'ringing' && (
              <>
                <button className="btn-ghost" onClick={snooze}>Snooze {SNOOZE_MINUTES} mnt</button>
                <button className="btn-ghost" onClick={stopAll}>Sudah Recall</button>
              </>
            )}
            {alarmState === 'snoozed' && (
              <button className="btn-ghost" onClick={stopAll}>Batalkan snooze</button>
            )}
          </div>
        </div>
      )}

      {!times && (
        <p className="warn-text">
          Tombol nonaktif karena shift hari ini belum diatur — tidak ada jam pengingat yang bisa dijadwalkan.{' '}
          <button className="link" onClick={onNeedShift}>Atur di tab Shift →</button>
        </p>
      )}

      {result && (
        <p className={result.type === 'ok' ? 'ok-text' : 'warn-text'} role="status">
          {result.msg}
        </p>
      )}

      {alarmResult && (
        <p className={alarmResult.type === 'ok' ? 'ok-text' : 'warn-text'} role="status">
          {alarmResult.msg}
        </p>
      )}

      <p className="muted">
        Desktop & mobile (Chrome/Edge/Firefox) didukung. iPhone perlu install via
        Share → Add to Home Screen (iOS 16.4+). Notifikasi hanya bunyi bila progres belum 100%.
        {' '}<strong>Bunyi + getar hanya selama tab ini terbuka</strong> — browser tidak mengizinkan suara
        otomatis saat app ditutup total, jadi pengingat 100% offline butuh push server (belum ada).
      </p>
    </section>
  )
}
