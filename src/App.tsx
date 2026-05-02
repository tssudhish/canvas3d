import { useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Bounds, OrbitControls, Line } from '@react-three/drei'
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

function CameraManager({ mode }: { mode: '2D' | '3D' }) {
  const { camera, controls } = useThree()
  useEffect(() => {
    // When switching to 2D draft mode, snap the camera to a perfect top-down view
    if (mode === '2D') {
      camera.position.set(0, 0, 10)
      camera.up.set(0, 1, 0)
      camera.lookAt(0, 0, 0)
      if (controls) {
        const orbit = controls as any
        if (orbit.target) {
          orbit.target.set(0, 0, 0)
          orbit.update()
        }
      }
    }
  }, [mode, camera, controls])
  return null
}

function App() {
  const [mode, setMode] = useState<'2D' | '3D'>('3D')
  // Rotation angle in degrees, from 0 (top-down) to 90 (side 3D view)
  const [tilt, setTilt] = useState(0)
  const [gapScale, setGapScale] = useState(1)
  // Defaulting to 400x exaggeration so the 0.25mm thickness is clearly visible (0.1m visual depth)
  const [thicknessScale, setThicknessScale] = useState(400)
  const [plyData, setPlyData] = useState<PlyItem[]>([])
  const [selectedPly, setSelectedPly] = useState<PlyItem | null>(null)
  
  const [draftVertices, setDraftVertices] = useState<[number, number][]>([])
  const [draftOrientation, setDraftOrientation] = useState<number>(0)
  const [draftColor, setDraftColor] = useState<string>('#aa3bff')

  // Convert degrees to radians for Three.js
  const currentTiltRadians = mode === '2D' ? 0 : (tilt * Math.PI) / 180

  useEffect(() => {
    // Fetch the external JSON file from the public directory
    fetch('/plyData.json')
      .then((res) => res.json())
      .then((data) => setPlyData(data))
      .catch((err) => console.error('Failed to load ply data:', err))
  }, [])

  // Commits the drafted shape into the 3D scene
  const handleAddPly = () => {
    if (draftVertices.length < 3) return
    const maxZ = plyData.length > 0 ? Math.max(...plyData.map(p => p.zOffset)) : -0.2
    const newPly: PlyItem = {
      id: `ply-custom-${Date.now().toString().slice(-4)}`,
      color: draftColor,
      vertices: draftVertices,
      zOffset: maxZ + 0.2, // Automatically stack on top
      orientation: draftOrientation,
      thickness: 0.00025,
    }
    setPlyData([...plyData, newPly])
    setDraftVertices([])
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', flexDirection: 'row', backgroundColor: '#1a1a1a' }}>
      
      {/* Main 3D Canvas Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* The camera position is now managed by the <Bounds> component */}
        <Canvas camera={{ fov: 50 }}>
          <CameraManager mode={mode} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          
          {/* Disable arbitrary rotation when in 2D mode */}
          <OrbitControls makeDefault enableRotate={mode === '3D'} />
          
          {/* Only render Bounds once our async plyData is populated */}
          {plyData.length > 0 && (
            <Bounds fit observe margin={1.2}>
              <group rotation={[-currentTiltRadians, 0, 0]}>
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

          {/* 2D Drafting Elements */}
          {mode === '2D' && (
            <group rotation={[-currentTiltRadians, 0, 0]}>
              {/* Invisible glass overlay placed in front of plies to securely absorb all clicks */}
              <mesh position={[0, 0, 5]} onClick={(e) => { e.stopPropagation(); setDraftVertices([...draftVertices, [e.point.x, e.point.y]]) }}>
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial visible={false} />
              </mesh>
              <gridHelper args={[100, 100]} rotation={[Math.PI / 2, 0, 0]} material-opacity={0.2} material-transparent />
              
              {/* Draw points where the user clicked */}
              {draftVertices.map((v, i) => (
                <mesh key={`pt-${i}`} position={[v[0], v[1], 0.01]}>
                  <sphereGeometry args={[0.05]} />
                  <meshBasicMaterial color={draftColor} />
                </mesh>
              ))}

              {/* Draw connected lines bridging the dots */}
              {draftVertices.length > 1 && (
                <Line
                  points={
                    draftVertices.length > 2 
                      ? [...draftVertices, draftVertices[0]].map(v => [v[0], v[1], 0.01] as [number, number, number])
                      : draftVertices.map(v => [v[0], v[1], 0.01] as [number, number, number])
                  }
                  color={draftColor}
                  lineWidth={2}
                />
              )}
            </group>
          )}
        </Canvas>
      </div>

      <SidePanel
        mode={mode}
        onModeChange={setMode}
        tilt={tilt}
        onTiltChange={setTilt}
        gapScale={gapScale}
        onGapScaleChange={setGapScale}
        thicknessScale={thicknessScale}
        onThicknessScaleChange={setThicknessScale}
        selectedPly={selectedPly}
        draftOrientation={draftOrientation}
        onDraftOrientationChange={setDraftOrientation}
        draftColor={draftColor}
        onDraftColorChange={setDraftColor}
        onAddPly={handleAddPly}
        onClearDraft={() => setDraftVertices([])}
        canAddPly={draftVertices.length >= 3}
      />
    </div>
  )
}

export default App
