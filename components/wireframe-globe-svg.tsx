"use client"

import { useEffect, useRef } from "react"

export function WireframeGlobeSVG() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    let rotation = 0
    const animate = () => {
      rotation += 0.2
      if (svgRef.current) {
        svgRef.current.style.transform = `rotateY(${rotation}deg)`
      }
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: "1000px" }}>
      {/* Data annotations */}
      <div className="absolute top-[15%] left-[10%] data-annotation">
        <div className="font-mono text-[10px] text-primary tracking-wider">
          38,420 STARTUPS
          <br />
          <span className="text-muted">ANALYZED</span>
        </div>
      </div>
      <div className="absolute top-[40%] left-[5%] data-annotation">
        <div className="font-mono text-[10px] text-primary tracking-wider">
          1.2M+ ERRORS
          <br />
          <span className="text-muted">IDENTIFIED</span>
        </div>
      </div>
      <div className="absolute bottom-[25%] left-[10%] data-annotation">
        <div className="font-mono text-[10px] text-primary tracking-wider">
          982M+ DATA
          <br />
          <span className="text-muted">POINTS</span>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className="w-full max-w-[400px] h-auto"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Outer glow */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.8"/>
            <stop offset="50%" stopColor="#ffb347" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#ff6b35" stopOpacity="0.4"/>
          </linearGradient>
        </defs>

        {/* Globe circles - horizontal */}
        {[0, 30, 60, 90, 120, 150].map((angle, i) => (
          <ellipse
            key={`h-${i}`}
            cx="200"
            cy="200"
            rx={150 * Math.cos((angle * Math.PI) / 180)}
            ry="150"
            fill="none"
            stroke="url(#wireGradient)"
            strokeWidth="0.5"
            opacity={0.3 + (i * 0.1)}
            filter="url(#glow)"
          />
        ))}

        {/* Globe circles - vertical */}
        {[-60, -30, 0, 30, 60].map((offset, i) => (
          <ellipse
            key={`v-${i}`}
            cx="200"
            cy="200"
            rx="150"
            ry={150 * Math.cos((offset * Math.PI) / 180)}
            fill="none"
            stroke="url(#wireGradient)"
            strokeWidth="0.5"
            opacity={0.4}
            filter="url(#glow)"
          />
        ))}

        {/* Main outline */}
        <circle
          cx="200"
          cy="200"
          r="150"
          fill="none"
          stroke="#ff6b35"
          strokeWidth="1"
          opacity="0.6"
          filter="url(#glow)"
        />

        {/* Dots on globe */}
        {Array.from({ length: 40 }).map((_, i) => {
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          const x = 200 + 145 * Math.sin(phi) * Math.cos(theta)
          const y = 200 + 145 * Math.sin(phi) * Math.sin(theta)
          return (
            <circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r="2"
              fill="#ff6b35"
              opacity={0.3 + Math.random() * 0.5}
            />
          )
        })}

        {/* Connection lines */}
        {Array.from({ length: 15 }).map((_, i) => {
          const x1 = 200 + (Math.random() - 0.5) * 280
          const y1 = 200 + (Math.random() - 0.5) * 280
          const x2 = 200 + (Math.random() - 0.5) * 280
          const y2 = 200 + (Math.random() - 0.5) * 280
          return (
            <line
              key={`line-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#ff6b35"
              strokeWidth="0.3"
              opacity="0.2"
            />
          )
        })}
      </svg>
    </div>
  )
}
