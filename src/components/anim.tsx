import { motion } from 'motion/react'
import type { ReactNode } from 'react'

// Komponen animasi reusable: hanya transform + opacity (hemat performa).
// Nonaktif otomatis saat prefers-reduced-motion via <MotionConfig reducedMotion="user"/> di App.

/** Transisi antar-tab (dipakai dalam <AnimatePresence mode="wait">). */
export function PageWrap({ tabKey, children }: { tabKey: string; children: ReactNode }) {
  return (
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Fade lembut untuk banner/panel yang muncul kondisional. */
export function Fade({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Indikator pill geser untuk navigasi aktif (layoutId unik per nav). */
export function NavPill({ id }: { id: string }) {
  return (
    <motion.span
      layoutId={id}
      className="pill"
      transition={{ type: 'spring', stiffness: 500, damping: 42 }}
    />
  )
}
