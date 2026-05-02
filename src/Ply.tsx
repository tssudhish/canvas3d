import React, { useMemo, useState } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'

export interface PlyProps {
  id: string
  vertices: [number, number][]
  zOffset: number
  color: string
  orientation: number
  thickness: number
  onClick?: (id: string) => void
}

export const Ply: React.FC<PlyProps> = ({ id, vertices, zOffset, color, orientation, thickness, onClick }) => {
  const [hovered, setHovered] = useState(false)

  // Construct the Three.js Shape from the provided 2D vertices
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    if (vertices.length > 0) {
      s.moveTo(vertices[0][0], vertices[0][1])
      for (let i = 1; i < vertices.length; i++) {
        s.lineTo(vertices[i][0], vertices[i][1])
      }
      s.closePath()
    }
    return s
  }, [vertices])

  // Compute a simple centroid to place the tooltip in the center of the ply
  const centroid = useMemo(() => {
    if (vertices.length === 0) return [0, 0, 0] as [number, number, number]
    let sumX = 0, sumY = 0
    vertices.forEach(v => { sumX += v[0]; sumY += v[1] })
    return [sumX / vertices.length, sumY / vertices.length, 0] as [number, number, number]
  }, [vertices])

  return (
    // Offset the shape slightly in the Z-axis to distinguish overlapping layers
    <mesh 
      position={[0, 0, zOffset]}
      onPointerOver={(e) => { 
        e.stopPropagation() // Prevent hovering multiple overlapping layers at once
        setHovered(true) 
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { 
        e.stopPropagation() 
        if (onClick) onClick(id) 
      }}
    >
      {/* Using extrudeGeometry to give the 2D shape a slight 3D thickness */}
      <extrudeGeometry args={[shape, { depth: thickness, bevelEnabled: false }]} />
      {/* Add an emissive glow when hovered */}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.4 : 0} side={THREE.DoubleSide} />
      
      {/* Tooltip shown on hover */}
      {hovered && (
        <Html position={centroid} center style={{ pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(0,0,0,0.8)', color: 'white', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap', fontSize: '14px' }}>
            {id} ({orientation}°)
          </div>
        </Html>
      )}
    </mesh>
  )
}