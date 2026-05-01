'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '@/components/logo'
import { WireframeGlobe } from '@/components/wireframe-globe'
import { LoadingSequence } from '@/components/loading-sequence'
import { ResultsCard, type DoppelgangerResult } from '@/components/results-card'

type AppState = 'landing' | 'scattering' | 'loading' | 'results'

export default function Home() {
  const [state, setState] = useState<AppState>('landing')
  const [inputValue, setInputValue] = useState('')
  const [result, setResult] = useState<DoppelgangerResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [easterEgg, setEasterEgg] = useState<{ message: string } | null>(null)
  const [scatteringLetters, setScatteringLetters] = useState<Array<{ char: string; x: number; y: number; r: number }>>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const trail = document.createElement('div')
      trail.className = 'cursor-trail'
      trail.style.left = `${e.clientX - 4}px`
      trail.style.top = `${e.clientY - 4}px`
      document.body.appendChild(trail)
      setTimeout(() => trail.remove(), 200)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim()) return

    setError(null)
    setEasterEgg(null)

    // Create scattering letters animation
    const letters = inputValue.split('').map((char) => ({
      char,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      r: (Math.random() - 0.5) * 720,
    }))
    setScatteringLetters(letters)
    setState('scattering')

    // Wait for scatter animation then transition to loading
    await new Promise((resolve) => setTimeout(resolve, 600))
    setState('loading')

    try {
      const response = await fetch('/api/find-doppelganger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: inputValue }),
      })

      const data = await response.json()

      if (data.easterEgg) {
        setEasterEgg(data)
        setState('landing')
        return
      }

      if (data.error) {
        setError(data.error)
        setState('landing')
        return
      }

      setResult(data)
    } catch {
      setError('Something went wrong. Please try again.')
      setState('landing')
    }
  }, [inputValue])

  const handleLoadingComplete = useCallback(() => {
    if (result) {
      setState('results')
    }
  }, [result])

  const handleFindAnother = useCallback(() => {
    setResult(null)
    setInputValue('')
    setEasterEgg(null)
    setState('landing')
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  return (
    <main className="relative min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 md:p-6">
        <Logo />
        <div className="glitch-text text-xs font-mono text-primary/70 border border-primary/30 px-2 py-1">
          BETA
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {/* Landing state */}
          {(state === 'landing' || state === 'scattering') && (
            <motion.div
              key="landing"
              className="relative w-full max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Wireframe globe background */}
              <WireframeGlobe isCollapsing={state === 'scattering'} />

              {/* Input section */}
              <div className="relative z-10 text-center">
                <motion.h1
                  className="text-3xl md:text-4xl font-bold mb-2 text-balance"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="bg-gradient-to-r from-primary via-accent to-cyan bg-clip-text text-transparent">
                    Find the startup that walked your path before you.
                  </span>
                </motion.h1>

                <motion.p
                  className="text-muted-foreground mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Learn from their journey. Avoid their mistakes.
                </motion.p>

                {/* Easter egg message */}
                <AnimatePresence>
                  {easterEgg && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="mb-6 text-2xl"
                    >
                      {easterEgg.message}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 text-red-400 text-sm font-mono"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input with scattering animation */}
                <motion.div
                  className="relative mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {state === 'scattering' ? (
                    <div className="relative h-14 flex items-center justify-center overflow-visible">
                      {scatteringLetters.map((letter, i) => (
                        <motion.span
                          key={i}
                          className="inline-block text-lg font-mono text-foreground"
                          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                          animate={{
                            x: letter.x,
                            y: letter.y,
                            rotate: letter.r,
                            opacity: 0,
                          }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          style={{ position: 'absolute' }}
                        >
                          {letter.char === ' ' ? '\u00A0' : letter.char}
                        </motion.span>
                      ))}
                    </div>
                  ) : (
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="Describe your startup in one sentence..."
                      className="w-full px-6 py-4 bg-card border border-border text-foreground text-lg placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-mono"
                      autoFocus
                    />
                  )}
                </motion.div>

                {/* Submit button */}
                {state !== 'scattering' && (
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!inputValue.trim()}
                    className="border-trace relative px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Find My Doppelganger
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* Loading state */}
          {state === 'loading' && (
            <LoadingSequence
              key="loading"
              isActive={state === 'loading'}
              onComplete={handleLoadingComplete}
            />
          )}

          {/* Results state */}
          {state === 'results' && result && (
            <motion.div
              key="results"
              className="w-full px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <ResultsCard result={result} onFindAnother={handleFindAnother} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center">
        <p className="text-xs text-muted-foreground/50 font-mono">
          Built at Zero to Agent Hackathon · Powered by Claude
        </p>
      </footer>
    </main>
  )
}
