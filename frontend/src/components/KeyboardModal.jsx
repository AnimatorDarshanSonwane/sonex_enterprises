import React from 'react';
import { Keyboard, X, MousePointer, RotateCw, ZoomIn, Eye } from 'lucide-react';

export default function KeyboardModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const SHORTCUTS = [
    { key: 'Space', desc: 'Toggle 360° Auto-Spin / Pause' },
    { key: '← / →', desc: 'Step -1 / +1 Frame (1/60s precision)' },
    { key: '1', desc: 'Full Body Camera (1.0x Overview)' },
    { key: '2', desc: 'Head / Neural Helm Focus (2.5x)' },
    { key: '3', desc: 'Torso & Arc Core Focus (2.1x)' },
    { key: '4', desc: 'Kinetic Greaves & Boots Focus (2.3x)' },
    { key: '5', desc: 'Cinematic Flank (3D Dutch Angle)' },
    { key: '6', desc: 'Isometric CAD Blueprint View' },
    { key: 'R', desc: 'Reset Camera to Default' },
    { key: 'H', desc: 'Toggle HUD Telemetry Overlays' },
    { key: 'M', desc: 'Toggle Audio Telemetry Sound FX' },
    { key: 'F', desc: 'Toggle Fullscreen Mode' }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Keyboard size={18} className="text-cyan" />
            <h3 className="modal-title">SHORTCUTS & INTERACTION GUIDE</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="guide-features-strip">
            <div className="feature-item">
              <MousePointer size={16} className="text-cyan" />
              <span><strong>Hover Scroll:</strong> Scroll wheel over character to spin 360° smoothly.</span>
            </div>
            <div className="feature-item">
              <RotateCw size={16} className="text-cyan" />
              <span><strong>Turntable Drag:</strong> Click & drag left/right to rotate model.</span>
            </div>
            <div className="feature-item">
              <Eye size={16} className="text-cyan" />
              <span><strong>Hotspot Click:</strong> Tap pulsing pins on character to zoom & inspect.</span>
            </div>
          </div>

          <h4 className="shortcuts-table-title">KEYBOARD SHORTCUTS</h4>
          <div className="shortcuts-grid">
            {SHORTCUTS.map((s, idx) => (
              <div key={idx} className="shortcut-row">
                <kbd className="kbd-badge">{s.key}</kbd>
                <span className="shortcut-desc">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            GOT IT, RESUME
          </button>
        </div>
      </div>
    </div>
  );
}
