import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import type { DailyLog } from '../lib/schema'
import { taskDone } from '../lib/schema'
import { riseChild, staggerParent } from '../lib/anim-variants'
import {
  IconActivity,
  IconCheck,
  IconDroplet,
  IconDumbbell,
  IconFlame,
  IconLeaf,
  IconMoon,
  IconNote,
  IconUser,
} from './icons'

type Props = {
  log: DailyLog
  readOnly: boolean
  onChange: (patch: Partial<DailyLog>) => void
}

function Card({
  done,
  icon,
  title,
  target,
  children,
  wide,
}: {
  done: boolean
  icon: ReactNode
  title: string
  target: string
  children: ReactNode
  wide?: boolean
}) {
  return (
    <motion.section variants={riseChild} className={`card ${done ? 'done' : ''}${wide ? ' wide' : ''}`} aria-label={title}>
      <div className="card-head">
        <span className="field-icon">{icon}</span>
        <div>
          <div className="card-title">{title}</div>
          <div className="card-target">Target: {target}</div>
        </div>
        <span className="status-dot" aria-label={done ? 'Selesai' : 'Belum selesai'}>
          <IconCheck size={16} />
        </span>
      </div>
      {children}
    </motion.section>
  )
}

function NumField({
  icon, label, target, value, min, max, step, unit, done, readOnly, onInput,
}: {
  icon: ReactNode; label: string; target: string; value: number; min?: number; max?: number; step?: number
  unit: string; done: boolean; readOnly: boolean; onInput: (v: number) => void
}) {
  return (
    <Card done={done} icon={icon} title={label} target={target}>
      <div className="card-input">
        <input
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          disabled={readOnly}
          aria-label={`${label} (${unit})`}
          onChange={(e) => onInput(Number(e.target.value))}
        />
        <span className="unit">{unit}</span>
      </div>
    </Card>
  )
}

export default function Checklist({ log, readOnly, onChange }: Props) {
  return (
    <motion.div
      key={log.date}
      className="grid"
      variants={staggerParent}
      initial="hidden"
      animate="show"
    >
      <NumField icon={<IconFlame />} label="Ransum Hashira (Protein)" target="140–160 g" value={log.protein_g}
        min={0} max={300} step={5} unit="g" done={taskDone(log, 'protein_g')}
        readOnly={readOnly} onInput={(v) => onChange({ protein_g: Math.max(0, Math.min(300, v || 0)) })} />
      <NumField icon={<IconDroplet />} label="Hidrasi" target="3–4 L" value={log.air_L}
        min={0} max={10} step={0.25} unit="L" done={taskDone(log, 'air_L')}
        readOnly={readOnly} onInput={(v) => onChange({ air_L: Math.max(0, Math.min(10, v || 0)) })} />
      <NumField icon={<IconActivity />} label="NEAT (Langkah)" target="8.000–10.000" value={log.langkah}
        min={0} max={50000} step={500} unit="langkah" done={taskDone(log, 'langkah')}
        readOnly={readOnly} onInput={(v) => onChange({ langkah: Math.max(0, Math.min(50000, Math.round(v || 0))) })} />
      <NumField icon={<IconMoon />} label="Tidur Pemulihan" target="7–8 jam" value={log.tidur_jam}
        min={0} max={24} step={0.5} unit="jam" done={taskDone(log, 'tidur_jam')}
        readOnly={readOnly} onInput={(v) => onChange({ tidur_jam: Math.max(0, Math.min(24, v || 0)) })} />

      <Card done={log.latihan_done} icon={<IconDumbbell />} title="Sesi Latihan" target="sesuai jadwal mingguan">
        <label className="row">
          <input type="checkbox" checked={log.latihan_done} disabled={readOnly}
            onChange={(e) => onChange({ latihan_done: e.target.checked })} />
          Selesaikan sesi hari ini
        </label>
        <input className="text" type="text" value={log.latihan_menu} disabled={readOnly}
          placeholder="cth: Hari 1: Upper Pull & Grip" aria-label="Menu latihan"
          onChange={(e) => onChange({ latihan_menu: e.target.value })} />
      </Card>

      <Card done={log.postur_done} icon={<IconUser />} title="Postur Sanemi" target="dada busung, bahu ke belakang">
        <label className="row">
          <input type="checkbox" checked={log.postur_done} disabled={readOnly}
            onChange={(e) => onChange({ postur_done: e.target.checked })} />
          Jaga postur sepanjang hari
        </label>
      </Card>

      <Card done={log.makanan_clean} icon={<IconLeaf />} title="Makan Bersih" target="defisit 300–500 kkal">
        <label className="row">
          <input type="checkbox" checked={log.makanan_clean} disabled={readOnly}
            onChange={(e) => onChange({ makanan_clean: e.target.checked })} />
          Whole foods, hindari gula/olahan
        </label>
      </Card>

      <Card done={(log.catatan ?? '').trim().length > 0} icon={<IconNote />}
        title="Catatan / Refleksi + Ukur Mingguan" target="berat & pinggang diisi Minggu pagi" wide>
        <div className="measure">
          <label>Berat (kg)
            <input type="number" inputMode="decimal" min={0} max={300} step={0.1} disabled={readOnly}
              value={log.berat_kg ?? ''} placeholder="cth 73.0"
              onChange={(e) => onChange({ berat_kg: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </label>
          <label>Pinggang (cm)
            <input type="number" inputMode="decimal" min={0} max={200} step={0.5} disabled={readOnly}
              value={log.pinggang_cm ?? ''} placeholder="cth 82"
              onChange={(e) => onChange({ pinggang_cm: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </label>
        </div>
        <textarea className="text" rows={3} disabled={readOnly} value={log.catatan ?? ''}
          placeholder="Kendala / pencapaian hari ini..." aria-label="Catatan harian"
          onChange={(e) => onChange({ catatan: e.target.value })} />
      </Card>
    </motion.div>
  )
}
