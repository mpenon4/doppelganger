'use client'

import { motion } from 'framer-motion'

export function WireframeGlobe({ isCollapsing = false }: { isCollapsing?: boolean }) {
  // Generate latitude lines
  const latitudes = Array.from({ length: 8 }, (_, i) => (i - 4) * 22.5)
  // Generate longitude lines
  const longitudes = Array.from({ length: 12 }, (_, i) => i * 30)

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0.6, scale: 1 }}
      animate={
        isCollapsing
          ? { opacity: 0, scale: 0, rotate: 180 }
          : { opacity: 0.6, scale: 1 }
      }
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div
        className="globe-container relative"
        style={{
          width: '500px',
          height: '500px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Latitude circles */}
        {latitudes.map((lat, i) => {
          const radius = Math.cos((lat * Math.PI) / 180) * 250
          const y = Math.sin((lat * Math.PI) / 180) * 250
          return (
            <div
              key={`lat-${i}`}
              className="absolute left-1/2 top-1/2"
              style={{
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                marginLeft: `-${radius}px`,
                marginTop: `-${radius}px`,
                border: '1px dotted rgba(139, 92, 246, 0.3)',
                borderRadius: '50%',
                transform: `translateZ(${y}px) rotateX(90deg)`,
                transformStyle: 'preserve-3d',
              }}
            />
          )
        })}

        {/* Longitude arcs */}
        {longitudes.map((lng, i) => (
          <div
            key={`lng-${i}`}
            className="absolute left-1/2 top-1/2"
            style={{
              width: '500px',
              height: '500px',
              marginLeft: '-250px',
              marginTop: '-250px',
              border: '1px dotted rgba(139, 92, 246, 0.2)',
              borderRadius: '50%',
              transform: `rotateY(${lng}deg)`,
              transformStyle: 'preserve-3d',
            }}
          />
        ))}

        {/* Scattered dots */}
        {Array.from({ length: 50 }).map((_, i) => {
          const phi = Math.acos(-1 + (2 * i) / 50)
          const theta = Math.sqrt(50 * Math.PI) * phi
          const x = 250 * Math.cos(theta) * Math.sin(phi)
          const y = 250 * Math.sin(theta) * Math.sin(phi)
          const z = 250 * Math.cos(phi)
          return (
            <div
              key={`dot-${i}`}
              className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full bg-primary/40"
              style={{
                transform: `translate3d(${x}px, ${y}px, ${z}px) translate(-50%, -50%)`,
              }}
            />
          )
        })}
      </div>
    </motion.div>
  )
}
