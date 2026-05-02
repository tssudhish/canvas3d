import React from 'react';

interface SidePanelProps {
  tilt: number;
  onTiltChange: (newTilt: number) => void;
  selectedPly: string | null;
}

export const SidePanel: React.FC<SidePanelProps> = ({ tilt, onTiltChange, selectedPly }) => {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2a2a2a', color: 'white', borderLeft: '1px solid #444' }}>
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

      {/* Display the selected ply */}
      {selectedPly && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#444', borderRadius: '8px', textAlign: 'center' }}>
          Selected Ply:<br/>
          <strong style={{ color: '#c084fc', fontSize: '1.2rem' }}>{selectedPly}</strong>
        </div>
      )}
    </div>
  );
};