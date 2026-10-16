// Mode tampilan: light / dark / system.
// Pilihan "system" diresolve ke light|dark di sini, lalu ditulis ke <html data-theme>.
// CSS hanya punya dua blok token (:root dan :root[data-theme='dark']) — tidak ada
// media query prefers-color-scheme yang nilainya bisa melenceng dari preferensi user.

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const KEY = 'sanemi-theme-v1'
const DARK_QUERY = '(prefers-color-scheme: dark)'
const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: '#ebedf3',
  dark: '#252d30',
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches
}

/** Preferensi OS saat ini (dipakai sebagai state awal "system"). */
export function prefersDark(): boolean {
  return systemPrefersDark()
}

export function loadThemeMode(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function saveThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(KEY, mode)
  } catch {
    /* localStorage diblokir — mode tetap berlaku untuk sesi ini */
  }
}

export function resolveTheme(mode: ThemeMode, systemDark = systemPrefersDark()): ResolvedTheme {
  if (mode !== 'system') return mode
  return systemDark ? 'dark' : 'light'
}

/** Terapkan tema ke <html data-theme> + meta theme-color (bar status browser). */
export function applyTheme(theme: ResolvedTheme): void {
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) meta.content = THEME_COLOR[theme]
}

/** Berlangganan perubahan preferensi OS; kembalikan fungsi unsubscribe. */
export function watchSystemTheme(onChange: (systemDark: boolean) => void): () => void {
  const mq = window.matchMedia(DARK_QUERY)
  const handler = () => onChange(mq.matches)
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}