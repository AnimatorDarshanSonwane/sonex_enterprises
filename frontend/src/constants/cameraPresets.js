export const CAMERA_PRESETS = [
  {
    id: 'full',
    name: 'Full Body',
    shortName: 'Full',
    badge: '1.0X',
    zoom: 1.0,
    panX: 0,
    panY: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    icon: 'Maximize',
    description: '360° full-height turntable overview of the complete character chassis.',
    stats: { armor: '95%', mobility: '88%', status: 'Nominal' }
  },
  {
    id: 'head',
    name: 'Neural Helm & Optics',
    shortName: 'Head',
    badge: '2.5X',
    zoom: 2.5,
    panX: 0,
    panY: 34,
    rotX: -2,
    rotY: 0,
    rotZ: 0,
    icon: 'Eye',
    description: 'Close inspection of multi-spectrum ocular sensors, cranial telemetry, and neural link ports.',
    stats: { resolution: '8K HDR', latency: '0.4ms', spectrum: 'Full UV/IR' }
  },
  {
    id: 'torso',
    name: 'Torso & Arc Core',
    shortName: 'Torso',
    badge: '2.1X',
    zoom: 2.1,
    panX: 0,
    panY: 8,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    icon: 'Shield',
    description: 'Hardened titanium-carbide chest plating housing the micro-singularity arc reactor.',
    stats: { coreOutput: '4.8 GW', absorption: '1200 kJ', integrity: '100%' }
  },
  {
    id: 'boots',
    name: 'Kinetic Greaves',
    shortName: 'Boots',
    badge: '2.3X',
    zoom: 2.3,
    panX: 0,
    panY: -28,
    rotX: 4,
    rotY: 0,
    rotZ: 0,
    icon: 'Footprints',
    description: 'Hydraulic shock-damping stabilizers with active magnetic anchoring solenoids.',
    stats: { groundGrip: '99.4%', shockDamp: '94%', sprintBoost: '+45%' }
  },
  {
    id: 'dutch',
    name: 'Cinematic Flank',
    shortName: 'Cinematic',
    badge: '1.4X 3D',
    zoom: 1.45,
    panX: -4,
    panY: 6,
    rotX: 12,
    rotY: -16,
    rotZ: 4,
    icon: 'Camera',
    description: 'Low-angle dynamic tilt simulating live action camera lens parallax.',
    stats: { focalLength: '35mm', aperture: 'f/1.8', shutter: '1/250s' }
  },
  {
    id: 'isometric',
    name: 'Isometric CAD',
    shortName: 'Isometric',
    badge: '1.3X CAD',
    zoom: 1.25,
    panX: 0,
    panY: 0,
    rotX: 20,
    rotY: 26,
    rotZ: -7,
    icon: 'Box',
    description: 'Axonometric projection angle ideal for engineering inspection and blueprint analysis.',
    stats: { proj: 'Axonometric', pitch: '30°', yaw: '45°' }
  }
];

export const HOTSPOTS = [
  {
    id: 'optics',
    title: 'Mark-VII Ocular Array',
    targetPreset: 'head',
    top: '18%',
    left: '50%',
    category: 'SENSORY',
    info: 'Quantum-enhanced binocular visual sensors with thermal, electromagnetic, and targeting overlays.'
  },
  {
    id: 'reactor',
    title: 'Arc-Core Micro Reactor',
    targetPreset: 'torso',
    top: '38%',
    left: '50%',
    category: 'POWER',
    info: 'Self-sustaining magnetic containment cell delivering continuous power to exosuit servos.'
  },
  {
    id: 'utility',
    title: 'Tactical Mag-Locks',
    targetPreset: 'torso',
    top: '52%',
    left: '48%',
    category: 'UTILITY',
    info: 'Modular holster hardpoints for sidearms, energy cells, and signal relays.'
  },
  {
    id: 'greaves',
    title: 'Kinetic Thrust Greaves',
    targetPreset: 'boots',
    top: '84%',
    left: '50%',
    category: 'LOCOMOTION',
    info: 'High-impact landing pistons capable of dampening terminal velocity drops without structural compromise.'
  }
];

export const LIGHTING_PRESETS = [
  {
    id: 'studio',
    name: 'Studio Neutral',
    color: '#ffffff',
    ambient: 'rgba(255, 255, 255, 0.05)',
    glow: 'rgba(255, 255, 255, 0.25)',
    filter: 'none'
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    color: '#00f0ff',
    ambient: 'rgba(0, 240, 255, 0.1)',
    glow: 'rgba(0, 240, 255, 0.4)',
    filter: 'drop-shadow(0 0 15px rgba(0,240,255,0.25)) contrast(108%) saturate(115%)'
  },
  {
    id: 'solar',
    name: 'Solar Amber',
    color: '#ffaa00',
    ambient: 'rgba(255, 170, 0, 0.1)',
    glow: 'rgba(255, 170, 0, 0.4)',
    filter: 'sepia(25%) contrast(105%) saturate(120%)'
  },
  {
    id: 'matrix',
    name: 'Matrix Emerald',
    color: '#00ff88',
    ambient: 'rgba(0, 255, 136, 0.1)',
    glow: 'rgba(0, 255, 136, 0.4)',
    filter: 'hue-rotate(60deg) contrast(110%)'
  },
  {
    id: 'noir',
    name: 'Stealth Noir',
    color: '#a0a5b5',
    ambient: 'rgba(160, 165, 181, 0.05)',
    glow: 'rgba(160, 165, 181, 0.25)',
    filter: 'grayscale(70%) contrast(125%)'
  },
  {
    id: 'xray',
    name: 'Holo Hologram',
    color: '#6366f1',
    ambient: 'rgba(99, 102, 241, 0.12)',
    glow: 'rgba(99, 102, 241, 0.5)',
    filter: 'invert(15%) hue-rotate(180deg) saturate(140%)'
  }
];

export const ROTATION_SNAPS = [
  { label: 'Front (0°)', angle: 0 },
  { label: '3/4 Right (45°)', angle: 45 },
  { label: 'Right (90°)', angle: 90 },
  { label: 'Rear (180°)', angle: 180 },
  { label: 'Left (270°)', angle: 270 },
  { label: '3/4 Left (315°)', angle: 315 }
];
