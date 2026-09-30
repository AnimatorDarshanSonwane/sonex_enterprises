import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Compass, 
  RotateCw, 
  Eye, 
  Shield, 
  Footprints, 
  Maximize2,
  Crosshair,
  Sparkles
} from 'lucide-react';
import { HOTSPOTS } from '../constants/cameraPresets';

// 3D Camera target definitions for Three.js
const CAMERA_3D_TARGETS = {
  full: {
    pos: new THREE.Vector3(0, 0, 4.3),
    lookAt: new THREE.Vector3(0, 0, 0),
    fov: 45
  },
  head: {
    pos: new THREE.Vector3(0, 1.25, 1.8),
    lookAt: new THREE.Vector3(0, 1.25, 0),
    fov: 30
  },
  torso: {
    pos: new THREE.Vector3(0, 0.32, 2.1),
    lookAt: new THREE.Vector3(0, 0.32, 0),
    fov: 34
  },
  boots: {
    pos: new THREE.Vector3(0, -1.15, 2.0),
    lookAt: new THREE.Vector3(0, -1.15, 0),
    fov: 32
  },
  dutch: {
    pos: new THREE.Vector3(-1.75, -0.15, 3.2),
    lookAt: new THREE.Vector3(0, 0.1, 0),
    fov: 46
  },
  isometric: {
    pos: new THREE.Vector3(2.6, 2.2, 2.9),
    lookAt: new THREE.Vector3(0, 0, 0),
    fov: 38
  }
};

