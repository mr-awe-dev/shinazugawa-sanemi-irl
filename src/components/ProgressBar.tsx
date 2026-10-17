import { useId } from 'react'
import { motion } from 'motion/react'
import { getProgress, grade } from '../lib/stats'
import type { DailyLog } from '../lib/schema'

export default function ProgressBar({ log }: { log: DailyLog }) {
  const { done, total, pct } = getProgress(log)
  // role="progressbar" wajib punya accessible name; pakai teks yang sudah
  // terlihat di atasnya supaya tidak ada label duplikat.
  const labelId = useId()
  return (
    <div className="progress-wrap">
      <div className="progress-top">
        <strong id={labelId}>
          {done}/{total} selesai — {pct}%
        </strong>
        <span className="grade">{grade(pct)}</span>
      </div>
      <div
        className="progress-bar"
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 22 }}
        />
      </div>
    </div>
  )
}
