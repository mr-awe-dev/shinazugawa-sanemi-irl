import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'motion/react'
import './App.css'
import { NavPill, PageWrap, Fade } from './components/anim'
import BackupPanel from './components/BackupPanel'
import ReminderCard from './components/ReminderCard'
import Checklist from './components/Checklist'
import ProgressBar from './components/ProgressBar'
import ShiftTab from './components/ShiftTab'
import ThemeToggle from './components/ThemeToggle'
import WorkoutTab from './components/WorkoutTab'
import {
  IconBell,
  IconBriefcase,
  IconChevLeft,
  IconChevRight,
  IconDumbbell,
  IconBed,
  IconChart,
  IconClock,
  IconHome,
  IconLock,
  IconShield,
  IconWind,
} from './components/icons'
import Charts from './components/Charts'
import History from './components/History'
import MonthlyRecap from './components/MonthlyRecap'
import WeeklyRecap from './components/WeeklyRecap'
import { addDays, canEdit, todayKey, type DailyLog } from './lib/schema'
import { getShift, isReminderDue, loadShifts, saveShifts, SHIFT_ADJUST, shiftLabel, type ShiftCode } from './lib/shift'
import { fireReminder, loadNotifyPref, msUntil, saveNotifyPref } from './lib/notify'
import { getLog, loadAll, saveAll } from './lib/store'
import { getProgress } from './lib/stats'
import { loadMeta, saveMeta, type MonthMeta } from './lib/meta'
import {
  applyTheme,
  loadThemeMode,
  prefersDark,
  resolveTheme,
  saveThemeMode,
  watchSystemTheme,
  type ResolvedTheme,
  type ThemeMode,
} from './lib/theme'
import type { BackupFile } from './lib/backup'

type Tab = 'hari' | 'latihan' | 'shift' | 'grafik' | 'riwayat'

const TABS: Array<{ id: Tab; label: string; icon: typeof IconHome }> = [
  { id: 'hari', label: 'Hari', icon: IconHome },
  { id: 'latihan', label: 'Latihan', icon: IconDumbbell },
  { id: 'shift', label: 'Shift', icon: IconBriefcase },
  { id: 'grafik', label: 'Grafik', icon: IconChart },
  { id: 'riwayat', label: 'Riwayat', icon: IconClock },
]

