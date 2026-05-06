'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Globe() {
  const ref = useRef<THREE.Points>(null)
  
  const sphere = useMemo(() => {
    const points = []
    const numPoints = 2000
    
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numPoints)
      const theta = Math.sqrt(numPoints * Math.PI) * phi
      
      const x = Math.cos(theta) * Math.sin(phi)
      const y = Math.sin(theta) * Math.sin(phi)
      const z = Math.cos(phi)
      
      points.push(x * 2, y * 2, z * 2)
    }
    
    return new Float32Array(points)
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.1
      ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.1
    }
  })

  return (
    <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  )
}

function DataLines() {
  const linesRef = useRef<THREE.Group>(null)
  
  const lines = useMemo(() => {
    const lineData = []
    const numLines = 15
    
    for (let i = 0; i < numLines; i++) {
      const phi1 = Math.random() * Math.PI
      const theta1 = Math.random() * Math.PI * 2
      const phi2 = Math.random() * Math.PI
      const theta2 = Math.random() * Math.PI * 2
      
      const start = new THREE.Vector3(
        Math.cos(theta1) * Math.sin(phi1) * 2,
        Math.sin(theta1) * Math.sin(phi1) * 2,
        Math.cos(phi1) * 2
      )
      
      const end = new THREE.Vector3(
        Math.cos(theta2) * Math.sin(phi2) * 2,
        Math.sin(theta2) * Math.sin(phi2) * 2,
        Math.cos(phi2) * 2
      )
      
      lineData.push({ start, end, delay: Math.random() * 2 })
    }
    
    return lineData
  }, [])

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })

  return (
    <group ref={linesRef}>
      {lines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  line.start.x, line.start.y, line.start.z,
                  line.end.x, line.end.y, line.end.z
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#333333" transparent opacity={0.4} />
        </line>
      ))}
    </group>
  )
}

export function Globe3D({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <Globe />
        <DataLines />
      </Canvas>
    </div>
  )
}
