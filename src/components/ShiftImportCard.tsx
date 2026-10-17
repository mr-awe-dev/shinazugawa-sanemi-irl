import { useRef, useState } from 'react'
import type { ShiftRow } from '../lib/shift'
import { SHIFT_TABLE_SAMPLE, parseShiftTable } from '../lib/shift'
import { IconNote } from './icons'

type Props = {
  onMerge: (rows: ShiftRow[]) => void
}

type Status = { type: 'ok' | 'err'; msg: string } | null

export default function ShiftImportCard({ onMerge }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [pending, setPending] = useState<{ rows: ShiftRow[]; warnings: string[]; from: string } | null>(null)
  const [status, setStatus] = useState<Status>(null)
  const [busy, setBusy] = useState(false)

  const review = (raw: string, from: string) => {
    setStatus(null)
    const res = parseShiftTable(raw)
    if (!res.ok) {
      setPending(null)
      setStatus({ type: 'err', msg: res.error })
      return
    }
    setPending({ rows: res.rows, warnings: res.warnings, from })
  }

  const pickFile = () => {
    setStatus(null)
    fileRef.current?.click()
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    setBusy(true)
    setPending(null)
    try {
      review(await f.text(), f.name)
    } catch {
      setStatus({ type: 'err', msg: 'Gagal membaca file.' })
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const confirm = () => {
    if (!pending) return
    onMerge(pending.rows)
    const bad = pending.warnings.length
    setStatus({
      type: 'ok',
      msg: `Import berhasil: ${pending.rows.length} tanggal diperbarui${bad ? `, ${bad} baris dilewati.` : '.'}`,
    })
    setPending(null)
    setText('')
  }

  return (
    <section className="card wide spaced" aria-label="Import jadwal shift">
      <div className="card-head">
        <span className="field-icon"><IconNote /></span>
        <div>
          <div className="card-title">Import Jadwal Shift</div>
          <div className="card-target">Format | Tanggal | Kode Jadwal | — kode: P, S, M, O, T, L</div>
        </div>
      </div>

      <pre className="paste-area" aria-label="Contoh format">{SHIFT_TABLE_SAMPLE}</pre>

      <div className="backup-actions">
        <button className="btn-primary" onClick={pickFile} disabled={busy}>
          {busy ? 'Membaca...' : 'Pilih file (.csv / .txt)'}
        </button>
        <button
          className="btn-ghost"
          onClick={() => review(text, 'teks yang ditempel')}
          disabled={text.trim() === ''}
        >
          Periksa teks
        </button>
        <button
          className="btn-ghost"
          onClick={() => { setText(''); setPending(null); setStatus(null) }}
          disabled={text === '' && !pending && !status}
        >
          Bersihkan
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt,text/csv,text/plain"
          hidden
          aria-label="Pilih file jadwal shift"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>

      <textarea
        className="text paste-area spaced"
        rows={4}
        value={text}
        placeholder={'| Tanggal | Kode Jadwal |\n| 2026-11-02 | P |'}
        aria-label="Tempel tabel jadwal di sini"
        onChange={(e) => setText(e.target.value)}
      />

      {pending && (
        <div className="restore-preview">
          <p>
            <strong>{pending.from}</strong> berisi <strong>{pending.rows.length}</strong> tanggal valid:{' '}
            {pending.rows.slice(0, 8).map((r) => `${r.date}=${r.code}`).join(', ')}
            {pending.rows.length > 8 ? `, ...dan ${pending.rows.length - 8} lainnya` : ''}.
          </p>
          {pending.warnings.length > 0 && (
            <ul>
              {pending.warnings.slice(0, 5).map((w) => (
                <li key={w}>{w}</li>
              ))}
              {pending.warnings.length > 5 && <li>...dan {pending.warnings.length - 5} lainnya dilewati.</li>}
            </ul>
          )}
          <p className="warn-text">
            Tanggal yang ada di daftar ini akan ditimpa. Jadwal di luar daftar TIDAK berubah.
          </p>
          <div className="backup-actions">
            <button className="btn-primary" onClick={confirm}>Ya, import &amp; merge</button>
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
        Baris kosong, baris komentar <code>#</code>, dan baris tidak valid dilewati dengan laporan
        (import tetap berjalan). Tanggal ulang memakai kode yang paling bawah. File dari Excel/Notion
        dengan koma juga bisa — delimiter dideteksi otomatis.
      </p>
    </section>
  )
}
