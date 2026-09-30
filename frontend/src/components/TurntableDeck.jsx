import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCw, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Compass
} from 'lucide-react';
import { ROTATION_SNAPS } from '../constants/cameraPresets';

const TOTAL_FRAMES = 240;

export default function TurntableDeck({
  currentFrame,
  setCurrentFrame,
  targetFrame,
  setTargetFrame,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  direction,
  setDirection,
  playSound
}) {
  const angle = ((currentFrame / TOTAL_FRAMES) * 360) % 360;
  const progressPercent = (currentFrame / TOTAL_FRAMES) * 100;
  const currentTimeSec = (currentFrame / 24).toFixed(2);

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    playSound(nextState ? 'mode' : 'click');
  };

  // Step 1 frame
  const handleStepFrame = (frames) => {
    if (isPlaying) setIsPlaying(false);
    let next = (currentFrame + frames) % TOTAL_FRAMES;
    if (next < 0) next = TOTAL_FRAMES + next;
    if (setTargetFrame) {
      setTargetFrame(next);
    } else {
      setCurrentFrame(next);
    }
    playSound('tick');
  };

  // Snap to degree angle with smooth inertia
  const handleSnapAngle = (targetAngle) => {
    if (isPlaying) setIsPlaying(false);
    const snapFrame = ((targetAngle / 360) * TOTAL_FRAMES) % TOTAL_FRAMES;
    if (setTargetFrame) {
      setTargetFrame(snapFrame);
    } else {
      setCurrentFrame(Math.round(snapFrame));
    }
    playSound('zoom');
  };

  // Handle timeline scrubber drag/click (floating point precision)
  const handleScrubberChange = (e) => {
    if (isPlaying) setIsPlaying(false);
    const newPercent = parseFloat(e.target.value);
    const newFrame = (newPercent / 100) * TOTAL_FRAMES;
    if (setTargetFrame) {
      setTargetFrame(newFrame);
    } else {
      setCurrentFrame(Math.round(newFrame) % TOTAL_FRAMES);
    }
  };

  // Capture Screenshot from Canvas
  const handleCaptureSnapshot = () => {
    const canvas = document.querySelector('.turnaround-canvas');
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `AETHER-01_frame_${currentFrame + 1}_${Math.round(angle)}deg.png`;
      a.click();
      playSound('click');
    } catch {
      // Fallback
    }
  };

  return (
    <div className="turntable-deck-container">
      {/* Upper Timeline Scrubber Bar */}
      <div className="turntable-scrubber-row">
        <div className="scrubber-angle-tag">
          <Compass size={14} className="text-cyan" />
          <span>{angle.toFixed(1)}°</span>
        </div>

        <div className="scrubber-track-wrap">
          <input
            type="range"
            min="0"
            max="100"
            step="0.2"
            value={progressPercent}
            onChange={handleScrubberChange}
            className="timeline-slider"
          />
          {/* Degree Tick marks on timeline */}
          <div className="scrubber-ticks-bar">
            <span style={{ left: '0%' }}>0°</span>
            <span style={{ left: '25%' }}>90°</span>
            <span style={{ left: '50%' }}>180°</span>
            <span style={{ left: '75%' }}>270°</span>
            <span style={{ left: '100%' }}>360°</span>
          </div>
        </div>

        <div className="scrubber-time-tag">
          <span>FRAME {currentFrame + 1} / {TOTAL_FRAMES}</span>
        </div>
      </div>

      {/* Lower Controls & Quick Angle Snaps */}
      <div className="deck-controls-row">
        {/* Playback & Direction Group */}
        <div className="deck-left-group">
          <button 
            className={`play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={handleTogglePlay}
            title={isPlaying ? 'Pause 360° Auto-Spin (Space)' : 'Start 360° Auto-Spin (Space)'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
            <span className="btn-text">{isPlaying ? 'PAUSE' : 'AUTO-SPIN'}</span>
          </button>

          {/* Direction Toggle */}
          <button 
            className="deck-icon-btn"
            onClick={() => {
              setDirection(d => d * -1);
              playSound('click');
            }}
            title={direction > 0 ? 'Clockwise (Click to invert)' : 'Counter-Clockwise (Click to invert)'}
          >
            {direction > 0 ? <RotateCw size={16} /> : <RotateCcw size={16} />}
          </button>

          {/* Speed Selector */}
          <div className="speed-pills">
            {[0.5, 1.0, 2.0].map((s) => (
              <button
                key={s}
                className={`speed-pill ${playbackSpeed === s ? 'active' : ''}`}
                onClick={() => {
                  setPlaybackSpeed(s);
                  playSound('click');
                }}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Frame Step */}
          <div className="frame-step-group">
            <button 
              className="deck-icon-btn"
              onClick={() => handleStepFrame(-1)}
              title="Step Back 1 Frame (Left Arrow)"
            >
              <ChevronLeft size={16} />
              <span className="step-txt">-1F</span>
            </button>
            <button 
              className="deck-icon-btn"
              onClick={() => handleStepFrame(1)}
              title="Step Forward 1 Frame (Right Arrow)"
            >
              <span className="step-txt">+1F</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Center Quick Snap Angles */}
        <div className="deck-snaps-group">
          <span className="snaps-label">SNAPS:</span>
          {ROTATION_SNAPS.map((snap) => {
            const isNear = Math.abs(angle - snap.angle) < 6;
            return (
              <button
                key={snap.angle}
                className={`snap-btn ${isNear ? 'active' : ''}`}
                onClick={() => handleSnapAngle(snap.angle)}
              >
                {snap.label}
              </button>
            );
          })}
        </div>

        {/* Right Snapshot Action */}
        <div className="deck-right-group">
          <button 
            className="snapshot-btn"
            onClick={handleCaptureSnapshot}
            title="Download PNG snapshot of current frame"
          >
            <Camera size={16} />
            <span>SNAPSHOT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
