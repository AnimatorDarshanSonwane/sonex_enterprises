import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  RotateCw, 
  Compass, 
  Eye, 
  Shield, 
  Footprints, 
  Maximize,
  Sliders,
  Sparkles,
  Camera,
  Layers,
  Zap
} from 'lucide-react';
import { HOTSPOTS } from '../constants/cameraPresets';

const TOTAL_FRAMES = 240; // Total high-definition turnaround frames

export default function SmoothTurnaroundViewer({
  targetFrame,
  setTargetFrame,
  currentFrame,
  setCurrentFrame,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  direction,
  currentPreset,
  setPreset,
  cameraConfig,
  setCameraConfig,
  lighting,
  showHud,
  onSelectHotspot,
  selectedHotspot,
  playSound
}) {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Sub-frame blending toggle (false = 100% Crystal Sharp Zero Blur by default)
  const [useSubframeBlend, setUseSubframeBlend] = useState(false);

  // Target frame & continuous floating point frame position for sub-frame accuracy
  const targetFrameRef = useRef(targetFrame ?? currentFrame);
  const currentFrameFloatRef = useRef(currentFrame);
  const lastReportedIntRef = useRef(currentFrame);
  const scrollVelocityRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartFrameRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate rotation angle (0° to 360°)
  const angle = ((currentFrame / TOTAL_FRAMES) * 360) % 360;

  // Compass Heading
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

  // 1. High-speed Canvas Draw with Crystal-Sharp Zero-Blur or Optional Optical Blending
  const drawFrame = useCallback((frameFloat) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let normalized = frameFloat % TOTAL_FRAMES;
    if (normalized < 0) normalized = TOTAL_FRAMES + normalized;

    // CRYSTAL SHARP (ZERO BLUR) MODE (DEFAULT):
    if (!useSubframeBlend) {
      const activeIdx = Math.round(normalized) % TOTAL_FRAMES;
      const img = imagesRef.current[activeIdx];
      if (!img || !img.complete) return;

      if (canvas.width !== img.naturalWidth && img.naturalWidth > 0) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return;
    }

    // OPTIONAL SUB-FRAME BLENDING MODE:
    const idx1 = Math.floor(normalized);
    const idx2 = (idx1 + 1) % TOTAL_FRAMES;
    const blendFraction = normalized - idx1; // fractional sub-frame offset

    const img1 = imagesRef.current[idx1];
    const img2 = imagesRef.current[idx2];
    if (!img1 || !img1.complete) return;

    // Maintain aspect ratio
    if (canvas.width !== img1.naturalWidth && img1.naturalWidth > 0) {
      canvas.width = img1.naturalWidth;
      canvas.height = img1.naturalHeight;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Base frame render
    ctx.globalAlpha = 1.0;
    ctx.drawImage(img1, 0, 0, canvas.width, canvas.height);

    // If sub-frame blending is active, blend next frame with sub-frame alpha
    if (blendFraction > 0.02 && img2 && img2.complete) {
      ctx.globalAlpha = blendFraction;
      ctx.drawImage(img2, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
    }
  }, [useSubframeBlend]);

  const drawFrameRef = useRef(drawFrame);
  drawFrameRef.current = drawFrame;

  // 2. Preload all 240 WebP frames into memory
  useEffect(() => {
    let loadedCount = 0;
    const images = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(4, '0');
      img.src = `/frames/frame_${paddedIndex}.webp`;

      img.onload = () => {
        loadedCount++;
        setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));
        if (loadedCount === 1) {
          drawFrameRef.current(0);
        }
        if (loadedCount >= TOTAL_FRAMES) {
          setIsReady(true);
        }
      };

      images.push(img);
    }

    imagesRef.current = images;
  }, []);

  // Sync external targetFrame changes (from scroll, scrubber, narrative cards, keyboard)
  useEffect(() => {
    if (targetFrame !== undefined && targetFrame !== null) {
      targetFrameRef.current = targetFrame;
    }
  }, [targetFrame]);

  // 3. Continuous 60-240Hz RAF Loop with Modular Shortest-Path Spring LERP (Zero Jerk)
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const loop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Auto-Spin Playback Loop
      if (isPlaying && delta > 0 && delta < 0.2) {
        const step = 24 * playbackSpeed * direction * delta;
        let nextTarget = (targetFrameRef.current + step) % TOTAL_FRAMES;
        if (nextTarget < 0) nextTarget += TOTAL_FRAMES;
        targetFrameRef.current = nextTarget;
      }

      // Smooth Hover-Wheel velocity physics decay
      if (Math.abs(scrollVelocityRef.current) > 0.005) {
        let nextTarget = (targetFrameRef.current + scrollVelocityRef.current) % TOTAL_FRAMES;
        if (nextTarget < 0) nextTarget += TOTAL_FRAMES;
        targetFrameRef.current = nextTarget;
        scrollVelocityRef.current *= 0.90;
      }

      // Shortest-Path Modular Circular LERP:
      // Computes smallest rotational arc (e.g. 238 to 2 is +4, not -236)
      let diff = (targetFrameRef.current - currentFrameFloatRef.current) % TOTAL_FRAMES;
      if (diff > TOTAL_FRAMES / 2) diff -= TOTAL_FRAMES;
      if (diff < -TOTAL_FRAMES / 2) diff += TOTAL_FRAMES;

      const lerpFactor = isDragging ? 0.40 : 0.15;
      if (Math.abs(diff) > 0.0005) {
        let nextFloat = (currentFrameFloatRef.current + diff * lerpFactor) % TOTAL_FRAMES;
        if (nextFloat < 0) nextFloat += TOTAL_FRAMES;
        currentFrameFloatRef.current = nextFloat;
      } else {
        currentFrameFloatRef.current = targetFrameRef.current;
      }

      // High-speed Canvas Render with Sub-Frame Blend
      drawFrame(currentFrameFloatRef.current);

      // Throttled UI state report
      const intVal = Math.floor(currentFrameFloatRef.current);
      if (intVal !== lastReportedIntRef.current) {
        lastReportedIntRef.current = intVal;
        setCurrentFrame(intVal);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed, direction, isDragging, setCurrentFrame, drawFrame]);

  // 4. Hover Wheel Scrubbing (Ultra-Smooth Velocity with Sub-Frame Blend)
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (isPlaying) {
      setIsPlaying(false);
    }

    // Smooth momentum delta calibrated for fluid wheel turning
    const delta = (e.deltaY * 0.045);
    scrollVelocityRef.current += delta;

    // Cap velocity to prevent runaway
    if (scrollVelocityRef.current > 12) scrollVelocityRef.current = 12;
    if (scrollVelocityRef.current < -12) scrollVelocityRef.current = -12;

    playSound('tick');
  }, [isPlaying, setIsPlaying, playSound]);

  // Attach non-passive wheel event
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // 5. Left Click + Drag Turntable Spin
  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartFrameRef.current = currentFrameFloatRef.current;
    if (isPlaying) setIsPlaying(false);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartXRef.current;
    // Map drag distance: ~480px = full 240 frame rotation
    const frameDelta = -(deltaX / 480) * TOTAL_FRAMES;
    let nextTarget = (dragStartFrameRef.current + frameDelta) % TOTAL_FRAMES;
    if (nextTarget < 0) nextTarget = TOTAL_FRAMES + nextTarget;

    targetFrameRef.current = nextTarget;
    if (setTargetFrame) setTargetFrame(nextTarget);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Determine Camera Focal Zoom Transform:
  // Smoothly focuses on Head, Torso, Boots, or Full Body
  const getCameraStyle = () => {
    const zoom = cameraConfig.zoom || 1.0;
    let originX = '50%';
    let originY = '50%';

    if (currentPreset?.id === 'head') {
      originX = '50%';
      originY = '20%'; // Head focus
    } else if (currentPreset?.id === 'torso') {
      originX = '50%';
      originY = '40%'; // Torso focus
    } else if (currentPreset?.id === 'boots') {
      originX = '50%';
      originY = '82%'; // Boots focus
    } else if (currentPreset?.id === 'dutch') {
      originX = '45%';
      originY = '35%';
    }

    return {
      transform: `scale(${zoom})`,
      transformOrigin: `${originX} ${originY}`,
      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform-origin 0.6s ease',
      filter: lighting.filter
    };
  };

  return (
    <div
      className={`viewport-stage-container ${isDragging ? 'is-dragging' : ''} ${isHovered ? 'is-hovered' : ''}`}
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
      {/* Studio Floor Spotlight & Glow */}
      <div className="studio-floor-perspective">
        <div className="floor-grid-lines"></div>
        <div 
          className="floor-spotlight"
          style={{ background: `radial-gradient(circle, ${lighting.glow} 0%, transparent 70%)` }}
        ></div>
        <div className="floor-turntable-ring"></div>
      </div>

      {/* Camera Focal Zoom Container (Smooth Zoom without tilting video in 3D) */}
      <div className="camera-focal-viewport" style={getCameraStyle()}>
        {/* Zero-Jerk Canvas Screen with Sub-Frame Interpolation */}
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="turnaround-canvas"
        />

        {/* Interactive Hotspot Nodes */}
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

      {/* Loading Bar if assets are loading */}
      {!isReady && loadProgress < 100 && (
        <div className="frames-loader-overlay">
          <div className="loader-box">
            <span className="loader-title">BUFFERING 240 HD TURNAROUND FRAMES...</span>
            <div className="loader-bar-track">
              <div className="loader-bar-fill" style={{ width: `${loadProgress}%` }}></div>
            </div>
            <span className="loader-percent">{loadProgress}% (ZERO-JERK CACHE)</span>
          </div>
        </div>
      )}

      {/* HUD Telemetry & Overlays */}
      {showHud && (
        <div className="hud-overlay-system pointer-events-none">
          {/* HUD Corner Brackets */}
          <div className="hud-corner top-left"></div>
          <div className="hud-corner top-right"></div>
          <div className="hud-corner bottom-left"></div>
          <div className="hud-corner bottom-right"></div>

          {/* Top HUD Telemetry */}
          <div className="hud-top-telemetry pointer-events-auto">
            <div className="hud-tag">
              <span className="hud-dot text-cyan">●</span>
              <span>FOCUS: <strong>{currentPreset.name.toUpperCase()}</strong></span>
            </div>
            <div className="hud-tag">
              <span>ZOOM: <strong>{cameraConfig.zoom.toFixed(2)}x</strong></span>
            </div>
            <div className="hud-tag">
              <span>FRAME: <strong>{currentFrame + 1} / {TOTAL_FRAMES}</strong></span>
            </div>
            {/* Sub-frame blend toggle badge */}
            <button
              className={`subframe-blend-badge ${!useSubframeBlend ? 'active' : ''}`}
              onClick={() => {
                setUseSubframeBlend(!useSubframeBlend);
                playSound('mode');
              }}
              title="Toggle Zero-Blur Crystal Sharp vs Optical Blending"
            >
              <Zap size={11} className={!useSubframeBlend ? 'text-cyan' : ''} />
              <span>{!useSubframeBlend ? 'ZERO BLUR: CRYSTAL SHARP' : 'OPTICAL BLEND: ACTIVE'}</span>
            </button>
          </div>

          {/* Center Dynamic Reticle */}
          <div className={`hud-center-reticle ${cameraConfig.zoom > 1.5 ? 'zoomed' : ''}`}>
            <div className="reticle-ring"></div>
            <div className="reticle-bracket left"></div>
            <div className="reticle-bracket right"></div>
            <div className="reticle-telemetry">
              <span>ZERO-JERK // {useSubframeBlend ? '240Hz BLEND' : '60 FPS'}</span>
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

          {/* Floating Hover Instruction Badge */}
          <div className={`hover-instruction-badge ${isHovered ? 'visible' : ''}`}>
            <RotateCw size={13} className="spin-slow" />
            <span>SCROLL TO TURN AROUND SMOOTHLY • DRAG TO ROTATE 360°</span>
          </div>
        </div>
      )}

      {/* Selected Hotspot Detail Card */}
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
                onClick={() => onSelectHotspot(null)}
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
