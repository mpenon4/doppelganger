"use client"

export function DataFunnel() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Data annotations - right side */}
      <div className="absolute top-[10%] right-[5%] text-right">
        <div className="font-mono text-[10px] text-primary tracking-wider">
          MARKET
          <br />
          <span className="text-muted">LANDSCAPE</span>
        </div>
        <div className="mt-1 w-16 h-px bg-primary ml-auto" />
      </div>
      <div className="absolute top-[28%] right-[5%] text-right">
        <div className="font-mono text-[10px] text-primary tracking-wider">
          COMPETITOR
          <br />
          <span className="text-muted">ANALYSIS</span>
        </div>
        <div className="mt-1 w-12 h-px bg-primary ml-auto" />
      </div>
      <div className="absolute top-[45%] right-[5%] text-right">
        <div className="font-mono text-[10px] text-primary tracking-wider">
          ERROR
          <br />
          <span className="text-muted">PATTERNS</span>
        </div>
        <div className="mt-1 w-10 h-px bg-primary ml-auto" />
      </div>
      <div className="absolute top-[62%] right-[5%] text-right">
        <div className="font-mono text-[10px] text-primary tracking-wider">
          DIFFERENTIATION
          <br />
          <span className="text-muted">OPPORTUNITIES</span>
        </div>
        <div className="mt-1 w-8 h-px bg-primary ml-auto" />
      </div>
      <div className="absolute bottom-[20%] right-[5%] text-right">
        <div className="font-mono text-[10px] text-primary tracking-wider">
          UNFAIR
          <br />
          <span className="text-muted">ADVANTAGE</span>
        </div>
        <div className="mt-1 w-6 h-px bg-primary ml-auto" />
      </div>

      <svg
        viewBox="0 0 300 500"
        className="w-full max-w-[250px] h-auto"
      >
        <defs>
          <linearGradient id="funnelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#ff6b35" stopOpacity="0.2"/>
          </linearGradient>
          <filter id="funnelGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Funnel wireframe lines - horizontal */}
        {Array.from({ length: 20 }).map((_, i) => {
          const y = 30 + i * 22
          const progress = i / 19
          const width = 260 - progress * 200
          const x = 150 - width / 2
          return (
            <ellipse
              key={`funnel-h-${i}`}
              cx="150"
              cy={y}
              rx={width / 2}
              ry={8 - progress * 5}
              fill="none"
              stroke="#ff6b35"
              strokeWidth="0.5"
              opacity={0.3 + progress * 0.4}
            />
          )
        })}

        {/* Vertical lines */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const topX = 150 + Math.cos(angle) * 130
          const topY = 30
          const bottomX = 150 + Math.cos(angle) * 30
          const bottomY = 450
          return (
            <line
              key={`funnel-v-${i}`}
              x1={topX}
              y1={topY}
              x2={bottomX}
              y2={bottomY}
              stroke="#ff6b35"
              strokeWidth="0.3"
              opacity="0.3"
            />
          )
        })}

        {/* Particle dots flowing down */}
        {Array.from({ length: 30 }).map((_, i) => {
          const progress = (i / 30)
          const y = 50 + progress * 380
          const width = 250 - progress * 200
          const x = 150 + (Math.random() - 0.5) * width * 0.8
          return (
            <circle
              key={`particle-${i}`}
              cx={x}
              cy={y}
              r={1.5 - progress * 0.5}
              fill="#ffb347"
              opacity={0.4 + Math.random() * 0.4}
            >
              <animate
                attributeName="cy"
                values={`${y};${y + 50};${y}`}
                dur={`${2 + Math.random() * 2}s`}
                repeatCount="indefinite"
              />
            </circle>
          )
        })}

        {/* Highlight ring at top */}
        <ellipse
          cx="150"
          cy="30"
          rx="130"
          ry="8"
          fill="none"
          stroke="#ff6b35"
          strokeWidth="1.5"
          filter="url(#funnelGlow)"
        />

        {/* Small indicator at bottom */}
        <circle
          cx="150"
          cy="470"
          r="4"
          fill="#ff6b35"
          opacity="0.8"
        >
          <animate
            attributeName="r"
            values="4;6;4"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  )
}
