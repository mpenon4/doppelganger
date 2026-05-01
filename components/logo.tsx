'use client'

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Solid ghost */}
        <path
          d="M10 8C10 5.79086 11.7909 4 14 4H18C20.2091 4 22 5.79086 22 8V24C22 25.1046 21.1046 26 20 26H12C10.8954 26 10 25.1046 10 24V8Z"
          fill="#8b5cf6"
        />
        <circle cx="14" cy="12" r="2" fill="#050508" />
        <circle cx="18" cy="12" r="2" fill="#050508" />
        <path
          d="M12 18C12 18 13 20 16 20C19 20 20 18 20 18"
          stroke="#050508"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Transparent ghost (offset) */}
        <path
          d="M12 10C12 7.79086 13.7909 6 16 6H20C22.2091 6 24 7.79086 24 10V26C24 27.1046 23.1046 28 22 28H14C12.8954 28 12 27.1046 12 26V10Z"
          fill="none"
          stroke="rgba(139, 92, 246, 0.4)"
          strokeWidth="1"
        />
        <circle cx="16" cy="14" r="1.5" fill="none" stroke="rgba(139, 92, 246, 0.4)" />
        <circle cx="20" cy="14" r="1.5" fill="none" stroke="rgba(139, 92, 246, 0.4)" />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-foreground">
        Doppelganger
      </span>
    </div>
  )
}
