import React, { useRef, useEffect } from 'react';
import { 
  ArrowDownCircle, 
  Eye, 
  Shield, 
  Footprints, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { CAMERA_PRESETS } from '../constants/cameraPresets';

const STORY_STEPS = [
  {
    step: '01',
    title: 'Chassis Overview & Full-Rotation Scan',
    subtitle: 'FULL-SPECTRUM 360° AERODYNAMIC PROFILE',
    presetId: 'full',
    targetAngle: 45,
    tag: 'SYSTEM SCAN',
    icon: Maximize2,
    badge: '360° SCAN',
    metrics: [
      { label: 'Total Height', value: '198 cm' },
      { label: 'Weight Spec', value: '112 kg' },
      { label: 'Alloy Composition', value: 'Carbon-Ti' }
    ],
    content: 'A complete panoramic analysis of the cybernetic chassis. Balanced structural ergonomics ensure fluid omnidirectional agility during high-stress operations.'
  },
  {
    step: '02',
    title: 'Mark-VII Neural Helm & Sensory Visor',
    subtitle: 'HEAD FOCUS // OCULAR TARGETING SYSTEM',
    presetId: 'head',
    targetAngle: 120,
    tag: 'CRANIAL OPTICS',
    icon: Eye,
    badge: 'HEAD FOCUS',
    metrics: [
      { label: 'Optics Resolution', value: '8K HDR' },
      { label: 'Sensory Latency', value: '0.24 ms' },
      { label: 'Targeting Locks', value: '32 Targets' }
    ],
    content: 'Equipped with synthetic multi-spectrum cornea units, quantum infrared rangefinders, and encrypted neural uplink ports for instantaneous tactical response.'
  },
  {
    step: '03',
    title: 'Torso Plating & Micro-Singularity Core',
    subtitle: 'TORSO FOCUS // ARMORED POWER CELL',
    presetId: 'torso',
    targetAngle: 210,
    tag: 'ENERGY CORE',
    icon: Shield,
    badge: 'TORSO FOCUS',
    metrics: [
      { label: 'Power Rating', value: '4.8 GW' },
      { label: 'Armor Class', value: 'Class-IV' },
      { label: 'Shield Capacity', value: '2500 MJ' }
    ],
    content: 'Hardened ballistic nanoweave plates protect the central magnetic containment vessel, supplying zero-latency electric potential to the peripheral skeletal frame.'
  },
  {
    step: '04',
    title: 'Kinetic Greaves & Ground Dampers',
    subtitle: 'BOOTS FOCUS // HYDRAULIC SERVO LOCOMOTION',
    presetId: 'boots',
    targetAngle: 300,
    tag: 'LOCOMOTION',
    icon: Footprints,
    badge: 'BOOTS FOCUS',
    metrics: [
      { label: 'Ground Grip', value: '99.4%' },
      { label: 'Impact Absorber', value: '150 kN' },
      { label: 'Sprint Surge', value: '+55 km/h' }
    ],
    content: 'Dual-phase hydraulic shock dampers absorb terminal velocity impacts with high-coercivity magnetic foot grips for stable combat grounding on any terrain.'
  },
  {
    step: '05',
    title: 'Cinematic Flank & Deployment Readiness',
    subtitle: '3D PERSPECTIVE // TACTICAL ENGAGEMENT',
    presetId: 'dutch',
    targetAngle: 360,
    tag: 'DEPLOYMENT',
    icon: Sparkles,
    badge: 'CINEMATIC 3D',
    metrics: [
      { label: 'Combat Status', value: 'NOMINAL' },
      { label: 'Core Temp', value: '48.2 °C' },
      { label: 'Sync Integrity', value: '100.0%' }
    ],
    content: 'All biomechanical subsystems calibrated and locked. 60 FPS turnaround telemetry validates 100% structural alignment for immediate mission deployment.'
  }
];

export default function ScrollStoryNarrative({ 
  setPreset, 
  setCurrentFrame, 
  setTargetFrame,
  setIsPlaying,
  currentPreset,
  playSound 
}) {
  const narrativeRef = useRef(null);

  // Jump to story chapter with smooth shortest-path rotation
  const handleSelectStoryStep = (step) => {
    if (setIsPlaying) setIsPlaying(false);

    // Set camera preset
    const preset = CAMERA_PRESETS.find(p => p.id === step.presetId) || CAMERA_PRESETS[0];
    setPreset(preset);

    // Set turnaround rotation frame
    const floatFrame = ((step.targetAngle % 360) / 360) * 240;
    if (setTargetFrame) {
      setTargetFrame(floatFrame);
    } else {
      setCurrentFrame(Math.round(floatFrame) % 240);
    }

    playSound('zoom');
  };

  return (
    <section className="scroll-narrative-section" ref={narrativeRef} id="scroll-story">
      {/* Section Header */}
      <div className="section-title-wrap">
        <div className="section-badge">
          <ArrowDownCircle size={14} className="text-cyan" />
          <span>INTERACTIVE SCROLL PROTOCOL</span>
        </div>
        <h2 className="section-heading">SUBSYSTEM DEEP-DIVE & ROTATION</h2>
        <p className="section-subtext">
          Scroll down or click each section below to smoothly spin the character and guide the dynamic 3D camera to every key feature.
        </p>
      </div>

      {/* Story Steps Grid */}
      <div className="story-cards-container">
        {STORY_STEPS.map((item, idx) => {
          const IconComp = item.icon;
          const isActive = currentPreset?.id === item.presetId;

          return (
            <div 
              key={item.step}
              className={`story-card ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectStoryStep(item)}
            >
              <div className="story-card-header">
                <div className="story-step-index">
                  <span className="step-num">{item.step}</span>
                  <span className="step-tag">{item.tag}</span>
                </div>
                <div className="story-badge">
                  <IconComp size={14} />
                  <span>{item.badge}</span>
                </div>
              </div>

              <div className="story-card-body">
                <h3 className="story-title">{item.title}</h3>
                <div className="story-sub">{item.subtitle}</div>
                <p className="story-content">{item.content}</p>

                {/* Metrics Pill Grid */}
                <div className="story-metrics-grid">
                  {item.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="metric-pill">
                      <span className="m-label">{m.label}</span>
                      <span className="m-value">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="story-card-footer">
                <div className="sync-angle-indicator">
                  <span>TARGET ANGLE: <strong>{item.targetAngle}°</strong></span>
                </div>
                <button className="jump-focus-btn">
                  <span>{isActive ? 'FOCUSED NOW' : 'FOCUS CAMERA'}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
