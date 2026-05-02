import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, OrbitControls } from '@react-three/drei'
import './App.css'
import { Ply } from './Ply'
import { SidePanel } from './SidePanel'

interface PlyItem {
  id: string
  color: string
  vertices: [number, number][]
  zOffset: number
}

function App() {
  // Rotation angle in degrees, from 0 (top-down) to 90 (side 3D view)
  const [tilt, setTilt] = useState(0)
  const [plyData, setPlyData] = useState<PlyItem[]>([])
  const [selectedPly, setSelectedPly] = useState<string | null>(null)

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
          
          {/* Bounds will auto-fit the camera to its contents, with a 20% margin */}
          <Bounds fit clip margin={1.2}>
            {/* This group tilts the entire scene along the X-axis based on the slider */}
            <group rotation={[-tiltRadians, 0, 0]}>
              {/* Render each polygonal ply based on our sample data */}
              {plyData.map((ply) => (
                <Ply 
                  key={ply.id} 
                  id={ply.id}
                  vertices={ply.vertices} 
                  zOffset={ply.zOffset} 
                  color={ply.color} 
                  onClick={(id) => setSelectedPly(id)}
                />
              ))}
            </group>
          </Bounds>
        </Canvas>
      </div>

      <SidePanel
        tilt={tilt}
        onTiltChange={setTilt}
        selectedPly={selectedPly}
      />
    </div>
  )
}

export default App
