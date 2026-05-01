'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const loadingSteps = [
  'Scanning Product Hunt...',
  'Searching Crunchbase graveyard...',
  'Analyzing founder timelines...',
  'Identifying your startup twin...',
]

const floatingLogos = [
  'Theranos', 'Quibi', 'Vine', 'Juicero', 'MoviePass',
  'WeWork', 'Jawbone', 'Pets.com', 'Webvan', 'Friendster'
]

interface LoadingSequenceProps {
  onComplete: () => void
  isActive: boolean
}

export function LoadingSequence({ onComplete, isActive }: LoadingSequenceProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0)
      setCompletedSteps([])
      return
    }

    const stepDuration = 1500
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) {
          setCompletedSteps((completed) => [...completed, prev])
          return prev + 1
        } else {
          clearInterval(interval)
          setCompletedSteps((completed) => [...completed, prev])
          setTimeout(onComplete, 800)
          return prev
        }
      })
    }, stepDuration)

    return () => clearInterval(interval)
  }, [isActive, onComplete])

  if (!isActive) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050508]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.5 }}
    >
      {/* Floating ghost logos */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingLogos.map((logo, i) => (
          <motion.div
            key={logo}
            className="absolute text-2xl font-bold text-white/5 blur-[2px] whitespace-nowrap"
            initial={{ x: -200, y: 100 + (i * 60) % 400 }}
            animate={{
              x: ['calc(-200px)', 'calc(100vw + 200px)'],
              y: [100 + (i * 60) % 400, 50 + (i * 80) % 350],
            }}
            transition={{
              duration: 12 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'linear',
            }}
          >
            {logo}
          </motion.div>
        ))}
      </div>

      {/* Terminal-style loading */}
      <div className="relative z-10 max-w-lg w-full mx-4">
        <div className="font-mono text-sm space-y-4">
          {loadingSteps.map((step, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: index <= currentStep ? 1 : 0.3,
                x: index <= currentStep ? 0 : -20,
              }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <span className="text-primary">{'>'}</span>
              <span
                className={`transition-all duration-300 ${
                  completedSteps.includes(index)
                    ? 'line-through text-muted-foreground'
                    : index === currentStep
                    ? 'text-foreground'
                    : 'text-muted-foreground/50'
                }`}
              >
                {step}
              </span>
              {completedSteps.includes(index) && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-cyan ml-2"
                >
                  ✓
                </motion.span>
              )}
              {index === currentStep && !completedSteps.includes(index) && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="w-2 h-4 bg-primary ml-1"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
