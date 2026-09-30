import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  RotateCw,
  RotateCcw,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Heart,
  ShoppingBag,
  Check,
  Sparkles,
  Compass,
  Sliders,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { resolve360Media } from '../utils/variantMedia';
import { loadAndCacheVideo, isVideoCached, getCachedFrames, areFramesCached } from '../services/videoCacheService';

const VIDEO_FPS = 60;
const VIDEO_DURATION = 10.0;

export default function InteractiveDressPreview({
  dress,
  onBack,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
  playSound,
  user,
  onOpenProfile
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // User Recommended Size from Saved Custom Fitting Profile
  const userRecommendedSize = useMemo(() => {
    if (user?.measurements?.recommendedSize) {
      return user.measurements.recommendedSize;
    }
    try {
      const saved = localStorage.getItem('sonex_measurements');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.recommendedSize) return parsed.recommendedSize;
      }
    } catch (_) { }
    return 'M';
  }, [user?.measurements]);
  const [direction, setDirection] = useState(1);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [backdropColor, setBackdropColor] = useState('#7f848c');
  const sampledRef = useRef(false);

  // Dress customization
  const [selectedColor, setSelectedColor] = useState(dress.colors ? dress.colors[0] : null);
  const [selectedSize, setSelectedSize] = useState(dress.defaultSize || (dress.sizes ? dress.sizes[0] : 'L'));
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Dynamic 360 Video / Frames Media Resolution based on Color & Size
  const activeMedia = useMemo(() => {
    return resolve360Media(dress, selectedColor, selectedSize);
  }, [dress, selectedColor, selectedSize]);

  const framesFolder = activeMedia.framesFolder;
  const videoSrc = activeMedia.videoSrc;
  const activeVariantLabel = activeMedia.label;

  // 60 fps * 10s video = 600 frames for 60fps high-precision rotational LERP (or 240 if static frames folder)
  const TOTAL_FRAMES = framesFolder ? 240 : 600;

  const [switchBanner, setSwitchBanner] = useState(null);
  const prevMediaRef = useRef(`${framesFolder}::${videoSrc}`);

  useEffect(() => {
    const key = `${framesFolder}::${videoSrc}`;
    if (prevMediaRef.current !== key) {
      prevMediaRef.current = key;
      setSwitchBanner(`360° Studio Turnaround: ${activeVariantLabel}`);
      const t = setTimeout(() => setSwitchBanner(null), 2500);
      return () => clearTimeout(t);
    }
  }, [framesFolder, videoSrc, activeVariantLabel]);

  // 10-Second Timeline Stops (Anti-Blur Magnetic Snapping)
  const snapTimestamps = useMemo(() => {
    if (Array.isArray(dress?.snapTimestamps) && dress.snapTimestamps.length > 0) {
      return [...dress.snapTimestamps]
        .map(Number)
        .filter(n => !isNaN(n) && n >= 0 && n <= VIDEO_DURATION)
        .sort((a, b) => a - b);
    }
    // Default 10s stops (0s, 2.5s, 5.0s, 7.5s)
    return [0.0, 2.5, 5.0, 7.5];
  }, [dress?.snapTimestamps]);

  // Convert timeline seconds into exact frame indices
  const snapFrames = useMemo(() => {
    return snapTimestamps.map(s => {
      const ratio = Math.max(0, Math.min(s / VIDEO_DURATION, 1));
      return Math.round(ratio * TOTAL_FRAMES) % TOTAL_FRAMES;
    });
  }, [snapTimestamps, TOTAL_FRAMES]);

  // Canvas & Physics Refs
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
  const containerRef = useRef(null);
  const isUserInteractingRef = useRef(false);
  const interactionTimeoutRef = useRef(null);

  const markUserInteraction = useCallback(() => {
    isUserInteractingRef.current = true;
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 180);
  }, []);

  // Sample exact background color from video frame edge to match entire viewport seamlessly
  const sampleColorFromImage = useCallback((img) => {
    if (!img) return;
    try {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = 16;
      offCanvas.height = 16;
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;
      offCtx.drawImage(img, 0, 0, 16, 16);

      // Sample edge points along top border where studio backdrop is uniform
      const p1 = offCtx.getImageData(1, 1, 1, 1).data;
      const p2 = offCtx.getImageData(14, 1, 1, 1).data;
      const p3 = offCtx.getImageData(8, 1, 1, 1).data;

      const r = Math.round((p1[0] + p2[0] + p3[0]) / 3);
      const g = Math.round((p1[1] + p2[1] + p3[1]) / 3);
      const b = Math.round((p1[2] + p2[2] + p3[2]) / 3);

      const colorStr = `rgb(${r}, ${g}, ${b})`;
      setBackdropColor(colorStr);
      sampledRef.current = true;
    } catch (err) {
      console.warn('Auto background sampling failed', err);
    }
  }, []);

  // Pre-sample from dress image on mount or change
  useEffect(() => {
    sampledRef.current = false;
    if (dress.image) {
      const sampleImg = new Image();
      sampleImg.crossOrigin = 'anonymous';
      sampleImg.src = dress.image;
      sampleImg.onload = () => sampleColorFromImage(sampleImg);
    }
  }, [dress, sampleColorFromImage]);

  // Rotation Angle & Compass Heading
  const angle = Math.round(((currentFrame / TOTAL_FRAMES) * 360) % 360);

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

  // 1. Crystal-sharp Canvas Render Frame (Zero Dimming, Full Contrast)
  const drawFrame = useCallback((frameFloat) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let normalized = frameFloat % TOTAL_FRAMES;
    if (normalized < 0) normalized = TOTAL_FRAMES + normalized;

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
  }, [TOTAL_FRAMES]);

  const drawFrameRef = useRef(drawFrame);
  drawFrameRef.current = drawFrame;

  // 2. Preload 240 1080p frames into memory (only if framesFolder provided)
  useEffect(() => {
    if (!framesFolder) {
      setIsReady(true);
      return;
    }

    // Fast check: If already preloaded into memory cache, mount instantly!
    const cachedImgs = getCachedFrames(framesFolder);
    if (cachedImgs && cachedImgs.length === TOTAL_FRAMES && cachedImgs.every(img => img && img.complete)) {
      imagesRef.current = cachedImgs;
      setIsReady(true);
      setLoadProgress(100);
      drawFrameRef.current(currentFrameFloatRef.current);
      if (cachedImgs[0]) sampleColorFromImage(cachedImgs[0]);
      return;
    }

    let loaded = 0;
    const imgs = [];
    setIsReady(false);
    setLoadProgress(0);

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(4, '0');
      img.src = `${framesFolder}/frame_${paddedIndex}.webp`;

      img.onload = () => {
        loaded++;
        setLoadProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
        if (loaded === 1) {
          drawFrameRef.current(currentFrameFloatRef.current);
          sampleColorFromImage(img);
        }
        if (loaded >= TOTAL_FRAMES) {
          if (typeof window !== 'undefined' && window.__SONEX_FRAME_CACHE__) {
            window.__SONEX_FRAME_CACHE__.set(framesFolder, imgs);
          }
          setIsReady(true);
        }
      };

      img.onerror = () => {
        if (!img.src.endsWith('.jpg')) {
          img.src = `${framesFolder}/frame_${paddedIndex}.jpg`;
        }
      };

      imgs.push(img);
    }

    imagesRef.current = imgs;
  }, [framesFolder, sampleColorFromImage, TOTAL_FRAMES]);

  // Video playbackRate sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Play / Pause sync with video element
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => { });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // 3. Continuous 60fps RAF Loop with Modular Shortest-Path Spring LERP (Zero Jerk, Buttery Smooth)
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const loop = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Auto-Spin Playback Loop
      if (isPlaying) {
        if (framesFolder || !videoRef.current) {
          if (delta > 0 && delta < 0.2) {
            const step = (TOTAL_FRAMES / VIDEO_DURATION) * playbackSpeed * direction * delta;
            let nextFloat = (currentFrameFloatRef.current + step) % TOTAL_FRAMES;
            if (nextFloat < 0) nextFloat += TOTAL_FRAMES;
            currentFrameFloatRef.current = nextFloat;
            targetFrameRef.current = nextFloat;

            drawFrame(nextFloat);

            const intVal = Math.floor(nextFloat);
            if (intVal !== lastReportedIntRef.current) {
              lastReportedIntRef.current = intVal;
              setCurrentFrame(intVal);
            }
          }
        } else if (videoRef.current && videoRef.current.duration) {
          const prog = (videoRef.current.currentTime / videoRef.current.duration) % 1;
          const f = Math.round(prog * TOTAL_FRAMES) % TOTAL_FRAMES;
          currentFrameFloatRef.current = f;
          targetFrameRef.current = f;
          if (f !== lastReportedIntRef.current) {
            lastReportedIntRef.current = f;
            setCurrentFrame(f);
          }
        }
      } else {
        // 1. Smooth Scroll Velocity Physics with Viscous Damping
        if (Math.abs(scrollVelocityRef.current) > 0.005) {
          let nextTarget = (targetFrameRef.current + scrollVelocityRef.current) % TOTAL_FRAMES;
          if (nextTarget < 0) nextTarget += TOTAL_FRAMES;
          targetFrameRef.current = nextTarget;
          scrollVelocityRef.current *= 0.93; // Silky gradual deceleration
        } else if (scrollVelocityRef.current !== 0) {
          scrollVelocityRef.current = 0;
        }

        // 1b. Magnetic Ease-In-Out Snapping to Closest 10s Timeline Stop (Anti-Blur)
        if (!isUserInteractingRef.current && !isDraggingRef.current && Math.abs(scrollVelocityRef.current) < 0.05 && snapFrames.length > 0) {
          let closestSnap = snapFrames[0];
          let minDiff = Infinity;
          for (const sf of snapFrames) {
            let d = Math.abs((targetFrameRef.current - sf + TOTAL_FRAMES) % TOTAL_FRAMES);
            if (d > TOTAL_FRAMES / 2) d = TOTAL_FRAMES - d;
            if (d < minDiff) {
              minDiff = d;
              closestSnap = sf;
            }
          }
          if (minDiff > 0.05) {
            let diffToSnap = (closestSnap - targetFrameRef.current + TOTAL_FRAMES) % TOTAL_FRAMES;
            if (diffToSnap > TOTAL_FRAMES / 2) diffToSnap -= TOTAL_FRAMES;
            if (diffToSnap < -TOTAL_FRAMES / 2) diffToSnap += TOTAL_FRAMES;
            // Luxurious soft magnetic pull towards the sharp timestamp stop
            targetFrameRef.current = (targetFrameRef.current + diffToSnap * 0.08 + TOTAL_FRAMES) % TOTAL_FRAMES;
          }
        }

        // 2. Shortest-Path Modular Circular LERP
        let diff = (targetFrameRef.current - currentFrameFloatRef.current) % TOTAL_FRAMES;
        if (diff > TOTAL_FRAMES / 2) diff -= TOTAL_FRAMES;
        if (diff < -TOTAL_FRAMES / 2) diff += TOTAL_FRAMES;

        // Controlled LERP factor for smooth, gradual frame rollout
        // Dragging: 0.30
        // Wheel Scroll / Inertia: 0.09 (luxurious gradual rollout of every intermediate frame)
        const lerpFactor = isDraggingRef.current ? 0.30 : 0.09;

        if (Math.abs(diff) > 0.0001) {
          let nextFloat = (currentFrameFloatRef.current + diff * lerpFactor) % TOTAL_FRAMES;
          if (nextFloat < 0) nextFloat += TOTAL_FRAMES;
          currentFrameFloatRef.current = nextFloat;
        } else {
          currentFrameFloatRef.current = targetFrameRef.current;
        }

        // Render Canvas (every intermediate frame is 100% visible and rendered synchronously)
        drawFrame(currentFrameFloatRef.current);

        // Update React Frame & Angle Indicators
        const intVal = Math.floor(currentFrameFloatRef.current);
        if (intVal !== lastReportedIntRef.current) {
          lastReportedIntRef.current = intVal;
          setCurrentFrame(intVal);
        }

        // 3. Direct, Ultra-Smooth 60fps Video Scrubbing (if video fallback mode)
        if (videoRef.current && videoRef.current.duration && !isPlaying) {
          const vid = videoRef.current;
          const targetTime = (currentFrameFloatRef.current / TOTAL_FRAMES) * vid.duration;
          const clampedTime = Math.max(0.001, Math.min(targetTime, vid.duration - 0.001));

          if (Math.abs(vid.currentTime - clampedTime) >= 0.010) {
            try {
              vid.currentTime = clampedTime;
            } catch (_) { }
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed, direction, drawFrame, TOTAL_FRAMES, framesFolder, snapFrames]);

  // 4. Mouse Wheel Scrolling Handler with Speed-Responsive Momentum & Smooth Rollout
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (isPlaying) setIsPlaying(false);
    setShowHint(false);
    markUserInteraction();

    // Normalize delta across input devices (pixels vs lines vs pages)
    let rawDelta = e.deltaY;
    if (e.deltaMode === 1) {
      rawDelta *= 32;
    } else if (e.deltaMode === 2) {
      rawDelta *= 300;
    }

    // Speed-proportional sensitivity:
    // Gentle wheel scroll -> delicate frame roll-out
    // Fast wheel scroll -> progressive, capped momentum so it NEVER jumps all frames at once
    const wheelSensitivity = 0.035;
    const impulse = rawDelta * wheelSensitivity;

    scrollVelocityRef.current += impulse;

    // Strict speed cap so fast wheel flings only roll out frames smoothly and gradually!
    const MAX_VELOCITY = 6.0;
    if (scrollVelocityRef.current > MAX_VELOCITY) scrollVelocityRef.current = MAX_VELOCITY;
    if (scrollVelocityRef.current < -MAX_VELOCITY) scrollVelocityRef.current = -MAX_VELOCITY;

    if (playSound) playSound('tick');
  }, [isPlaying, playSound, markUserInteraction]);

  useEffect(() => {
    const onWheel = (e) => handleWheel(e);
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [handleWheel]);

  // 5. Drag / Swipe Handler
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartFrameRef.current = currentFrameFloatRef.current;
    if (isPlaying) setIsPlaying(false);
    setShowHint(false);
    markUserInteraction();
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    markUserInteraction();
    const deltaX = e.clientX - dragStartXRef.current;
    const frameDelta = -(deltaX / 480) * TOTAL_FRAMES;
    let nextTarget = (dragStartFrameRef.current + frameDelta) % TOTAL_FRAMES;
    if (nextTarget < 0) nextTarget = TOTAL_FRAMES + nextTarget;
    targetFrameRef.current = nextTarget;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    markUserInteraction();
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => { });
      setIsFullscreen(false);
    }
  };

  // Add to cart with animation
  const handleAddToCart = () => {
    const colorStr = selectedColor?.name || (typeof selectedColor === 'string' ? selectedColor : undefined);
    onAddToCart({
      ...dress,
      selectedColor: colorStr,
      selectedSize
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
    if (playSound) playSound('zoom');
  };

  return (
    <div
      className="interactive-preview-page light-theme-root"
      style={{ backgroundColor: backdropColor, '--preview-bg': backdropColor }}
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Background Interactive Video & 1080p Canvas Frame Engine */}
      <div
        className="preview-canvas-backdrop"
        style={{ backgroundColor: backdropColor }}
      >
        {/* Luxury Loading Overlay when media is buffering / caching */}
        {!isReady && (
          <div className="preview-loading-overlay">
            <div className="preview-loading-card">
              <div className="preview-loading-icon-ring">
                <RotateCw size={28} color="#d4af37" className="spin-slow" />
              </div>
              <span className="preview-loading-pill">Sonex 360° Studio Turnaround Engine</span>
              <h3 className="preview-loading-title">{dress.title}</h3>
              <p className="preview-loading-text">
                Caching {TOTAL_FRAMES} studio frames into local memory for buttery smooth 60fps scrubbing...
              </p>
              <div className="preview-loading-bar-track">
                <div
                  className="preview-loading-bar-fill"
                  style={{ width: `${Math.max(5, loadProgress)}%` }}
                />
              </div>
              <div className="preview-loading-meta">
                <span>0 Egress • 0 Network Reads on Scroll</span>
                <span className="preview-loading-pct">{loadProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* If static frames folder is present, show canvas. Otherwise direct 60fps video turntable */}
        {framesFolder ? (
          <canvas
            ref={canvasRef}
            className="preview-turntable-canvas"
          />
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            muted
            loop
            preload="auto"
            className="preview-fallback-video"
            style={{ opacity: 1, objectFit: 'contain' }}
            onTimeUpdate={() => {
              if (isPlaying && videoRef.current && videoRef.current.duration) {
                const prog = videoRef.current.currentTime / videoRef.current.duration;
                const f = Math.round(prog * TOTAL_FRAMES) % TOTAL_FRAMES;
                currentFrameFloatRef.current = f;
                targetFrameRef.current = f;
                setCurrentFrame(f);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current && videoRef.current.duration && !isPlaying) {
                const initialTime = (currentFrame / TOTAL_FRAMES) * videoRef.current.duration;
                try {
                  videoRef.current.currentTime = Math.max(0.001, Math.min(initialTime, videoRef.current.duration - 0.001));
                } catch (_) { }
              }
            }}
          />
        )}
      </div>

      {/* Floating Top Navigation Header */}
      <header className="preview-top-nav">
        <div className="top-nav-left">
          <button
            className="preview-back-btn"
            onClick={onBack}
            title="Return to Dress Collection"
            aria-label="Back to Collection"
          >
            <ArrowLeft size={18} />
            <span>Back to Collection</span>
          </button>

          <div className="nav-title-group">
            <span className="nav-dress-category">{dress.category}</span>
            <h2 className="nav-dress-title">{dress.title}</h2>
          </div>
        </div>

        <div className="top-nav-right">
          {/* Compass Angle Indicator */}
          <div className="preview-angle-pill">
            <Compass size={15} className="compass-icon spin-slow" />
            <span className="angle-deg">{angle}°</span>
            <span className="angle-divider">•</span>
            <span className="angle-heading">{getCompassHeading(angle)}</span>
            <span className="angle-divider">•</span>
            <span className="angle-variant-tag">{activeVariantLabel}</span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            className="nav-icon-square-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>

      {/* Dynamic 360 Turnaround Variant Toast Pill */}
      {switchBanner && (
        <div className="preview-variant-switch-toast">
          <Sparkles size={16} className="toast-sparkle-icon" />
          <span>{switchBanner}</span>
        </div>
      )}


      {/* Floating Center Hint Pill (Auto fades or dismisses on scroll) */}
      {showHint && (
        <div className="preview-gesture-hint-pill">
          <RotateCw size={16} className="hint-rotate-icon" />
          <span>Scroll mouse wheel or drag anywhere to spin 360°</span>
        </div>
      )}

      {/* Floating Product Details & Fitting Card (Light Theme Luxury Glassmorphism) */}
      <aside
        className="preview-product-card"
        onPointerDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="product-card-header">
          <div className="product-badge-row">
            <span className="card-luxury-badge">{dress.badge || 'Haute Couture'}</span>
            {dress.category && (
              <span className="card-category-badge">{dress.category}</span>
            )}
            {dress.material && (
              <span className="card-material-badge">🧵 {dress.material}</span>
            )}
            <span className="card-interactive-badge">
              <RotateCw size={12} />
              <span>360° Studio Fitting</span>
            </span>
          </div>

          <h1 className="product-card-title">{dress.title}</h1>

          <div className="product-card-price-row">
            <div className="price-stack">
              <span className="product-card-price">{formatINR(dress.price)}</span>
              {dress.originalPrice && (
                <span className="product-card-original">{formatINR(dress.originalPrice)}</span>
              )}
            </div>
            {dress.discount && (
              <span className="product-card-discount">{dress.discount} OFF</span>
            )}
          </div>
        </div>

        <p className="product-card-desc">{dress.description}</p>

        {/* Color Palette Selector */}
        {dress.colors && dress.colors.length > 0 && (
          <div className="product-option-block">
            <div className="option-label-with-guide">
              <label className="option-label">
                <span>Color Shade:</span>
                <strong className="option-value-highlight">{selectedColor?.name || 'Standard'}</strong>
              </label>
              {(activeMedia.sourceType === 'color' || activeMedia.sourceType === 'variant') && (
                <span className="studio-variant-badge">
                  <RotateCw size={10} />
                  <span>360° Tailored Video</span>
                </span>
              )}
            </div>
            <div className="color-swatches-row">
              {dress.colors.map((c, i) => {
                const hasCustomMedia = Boolean(
                  c.videoSrc ||
                  c.framesFolder ||
                  (dress.colorVideos && dress.colorVideos[c.name]) ||
                  (Array.isArray(dress.variantVideos) && dress.variantVideos.some(v => v.color?.toLowerCase() === c.name?.toLowerCase()))
                );
                return (
                  <button
                    key={i}
                    className={`color-swatch-btn ${selectedColor?.name === c.name ? 'active' : ''}`}
                    style={{ backgroundColor: c.hex }}
                    onClick={() => {
                      setSelectedColor(c);
                      if (playSound) playSound('click');
                    }}
                    title={`${c.name}${hasCustomMedia ? ' (Dedicated 360° Video Preview)' : ''}`}
                    aria-label={c.name}
                  >
                    {selectedColor?.name === c.name && (
                      <Check size={12} color={c.hex === '#f8f9fa' || c.hex === '#ffffff' ? '#111' : '#fff'} />
                    )}
                    {hasCustomMedia && selectedColor?.name !== c.name && (
                      <span className="swatch-video-dot" title="Has 360° Studio Video" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {dress.sizes && dress.sizes.length > 0 && (
          <div className="product-option-block">
            <div className="option-label-with-guide">
              <label className="option-label">
                <span>Select Size:</span>
                <strong className="option-value-highlight">{selectedSize}</strong>
              </label>
              {activeMedia.sourceType === 'size' && (
                <span className="studio-variant-badge">
                  <RotateCw size={10} />
                  <span>Size 360° Fit</span>
                </span>
              )}
              <button
                type="button"
                className="size-guide-link-btn"
                onClick={() => {
                  if (onOpenProfile) onOpenProfile('measurements');
                  if (playSound) playSound('click');
                }}
                title="View & Edit your custom 360° body measurements and sizing profile"
              >
                <span>Fitting Guide</span>
                {userRecommendedSize && (
                  <span className="guide-rec-tag">★ Fit: {userRecommendedSize}</span>
                )}
              </button>
            </div>
            <div className="size-buttons-row">
              {dress.sizes.map((s) => {
                const hasSizeMedia = Boolean(
                  (dress.sizeVideos && dress.sizeVideos[s]) ||
                  (Array.isArray(dress.variantVideos) && dress.variantVideos.some(v => v.size?.toUpperCase() === s.toUpperCase()))
                );
                const isRecommended = s.toUpperCase() === (userRecommendedSize || '').toUpperCase();
                return (
                  <button
                    key={s}
                    className={`size-choice-btn ${selectedSize === s ? 'active' : ''} ${isRecommended ? 'is-recommended-fit' : ''}`}
                    onClick={() => {
                      setSelectedSize(s);
                      if (playSound) playSound('click');
                    }}
                    title={isRecommended ? `${s} — Recommended by your saved 360° Fitting Profile` : s}
                  >
                    <span>{s}</span>
                    {isRecommended && <span className="rec-star-pip" title="Recommended Fit">★</span>}
                    {hasSizeMedia && <span className="size-360-indicator-dot" title="Dedicated 360° Video" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Atelier Live Stock Indicator */}
        {(() => {
          const stockCount = dress.stock !== undefined && dress.stock !== null && !isNaN(dress.stock)
            ? Math.max(0, Number(dress.stock))
            : 10;
          const isOutOfStock = stockCount === 0;
          const isLowStock = stockCount > 0 && stockCount <= 5;
          return (
            <div className={`preview-stock-banner ${isOutOfStock ? 'out' : isLowStock ? 'low' : 'in'}`}>
              <span className={`stock-live-dot ${isOutOfStock ? 'out' : isLowStock ? 'low' : 'in'}`} />
              <span className="stock-banner-text">
                {isOutOfStock ? (
                  <strong>Currently Sold Out in Atelier</strong>
                ) : isLowStock ? (
                  <>⚡ High Demand: Only <strong>{stockCount} pieces left</strong> in stock!</>
                ) : (
                  <>Atelier Inventory: <strong>{stockCount} units available</strong> for dispatch</>
                )}
              </span>
            </div>
          );
        })()}

        {/* Primary Action Buttons */}
        <div className="product-cta-group">
          {(() => {
            const stockCount = dress.stock !== undefined && dress.stock !== null && !isNaN(dress.stock)
              ? Math.max(0, Number(dress.stock))
              : 10;
            const isOutOfStock = stockCount === 0;
            return (
              <button
                className={`preview-add-cart-btn ${addedAnimation ? 'is-added' : ''} ${isOutOfStock ? 'is-disabled' : ''}`}
                onClick={isOutOfStock ? undefined : handleAddToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? (
                  <span>Currently Sold Out</span>
                ) : addedAnimation ? (
                  <>
                    <Check size={18} />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Add to Shopping Bag • {formatINR(dress.price)}</span>
                  </>
                )}
              </button>
            );
          })()}

          <button
            className={`preview-fav-btn ${isFavorite ? 'is-favorited' : ''}`}
            onClick={() => onToggleFavorite(dress)}
            title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist"
          >
            <Heart size={20} fill={isFavorite ? '#f43f5e' : 'none'} color={isFavorite ? '#f43f5e' : '#475569'} />
          </button>
        </div>

        {/* Guarantees & Features */}
        <div className="product-perks-mini">
          <div className="perk-mini-item">
            <Truck size={14} />
            <span>Complimentary 2-Day Insured Delivery</span>
          </div>
          <div className="perk-mini-item">
            <ShieldCheck size={14} />
            <span>30-Day Guaranteed Atelier Returns &amp; Fit Exchange</span>
          </div>
        </div>

        {/* Dress Fabric & Atelier Details List */}
        <div className="product-specs-list">
          <span className="specs-heading">Atelier Specifications:</span>
          <ul>
            {dress.material && (
              <li className="spec-material-highlight">
                <strong>Primary Fabric:</strong> {dress.material}
              </li>
            )}
            {dress.category && (
              <li>
                <strong>Garment Category:</strong> {dress.category}
              </li>
            )}
            {dress.details && dress.details.map((d, idx) => (
              <li key={idx}>{d}</li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Floating Bottom Timeline Scrubber Deck (Light Theme) */}
      <footer
        className="preview-bottom-bar"
        onPointerDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="bottom-bar-inner">
          {/* Play/Pause Auto-Spin Button */}
          <button
            className={`spin-control-btn ${isPlaying ? 'active' : ''}`}
            onClick={() => {
              setIsPlaying(!isPlaying);
              if (playSound) playSound('mode');
            }}
            title={isPlaying ? 'Pause Auto-Spin' : 'Start Auto-Spin 360°'}
            aria-label="Auto-spin toggle"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'PAUSE 360°' : 'AUTO SPIN'}</span>
          </button>

          {/* Direction Reverse */}
          <button
            className="spin-dir-btn"
            onClick={() => setDirection(prev => prev * -1)}
            title="Reverse Rotation Direction"
            aria-label="Reverse direction"
          >
            {direction === 1 ? <RotateCw size={15} /> : <RotateCcw size={15} />}
          </button>

          {/* Interactive Frame Timeline Scrubber */}
          <div className="timeline-scrubber-wrapper">
            <div className="timeline-meta-label">
              <span>0.0s START</span>
              <span className="current-frame-indicator">
                ⏱️ {((currentFrame / TOTAL_FRAMES) * VIDEO_DURATION).toFixed(1)}s • FRAME {currentFrame + 1} / {TOTAL_FRAMES}
              </span>
              <span>10.0s FULL TURN</span>
            </div>
            <div className="timeline-slider-track-box" style={{ position: 'relative' }}>
              <input
                type="range"
                min="0"
                max={TOTAL_FRAMES - 1}
                value={currentFrame}
                onChange={(e) => {
                  if (isPlaying) setIsPlaying(false);
                  const val = parseInt(e.target.value, 10);
                  targetFrameRef.current = val;
                  if (playSound) playSound('tick');
                }}
                className="timeline-slider-input"
                aria-label="360 Frame Scrubber"
              />
              {/* Notches for each 10s stop */}
              <div className="timeline-snap-pips-container">
                {snapTimestamps.map((ts, idx) => {
                  const pct = Math.min(100, Math.max(0, (ts / VIDEO_DURATION) * 100));
                  const sf = Math.round((ts / VIDEO_DURATION) * TOTAL_FRAMES) % TOTAL_FRAMES;
                  const isCurrent = Math.abs(currentFrame - sf) <= 3;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`timeline-snap-pip ${isCurrent ? 'active' : ''}`}
                      style={{ left: `${pct}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPlaying) setIsPlaying(false);
                        targetFrameRef.current = sf;
                        if (playSound) playSound('click');
                      }}
                      title={`Snap Stop: ${ts.toFixed(1)}s`}
                      aria-label={`Snap stop at ${ts.toFixed(1)}s`}
                    >
                      <span className="pip-dot" />
                      <span className="pip-label">{ts.toFixed(1)}s</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Speed Toggle */}
          <div className="speed-pills-row">
            {[0.5, 1.0, 2.0].map((s) => (
              <button
                key={s}
                className={`speed-pill ${playbackSpeed === s ? 'active' : ''}`}
                onClick={() => setPlaybackSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
