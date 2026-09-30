import React from 'react';
import { 
  Cpu, 
  ShieldAlert, 
  Zap, 
  Gauge, 
  Crosshair, 
  Terminal, 
  HardDrive,
  Award
} from 'lucide-react';

const STATS = [
  { name: 'KINETIC MOBILITY', value: 92, max: 100, color: '#00f0ff' },
  { name: 'TITANIUM PLATING', value: 96, max: 100, color: '#aa3bff' },
  { name: 'OCULAR RECOGNITION', value: 98, max: 100, color: '#00ff88' },
  { name: 'ARC POWER CAPACITY', value: 94, max: 100, color: '#ffaa00' },
  { name: 'EMP SHIELDING', value: 89, max: 100, color: '#3b82f6' }
];

const SPEC_DETAILS = [
  { label: 'CHASSIS CODE', val: 'AETHER-01-VANGUARD' },
  { label: 'ANIMATION PROFILE', val: '60.00 FPS TRUE SYNC' },
  { label: 'TURNTABLE CYCLE', val: '10.006s (360° CONTINUOUS)' },
  { label: 'PRIMARY OPERATOR', val: 'AUTONOMOUS / SYNAPSE' },
  { label: 'NEURAL LATENCY', val: '< 0.35 MS (SUB-NEURONAL)' },
  { label: 'MAX ACCELERATION', val: '14.2 G-FORCE DAMPENED' },
  { label: 'MATERIAL HARDNESS', val: 'MOHS 9.8 (TI-BORON CARBIDE)' },
  { label: 'THERMAL THRESHOLD', val: '-180°C TO +1450°C' }
];

export default function SpecSheet() {
  return (
    <section className="specsheet-section">
      <div className="section-title-wrap">
        <div className="section-badge">
          <Terminal size={14} className="text-cyan" />
          <span>TECHNICAL DOSSIER & TELEMETRY</span>
        </div>
        <h2 className="section-heading">BIOMECHANICAL SPECIFICATIONS</h2>
        <p className="section-subtext">
          Engineered for extreme orbital and high-density urban warfare. Full structural diagnostic telemetry below.
        </p>
      </div>

      <div className="spec-content-grid">
        {/* Left: Performance Stat Bars */}
        <div className="spec-card">
          <div className="card-top-bar">
            <Gauge size={16} className="text-cyan" />
            <span className="card-top-title">COMBAT PERFORMANCE METRICS</span>
          </div>

          <div className="stat-bars-list">
            {STATS.map((stat, i) => (
              <div key={i} className="stat-bar-item">
                <div className="stat-bar-header">
                  <span className="stat-name">{stat.name}</span>
                  <span className="stat-value">{stat.value}%</span>
                </div>
                <div className="stat-track">
                  <div 
                    className="stat-fill" 
                    style={{ 
                      width: `${stat.value}%`,
                      backgroundColor: stat.color,
                      boxShadow: `0 0 10px ${stat.color}88`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-footnote">
            <Award size={14} className="text-cyan" />
            <span>CALIBRATION CONFIRMED: 60 FPS INTERPOLATION ENGINE</span>
          </div>
        </div>

        {/* Right: Technical Spec Grid Table */}
        <div className="spec-card">
          <div className="card-top-bar">
            <HardDrive size={16} className="text-cyan" />
            <span className="card-top-title">ARCHITECTURAL TELEMETRY</span>
          </div>

          <div className="spec-details-table">
            {SPEC_DETAILS.map((item, idx) => (
              <div key={idx} className="spec-table-row">
                <span className="spec-key">{item.label}</span>
                <span className="spec-val">{item.val}</span>
              </div>
            ))}
          </div>

          <div className="tactical-quote-box">
            <span className="quote-tag">[LOG 904.2-A]</span>
            <p className="quote-text">
              "The AETHER-01 chassis exhibits complete structural symmetry through full 360-degree rotation testing. Zero torsional drift recorded."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
