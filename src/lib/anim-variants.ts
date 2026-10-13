import type { Variants } from 'motion/react'

// Kurva + varian bersama (file khusus non-komponen agar lolos react-refresh).
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Kontainer stagger: anak memakai variants `riseChild`. */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
}

export const riseChild: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
}
