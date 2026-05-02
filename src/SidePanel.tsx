import React from 'react';
import type { PlyItem } from './App';

interface SidePanelProps {
  tilt: number;
  onTiltChange: (newTilt: number) => void;
  gapScale: number;
  onGapScaleChange: (newScale: number) => void;
  thicknessScale: number;
  onThicknessScaleChange: (newScale: number) => void;
  selectedPly: PlyItem | null;
}

export const SidePanel: React.FC<SidePanelProps> = ({ tilt, onTiltChange, gapScale, onGapScaleChange, thicknessScale, onThicknessScaleChange, selectedPly }) => {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2a2a2a', color: 'white', borderLeft: '1px solid #444', minWidth: '250px', boxSizing: 'border-box' }}>
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
    </div>
  );
};