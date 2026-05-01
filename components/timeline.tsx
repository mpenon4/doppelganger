'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface TimelineEvent {
  month: string
  title: string
  description: string
  type: 'milestone' | 'warning' | 'failure' | 'success'
}

interface TimelineProps {
  events: TimelineEvent[]
  outcome: 'alive' | 'dead' | 'acquired'
}

export function Timeline({ events, outcome }: TimelineProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const outcomeColors = {
    alive: 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10',
    dead: 'text-red-400 border-red-400/50 bg-red-400/10',
    acquired: 'text-cyan border-cyan/50 bg-cyan/10',
  }

  const outcomeLabels = {
    alive: 'Still Alive',
    dead: 'Shut Down',
    acquired: 'Acquired',
  }

  const typeColors = {
    milestone: 'bg-primary',
    warning: 'bg-amber-500',
    failure: 'bg-red-500',
    success: 'bg-emerald-500',
  }

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between">
        {/* Timeline line */}
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-primary/50 via-accent/50 to-cyan/50" />

        {/* Event nodes */}
        {events.map((event, index) => (
          <motion.div
            key={index}
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.3, type: 'spring', stiffness: 200 }}
          >
            <button
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              className={`pulse-ripple relative z-10 w-4 h-4 rounded-full ${typeColors[event.type]} border-2 border-[#050508] cursor-pointer transition-transform hover:scale-125`}
            />
            <span className="mt-2 text-xs font-mono text-muted-foreground">
              {event.month}
            </span>

            {/* Expanded detail card */}
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ opacity: 0, rotateY: -90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 90 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-full mt-4 w-48 p-3 bg-card border border-border text-left z-20"
                  style={{ perspective: '1000px' }}
                >
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    {event.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {event.description}
                  </p>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-border" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Outcome node */}
        <motion.div
          className="relative flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: events.length * 0.08 + 0.3, type: 'spring', stiffness: 200 }}
        >
          <div
            className={`relative z-10 px-3 py-1 text-xs font-semibold border ${outcomeColors[outcome]}`}
          >
            {outcomeLabels[outcome]}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
