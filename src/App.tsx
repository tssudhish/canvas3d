import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, OrbitControls } from '@react-three/drei'
import './App.css'
import { Ply } from './Ply'
import { SidePanel } from './SidePanel'

export interface PlyItem {
  id: string
  color: string
  vertices: [number, number][]
  zOffset: number
  orientation: number
  thickness: number
}

function App() {
  // Rotation angle in degrees, from 0 (top-down) to 90 (side 3D view)
  const [tilt, setTilt] = useState(0)
  const [gapScale, setGapScale] = useState(1)
  // Defaulting to 400x exaggeration so the 0.25mm thickness is clearly visible (0.1m visual depth)
  const [thicknessScale, setThicknessScale] = useState(400)
  const [plyData, setPlyData] = useState<PlyItem[]>([])
  const [selectedPly, setSelectedPly] = useState<PlyItem | null>(null)

  // Convert degrees to radians for Three.js
  const tiltRadians = (tilt * Math.PI) / 180

  useEffect(() => {
    // Fetch the external JSON file from the public directory
    fetch('/plyData.json')
      .then((res) => res.json())
      .then((data) => setPlyData(data))
      .catch((err) => console.error('Failed to load ply data:', err))
  }, [])

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', flexDirection: 'row', backgroundColor: '#1a1a1a' }}>
      
      {/* Main 3D Canvas Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* The camera position is now managed by the <Bounds> component */}
        <Canvas camera={{ fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          
          {/* Allow user to rotate, pan, and zoom with the mouse */}
          <OrbitControls makeDefault />
          
          {/* Only render Bounds once our async plyData is populated */}
          {plyData.length > 0 && (
            <Bounds fit observe margin={1.2}>
              {/* This group tilts the entire scene along the X-axis based on the slider */}
              <group rotation={[-tiltRadians, 0, 0]}>
                {/* Render each polygonal ply based on our sample data */}
                {plyData.map((ply) => (
                  <Ply 
                    key={ply.id} 
                    id={ply.id}
                    vertices={ply.vertices} 
                    zOffset={ply.zOffset * gapScale} 
                    color={ply.color} 
                    orientation={ply.orientation}
                    thickness={ply.thickness * thicknessScale}
                    onClick={(id) => setSelectedPly(plyData.find(p => p.id === id) || null)}
                  />
                ))}
              </group>
            </Bounds>
          )}
        </Canvas>
      </div>

      <SidePanel
        tilt={tilt}
        onTiltChange={setTilt}
        gapScale={gapScale}
        onGapScaleChange={setGapScale}
        thicknessScale={thicknessScale}
        onThicknessScaleChange={setThicknessScale}
        selectedPly={selectedPly}
      />
    </div>
  )
}

export default App
