import React from 'react';
import { 
  Maximize, 
  Eye, 
  Shield, 
  Footprints, 
  Camera, 
  Box, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Crosshair,
  Sliders,
  Wind
} from 'lucide-react';
import { CAMERA_PRESETS } from '../constants/cameraPresets';

const iconMap = {
  Maximize: Maximize,
  Eye: Eye,
  Shield: Shield,
  Footprints: Footprints,
  Camera: Camera,
  Box: Box
};

export default function CameraControls({
  currentPreset,
  setPreset,
  cameraConfig,
  setCameraConfig,
  isBreathing,
  setIsBreathing,
  playSound
}) {
  const handleSelectPreset = (preset) => {
    setPreset(preset);
    playSound('zoom');
  };

  const handleZoomChange = (newZoom) => {
    const clamped = Math.min(3.5, Math.max(1.0, parseFloat(newZoom.toFixed(2))));
    setCameraConfig(prev => ({
      ...prev,
      zoom: clamped,
      isCustom: true
    }));
  };

  const handleResetCamera = () => {
    const fullPreset = CAMERA_PRESETS.find(p => p.id === 'full') || CAMERA_PRESETS[0];
    setPreset(fullPreset);
    playSound('mode');
  };

  return (
    <aside className="camera-controls-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title-group">
          <Camera size={16} className="title-icon text-cyan" />
          <h2 className="panel-title">CAMERA RIG // 3D ANGLES</h2>
        </div>
        <button 
          className="reset-cam-btn"
          onClick={handleResetCamera}
          title="Reset Camera to Full Body"
        >
          <RotateCcw size={14} />
          <span>RESET</span>
        </button>
      </div>

      <p className="panel-desc">
        Select dynamic focal targets or use smooth zoom to inspect individual systems in 3D perspective.
      </p>

      {/* Preset Buttons Grid */}
      <div className="presets-grid">
        {CAMERA_PRESETS.map((preset) => {
          const IconComponent = iconMap[preset.icon] || Camera;
          const isActive = currentPreset?.id === preset.id && !cameraConfig.isCustom;

          return (
            <button
              key={preset.id}
              className={`preset-card ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectPreset(preset)}
            >
              <div className="preset-top">
                <div className="preset-icon-wrap">
                  <IconComponent size={18} />
                </div>
                <span className="preset-badge">{preset.badge}</span>
              </div>
              <div className="preset-info">
                <div className="preset-name">{preset.name}</div>
                <div className="preset-sub">{preset.shortName} Focal View</div>
              </div>
              {isActive && (
                <div className="preset-active-indicator">
                  <Crosshair size={12} className="spin-slow" />
                  <span>LOCKED</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Manual Zoom & Fine-Tuning */}
      <div className="manual-zoom-box">
        <div className="zoom-box-header">
          <div className="zoom-title-row">
            <Sliders size={14} className="text-cyan" />
            <span className="zoom-label">MANUAL FOCAL ZOOM</span>
          </div>
          <span className="zoom-value-tag">{cameraConfig.zoom.toFixed(1)}x</span>
        </div>

        <div className="zoom-slider-container">
          <button 
            className="zoom-step-btn"
            onClick={() => {
              handleZoomChange(cameraConfig.zoom - 0.25);
              playSound('click');
            }}
            disabled={cameraConfig.zoom <= 1.0}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>

          <input 
            type="range"
            min="1.0"
            max="3.5"
            step="0.05"
            value={cameraConfig.zoom}
            onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
            className="zoom-range-input"
          />

          <button 
            className="zoom-step-btn"
            onClick={() => {
              handleZoomChange(cameraConfig.zoom + 0.25);
              playSound('click');
            }}
            disabled={cameraConfig.zoom >= 3.5}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* Camera Dynamics & Telemetry */}
      <div className="camera-extras">
        <button 
          className={`toggle-pill-btn ${isBreathing ? 'active' : ''}`}
          onClick={() => {
            setIsBreathing(!isBreathing);
            playSound('click');
          }}
          title="Toggle subtle cinematic breathing motion"
        >
          <Wind size={15} />
          <span>Cinematic Drift</span>
          <span className="toggle-status">{isBreathing ? 'ON' : 'OFF'}</span>
        </button>

        <div className="camera-telemetry-readout">
          <div className="telemetry-row">
            <span className="key">FOCAL DEPTH:</span>
            <span className="val">{Math.round(cameraConfig.zoom * 50)}mm</span>
          </div>
          <div className="telemetry-row">
            <span className="key">AXIS TILT (X/Y):</span>
            <span className="val">{cameraConfig.rotX}° / {cameraConfig.rotY}°</span>
          </div>
          <div className="telemetry-row">
            <span className="key">CENTER OFFSET:</span>
            <span className="val">{cameraConfig.panY > 0 ? `+${cameraConfig.panY}%` : `${cameraConfig.panY}%`}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
