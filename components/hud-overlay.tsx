"use client"

import { useEffect, useState } from "react"

export function HUDOverlay() {
  const [time, setTime] = useState("")
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toISOString().slice(11, 19))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Top Left Corner */}
      <div className="absolute top-20 left-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 border border-[#ff6b35]" />
          <span className="font-mono text-[10px] text-[#666]">SYS_TIME: {time}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#ff6b35]" />
          <span className="font-mono text-[10px] text-[#666]">COORD: {coords.x}, {coords.y}</span>
        </div>
      </div>

      {/* Top Right Corner */}
      <div className="absolute top-20 right-6 text-right">
        <div className="flex items-center justify-end gap-2 mb-2">
          <span className="font-mono text-[10px] text-[#666]">NET_STATUS</span>
          <div className="w-2 h-2 bg-green-500 animate-pulse" />
        </div>
        <div className="flex items-center justify-end gap-2">
          <span className="font-mono text-[10px] text-[#666]">v1.0.4_BETA</span>
          <div className="w-2 h-2 border border-[#ff6b35]" />
        </div>
      </div>

      {/* Bottom Left */}
      <div className="absolute bottom-6 left-6">
        <div className="font-mono text-[10px] text-[#444]">
          <p>MEM: 847MB / 2048MB</p>
          <p>CPU: 12.4%</p>
        </div>
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-6 right-6 text-right">
        <p className="font-mono text-[10px] text-[#444]">DOPPELGANGER_ENGINE</p>
        <p className="font-mono text-[10px] text-[#ff6b35]">READY</p>
      </div>

      {/* Corner Brackets */}
      <svg className="absolute top-16 left-4 w-8 h-8" viewBox="0 0 32 32" fill="none">
        <path d="M0 12V0H12" stroke="#ff6b35" strokeWidth="1" strokeOpacity="0.3" />
      </svg>
      <svg className="absolute top-16 right-4 w-8 h-8" viewBox="0 0 32 32" fill="none">
        <path d="M32 12V0H20" stroke="#ff6b35" strokeWidth="1" strokeOpacity="0.3" />
      </svg>
      <svg className="absolute bottom-4 left-4 w-8 h-8" viewBox="0 0 32 32" fill="none">
        <path d="M0 20V32H12" stroke="#ff6b35" strokeWidth="1" strokeOpacity="0.3" />
      </svg>
      <svg className="absolute bottom-4 right-4 w-8 h-8" viewBox="0 0 32 32" fill="none">
        <path d="M32 20V32H20" stroke="#ff6b35" strokeWidth="1" strokeOpacity="0.3" />
      </svg>

      {/* Crosshair Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="15" stroke="#ff6b35" strokeWidth="0.5" />
          <line x1="20" y1="0" x2="20" y2="10" stroke="#ff6b35" strokeWidth="0.5" />
          <line x1="20" y1="30" x2="20" y2="40" stroke="#ff6b35" strokeWidth="0.5" />
          <line x1="0" y1="20" x2="10" y2="20" stroke="#ff6b35" strokeWidth="0.5" />
          <line x1="30" y1="20" x2="40" y2="20" stroke="#ff6b35" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Film Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
