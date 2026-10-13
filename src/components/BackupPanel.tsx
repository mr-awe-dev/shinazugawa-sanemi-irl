import { useRef, useState } from 'react'
import type { DailyLog } from '../lib/schema'
import type { ShiftCode } from '../lib/shift'
import {
  applyBackup,
  exportCSV,
  exportJSON,
  parseBackupText,
  type BackupFile,
} from '../lib/backup'
import { IconNote } from './icons'

type Props = {
  all: Record<string, DailyLog>
  shifts: Record<string, ShiftCode>
  onImported: (data: BackupFile) => void
}

type Pending = {
  data: BackupFile
  logs: number
  shifts: number
  meta: number
  warnings: string[]
  name: string
}

export default function BackupPanel({ all, shifts, onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const pickFile = () => {
    setStatus(null)
    fileRef.current?.click()
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    setBusy(true)
    setPending(null)
    try {
      const text = await f.text()
      const res = parseBackupText(text)
      if (!res.ok) {
        setStatus({ type: 'err', msg: res.error })
      } else {
        setPending({ data: res.data, logs: res.logs, shifts: res.shifts, meta: res.meta, warnings: res.warnings, name: f.name })
        setStatus(null)
      }
    } catch {
      setStatus({ type: 'err', msg: 'Gagal membaca file.' })
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const confirmImport = () => {
    if (!pending) return
    try {
      applyBackup(pending.data)
      onImported(pending.data)
      setStatus({ type: 'ok', msg: `Restore berhasil: ${pending.logs} log, ${pending.shifts} shift, ${pending.meta} evaluasi.` })
      setPending(null)
    } catch (e) {
      setStatus({ type: 'err', msg: e instanceof Error ? e.message : 'Restore gagal.' })
    }
  }

  return (
    <section className="card wide" aria-label="Backup data">
      <div className="card-head">
        <span className="field-icon"><IconNote /></span>
        <div>
          <div className="card-title">Backup Data</div>
          <div className="card-target">
            {Object.keys(all).length} hari log • {Object.keys(shifts).length} shift tersimpan di browser ini
          </div>
        </div>
      </div>

      <div className="backup-actions">
        <button className="btn-primary" onClick={exportJSON}>Unduh backup (JSON)</button>
        <button className="btn-ghost" onClick={() => exportCSV(all, shifts)}>Unduh log (CSV)</button>
        <button className="btn-ghost" onClick={pickFile} disabled={busy}>
          {busy ? 'Membaca...' : 'Restore dari file'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          aria-label="Pilih file backup JSON"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>

      {pending && (
        <div className="restore-preview">
          <p>
            <strong>{pending.name}</strong> berisi {pending.logs} log harian, {pending.shifts} jadwal shift,
            {pending.meta} evaluasi bulanan.
          </p>
          {pending.warnings.length > 0 && (
            <ul>
              {pending.warnings.slice(0, 5).map((w) => (
                <li key={w}>{w}</li>
              ))}
              {pending.warnings.length > 5 && <li>...dan {pending.warnings.length - 5} lainnya dilewati.</li>}
            </ul>
          )}
          <p className="warn-text">Restore akan MENIMPA seluruh data saat ini. Lanjutkan?</p>
          <div className="backup-actions">
            <button className="btn-primary" onClick={confirmImport}>Ya, timpa & restore</button>
            <button className="btn-ghost" onClick={() => setPending(null)}>Batal</button>
          </div>
        </div>
      )}

      {status && (
        <p className={status.type === 'ok' ? 'ok-text' : 'warn-text'} role="status">
          {status.msg}
        </p>
      )}

      <p className="muted">
        Simpan file JSON di tempat aman (Drive/HP). CSV hanya berisi log harian untuk dibuka di Excel — tidak bisa di-restore.
      </p>
    </section>
  )
}