export default function App() {
  const [all, setAll] = useState<Record<string, DailyLog>>(() => loadAll())
  const [shifts, setShifts] = useState<Record<string, ShiftCode>>(() => loadShifts())
  const [meta, setMeta] = useState<Record<string, MonthMeta>>(() => loadMeta())
  const [notifyOn, setNotifyOn] = useState<boolean>(() => loadNotifyPref())
  const [dateKey, setDateKey] = useState(todayKey())
  const [tab, setTab] = useState<Tab>('hari')
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => loadThemeMode())
  const [systemDark, setSystemDark] = useState(prefersDark)

  // Mode "system" mengikuti preferensi OS selama aplikasi terbuka.
  useEffect(() => watchSystemTheme(setSystemDark), [])

  const theme: ResolvedTheme = resolveTheme(themeMode, systemDark)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const handleTheme = (mode: ThemeMode) => {
    setThemeMode(mode)
    saveThemeMode(mode)
  }

  useEffect(() => {
    saveAll(all)
  }, [all])

  useEffect(() => {
    saveShifts(shifts)
  }, [shifts])

  useEffect(() => {
    saveMeta(meta)
  }, [meta])

  // Penjadwal notifikasi lokal: jam pengingat shift HARI INI yang masih di depan.
  // fireReminder membaca progres terbaru dari localStorage saat bunyi (anti-stale).
  useEffect(() => {
    if (!notifyOn) return
    const tKey = todayKey()
    const code = getShift(shifts, tKey)
    if (!code) return
    const label = shiftLabel(code)
    const timers: ReturnType<typeof setTimeout>[] = []
    for (const time of SHIFT_ADJUST[code].reminderTimes) {
      const ms = msUntil(time)
      if (ms === null) continue
      timers.push(setTimeout(() => void fireReminder(time, tKey, label), ms))
    }
    return () => { for (const t of timers) clearTimeout(t) }
  }, [notifyOn, shifts])

  const log = useMemo(() => getLog(all, dateKey), [all, dateKey])
  const editable = canEdit(dateKey)
  const isToday = dateKey === todayKey()

  const shift = getShift(shifts, dateKey)
  const adj = shift ? SHIFT_ADJUST[shift] : null
  const { pct } = getProgress(log)
  const dueNow = isToday && adj && pct < 100 ? isReminderDue(adj.reminderTimes) : null

  const patch = (p: Partial<DailyLog>) => {
    if (!editable) return
    setAll((prev) => ({ ...prev, [dateKey]: { ...getLog(prev, dateKey), ...p } }))
  }

  const setShift = (date: string, code: ShiftCode | null) => {
    setShifts((prev) => {
      const next = { ...prev }
      if (code) next[date] = code
      else delete next[date]
      return next
    })
  }

  const setMonthMeta = (ym: string, patch: Partial<MonthMeta>) => {
    setMeta((prev) => {
      const cur = prev[ym] ?? { eval: '', deloadDone: false }
      return { ...prev, [ym]: { ...cur, ...patch } }
    })
  }

  const openDate = (k: string) => { setDateKey(k); setTab('hari') }

  const handleImported = (data: BackupFile) => {
    setAll(data.logs)
    setShifts(data.shifts)
    setMeta(data.meta)
  }

  const handleNotifyToggle = (on: boolean) => {
    setNotifyOn(on)
    saveNotifyPref(on)
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="app-scene">
      <div className="app-shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark"><IconWind size={24} /></span>
            <div>
              <h1>Sanemi IRL Tracker</h1>
              <p className="brand-sub">Pernapasan Konsentrasi Penuh — Rutinitas Harian</p>
            </div>
          </div>
          <div className="topbar-tools">
            <ThemeToggle mode={themeMode} onChange={handleTheme} />
            <nav className="seg-tabs" aria-label="Navigasi utama">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}
                  aria-current={tab === id ? 'page' : undefined}>
                  {tab === id && <NavPill id="seg-pill" />}
                  <Icon size={16} /> <span className="nav-label">{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </header>

        {tab !== 'shift' && (
          <div className="datebar" role="group" aria-label="Pilih tanggal">
            <button onClick={() => setDateKey((k) => addDays(k, -1))} aria-label="Hari sebelumnya">
              <IconChevLeft size={16} /> H-1
            </button>
            <strong>{dateKey} {isToday ? '(hari ini)' : ''}</strong>
            <button disabled={dateKey >= todayKey()} onClick={() => setDateKey((k) => addDays(k, 1))} aria-label="Hari berikutnya">
              H+1 <IconChevRight size={16} />
            </button>
            <button onClick={() => setDateKey(todayKey())} disabled={isToday}>Hari ini</button>
          </div>
        )}
        {!editable && tab !== 'shift' && (
          <p className="locked"><IconLock size={16} /> Terkunci — hanya hari ini + H-1 yang bisa diedit.</p>
        )}

        <main>
          <AnimatePresence mode="wait" initial={false}>
            <PageWrap tabKey={tab}>
              {tab === 'hari' && (
            <>
              {shift && adj ? (
                <Fade key={dateKey}>
                  <div className={`shift-banner mode-${adj.workoutMode}`}>
                    <strong><IconShield size={16} /> Shift {shiftLabel(shift)}</strong>
                    <div>{adj.workoutNote}</div>
                    <div className="muted">
                      <IconBed size={14} /> Tidur saran {adj.sleepWindow} (target tetap 7–8 jam)
                      {' '}• <IconClock size={14} /> Ingatkan {adj.reminderTimes.join(' & ')}
                    </div>
                  </div>
                </Fade>
              ) : (
                <p className="shift-empty">
                  Belum ada jadwal shift tanggal ini.{' '}
                  <button className="link" onClick={() => setTab('shift')}>Atur di tab Shift →</button>
                </p>
              )}
              {dueNow && (
                <p className="nudge">
                  <IconBell size={16} />
                  Sekarang ±jam pengingat ({dueNow}) dan progres {pct}% — {adj?.reminderNote}
                </p>
              )}
              <ProgressBar log={log} />
              <Checklist log={log} readOnly={!editable} onChange={patch} />
              {isToday && (
                <ReminderCard
                  enabled={notifyOn}
                  times={adj ? adj.reminderTimes : null}
                  onToggle={handleNotifyToggle}
                  onNeedShift={() => setTab('shift')}
                />
              )}
              <p className="quote">“Lukai dirimu hari ini, agar kau bisa lebih kuat besok.” — Disiplin mengalahkan motivasi.</p>
            </>
          )}

          {tab === 'latihan' && <WorkoutTab dateKey={dateKey} shift={shift} />}

          {tab === 'shift' && (
            <ShiftTab
              shifts={shifts}
              onChange={setShift}
              onSelectDate={(k) => { setDateKey(k); setTab('hari') }}
            />
          )}

          {tab === 'grafik' && <Charts all={all} />}

          {tab === 'riwayat' && (
            <div className="recap-stack">
              <WeeklyRecap all={all} />
              <MonthlyRecap all={all} meta={meta} onMeta={setMonthMeta} />
              <History all={all} shifts={shifts} onSelectDate={openDate} />
              <BackupPanel all={all} shifts={shifts} onImported={handleImported} />
            </div>
          )}
            </PageWrap>
          </AnimatePresence>
        </main>
      </div>

      <nav className="dock" aria-label="Navigasi utama">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`dock-btn ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}
            aria-current={tab === id ? 'page' : undefined}>
            {tab === id && <NavPill id="dock-pill" />}
            <Icon size={20} /> <span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </div>
    </MotionConfig>
  )
}
