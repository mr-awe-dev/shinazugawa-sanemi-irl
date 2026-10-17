import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Inter di-host sendiri (OFL-1.1), menggantikan pemuatan dari fonts.googleapis.com:
// hilang 1 stylesheet render-blocking + 2 preconnect ke domain pihak ketiga.
// Nama family-nya "Inter Variable" (bukan "Inter") — lihat --font di index.css.
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/inter/wght-italic.css'
import './index.css'
import App from './App.tsx'

// Service worker minimal (klik notifikasi + syarat PWA). Aman di dev maupun build.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      /* abaikan — app tetap jalan tanpa SW */
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