export default function ThreeCharacterStage({
  videoRef,
  currentTime,
  setCurrentTime,
  targetTimeRef,
  duration,
  isPlaying,
  setIsPlaying,
  currentPreset,
  setPreset,
  cameraConfig,
  lighting,
  showHud,
  isBreathing,
  onSelectHotspot,
  selectedHotspot,
  playSound
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const videoTextureRef = useRef(null);
  const turntableRingsRef = useRef([]);
  const spotLightRef = useRef(null);
  const pointLightRef = useRef(null);

  // Smooth camera interpolation targets
  const currentCamPosRef = useRef(new THREE.Vector3(0, 0, 4.3));
  const targetCamPosRef = useRef(new THREE.Vector3(0, 0, 4.3));
  const currentLookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  // Wheel scrub velocity & state
  const scrollVelocityRef = useRef(0);
  const isSeekingRef = useRef(false);
  const pendingTimeRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const dragStartYRef = useRef(0);
  const isRightDraggingRef = useRef(false);
  const orbitAnglesRef = useRef({ theta: 0, phi: 0 });

  // Calculate current turnaround angle (0° to 360°)
  const angle = duration > 0 ? ((currentTime / duration) * 360) % 360 : 0;
  const currentFrame = Math.round((currentTime / (duration || 10.006)) * 600);

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

  // Update target camera position when currentPreset or cameraConfig changes
  useEffect(() => {
    const target = CAMERA_3D_TARGETS[currentPreset?.id] || CAMERA_3D_TARGETS.full;
    
    // Manual zoom scaling
    const zoomFactor = cameraConfig.zoom > 0 ? (1 / cameraConfig.zoom) : 1;
    
    targetCamPosRef.current.set(
      target.pos.x,
      target.pos.y,
      target.pos.z * zoomFactor
    );
    targetLookAtRef.current.copy(target.lookAt);

    if (cameraRef.current) {
      cameraRef.current.fov = target.fov * (cameraConfig.zoom > 1.5 ? 0.9 : 1.0);
      cameraRef.current.updateProjectionMatrix();
    }
  }, [currentPreset, cameraConfig.zoom]);

  // Update lighting colors in Three.js
  useEffect(() => {
    if (spotLightRef.current && lighting) {
      spotLightRef.current.color.set(lighting.color);
    }
    if (pointLightRef.current && lighting) {
      pointLightRef.current.color.set(lighting.color);
    }
  }, [lighting]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 640;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.3);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with high performance WebGL
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Video Texture & Plane
    const video = videoRef.current;
    if (video) {
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.minFilter = THREE.LinearFilter;
      videoTexture.magFilter = THREE.LinearFilter;
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      videoTextureRef.current = videoTexture;

      // Plane geometry sized to fit character turnaround (approx 9:16 or 3:4 portrait)
      const planeGeo = new THREE.PlaneGeometry(2.35, 3.8);
      const planeMat = new THREE.MeshBasicMaterial({
        map: videoTexture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const characterMesh = new THREE.Mesh(planeGeo, planeMat);
      characterMesh.position.set(0, 0.1, 0);
      scene.add(characterMesh);
    }

    // 5. 3D Perspective Grid Floor
    const gridHelper = new THREE.GridHelper(12, 24, 0x00f0ff, 0x152238);
    gridHelper.position.y = -1.9;
    scene.add(gridHelper);

    // 6. Concentric Hologram Turntable Rings on Floor
    const ringsGroup = new THREE.Group();
    ringsGroup.position.y = -1.88;
    ringsGroup.rotation.x = -Math.PI / 2;

    const ringGeo1 = new THREE.RingGeometry(1.2, 1.24, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringsGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(1.8, 1.83, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xaa3bff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringsGroup.add(ring2);

    scene.add(ringsGroup);
    turntableRingsRef.current = [ring1, ring2, ringsGroup];

    // 7. 3D Cyber Ambient Dust Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.025,
      transparent: true,
      opacity: 0.4
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 8. Dynamic Colored Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0x00f0ff, 3, 10, Math.PI / 4, 0.5, 1);
    spotLight.position.set(0, 3, 2.5);
    scene.add(spotLight);
    spotLightRef.current = spotLight;

    const pointLight = new THREE.PointLight(0x00f0ff, 2, 8);
    pointLight.position.set(0, -1.5, 1.2);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // 9. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // 10. Main Animation Render Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera lerp (0.075 factor for smooth cinematic glide)
      currentCamPosRef.current.lerp(targetCamPosRef.current, 0.075);
      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.075);

      // Subtle breathing motion if enabled
      if (isBreathing) {
        const breathOffsetY = Math.sin(elapsedTime * 1.5) * 0.03;
        camera.position.set(
          currentCamPosRef.current.x,
          currentCamPosRef.current.y + breathOffsetY,
          currentCamPosRef.current.z
        );
      } else {
        camera.position.copy(currentCamPosRef.current);
      }
      camera.lookAt(currentLookAtRef.current);

      // Rotate 3D hologram rings on floor with turntable sync
      if (ringsGroup) {
        ringsGroup.rotation.z = -(angle * Math.PI) / 180;
      }

      // Drift ambient particles
      if (particles) {
        particles.rotation.y = elapsedTime * 0.03;
      }

      // Velocity damping for wheel scrub
      if (Math.abs(scrollVelocityRef.current) > 0.0001) {
        let nextTime = targetTimeRef.current + scrollVelocityRef.current;
        const totalDur = duration || 10.006;
        if (nextTime < 0) nextTime = totalDur + (nextTime % totalDur);
        if (nextTime >= totalDur) nextTime = nextTime % totalDur;

        targetTimeRef.current = nextTime;
        setCurrentTime(nextTime);
        requestVideoSeek(nextTime);

        // Apply friction decay
        scrollVelocityRef.current *= 0.88;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [duration, isBreathing, angle, setCurrentTime, targetTimeRef, videoRef, requestVideoSeek]);

  // HOVER-WHEEL SMOOTH SCRUB - User's Core Request:
  // "Aur main chahta hu ki jab jab character ke upar hover karke scroll karu toh wo smoothly animation mujhe dikhna chahiye."
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (isPlaying) {
      setIsPlaying(false);
    }

    // Accumulate smooth velocity
    const delta = e.deltaY * 0.0022; // silky smooth sensitivity
    scrollVelocityRef.current += delta;

    // Cap maximum scroll velocity to prevent overshoot
    if (scrollVelocityRef.current > 0.4) scrollVelocityRef.current = 0.4;
    if (scrollVelocityRef.current < -0.4) scrollVelocityRef.current = -0.4;

    playSound('tick');
  }, [isPlaying, setIsPlaying, playSound]);

  // Attach non-passive wheel event directly to mount element
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Pointer Drag Handlers (Left Click = Rotate Turntable, Right Click = Orbit Camera)
  const handlePointerDown = (e) => {
    if (isPlaying) setIsPlaying(false);

    if (e.button === 2) {
      // Right click orbit
      isRightDraggingRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartYRef.current = e.clientY;
    } else if (e.button === 0) {
      // Left click turntable spin
      setIsDragging(true);
      dragStartXRef.current = e.clientX;
      dragStartTimeRef.current = targetTimeRef.current;
    }
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartXRef.current;
      const timeDelta = -(deltaX / 360) * (duration || 10.006);
      let newTime = dragStartTimeRef.current + timeDelta;
      const totalDur = duration || 10.006;

      if (newTime < 0) newTime = totalDur + (newTime % totalDur);
      if (newTime >= totalDur) newTime = newTime % totalDur;

      targetTimeRef.current = newTime;
      setCurrentTime(newTime);
      requestVideoSeek(newTime);
    } else if (isRightDraggingRef.current) {
      // Orbit camera in 3D
      const deltaX = (e.clientX - dragStartXRef.current) * 0.005;
      const deltaY = (e.clientY - dragStartYRef.current) * 0.005;
      dragStartXRef.current = e.clientX;
      dragStartYRef.current = e.clientY;

      targetCamPosRef.current.x += deltaX * 2;
      targetCamPosRef.current.y -= deltaY * 2;
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    isRightDraggingRef.current = false;
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
      onContextMenu={(e) => e.preventDefault()} // Disable default right-click menu for 3D orbit
    >
      {/* Three.js Canvas Container */}
      <div 
        ref={mountRef} 
        className="three-canvas-viewport" 
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      />

      {/* Hidden Hardware-Accelerated Video Element Feeding Three.js VideoTexture */}
      <video
        ref={videoRef}
        src="/01_Character Turnaround.mp4"
        playsInline
        muted
        preload="auto"
        loop
        style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0.01, pointerEvents: 'none' }}
      />

      {/* Interactive 3D Hotspot Pins (Overlaid with Active Preset Sync) */}
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

      {/* HUD System Overlays */}
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
              <span>THREE.JS CAM: <strong>{currentPreset.name.toUpperCase()}</strong></span>
            </div>
            <div className="hud-tag">
              <span>FOV: <strong>{CAMERA_3D_TARGETS[currentPreset.id]?.fov || 45}°</strong></span>
            </div>
            <div className="hud-tag">
              <span>FRAME: <strong>{currentFrame} / 600</strong></span>
            </div>
          </div>

          {/* Dynamic Focal Target Reticle */}
          <div className={`hud-center-reticle ${currentPreset.id !== 'full' ? 'zoomed' : ''}`}>
            <div className="reticle-ring"></div>
            <div className="reticle-bracket left"></div>
            <div className="reticle-bracket right"></div>
            <div className="reticle-telemetry">
              <span>3D CAM // 60 FPS</span>
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
            <span>SCROLL TO SPIN 360° SMOOTHLY • DRAG TO ROTATE</span>
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
