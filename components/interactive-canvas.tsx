"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  baseX: number
  baseY: number
  vx: number
  vy: number
  size: number
  alpha: number
}

export function InteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      initParticles()
    }

    const initParticles = () => {
      particlesRef.current = []
      const gridSize = 60
      const cols = Math.ceil(width / gridSize)
      const rows = Math.ceil(height / gridSize)

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          particlesRef.current.push({
            x: i * gridSize,
            y: j * gridSize,
            baseX: i * gridSize,
            baseY: j * gridSize,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.3 + 0.1,
          })
        }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const drawGrid = () => {
      ctx.strokeStyle = "rgba(255, 107, 53, 0.03)"
      ctx.lineWidth = 1

      // Vertical lines
      for (let x = 0; x < width; x += 60) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = 0; y < height; y += 60) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
    }

    const drawConnections = () => {
      const particles = particlesRef.current
      ctx.strokeStyle = "rgba(255, 107, 53, 0.08)"
      ctx.lineWidth = 0.5

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 80) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[j].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw grid
      drawGrid()

      // Update and draw particles
      const particles = particlesRef.current
      const mouse = mouseRef.current
      const maxDist = 200

      for (const p of particles) {
        // Calculate distance from mouse
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist
          const angle = Math.atan2(dy, dx)
          p.vx -= Math.cos(angle) * force * 0.5
          p.vy -= Math.sin(angle) * force * 0.5
        }

        // Spring back to base position
        p.vx += (p.baseX - p.x) * 0.03
        p.vy += (p.baseY - p.y) * 0.03

        // Apply friction
        p.vx *= 0.92
        p.vy *= 0.92

        // Update position
        p.x += p.vx
        p.y += p.vy

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 107, 53, ${p.alpha})`
        ctx.fill()
      }

      // Draw connections
      drawConnections()

      animationId = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", handleMouseMove)
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}
