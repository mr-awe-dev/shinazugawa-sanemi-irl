import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getPermission,
  getSWStatus,
  msUntil,
  requestPermission,
  sendTest,
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

const RESULT_MSG: Record<ShowResult, { type: 'ok' | 'err'; msg: string }> = {
  shown: { type: 'ok', msg: 'Terkirim ke sistem. Tidak terlihat? Cek Action Center (Win+N) / pastikan Do Not Disturb mati.' },
  'skipped-done': { type: 'ok', msg: 'Dilewati karena progres sudah 100% — memang dirancang diam bila tuntas.' },
  denied: { type: 'err', msg: 'Izin belum granted. Aktifkan dulu lewat tombol di bawah / pengaturan browser.' },
  unsupported: { type: 'err', msg: 'Browser tidak mendukung Notification API.' },
  failed: { type: 'err', msg: 'Gagal tampil (browser memblokir). Coba tutup-buka tab, lalu uji lagi.' },
}

export default function ReminderCard({ enabled, times, onToggle, onNeedShift }: Props) {
  const supported = supportNotification()
  const [perm, setPerm] = useState(getPermission())
  const [sw, setSw] = useState<'ready' | 'missing' | 'unsupported' | 'checking'>('checking')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
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
      </ul>

      <div className="backup-actions">
        {enabled && perm === 'granted' ? (
          <>
            <button className="btn-ghost" onClick={() => onToggle(false)}>Matikan pengingat</button>
            <button className="btn-ghost" onClick={() => void test()} disabled={busy}>
              {busy ? 'Mengirim...' : 'Kirim notifikasi uji'}
            </button>
          </>
        ) : (
          <button className="btn-primary" onClick={() => void enable()} disabled={!supported || busy || !times}>
            {busy ? 'Meminta izin...' : 'Aktifkan pengingat'}
          </button>
        )}
        <button className="btn-ghost" onClick={refresh}><IconClock size={14} /> Perbarui status</button>
      </div>

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

      <p className="muted">
        Desktop & mobile (Chrome/Edge/Firefox) didukung. iPhone perlu install via
        Share → Add to Home Screen (iOS 16.4+). Notifikasi hanya bunyi bila progres belum 100%
        dan app pernah dibuka hari itu — pengingat saat app tertutup total butuh server push (belum ada).
      </p>
    </section>
  )
}
