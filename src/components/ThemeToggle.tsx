import type { ReactNode } from 'react'
import { NavPill } from './anim'
import { IconMonitor, IconMoon, IconSun } from './icons'
import type { ThemeMode } from '../lib/theme'

// Pemilih 3 arah (Terang / Gelap / Sistem) dengan pola segmented neumorphism:
// wadah inset, pilihan aktif raised (Skill §10 — Tab/segmented).

const OPTIONS: Array<{ id: ThemeMode; label: string; icon: ReactNode }> = [
  { id: 'light', label: 'Terang', icon: <IconSun size={16} /> },
  { id: 'dark', label: 'Gelap', icon: <IconMoon size={16} /> },
  { id: 'system', label: 'Sistem', icon: <IconMonitor size={16} /> },
]

type Props = {
  mode: ThemeMode
  onChange: (mode: ThemeMode) => void
}

export default function ThemeToggle({ mode, onChange }: Props) {
  return (
    <div className="theme-seg" role="group" aria-label="Mode tampilan">
      {OPTIONS.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          className={`theme-btn${mode === id ? ' active' : ''}`}
          aria-pressed={mode === id}
          onClick={() => onChange(id)}
        >
          {mode === id && <NavPill id="theme-pill" />}
          <span className="theme-btn-face">
            {icon}
            <span className="theme-btn-label">{label}</span>
          </span>
        </button>
      ))}
    </div>
  )
}