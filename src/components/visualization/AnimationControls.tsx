/* ============================================
   Animation Controls — Play/Pause/Step/Speed/Timeline
   Reusable for all visualizers
   ============================================ */

import React from 'react';
import { Play, Pause, SkipForward, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AnimationControls as AnimCtrl } from '../../types';
import './AnimationControls.css';

interface Props {
  controls: AnimCtrl;
  operationLabel?: string;
  comparisons?: number;
  assignments?: number;
  complexity?: string;
}

const SPEED_OPTIONS = [0.5, 1, 1.5, 2];

export const AnimationControls: React.FC<Props> = ({
  controls,
  operationLabel,
  comparisons,
  assignments,
  complexity,
}) => {
  return (
    <div className="animation-controls">
      {/* Timeline */}
      <div className="timeline-section">
        <span className="step-label font-mono">
          {controls.totalSteps > 0
            ? `${String(controls.currentStep + 1).padStart(2, '0')} / ${String(controls.totalSteps).padStart(2, '0')}`
            : '-- / --'}
        </span>
        <input
          type="range"
          className="timeline-slider"
          min={0}
          max={Math.max(0, controls.totalSteps - 1)}
          value={controls.currentStep}
          onChange={e => controls.goToStep(Number(e.target.value))}
          disabled={controls.totalSteps === 0}
          aria-label="Timeline"
        />
      </div>

      {/* Main Controls */}
      <div className="controls-row">
        <div className="controls-group">
          <button
            className="ctrl-btn"
            onClick={controls.restart}
            disabled={controls.totalSteps === 0}
            aria-label="Restart"
            title="Restart (R)"
          >
            <RotateCcw size={15} />
          </button>
          <button
            className="ctrl-btn"
            onClick={controls.stepBack}
            disabled={controls.currentStep <= 0}
            aria-label="Previous step"
            title="Previous (←)"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            className="ctrl-btn ctrl-btn-primary"
            onClick={controls.toggle}
            disabled={controls.totalSteps === 0}
            aria-label={controls.isPlaying ? 'Pause' : 'Play'}
            title={controls.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {controls.isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            className="ctrl-btn"
            onClick={controls.stepForward}
            disabled={controls.currentStep >= controls.totalSteps - 1}
            aria-label="Next step"
            title="Next (→)"
          >
            <ChevronRight size={17} />
          </button>
          <button
            className="ctrl-btn"
            onClick={() => controls.goToStep(controls.totalSteps - 1)}
            disabled={controls.totalSteps === 0}
            aria-label="Go to last step"
            title="Last step"
          >
            <SkipForward size={15} />
          </button>
        </div>

        {/* Speed */}
        <div className="speed-group">
          {SPEED_OPTIONS.map(s => (
            <button
              key={s}
              className={`speed-btn ${controls.speed === s ? 'speed-btn-active' : ''}`}
              onClick={() => controls.setSpeed(s)}
              aria-label={`Speed ${s}x`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Status bar */}
      {(operationLabel || comparisons !== undefined || complexity) && (
        <div className="status-bar">
          {operationLabel && (
            <div className="status-item">
              <span className="status-label">Operation</span>
              <span className="status-value font-mono">{operationLabel}</span>
            </div>
          )}
          {comparisons !== undefined && (
            <div className="status-item">
              <span className="status-label">Comparisons</span>
              <span className="status-value font-mono">{comparisons}</span>
            </div>
          )}
          {assignments !== undefined && (
            <div className="status-item">
              <span className="status-label">Assignments</span>
              <span className="status-value font-mono">{assignments}</span>
            </div>
          )}
          {complexity && (
            <div className="status-item">
              <span className="status-label">Complexity</span>
              <span className="status-value font-mono">{complexity}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
