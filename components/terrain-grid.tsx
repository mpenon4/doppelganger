"use client"

export function TerrainGrid() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[300px] overflow-hidden pointer-events-none">
      <svg
        viewBox="0 0 1200 300"
        className="w-full h-full"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="terrainFade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a0a0a" stopOpacity="1"/>
            <stop offset="30%" stopColor="#0a0a0a" stopOpacity="0"/>
          </linearGradient>
          <mask id="fadeMask">
            <rect x="0" y="0" width="100%" height="100%" fill="url(#terrainFade)"/>
          </mask>
        </defs>

        <g style={{ transform: "perspective(500px) rotateX(60deg)", transformOrigin: "center bottom" }}>
          {/* Horizontal lines */}
          {Array.from({ length: 20 }).map((_, i) => {
            const y = 50 + i * 15
            const wave = Math.sin(i * 0.5) * 10
            return (
              <path
                key={`h-${i}`}
                d={`M 0 ${y + wave} Q 300 ${y + wave + 20} 600 ${y + wave} T 1200 ${y + wave}`}
                fill="none"
                stroke="#ff6b35"
                strokeWidth="0.5"
                opacity={0.2 + (i / 20) * 0.3}
              />
            )
          })}

          {/* Vertical lines */}
          {Array.from({ length: 40 }).map((_, i) => {
            const x = i * 30
            return (
              <line
                key={`v-${i}`}
                x1={x}
                y1="50"
                x2={x}
                y2="350"
                stroke="#ff6b35"
                strokeWidth="0.3"
                opacity="0.15"
              />
            )
          })}

          {/* Dots at intersections */}
          {Array.from({ length: 100 }).map((_, i) => {
            const x = Math.random() * 1200
            const y = 80 + Math.random() * 200
            return (
              <circle
                key={`dot-${i}`}
                cx={x}
                cy={y}
                r={0.5 + Math.random() * 1.5}
                fill="#ffb347"
                opacity={0.2 + Math.random() * 0.4}
              />
            )
          })}
        </g>

        {/* Fade overlay */}
        <rect x="0" y="0" width="100%" height="100%" fill="url(#terrainFade)"/>
      </svg>
    </div>
  )
}
