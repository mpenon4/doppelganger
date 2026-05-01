'use client'

import { motion } from 'framer-motion'
import { Timeline } from './timeline'
import { SimilarityScore } from './similarity-score'

export interface DoppelgangerResult {
  companyName: string
  logo?: string
  description: string
  foundingYear: number
  timeline: Array<{
    month: string
    title: string
    description: string
    type: 'milestone' | 'warning' | 'failure' | 'success'
  }>
  outcome: 'alive' | 'dead' | 'acquired'
  wrongMoves: string[]
  recommendations: string[]
  similarityScore: number
}

interface ResultsCardProps {
  result: DoppelgangerResult
  onFindAnother: () => void
}

export function ResultsCard({ result, onFindAnother }: ResultsCardProps) {
  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-sm font-mono text-muted-foreground mb-2">
          Your Doppelganger is:
        </p>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-cyan bg-clip-text text-transparent">
          {result.companyName}
        </h1>
      </motion.div>

      {/* Main card */}
      <motion.div
        className="border border-border bg-card/50 p-6 md:p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Company info */}
        <div className="flex items-start gap-6 mb-8">
          <motion.div
            className="w-16 h-16 shrink-0 bg-secondary flex items-center justify-center text-2xl font-bold text-primary border border-border"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            {result.companyName[0]}
          </motion.div>
          <div className="flex-1">
            <p className="text-muted-foreground leading-relaxed">
              {result.description}
            </p>
            <p className="text-sm font-mono text-cyan mt-2">
              Founded {result.foundingYear}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-sm font-mono text-muted-foreground mb-4 uppercase tracking-wider">
            Timeline of Events
          </h2>
          <Timeline events={result.timeline} outcome={result.outcome} />
        </motion.div>

        {/* Two columns: Wrong moves & Recommendations */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            className="border border-red-500/30 bg-red-500/5 p-5"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-mono text-red-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span>☠️</span> Where they went wrong
            </h3>
            <ul className="space-y-3">
              {result.wrongMoves.map((move, i) => (
                <motion.li
                  key={i}
                  className="text-sm text-muted-foreground leading-relaxed flex gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <span className="text-red-400 shrink-0">—</span>
                  {move}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="border border-emerald-500/30 bg-emerald-500/5 p-5"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-mono text-emerald-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span>🎯</span> What you should do differently
            </h3>
            <ul className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <motion.li
                  key={i}
                  className="text-sm text-muted-foreground leading-relaxed flex gap-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <span className="text-emerald-400 shrink-0">{i + 1}.</span>
                  {rec}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Similarity score */}
        <motion.div
          className="border-t border-border pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <SimilarityScore score={result.similarityScore} />
        </motion.div>
      </motion.div>

      {/* Find Another button */}
      <motion.div
        className="mt-8 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <button
          onClick={onFindAnother}
          className="border-trace relative px-8 py-4 bg-transparent border border-primary/50 text-foreground font-semibold hover:bg-primary/10 transition-colors"
        >
          Find Another Doppelganger
        </button>
      </motion.div>
    </motion.div>
  )
}
