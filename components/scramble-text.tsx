"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>[]{}~"

interface ScrambleTextProps {
  text: string
  className?: string
  delay?: number
  speed?: number
  hover?: boolean
}

export function ScrambleText({ 
  text, 
  className = "", 
  delay = 0,
  speed = 30,
  hover = false
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isScrambling, setIsScrambling] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const hasAnimated = useRef(false)

  const scramble = () => {
    if (isScrambling) return
    setIsScrambling(true)
    
    let iteration = 0
    const maxIterations = text.length
    
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " "
            if (index < iteration) return text[index]
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join("")
      )
      
      iteration += 1 / 2
      
      if (iteration >= maxIterations) {
        clearInterval(interval)
        setDisplayText(text)
        setIsScrambling(false)
      }
    }, speed)
  }

  useEffect(() => {
    if (isInView && !hasAnimated.current && !hover) {
      hasAnimated.current = true
      const timeout = setTimeout(scramble, delay)
      return () => clearTimeout(timeout)
    }
  }, [isInView, delay, hover])

  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      onMouseEnter={hover ? scramble : undefined}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
    >
      {displayText}
    </motion.span>
  )
}

// Letter by letter reveal with stagger
interface StaggerTextProps {
  text: string
  className?: string
  delay?: number
  staggerDelay?: number
}

export function StaggerText({ 
  text, 
  className = "", 
  delay = 0,
  staggerDelay = 0.03 
}: StaggerTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 20, rotateX: -90 }}
          animate={isInView ? { 
            opacity: 1, 
            y: 0, 
            rotateX: 0 
          } : {}}
          transition={{
            duration: 0.4,
            delay: delay + i * staggerDelay,
            ease: [0.215, 0.61, 0.355, 1]
          }}
          style={{ transformOrigin: "bottom" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  )
}

// Glitch effect text
interface GlitchTextProps {
  text: string
  className?: string
}

export function GlitchText({ text, className = "" }: GlitchTextProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span 
        className="absolute inset-0 text-[#FF4D00] opacity-80 animate-glitch-1"
        style={{ clipPath: "inset(40% 0 20% 0)" }}
        aria-hidden
      >
        {text}
      </span>
      <span 
        className="absolute inset-0 text-cyan-400 opacity-80 animate-glitch-2"
        style={{ clipPath: "inset(60% 0 10% 0)" }}
        aria-hidden
      >
        {text}
      </span>
    </span>
  )
}

// Typewriter effect
interface TypewriterProps {
  text: string
  className?: string
  speed?: number
  delay?: number
}

export function Typewriter({ 
  text, 
  className = "", 
  speed = 50,
  delay = 0 
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("")
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView && !started) {
      const startTimeout = setTimeout(() => {
        setStarted(true)
        let i = 0
        const interval = setInterval(() => {
          setDisplayText(text.slice(0, i + 1))
          i++
          if (i >= text.length) clearInterval(interval)
        }, speed)
        return () => clearInterval(interval)
      }, delay)
      return () => clearTimeout(startTimeout)
    }
  }, [isInView, started, text, speed, delay])

  return (
    <span ref={ref} className={className}>
      {displayText}
      {started && displayText.length < text.length && (
        <span className="animate-pulse">_</span>
      )}
    </span>
  )
}
