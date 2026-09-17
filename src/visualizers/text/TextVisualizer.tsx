/* ============================================
   Text Algorithm Visualizer
   ============================================ */

import React, { useState, useCallback } from 'react';
import { AnimationControls } from '../../components/visualization/AnimationControls';
import { ExplanationPanel } from '../../components/visualization/ExplanationPanel';
import { PseudocodeViewer } from '../../components/visualization/PseudocodeViewer';
import { TheorySection } from '../../components/visualization/TheorySection';
import { useStateEngine } from '../../hooks/useStateEngine';
import { bruteForceMatch, kmpMatch, kmpPseudocode, bfPseudocode } from '../../algorithms/text/PatternMatching';
import './TextVisualizer.css';

// Character display component
const TextDisplay: React.FC<{
  text: string;
  pattern: string;
  alignment: number;
  textHighlights: { index: number; state: string }[];
  patternHighlights: { index: number; state: string }[];
  lps?: number[];
}> = ({ text, pattern, alignment, textHighlights, patternHighlights, lps }) => {
  const hlColors: Record<string, string> = {
    match: 'var(--state-match)',
    mismatch: 'var(--state-mismatch)',
  };

  return (
    <div className="text-display">
      {/* Text row */}
      <div className="text-row">
        <span className="text-row-label">Text</span>
        <div className="char-row">
          {text.split('').map((ch, i) => {
            const hl = textHighlights.find(h => h.index === i);
            return (
              <div key={i} className={`char-cell ${hl ? `char-${hl.state}` : ''}`}
                style={hl ? { borderColor: hlColors[hl.state] } : {}}>
                <span className="char-index font-mono">{i}</span>
                <span className="char-value font-mono">{ch}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pattern row (aligned) */}
      <div className="text-row">
        <span className="text-row-label">Pattern</span>
        <div className="char-row">
          {/* Spacer for alignment */}
          {Array.from({ length: Math.max(0, alignment) }, (_, i) => (
            <div key={`space-${i}`} className="char-cell char-spacer" />
          ))}
          {pattern.split('').map((ch, j) => {
            const hl = patternHighlights.find(h => h.index === j);
            return (
              <div key={j} className={`char-cell char-pattern ${hl ? `char-${hl.state}` : ''}`}
                style={hl ? { borderColor: hlColors[hl.state] } : {}}>
                <span className="char-value font-mono">{ch}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* LPS array */}
      {lps && (
        <div className="text-row">
          <span className="text-row-label">LPS</span>
          <div className="char-row">
            {lps.map((val, i) => (
              <div key={i} className="char-cell char-lps">
                <span className="char-index font-mono">{pattern[i]}</span>
                <span className="char-value font-mono">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const TextVisualizer: React.FC<{ initialAlgorithm?: 'brute-force' | 'kmp' }> = ({
  initialAlgorithm = 'kmp',
}) => {
  const [text, setText] = useState('ABABDABACDABABCABAB');
  const [pattern, setPattern] = useState('ABABCABAB');
  const [algorithm, setAlgorithm] = useState<'brute-force' | 'kmp'>(initialAlgorithm);
  const { currentState, controls, loadStates } = useStateEngine();

  const handleRun = useCallback(() => {
    if (!text || !pattern) return;
    const states = algorithm === 'kmp' ? kmpMatch(text, pattern) : bruteForceMatch(text, pattern);
    loadStates(states);
  }, [text, pattern, algorithm, loadStates]);

  const dsState = currentState?.dataStructureState || {};
  const alignment = dsState.alignment ?? 0;
  const textHighlights = dsState.textHighlights || [];
  const patternHighlights = dsState.patternHighlights || [];
  const lps = dsState.lps;

  return (
    <div className="text-viz">
      <TheorySection topicId={algorithm === 'kmp' ? 'kmp' : 'brute-force-matching'} />
      <div className="viz-header">
        <div className="viz-header-info">
          <span className="viz-badge">Unit 5 — Text Processing</span>
          <h1 className="viz-title">{algorithm === 'kmp' ? 'KMP Pattern Matching' : 'Brute-Force Pattern Matching'}</h1>
          <p className="viz-desc">
            Enter text and pattern below. Watch the algorithm compare characters one by one.
            {algorithm === 'kmp' && ' KMP builds an LPS array to skip unnecessary comparisons.'}
          </p>
        </div>
      </div>

      <div className="viz-layout">
        <div className="viz-main">
          <div className="text-inputs">
            <div className="text-input-group">
              <label className="text-input-label">Text</label>
              <input type="text" className="viz-input viz-input-wide font-mono" value={text}
                onChange={e => setText(e.target.value.toUpperCase())} />
            </div>
            <div className="text-input-group">
              <label className="text-input-label">Pattern</label>
              <input type="text" className="viz-input viz-input-wide font-mono" value={pattern}
                onChange={e => setPattern(e.target.value.toUpperCase())} />
            </div>
          </div>

          <div className="viz-controls-bar">
            <div className="viz-input-group">
              <select className="viz-input" value={algorithm} onChange={e => setAlgorithm(e.target.value as any)}>
                <option value="kmp">KMP</option>
                <option value="brute-force">Brute Force</option>
              </select>
              <button className="viz-btn viz-btn-insert" onClick={handleRun}>Run</button>
              <button className="viz-btn viz-btn-ghost" onClick={() => loadStates([])}>Reset</button>
            </div>
          </div>

          <div className="viz-canvas" style={{ minHeight: 'auto', padding: 'var(--space-4)' }}>
            <TextDisplay text={text} pattern={pattern} alignment={alignment >= 0 ? alignment : 0}
              textHighlights={textHighlights} patternHighlights={patternHighlights} lps={lps} />
          </div>

          <AnimationControls controls={controls} operationLabel={currentState?.operation}
            comparisons={currentState?.comparisons} complexity={currentState?.complexity} />
        </div>

        <div className="viz-sidebar">
          <ExplanationPanel state={currentState} stepIndex={controls.currentStep} totalSteps={controls.totalSteps} />
          <PseudocodeViewer
            lines={algorithm === 'kmp' ? kmpPseudocode : bfPseudocode}
            highlightedLine={currentState?.pseudocodeLine ?? null}
            title={algorithm === 'kmp' ? 'KMP Algorithm' : 'Brute Force'}
          />
          <div className="viz-info-panel glass-panel">
            <h4 className="viz-info-title">Algorithm Comparison</h4>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexDirection: 'column' }}>
              <div className="text-algo-compare">
                <span>Brute Force</span><span className="font-mono" style={{ color: 'var(--state-error)' }}>O(n·m)</span>
              </div>
              <div className="text-algo-compare">
                <span>KMP</span><span className="font-mono" style={{ color: 'var(--state-success)' }}>O(n+m)</span>
              </div>
              <div className="text-algo-compare">
                <span>Boyer-Moore</span><span className="font-mono" style={{ color: 'var(--state-success)' }}>O(n/m) best</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
