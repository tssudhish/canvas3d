import React from 'react';
import type { PlyItem } from './App';

interface SidePanelProps {
  mode: '2D' | '3D';
  onModeChange: (mode: '2D' | '3D') => void;
  tilt: number;
  onTiltChange: (newTilt: number) => void;
  gapScale: number;
  onGapScaleChange: (newScale: number) => void;
  thicknessScale: number;
  onThicknessScaleChange: (newScale: number) => void;
  selectedPly: PlyItem | null;
  draftOrientation: number;
  onDraftOrientationChange: (val: number) => void;
  draftColor: string;
  onDraftColorChange: (val: string) => void;
  onAddPly: () => void;
  onClearDraft: () => void;
  canAddPly: boolean;
  onExportPlies: () => void;
  datasets: string[];
  currentDataset: string;
  onLoadDataset: (filename: string) => void;
  onNewDataset: () => void;
  onClearWorkspace: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({ mode, onModeChange, tilt, onTiltChange, gapScale, onGapScaleChange, thicknessScale, onThicknessScaleChange, selectedPly, draftOrientation, onDraftOrientationChange, draftColor, onDraftColorChange, onAddPly, onClearDraft, canAddPly, onExportPlies, datasets, currentDataset, onLoadDataset, onNewDataset, onClearWorkspace }) => {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2a2a2a', color: 'white', borderLeft: '1px solid #444', minWidth: '250px', boxSizing: 'border-box' }}>
      {/* Mode Toggle */}
      <div style={{ display: 'flex', width: '100%', marginBottom: '2rem', borderRadius: '8px', overflow: 'hidden' }}>
        <button onClick={() => onModeChange('2D')} style={{ flex: 1, padding: '10px', border: 'none', backgroundColor: mode === '2D' ? '#aa3bff' : '#333', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>2D Draft</button>
        <button onClick={() => onModeChange('3D')} style={{ flex: 1, padding: '10px', border: 'none', backgroundColor: mode === '3D' ? '#aa3bff' : '#333', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>3D View</button>
      </div>

      {mode === '3D' ? (
        <>
      <label htmlFor="tilt-slider" style={{ marginBottom: '1rem', fontWeight: 'bold' }}>3D Tilt</label>
      <input
        id="tilt-slider"
        type="range"
        min="0"
        max="90"
        value={tilt}
        onChange={(e) => onTiltChange(Number(e.target.value))}
        style={{
          appearance: 'slider-vertical', // Standard for vertically oriented sliders
          width: '20px',
          height: '300px',
          cursor: 'pointer'
        }}
      />
      <span style={{ marginTop: '1rem', fontFamily: 'monospace', fontSize: '1.2rem' }}>{tilt}°</span>

      {/* Visual Scaling Controls */}
      <div style={{ marginTop: '2rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#ccc', marginBottom: '0.5rem' }}>
            <span>Gap Scale</span>
            <span>{gapScale.toFixed(1)}x</span>
          </label>
          <input 
            type="range" 
            min="0" max="5" step="0.1" 
            value={gapScale} 
            onChange={e => onGapScaleChange(Number(e.target.value))} 
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#ccc', marginBottom: '0.5rem' }}>
            <span>Thickness Ext.</span>
            <span>{thicknessScale}x</span>
          </label>
          <input 
            type="range" 
            min="1" max="1000" step="1" 
            value={thicknessScale} 
            onChange={e => onThicknessScaleChange(Number(e.target.value))} 
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Display the selected ply */}
      {selectedPly && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#444', borderRadius: '8px', textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
          <div style={{fontSize: '0.9rem', color: '#ccc'}}>Selected Ply:</div>
          <strong style={{ color: '#c084fc', fontSize: '1.1rem', display: 'block', marginBottom: '0.5rem' }}>{selectedPly.id}</strong>
          
          <div style={{fontSize: '0.9rem', color: '#ccc'}}>Orientation:</div>
          <strong style={{ color: 'white', fontSize: '1.1rem' }}>{selectedPly.orientation}°</strong>
        </div>
      )}
        </>
      ) : (
        <>
          {/* 2D Drafting Tools */}
          <h3 style={{ margin: '0 0 1rem 0', alignSelf: 'flex-start' }}>Draw New Ply</h3>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#ccc', marginBottom: '0.5rem' }}>Orientation (°)</label>
              <input type="number" value={draftOrientation} onChange={e => onDraftOrientationChange(Number(e.target.value))} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', background: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#ccc', marginBottom: '0.5rem' }}>Color</label>
              <input type="color" value={draftColor} onChange={e => onDraftColorChange(e.target.value)} style={{ width: '100%', height: '40px', padding: '0', border: 'none', cursor: 'pointer', background: 'transparent' }} />
            </div>
            <button onClick={onAddPly} disabled={!canAddPly} style={{ padding: '10px', backgroundColor: canAddPly ? '#22c55e' : '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: canAddPly ? 'pointer' : 'not-allowed', fontWeight: 'bold', marginTop: '1rem' }}>
              Add Ply
            </button>
            <button onClick={onClearDraft} style={{ padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Clear Drawing
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '1rem', lineHeight: '1.4', textAlign: 'center' }}>
            Click on the grid to add points.<br/>Need at least 3 points to create a ply.
          </p>
        </>
      )}

      {/* Global Actions */}
      <div style={{ marginTop: 'auto', width: '100%', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <select value={currentDataset} onChange={(e) => onLoadDataset(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#eab308', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {datasets.length === 0 && <option value="">Loading datasets...</option>}
          {datasets.map(ds => <option key={ds} value={ds}>{ds}</option>)}
        </select>
        <button onClick={onNewDataset} style={{ width: '100%', padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          New Dataset
        </button>
        <button onClick={onExportPlies} style={{ width: '100%', padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Save to Server
        </button>
        <button onClick={onClearWorkspace} style={{ width: '100%', padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Clear Workspace
        </button>
      </div>
    </div>
  );
};