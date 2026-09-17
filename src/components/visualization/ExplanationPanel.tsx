/* ============================================
   Explanation Panel — Shows current step info
   ============================================ */

import React from 'react';
import type { AlgorithmState } from '../../types';
import './ExplanationPanel.css';

interface Props {
  state: AlgorithmState | null;
  stepIndex: number;
  totalSteps: number;
}

export const ExplanationPanel: React.FC<Props> = ({ state, stepIndex, totalSteps }) => {
  if (!state) {
    return (
      <div className="explanation-panel">
        <div className="explanation-empty">
          <p>Run an operation to see the step-by-step explanation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="explanation-panel">
      <div className="explanation-header">
        <span className="explanation-step font-mono">
          Step {stepIndex + 1} / {totalSteps}
        </span>
        {state.operation && (
          <span className="explanation-operation">{state.operation}</span>
        )}
      </div>

      {state.explanation && (
        <div className="explanation-section">
          <h4 className="explanation-section-title">What's happening?</h4>
          <p className="explanation-text">{state.explanation}</p>
        </div>
      )}

      {state.detailedExplanation && (
        <div className="explanation-section">
          <h4 className="explanation-section-title">Why?</h4>
          <p className="explanation-text explanation-text-detail">{state.detailedExplanation}</p>
        </div>
      )}

      <div className="explanation-metrics">
        <div className="metric">
          <span className="metric-label">Comparisons</span>
          <span className="metric-value font-mono">{state.comparisons}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Assignments</span>
          <span className="metric-value font-mono">{state.assignments}</span>
        </div>
        {state.complexity && (
          <div className="metric">
            <span className="metric-label">Complexity</span>
            <span className="metric-value font-mono">{state.complexity}</span>
          </div>
        )}
      </div>
    </div>
  );
};
