import type { SVGProps } from 'react'

// Set ikon SVG garis konsisten (gaya Lucide), tanpa emoji untuk UI.
// Setiap ikon mewarisi warna teks via currentColor.

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Base({ size = 18, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconHome = (p: IconProps) => (
  <Base {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></Base>
)

export const IconDumbbell = (p: IconProps) => (
  <Base {...p}><path d="M6.5 6.5v11" /><path d="M17.5 6.5v11" /><path d="M3.5 9v6" /><path d="M20.5 9v6" /><path d="M6.5 12h11" /></Base>
)

export const IconBriefcase = (p: IconProps) => (
  <Base {...p}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></Base>
)

export const IconChart = (p: IconProps) => (
  <Base {...p}><path d="M3 3v18h18" /><path d="m7 15 4-6 4 3 5-8" /></Base>
)

export const IconCheck = (p: IconProps) => (
  <Base {...p}><path d="M20 6 9 17l-5-5" /></Base>
)

export const IconDroplet = (p: IconProps) => (
  <Base {...p}><path d="M12 2.7s6.5 7.1 6.5 11.3a6.5 6.5 0 1 1-13 0C5.5 9.8 12 2.7 12 2.7z" /></Base>
)

export const IconFlame = (p: IconProps) => (
  <Base {...p}><path d="M12 22c4.2 0 7-2.9 7-6.8 0-3.8-3-5.8-4.3-8.7-.9-2-1.4-4.5-1.4-4.5S5.6 7.6 5 13.2C4.6 17.4 7.8 22 12 22z" /><path d="M12 22c-1.8 0-3-1.3-3-2.9 0-1.7 1.4-2.5 2-3.9.4-.9.6-2 .6-2s3.2 2.5 3.4 5.4c.1 1.9-1.2 3.4-3 3.4z" /></Base>
)

export const IconActivity = (p: IconProps) => (
  <Base {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></Base>
)

export const IconMoon = (p: IconProps) => (
  <Base {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></Base>
)

export const IconUser = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></Base>
)

export const IconLeaf = (p: IconProps) => (
  <Base {...p}><path d="M11 20A7 7 0 0 1 4 13c0-4.5 3.5-8.5 8.5-10C17 1.7 20 1.5 20 1.5s-.3 3-1.6 7.5C17 13.5 15.5 20 11 20z" /><path d="M4 21c4-6.5 8.5-10 12.5-12" /></Base>
)

export const IconNote = (p: IconProps) => (
  <Base {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h6" /></Base>
)

export const IconClock = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Base>
)

export const IconBed = (p: IconProps) => (
  <Base {...p}><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" /><path d="M2 17h20" /><path d="M6 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" /></Base>
)

export const IconShield = (p: IconProps) => (
  <Base {...p}><path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z" /></Base>
)

export const IconLock = (p: IconProps) => (
  <Base {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Base>
)

export const IconBell = (p: IconProps) => (
  <Base {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" /><path d="M10.3 21a2 2 0 0 0 3.4 0" /></Base>
)

export const IconChevLeft = (p: IconProps) => (
  <Base {...p}><path d="m15 18-6-6 6-6" /></Base>
)

export const IconChevRight = (p: IconProps) => (
  <Base {...p}><path d="m9 18 6-6-6-6" /></Base>
)

export const IconWind = (p: IconProps) => (
  <Base {...p}><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" /><path d="M9.6 4.6A2 2 0 1 1 11 8H2" /><path d="M12.6 19.4A2 2 0 1 0 14 16H2" /></Base>
)

export const IconSun = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.9 4.9 1.4 1.4" /><path d="m17.7 17.7 1.4 1.4" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.3 17.7-1.4 1.4" /><path d="m19.1 4.9-1.4 1.4" /></Base>
)
