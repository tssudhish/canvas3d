import { useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Bounds, OrbitControls, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
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

// Validates that an imported JSON file matches the PlyItem[] structure
const validatePlyData = (data: any): data is PlyItem[] => {
  if (!Array.isArray(data)) return false;
  return data.every(item => 
    item && typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.color === 'string' &&
    typeof item.zOffset === 'number' &&
    typeof item.orientation === 'number' &&
    typeof item.thickness === 'number' &&
    Array.isArray(item.vertices) &&
    item.vertices.every((v: any) => Array.isArray(v) && v.length === 2 && typeof v[0] === 'number' && typeof v[1] === 'number')
  );
}

function CameraManager({ mode }: { mode: '2D' | '3D' }) {
  const { camera, controls } = useThree()
  useEffect(() => {
    const orbit = controls as any
    if (!orbit) return

    if (mode === '2D') {
      // To allow 2D Z-axis rotation, set 'up' to Z and place the camera nearly on the Z axis
      camera.up.set(0, 0, 1)
      // A tiny negative Y offset prevents Gimbal lock and aligns screen +Y with world +Y
      camera.position.set(0, -0.001, 10)
      camera.lookAt(0, 0, 0)
      orbit.target.set(0, 0, 0)
      // Lock polar angle to prevent 3D tilting
      orbit.minPolarAngle = 0.0001
      orbit.maxPolarAngle = 0.0001
      orbit.update()
    } else {
      // Restore 3D mode defaults
      camera.up.set(0, 1, 0)
      camera.position.set(0, 0, 10)
      camera.lookAt(0, 0, 0)
      orbit.target.set(0, 0, 0)
      // Allow full 3D rotation
      orbit.minPolarAngle = 0
      orbit.maxPolarAngle = Math.PI
      orbit.update()
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
  const [datasets, setDatasets] = useState<string[]>([])
  const [currentDataset, setCurrentDataset] = useState<string>('plyData.json')
  
  const [draftVertices, setDraftVertices] = useState<[number, number][]>([])
  const [draftOrientation, setDraftOrientation] = useState<number>(0)
  const [draftColor, setDraftColor] = useState<string>('#aa3bff')

  // Convert degrees to radians for Three.js
  const currentTiltRadians = mode === '2D' ? 0 : (tilt * Math.PI) / 180

  useEffect(() => {
    // Fetch available datasets
    fetch('http://localhost:5000/api/datasets')
      .then((res) => res.json())
      .then((data) => setDatasets(data))
      .catch((err) => console.error('Failed to load datasets:', err))

    // Fetch the default JSON file from our Python backend
    fetch('http://localhost:5000/api/plies?file=plyData.json')
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

  // Exports the current plyData state, allowing the user to overwrite the JSON file
  const handleExportPlies = async () => {
    let exportPlies = [...plyData];
    
    // Include active drafting data if it forms a valid shape in the workspace
    if (draftVertices.length >= 3) {
      const maxZ = exportPlies.length > 0 ? Math.max(...exportPlies.map(p => p.zOffset)) : -0.2;
      exportPlies.push({
        id: `ply-draft-${Date.now().toString().slice(-4)}`,
        color: draftColor,
        vertices: draftVertices,
        zOffset: maxZ + 0.2,
        orientation: draftOrientation,
        thickness: 0.00025,
      });
    }

    // Format numbers to 4 decimal places to prevent massive raw WebGL float strings
    const formattedData = exportPlies.map(ply => ({
      ...ply,
      zOffset: Number(ply.zOffset.toFixed(4)),
      vertices: ply.vertices.map(v => [Number(v[0].toFixed(4)), Number(v[1].toFixed(4))] as [number, number])
    }));

    try {
      const response = await fetch(`http://localhost:5000/api/plies?file=${currentDataset}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        alert('Data successfully saved to server!');
      } else {
        alert('Failed to save data. Make sure the Python backend is running.');
      }
    } catch (err: any) {
      console.error('Failed to save file:', err);
      alert('Network error. Make sure the Python backend is running.');
    }
  }

  // Loads a specific dataset from the server
  const handleLoadDataset = (filename: string) => {
    fetch(`http://localhost:5000/api/plies?file=${filename}`)
      .then((res) => res.json())
      .then((data) => {
        if (validatePlyData(data)) {
          setPlyData(data)
          setCurrentDataset(filename)
          setSelectedPly(null)
          setDraftVertices([])
        } else {
          alert('Load Failed: The JSON file is missing required fields or has incorrect data types.')
        }
      })
      .catch((err) => {
        console.error(err)
        alert('Load Failed: Could not fetch or parse the JSON file.')
      })
  }

  // Starts a new empty dataset with a custom name
  const handleNewDataset = () => {
    const name = window.prompt('Enter new dataset name:', 'untitled.json');
    if (name) {
      let validName = name.trim();
      if (!validName.endsWith('.json')) validName += '.json';
      
      if (!/^[\w\-. ]+$/.test(validName)) {
        alert('Invalid filename. Please use only alphanumeric characters, dashes, and spaces.');
        return;
      }

      if (datasets.includes(validName)) {
        if (!window.confirm(`Dataset "${validName}" already exists. Continuing will clear the workspace and overwrite it upon saving. Continue?`)) {
          return;
        }
      } else if (plyData.length > 0 || draftVertices.length > 0) {
        if (!window.confirm('Are you sure you want to start a new workspace? All unsaved data will be lost.')) {
          return;
        }
      }

      setPlyData([]);
      setSelectedPly(null);
      setDraftVertices([]);
      setCurrentDataset(validName);
      if (!datasets.includes(validName)) {
        setDatasets([...datasets, validName]);
      }
    }
  }

  // Clears all plies from the workspace
  const handleClearWorkspace = () => {
    if (window.confirm('Are you sure you want to clear the workspace? All unsaved data will be lost.')) {
      setPlyData([])
      setSelectedPly(null)
      setDraftVertices([])
    }
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
          
          {/* Rotation constraints are dynamically managed by CameraManager */}
          <OrbitControls makeDefault />
          
          {/* Only render Bounds once our async plyData is populated */}
          {plyData.length > 0 && (
            <Bounds fit observe margin={1.2}>
              <group rotation={[-currentTiltRadians, 0, 0]}>
                {/* Global coordinate system (X=Red, Y=Green, Z=Blue) */}
                <group>
                  <axesHelper args={[15]} />
                  <Html position={[16, 0, 0]} center><div style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '1.2rem', pointerEvents: 'none' }}>X</div></Html>
                  <Html position={[0, 16, 0]} center><div style={{ color: '#44ff44', fontWeight: 'bold', fontSize: '1.2rem', pointerEvents: 'none' }}>Y</div></Html>
                  <Html position={[0, 0, 16]} center><div style={{ color: '#4488ff', fontWeight: 'bold', fontSize: '1.2rem', pointerEvents: 'none' }}>Z</div></Html>
                </group>

                {/* Overall Ply Orientation System (0°, 45°, 90°) */}
                {/* Elevated slightly in Z so it can be seen clearly over the plies */}
                <group position={[0, 0, 1]}>
                  <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 8, 0xffffff, 1, 0.5]} />
                  <Html position={[9, 0, 0]} center><div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', pointerEvents: 'none', textShadow: '0 0 4px black' }}>0°</div></Html>
                  
                  <arrowHelper args={[new THREE.Vector3(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4), 0), new THREE.Vector3(0, 0, 0), 8, 0xffffff, 1, 0.5]} />
                  <Html position={[9 * Math.cos(Math.PI / 4), 9 * Math.sin(Math.PI / 4), 0]} center><div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', pointerEvents: 'none', textShadow: '0 0 4px black' }}>45°</div></Html>
                  
                  <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 8, 0xffffff, 1, 0.5]} />
                  <Html position={[0, 9, 0]} center><div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', pointerEvents: 'none', textShadow: '0 0 4px black' }}>90°</div></Html>
                </group>

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
        onExportPlies={handleExportPlies}
        datasets={datasets}
        currentDataset={currentDataset}
        onLoadDataset={handleLoadDataset}
        onNewDataset={handleNewDataset}
        onClearWorkspace={handleClearWorkspace}
      />
    </div>
  )
}

export default App
