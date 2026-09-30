import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  RotateCw, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Layers, 
  Compass, 
  Sparkles,
  Zap,
  Film,
  MousePointer
} from 'lucide-react';

const TOTAL_FRAMES = 240;
const VIDEO_DURATION = 10.0; // 10 seconds

export default function FullscreenShowcasePage({ 
  onBack, 
  playSound, 
  isMuted = true,
  videoSrc = '/showcase_1080p.mp4',
  framesFolder = '/showcase_frames',
  title = '1080P FULLSCREEN // AETHER-01',
  modelKey = 'model-1',
  onSwitchModel
}) {
  // Mode: 'canvas' (Sub-frame 240Hz blended frames) or 'video' (Native HTML5 MP4)
  const [renderMode, setRenderMode] = useState('canvas'); // 'canvas' | 'video'
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [direction, setDirection] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [useSubframeBlend, setUseSubframeBlend] = useState(false); // False by default = 100% Crystal Sharp (Zero Blur)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showHint, setShowHint] = useState(true);

  // Refs
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const imagesRef = useRef([]);
  const targetFrameRef = useRef(0);
  const currentFrameFloatRef = useRef(0);
  const lastReportedIntRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartFrameRef = useRef(0);
  const controlsTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  const angle = ((currentFrame / TOTAL_FRAMES) * 360) % 360;

  // 1. High-speed Canvas Render with Crystal-Sharp Zero-Blur or Optional Optical Blending
  const drawFrame = useCallback((frameFloat) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let normalized = frameFloat % TOTAL_FRAMES;
    if (normalized < 0) normalized = TOTAL_FRAMES + normalized;

    // CRYSTAL SHARP (ZERO BLUR) MODE (DEFAULT):
    // Renders the exact nearest 1080p frame at 100% opacity without overlaying adjacent frames
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
    const blendFraction = normalized - idx1;

    const img1 = imagesRef.current[idx1];
    const img2 = imagesRef.current[idx2];
    if (!img1 || !img1.complete) return;

    if (canvas.width !== img1.naturalWidth && img1.naturalWidth > 0) {
      canvas.width = img1.naturalWidth;
      canvas.height = img1.naturalHeight;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Base Frame
    ctx.globalAlpha = 1.0;
    ctx.drawImage(img1, 0, 0, canvas.width, canvas.height);

    // Sub-frame optical blend
    if (blendFraction > 0.01 && img2 && img2.complete) {
      ctx.globalAlpha = blendFraction;
      ctx.drawImage(img2, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
    }
  }, [useSubframeBlend]);

  const drawFrameRef = useRef(drawFrame);
  drawFrameRef.current = drawFrame;

  // 2. Preload all 240 1080p frames into memory for the active model
  useEffect(() => {
    let loaded = 0;
    const imgs = [];
    setIsReady(false);
    setLoadProgress(0);

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(4, '0');
      img.src = `${framesFolder}/frame_${paddedIndex}.jpg`;

      img.onload = () => {
        loaded++;
        setLoadProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
        if (loaded === 1) {
          drawFrameRef.current(0);
        }
        if (loaded >= TOTAL_FRAMES) {
          setIsReady(true);
        }
      };

      imgs.push(img);
    }

    imagesRef.current = imgs;
  }, [framesFolder]);

  // 3. Continuous RAF Animation Loop with Shortest-Path Spring LERP (Zero Jerk)
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

        if (renderMode === 'video' && videoRef.current) {
          const targetTime = (nextTarget / TOTAL_FRAMES) * VIDEO_DURATION;
          videoRef.current.currentTime = targetTime;
        }
      }

      // Smooth Hover-Wheel velocity physics decay
      if (Math.abs(scrollVelocityRef.current) > 0.005) {
        let nextTarget = (targetFrameRef.current + scrollVelocityRef.current) % TOTAL_FRAMES;
        if (nextTarget < 0) nextTarget += TOTAL_FRAMES;
        targetFrameRef.current = nextTarget;
        scrollVelocityRef.current *= 0.88;

        if (renderMode === 'video' && videoRef.current) {
          const targetTime = (nextTarget / TOTAL_FRAMES) * VIDEO_DURATION;
          videoRef.current.currentTime = targetTime;
        }
      } else if (scrollVelocityRef.current !== 0) {
        scrollVelocityRef.current = 0;
        // Clean snap to exact integer frame when scrolling finishes
        targetFrameRef.current = Math.round(targetFrameRef.current) % TOTAL_FRAMES;
      }

      // Shortest-Path Circular LERP
      let diff = (targetFrameRef.current - currentFrameFloatRef.current) % TOTAL_FRAMES;
      if (diff > TOTAL_FRAMES / 2) diff -= TOTAL_FRAMES;
      if (diff < -TOTAL_FRAMES / 2) diff += TOTAL_FRAMES;

      const lerpFactor = isDraggingRef.current ? 0.40 : 0.16;
      if (Math.abs(diff) > 0.0005) {
        let nextFloat = (currentFrameFloatRef.current + diff * lerpFactor) % TOTAL_FRAMES;
        if (nextFloat < 0) nextFloat += TOTAL_FRAMES;
        currentFrameFloatRef.current = nextFloat;
      } else {
        currentFrameFloatRef.current = targetFrameRef.current;
      }

      if (renderMode === 'canvas') {
        drawFrame(currentFrameFloatRef.current);
      }

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
  }, [isPlaying, playbackSpeed, direction, renderMode, drawFrame]);

  // 4. Mouse Wheel Scrolling Handler ("same mouse wheel scrolling scrolling")
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (isPlaying) setIsPlaying(false);
    setShowHint(false);

    // Smooth momentum delta calibrated for fluid wheel turning
    const delta = (e.deltaY * 0.045);
    scrollVelocityRef.current += delta;

    if (scrollVelocityRef.current > 14) scrollVelocityRef.current = 14;
    if (scrollVelocityRef.current < -14) scrollVelocityRef.current = -14;

    wakeControls();
    if (playSound) playSound('tick');
  }, [isPlaying, playSound]);

  // Attach global wheel listener to the entire page
  useEffect(() => {
    const el = containerRef.current || window;
    const onWheel = (e) => handleWheel(e);

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [handleWheel]);

  // 5. Left Click + Drag Turntable Spin
  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartFrameRef.current = currentFrameFloatRef.current;
    if (isPlaying) setIsPlaying(false);
    setShowHint(false);
    wakeControls();
  };

  const handlePointerMove = (e) => {
    wakeControls();
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const frameDelta = -(deltaX / 520) * TOTAL_FRAMES;
    let nextTarget = (dragStartFrameRef.current + frameDelta) % TOTAL_FRAMES;
    if (nextTarget < 0) nextTarget = TOTAL_FRAMES + nextTarget;

    targetFrameRef.current = nextTarget;

    if (renderMode === 'video' && videoRef.current) {
      const targetTime = (nextTarget / TOTAL_FRAMES) * VIDEO_DURATION;
      videoRef.current.currentTime = targetTime;
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // 6. Auto-Hiding Controls Engine
  const wakeControls = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        setShowControls(false);
      }
    }, 2800);
  };

  // Initial hint fade out
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  // 7. Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      wakeControls();
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
        if (playSound) playSound('mode');
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        targetFrameRef.current = (targetFrameRef.current - 1 + TOTAL_FRAMES) % TOTAL_FRAMES;
        if (playSound) playSound('tick');
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        targetFrameRef.current = (targetFrameRef.current + 1) % TOTAL_FRAMES;
        if (playSound) playSound('tick');
      } else if (e.code === 'KeyF') {
        toggleBrowserFullscreen();
      } else if (e.code === 'Escape') {
        if (isFullscreen) {
          toggleBrowserFullscreen();
        } else if (onBack) {
          onBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onBack, playSound]);

  // Fullscreen Toggle
  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Timeline scrubber
  const handleScrubberChange = (e) => {
    if (isPlaying) setIsPlaying(false);
    const newPercent = parseFloat(e.target.value);
    const newFrame = (newPercent / 100) * TOTAL_FRAMES;
    targetFrameRef.current = newFrame;

    if (renderMode === 'video' && videoRef.current) {
      videoRef.current.currentTime = (newPercent / 100) * VIDEO_DURATION;
    }
    wakeControls();
  };

  // Snap angles
  const handleSnapAngle = (targetAngle) => {
    if (isPlaying) setIsPlaying(false);
    const snapFrame = ((targetAngle / 360) * TOTAL_FRAMES) % TOTAL_FRAMES;
    targetFrameRef.current = snapFrame;
    if (renderMode === 'video' && videoRef.current) {
      videoRef.current.currentTime = (targetAngle / 360) * VIDEO_DURATION;
    }
    if (playSound) playSound('zoom');
    wakeControls();
  };

  return (
    <div 
      className="fullscreen-showcase-wrapper"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseMove={wakeControls}
    >
      {/* Background Floor & Ambient Light */}
      <div className="fullscreen-ambient-backdrop">
        <div className="fullscreen-grid-floor"></div>
        <div className="fullscreen-spotlight-beam"></div>
      </div>

      {/* Main Visual Display (1080p Canvas or Direct MP4 Video) */}
      <div className="fullscreen-media-container">
        {renderMode === 'canvas' ? (
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            className="fullscreen-display-canvas"
          />
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            className="fullscreen-display-video"
            playsInline
            muted
            preload="auto"
          />
        )}
      </div>

      {/* First-time Interaction Floating Hint */}
      {showHint && (
        <div className="fullscreen-interaction-hint">
          <div className="hint-pill">
            <MousePointer size={18} className="hint-icon pulse-bounce" />
            <div className="hint-text-block">
              <span className="hint-title">INTERACTIVE 360° TURNAROUND</span>
              <span className="hint-desc">SCROLL MOUSE WHEEL OR DRAG TO ROTATE IN 1080P</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Top Header Bar */}
      <header className={`fullscreen-header-bar ${showControls ? 'visible' : 'hidden'}`}>
        <div className="header-left-zone">
          <button 
            className="back-to-studio-btn"
            onClick={onBack}
            title="Return to Studio Dossier (Page 1)"
          >
            <ArrowLeft size={16} />
            <span>STUDIO DOSSIER</span>
          </button>

          <div className="header-badge-tag">
            <span className="live-dot">●</span>
            <span>{title}</span>
          </div>

          {/* Model Switcher between Model A and Model B in Fullscreen */}
          {onSwitchModel && (
            <div className="model-switcher-pills">
              <button
                className={`model-pill ${modelKey === 'model-1' ? 'active' : ''}`}
                onClick={() => onSwitchModel('model-1')}
                title="Switch to 1080p Showcase A"
              >
                SHOWCASE A
              </button>
              <button
                className={`model-pill ${modelKey === 'model-2' ? 'active' : ''}`}
                onClick={() => onSwitchModel('model-2')}
                title="Switch to 1080p Showcase B"
              >
                SHOWCASE B
              </button>
            </div>
          )}
        </div>

        <div className="header-right-zone">
          {/* Render Mode Switcher */}
          <div className="engine-switch-pill">
            <button
              className={`mode-tab ${renderMode === 'canvas' ? 'active' : ''}`}
              onClick={() => {
                setRenderMode('canvas');
                if (playSound) playSound('mode');
              }}
              title="1080p Canvas Engine with Sub-Frame Blending (Zero Jerk)"
            >
              <Zap size={13} />
              <span>HD CANVAS (ZERO-JERK)</span>
            </button>
            <button
              className={`mode-tab ${renderMode === 'video' ? 'active' : ''}`}
              onClick={() => {
                setRenderMode('video');
                if (playSound) playSound('mode');
              }}
              title="Native HTML5 Video Element Stream"
            >
              <Film size={13} />
              <span>NATIVE MP4</span>
            </button>
          </div>

          {/* Subframe Blend Toggle (only in Canvas mode) */}
          {renderMode === 'canvas' && (
            <button
              className={`opt-toggle-btn ${!useSubframeBlend ? 'active' : ''}`}
              onClick={() => {
                setUseSubframeBlend(!useSubframeBlend);
                if (playSound) playSound('click');
              }}
              title="Toggle Zero-Blur Crystal Sharp Rendering vs Optical Blend"
            >
              <Sparkles size={14} />
              <span>{!useSubframeBlend ? 'ZERO BLUR: CRYSTAL SHARP' : 'OPTICAL BLEND: ACTIVE'}</span>
            </button>
          )}

          {/* True Fullscreen Toggle */}
          <button
            className="fs-icon-btn"
            onClick={toggleBrowserFullscreen}
            title="Toggle True Fullscreen (F11 / F)"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* Floating Bottom Control Dock */}
      <footer className={`fullscreen-bottom-dock ${showControls ? 'visible' : 'hidden'}`}>
        <div className="glassmorphic-dock-shell">
          {/* Timeline & Angle Info */}
          <div className="dock-scrubber-row">
            <div className="dock-angle-pill">
              <Compass size={14} className="text-cyan animate-spin-slow" />
              <span>{angle.toFixed(1)}°</span>
            </div>

            <div className="dock-slider-wrap">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={(currentFrame / TOTAL_FRAMES) * 100}
                onChange={handleScrubberChange}
                className="fullscreen-timeline-range"
              />
              <div className="timeline-ticks">
                <span onClick={() => handleSnapAngle(0)}>0° FRONT</span>
                <span onClick={() => handleSnapAngle(90)}>90° PROFILE</span>
                <span onClick={() => handleSnapAngle(180)}>180° REAR</span>
                <span onClick={() => handleSnapAngle(270)}>270° LEFT</span>
              </div>
            </div>

            <div className="dock-frame-pill">
              <span>FRAME: <strong>{currentFrame + 1} / {TOTAL_FRAMES}</strong></span>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="dock-buttons-row">
            {/* Play/Pause */}
            <button
              className={`dock-action-btn primary ${isPlaying ? 'playing' : ''}`}
              onClick={() => {
                setIsPlaying(!isPlaying);
                if (playSound) playSound('mode');
              }}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isPlaying ? 'PAUSE' : 'AUTO-SPIN'}</span>
            </button>

            {/* Reverse Direction */}
            <button
              className="dock-action-btn"
              onClick={() => {
                setDirection(d => -d);
                if (playSound) playSound('click');
              }}
              title="Reverse Rotation Direction"
            >
              {direction === 1 ? <RotateCw size={15} /> : <RotateCcw size={15} />}
              <span>{direction === 1 ? 'CW' : 'CCW'}</span>
            </button>

            {/* Speed Pills */}
            <div className="speed-pills-group">
              {[0.5, 1.0, 2.0].map((spd) => (
                <button
                  key={spd}
                  className={`speed-pill ${playbackSpeed === spd ? 'active' : ''}`}
                  onClick={() => {
                    setPlaybackSpeed(spd);
                    if (playSound) playSound('click');
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Snap Angle Shortcuts */}
            <div className="snap-buttons-group">
              <button onClick={() => handleSnapAngle(0)}>0°</button>
              <button onClick={() => handleSnapAngle(90)}>90°</button>
              <button onClick={() => handleSnapAngle(180)}>180°</button>
              <button onClick={() => handleSnapAngle(270)}>270°</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
