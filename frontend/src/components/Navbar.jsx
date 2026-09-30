import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Layers, 
  Activity, 
  Sparkles,
  HelpCircle,
  Box,
  Film
} from 'lucide-react';
import { LIGHTING_PRESETS } from '../constants/cameraPresets';

export default function Navbar({ 
  lighting, 
  setLighting, 
  isMuted, 
  setIsMuted, 
  isFullscreen, 
  toggleFullscreen,
  showHud,
  setShowHud,
  engineMode,
  setEngineMode,
  onOpenHelp,
  playSound,
  activePage = 'studio',
  setActivePage
}) {
  return (
    <header className="navbar-container">
      {/* Brand Identity */}
      <div className="navbar-brand">
        <div className="brand-badge">
          <span className="pulse-dot"></span>
          <span className="badge-text">LIVE 60 FPS</span>
        </div>
        <div className="brand-titles">
          <h1 className="brand-name">AETHER-01</h1>
          <span className="brand-subtitle">CYBERNETIC TURNTABLE SHOWCASE</span>
        </div>
      </div>

      {/* Multi-Page Switcher Tabs */}
      {setActivePage && (
        <nav className="navbar-page-switch">
          <button
            className={`page-tab-btn ${activePage === 'studio' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('studio');
              window.location.hash = '';
              if (playSound) playSound('mode');
            }}
          >
            <Box size={13} />
            <span>01 // DOSSIER</span>
          </button>
          <button
            className={`page-tab-btn ${activePage === 'showcase-1' ? 'active showcase-accent' : ''}`}
            onClick={() => {
              setActivePage('showcase-1');
              window.location.hash = '#showcase-1';
              if (playSound) playSound('mode');
            }}
          >
            <Maximize2 size={13} />
            <span>02 // SHOWCASE A</span>
          </button>
          <button
            className={`page-tab-btn ${activePage === 'showcase-2' ? 'active showcase-accent-2' : ''}`}
            onClick={() => {
              setActivePage('showcase-2');
              window.location.hash = '#showcase-2';
              if (playSound) playSound('mode');
            }}
          >
            <Film size={13} />
            <span>03 // SHOWCASE B</span>
          </button>
        </nav>
      )}

      {/* Telemetry Center Info */}
      <div className="navbar-telemetry">
        <div className="telemetry-pill">
          <Layers size={14} className="telemetry-icon" />
          <span>PIPELINE: <strong>ZERO-JERK HD CANVAS</strong></span>
        </div>
        <div className="telemetry-pill">
          <Activity size={14} className="telemetry-icon" />
          <span>FPS: <strong>60 TRUE SYNC</strong></span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="navbar-actions">
        {/* Lighting Palette Selector */}
        <div className="lighting-selector" title="Select Studio Lighting Filter">
          <div className="selector-label">
            <Sparkles size={14} />
            <span>LIGHTING</span>
          </div>
          <div className="lighting-dots">
            {LIGHTING_PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={`lighting-dot-btn ${lighting.id === preset.id ? 'active' : ''}`}
                style={{ '--dot-color': preset.color }}
                onClick={() => {
                  setLighting(preset);
                  playSound('mode');
                }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* HUD Toggle */}
        <button 
          className={`icon-btn ${showHud ? 'active' : ''}`}
          onClick={() => {
            setShowHud(!showHud);
            playSound('click');
          }}
          title={showHud ? 'Hide HUD Overlays' : 'Show HUD Overlays'}
        >
          <Layers size={18} />
          <span className="btn-label-sm">HUD</span>
        </button>

        {/* Audio Mute / Unmute */}
        <button 
          className={`icon-btn ${!isMuted ? 'active-audio' : ''}`}
          onClick={() => {
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);
            if (nextMuted === false) {
              playSound('mode', false);
            }
          }}
          title={isMuted ? 'Enable UI Audio Telemetry' : 'Mute UI Audio'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Shortcuts Help */}
        <button 
          className="icon-btn"
          onClick={() => {
            onOpenHelp();
            playSound('click');
          }}
          title="Keyboard Shortcuts & Controls"
        >
          <HelpCircle size={18} />
        </button>

        {/* Fullscreen Toggle */}
        <button 
          className="icon-btn"
          onClick={() => {
            toggleFullscreen();
            playSound('click');
          }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
    </header>
  );
}
