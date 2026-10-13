import { motion } from 'motion/react'
import { getProgress, grade } from '../lib/stats'
import type { DailyLog } from '../lib/schema'

export default function ProgressBar({ log }: { log: DailyLog }) {
  const { done, total, pct } = getProgress(log)
  return (
    <div className="progress-wrap">
      <div className="progress-top">
        <strong>
          {done}/{total} selesai — {pct}%
        </strong>
        <span className="grade">{grade(pct)}</span>
      </div>
      <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
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
