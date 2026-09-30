import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Crosshair,
  RotateCw,
  Compass,
  Info,
  Sparkles,
  Scan,
  Maximize
} from 'lucide-react';
import { HOTSPOTS } from '../constants/cameraPresets';

export default function CharacterViewport({
  videoRef,
  currentTime,
  setCurrentTime,
  targetTimeRef,
  duration,
  isPlaying,
  setIsPlaying,
  cameraConfig,
  currentPreset,
  setPreset,
  lighting,
  showHud,
  isBreathing,
  onSelectHotspot,
  selectedHotspot,
  playSound
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showLaserScan, setShowLaserScan] = useState(false);

  // Calculate current angle (0° to 360°)
  const angle = duration > 0 ? ((currentTime / duration) * 360) % 360 : 0;
  const currentFrame = Math.round((currentTime / (duration || 10)) * 600);

  // Compass orientation label
  const getCompassHeading = (deg) => {
    const d = (deg + 360) % 360;
    if (d >= 337.5 || d < 22.5) return 'FRONT (0°)';
    if (d >= 22.5 && d < 67.5) return 'FRONT-RIGHT (45°)';
    if (d >= 67.5 && d < 112.5) return 'PROFILE-RIGHT (90°)';
    if (d >= 112.5 && d < 157.5) return 'REAR-RIGHT (135°)';
    if (d >= 157.5 && d < 202.5) return 'REAR (180°)';
    if (d >= 202.5 && d < 247.5) return 'REAR-LEFT (225°)';
    if (d >= 247.5 && d < 292.5) return 'PROFILE-LEFT (270°)';
    return 'FRONT-LEFT (315°)';
  };

  const scrollVelocityRef = useRef(0);
  const isSeekingRef = useRef(false);
  const pendingTimeRef = useRef(null);

  // Safe seek handler that prevents decoder queue stalling
  const requestVideoSeek = useCallback((time) => {
    const video = videoRef.current;
    if (!video) return;

    if (isSeekingRef.current) {
      pendingTimeRef.current = time;
    } else {
      isSeekingRef.current = true;
      video.currentTime = time;
    }
  }, [videoRef]);

  // Attach seeked listener to process pending seek
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleSeeked = () => {
      isSeekingRef.current = false;
      if (pendingTimeRef.current !== null) {
        const nextTime = pendingTimeRef.current;
        pendingTimeRef.current = null;
        requestVideoSeek(nextTime);
      }
    };

    video.addEventListener('seeked', handleSeeked);
    return () => {
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [videoRef, requestVideoSeek]);

  // Velocity friction decay loop for buttery-smooth 60fps wheel scrubbing
  useEffect(() => {
    let animId;

    const loop = () => {
      if (Math.abs(scrollVelocityRef.current) > 0.0001) {
        let nextTime = targetTimeRef.current + scrollVelocityRef.current;
        const totalDur = duration || 10.006;
        if (nextTime < 0) nextTime = totalDur + (nextTime % totalDur);
        if (nextTime >= totalDur) nextTime = nextTime % totalDur;

        targetTimeRef.current = nextTime;
        setCurrentTime(nextTime);
        requestVideoSeek(nextTime);

        // Apply smooth friction decay
        scrollVelocityRef.current *= 0.88;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [duration, setCurrentTime, targetTimeRef, requestVideoSeek]);

  // Hover wheel scrubbing - requested by user:
  // "Us character pe hover karke scroll down kare toh woh character animation smoothly turn around hoga."
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (isPlaying) {
      setIsPlaying(false);
    }

    // Accumulate smooth momentum velocity
    const delta = e.deltaY * 0.0022;
    scrollVelocityRef.current += delta;

    if (scrollVelocityRef.current > 0.4) scrollVelocityRef.current = 0.4;
    if (scrollVelocityRef.current < -0.4) scrollVelocityRef.current = -0.4;

    playSound('tick');
  }, [isPlaying, setIsPlaying, playSound]);

  // Attach non-passive wheel event to container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Pointer drag rotation (Interactive Turntable 360°)
  const handlePointerDown = (e) => {
    if (e.button !== 0) return; // Primary click only
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartTimeRef.current = targetTimeRef.current;
    if (isPlaying) {
      setIsPlaying(false);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartXRef.current;
    // Map pixels to video seconds: 400px = full 10s rotation
    const timeDelta = -(deltaX / 350) * (duration || 10);
    let newTime = (dragStartTimeRef.current + timeDelta);

    if (duration > 0) {
      if (newTime < 0) newTime = duration + (newTime % duration);
      if (newTime >= duration) newTime = newTime % duration;
    }

    targetTimeRef.current = newTime;
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Trigger laser scan effect on camera preset switch
  useEffect(() => {
    setShowLaserScan(true);
    const timer = setTimeout(() => setShowLaserScan(false), 900);
    return () => clearTimeout(timer);
  }, [currentPreset, cameraConfig.zoom]);

  return (
    <div
      className={`viewport-stage-container ${isDragging ? 'is-dragging' : ''} ${isHovered ? 'is-hovered' : ''}`}
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        handlePointerUp();
        setIsHovered(false);
      }}
      onMouseEnter={() => setIsHovered(true)}
      style={{
        '--accent-color': lighting.color,
        '--ambient-glow': lighting.glow
      }}
    >
      {/* 3D Studio Floor Perspective */}
      <div className="studio-floor-perspective">
        <div className="floor-grid-lines"></div>
        <div
          className="floor-spotlight"
          style={{ background: `radial-gradient(circle, ${lighting.glow} 0%, transparent 70%)` }}
        ></div>
        <div className="floor-turntable-ring"></div>
      </div>

      {/* Camera Rig Viewport Wrapper */}
      <div
        className={`camera-rig-view ${isBreathing ? 'cam-breathing' : ''}`}
        style={{
          transform: `
            scale(${cameraConfig.zoom}) 
            translate3d(${cameraConfig.panX}%, ${cameraConfig.panY}%, 0) 
            rotateX(${cameraConfig.rotX}deg) 
            rotateY(${cameraConfig.rotY}deg) 
            rotateZ(${cameraConfig.rotZ}deg)
          `,
          filter: lighting.filter
        }}
      >
        {/* HTML5 60 FPS Video Element */}
        <div className="video-chassis-wrapper">
          <video
            ref={videoRef}
            className="turnaround-video"
            playsInline
            muted
            preload="auto"
            loop
            src="/01_Character Turnaround.mp4"
            onLoadedMetadata={(e) => {
              if (targetTimeRef.current === 0) {
                targetTimeRef.current = 0.01;
                setCurrentTime(0.01);
              }
            }}
          />

          {/* Laser Scan Line Overlay */}
          {showLaserScan && <div className="hud-laser-scan-line"></div>}

          {/* Interactive Hotspots on the Character */}
          {showHud && HOTSPOTS.map((spot) => {
            const isSelected = selectedHotspot?.id === spot.id;
            return (
              <div
                key={spot.id}
                className={`hotspot-node ${isSelected ? 'active' : ''}`}
                style={{ top: spot.top, left: spot.left }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHotspot(spot);
                  playSound('zoom');
                }}
                title={spot.title}
              >
                <div className="hotspot-pulse"></div>
                <div className="hotspot-core">
                  <span className="hotspot-dot"></span>
                </div>
                <div className="hotspot-tooltip">
                  <span className="spot-cat">{spot.category}</span>
                  <span className="spot-title">{spot.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HUD Overlays (Toggleable) */}
      {showHud && (
        <div className="hud-overlay-system pointer-events-none">
          {/* HUD Corner Brackets */}
          <div className="hud-corner top-left"></div>
          <div className="hud-corner top-right"></div>
          <div className="hud-corner bottom-left"></div>
          <div className="hud-corner bottom-right"></div>

          {/* Top HUD Telemetry */}
          <div className="hud-top-telemetry">
            <div className="hud-tag">
              <span className="hud-dot text-cyan">●</span>
              <span>CAM TARGET: <strong>{currentPreset.name.toUpperCase()}</strong></span>
            </div>
            <div className="hud-tag">
              <span>FOV ZOOM: <strong>{cameraConfig.zoom.toFixed(2)}x</strong></span>
            </div>
            <div className="hud-tag">
              <span>FRAME: <strong>{currentFrame} / 600</strong></span>
            </div>
          </div>

          {/* Center Dynamic Reticle */}
          <div className={`hud-center-reticle ${cameraConfig.zoom > 1.8 ? 'zoomed' : ''}`}>
            <div className="reticle-ring"></div>
            <div className="reticle-crosshair"></div>
            <div className="reticle-bracket left"></div>
            <div className="reticle-bracket right"></div>
            <div className="reticle-telemetry">
              <span>TRK // 60FPS</span>
            </div>
          </div>

          {/* Bottom Left 360° Compass Dial */}
          <div className="hud-compass-dial">
            <div className="compass-header">
              <Compass size={14} className="text-cyan" />
              <span>360° TURNTABLE</span>
            </div>
            <div className="compass-visual-ring">
              <div
                className="compass-needle"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div className="needle-head"></div>
              </div>
              <div className="compass-ticks">
                <span className="tick n">0°</span>
                <span className="tick e">90°</span>
                <span className="tick s">180°</span>
                <span className="tick w">270°</span>
              </div>
            </div>
            <div className="compass-readout">
              <span className="readout-deg">{angle.toFixed(1)}°</span>
              <span className="readout-cardinal">{getCompassHeading(angle)}</span>
            </div>
          </div>

          {/* Floating Guidance Badge */}
          <div className={`hover-instruction-badge ${isHovered ? 'visible' : ''}`}>
            <RotateCw size={13} className="spin-slow" />
            <span>SCROLL DOWN/UP TO TURN AROUND • DRAG TO ROTATE 360°</span>
          </div>
        </div>
      )}

      {/* Selected Hotspot Detailed Modal / Drawer */}
      {selectedHotspot && (
        <div className="hotspot-detail-overlay" onClick={() => onSelectHotspot(null)}>
          <div className="hotspot-card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <div className="card-tag">{selectedHotspot.category} PROTOCOL</div>
              <button
                className="card-close-btn"
                onClick={() => onSelectHotspot(null)}
              >
                ×
              </button>
            </div>
            <h3 className="card-title">{selectedHotspot.title}</h3>
            <p className="card-text">{selectedHotspot.info}</p>
            <div className="card-actions">
              <button
                className="btn-primary"
                onClick={() => {
                  const target = cameraConfig;
                  onSelectHotspot(null);
                }}
              >
                CLOSE INSPECTION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
