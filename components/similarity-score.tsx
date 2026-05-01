'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

interface SimilarityScoreProps {
  score: number
}

export function SimilarityScore({ score }: SimilarityScoreProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    const controls = animate(count, score, {
      duration: 1.5,
      ease: 'easeOut',
    })
    return () => controls.stop()
  }, [count, score])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-baseline gap-1">
        <motion.span className="text-4xl font-bold text-foreground">
          {rounded}
        </motion.span>
        <span className="text-2xl font-bold text-muted-foreground">%</span>
        <span className="text-sm text-muted-foreground ml-2">match</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-secondary overflow-hidden">
        <motion.div
          className="h-full shimmer-bar"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
