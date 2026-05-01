"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

interface ScanlineTextProps {
  text: string
  className?: string
  delay?: number
  scanColor?: string
}

export function ScanlineText({ 
  text, 
  className = "", 
  delay = 0,
  scanColor = "#00d4ff"
}: ScanlineTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: false, margin: "-50px" })

  return (
    <span 
      ref={ref} 
      className={`relative inline-block overflow-hidden ${className}`}
    >
      <span className="relative z-10">{text}</span>
      
      {/* Scanline bar that moves up and down */}
      {isInView && (
        <motion.span
          className="absolute left-0 right-0 h-[2px] z-20 pointer-events-none"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${scanColor}, transparent)`,
            boxShadow: `0 0 10px ${scanColor}, 0 0 20px ${scanColor}, 0 0 30px ${scanColor}`,
          }}
          initial={{ top: "-10%" }}
          animate={{ 
            top: ["0%", "100%", "0%"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
            delay: delay / 1000
          }}
        />
      )}
      
      {/* Glow overlay that follows scanline */}
      {isInView && (
        <motion.span
          className="absolute left-0 right-0 h-[20px] z-10 pointer-events-none opacity-30"
          style={{ 
            background: `linear-gradient(180deg, transparent, ${scanColor}, transparent)`,
          }}
          initial={{ top: "-20%" }}
          animate={{ 
            top: ["0%", "100%", "0%"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
            delay: delay / 1000
          }}
        />
      )}
    </span>
  )
}

// Logo variant with constant scan effect
export function ScanlineLogo({ 
  text, 
  className = "",
  scanColor = "#00d4ff"
}: {
  text: string
  className?: string
  scanColor?: string
}) {
  return (
    <span className={`relative inline-block overflow-hidden ${className}`}>
      <span className="relative z-10">{text}</span>
      
      <motion.span
        className="absolute left-0 right-0 h-[1px] z-20 pointer-events-none"
        style={{ 
          background: `linear-gradient(90deg, transparent, ${scanColor}, transparent)`,
          boxShadow: `0 0 8px ${scanColor}, 0 0 15px ${scanColor}`,
        }}
        animate={{ 
          top: ["0%", "100%", "0%"]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </span>
  )
}
