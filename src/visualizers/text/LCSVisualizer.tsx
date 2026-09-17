/* ============================================
   LCS Visualizer — DP Matrix visualization
   ============================================ */

import React, { useState, useCallback } from 'react';
import { AnimationControls } from '../../components/visualization/AnimationControls';
import { ExplanationPanel } from '../../components/visualization/ExplanationPanel';
import { PseudocodeViewer } from '../../components/visualization/PseudocodeViewer';
import { ComplexityPanel } from '../../components/visualization/ComplexityPanel';
import { TheorySection } from '../../components/visualization/TheorySection';
import { useStateEngine } from '../../hooks/useStateEngine';
import { lcsCompute, lcsPseudocode } from '../../algorithms/text/LCS';
import type { LCSMatrix } from '../../algorithms/text/LCS';
import type { ComplexityInfo } from '../../types';
import './LCSVisualizer.css';

const LCS_COMPLEXITY: ComplexityInfo = {
  time: { best: 'O(m·n)', average: 'O(m·n)', worst: 'O(m·n)' },
  space: 'O(m·n)',
};

// DP Matrix renderer
const MatrixView: React.FC<{
  matrix: LCSMatrix | null;
  activeCell?: { i: number; j: number; state: string } | null;
  backtrackCells?: { i: number; j: number }[];
}> = ({ matrix, activeCell, backtrackCells }) => {
  if (!matrix) {
    return (
      <div className="lcs-matrix-empty">Enter two strings and click Compute to see the DP matrix</div>
    );
  }

  const isBacktrack = (i: number, j: number) =>
    backtrackCells?.some(c => c.i === i && c.j === j) || false;

  return (
    <div className="lcs-matrix-container">
      <table className="lcs-matrix">
        <thead>
          <tr>
            <th className="lcs-header-cell"></th>
            <th className="lcs-header-cell font-mono">∅</th>
            {matrix.text2.split('').map((ch, j) => (
              <th key={j} className="lcs-header-cell font-mono">{ch}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.cells.map((row, i) => (
            <tr key={i}>
              <td className="lcs-header-cell font-mono">
                {i === 0 ? '∅' : matrix.text1[i - 1]}
              </td>
              {row.map((val, j) => {
                const isActive = activeCell && activeCell.i === i && activeCell.j === j;
                const isMatch = isActive && activeCell?.state === 'match';
                const isMismatch = isActive && activeCell?.state === 'mismatch';
                const isBT = isBacktrack(i, j);
                const arrow = matrix.arrows[i][j];

                let cellClass = 'lcs-cell';
                if (isMatch) cellClass += ' lcs-cell-match';
                else if (isMismatch) cellClass += ' lcs-cell-mismatch';
                else if (isBT) cellClass += ' lcs-cell-backtrack';

                return (
                  <td key={j} className={cellClass}>
                    <span className="lcs-cell-value font-mono">{val}</span>
                    {arrow !== 'none' && (
                      <span className="lcs-cell-arrow">
                        {arrow === 'diag' ? '↖' : arrow === 'up' ? '↑' : '←'}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const LCSVisualizer: React.FC = () => {
  const [str1, setStr1] = useState('ABCBDAB');
  const [str2, setStr2] = useState('BDCAB');
  const [result, setResult] = useState<string>('');
  const { currentState, controls, loadStates } = useStateEngine();

  const handleCompute = useCallback(() => {
    if (!str1 || !str2) return;
    const { lcs, states } = lcsCompute(str1, str2);
    setResult(lcs);
    loadStates(states);
  }, [str1, str2, loadStates]);

  const dsState = currentState?.dataStructureState as LCSMatrix | undefined;

  // Extract active cell from state
  const activeNodes = currentState?.activeNodes || [];
  let activeCell: { i: number; j: number; state: string } | null = null;
  if (activeNodes.length > 0) {
    const match = activeNodes[0].id.match(/cell-(\d+)-(\d+)/);
    if (match) {
      activeCell = { i: parseInt(match[1]), j: parseInt(match[2]), state: activeNodes[0].state };
    }
  }
  const backtrackCells = currentState?.metadata?.backtrack;

  return (
    <div className="lcs-viz">
      <TheorySection topicId="lcs" />
      <div className="viz-header">
        <div className="viz-header-info">
          <span className="viz-badge">Unit 5 — Text Processing / DP</span>
          <h1 className="viz-title">Longest Common Subsequence</h1>
          <p className="viz-desc">
            Dynamic programming at its finest. Watch the DP matrix fill cell-by-cell,
            then backtrack to find the actual LCS. Diagonal arrows = match characters.
          </p>
        </div>
      </div>

      <div className="viz-layout">
        <div className="viz-main">
          <div className="lcs-inputs">
            <div className="lcs-input-group">
              <label className="text-input-label">String 1</label>
              <input type="text" className="viz-input viz-input-wide font-mono" value={str1}
                onChange={e => setStr1(e.target.value.toUpperCase())} placeholder="ABCBDAB" />
            </div>
            <div className="lcs-input-group">
              <label className="text-input-label">String 2</label>
              <input type="text" className="viz-input viz-input-wide font-mono" value={str2}
                onChange={e => setStr2(e.target.value.toUpperCase())} placeholder="BDCAB" />
            </div>
            <button className="viz-btn viz-btn-insert" onClick={handleCompute}>Compute LCS</button>
            <button className="viz-btn viz-btn-ghost" onClick={() => { setResult(''); loadStates([]); }}>Reset</button>
          </div>

          {result && (
            <div className="lcs-result glass-panel">
              <span className="lcs-result-label">LCS:</span>
              <span className="lcs-result-value font-mono">{result}</span>
              <span className="lcs-result-length font-mono">Length: {result.length}</span>
            </div>
          )}

          <div className="viz-canvas" style={{ minHeight: 'auto', padding: 'var(--space-4)', overflow: 'auto' }}>
            <MatrixView matrix={dsState || null} activeCell={activeCell} backtrackCells={backtrackCells} />
          </div>

          <AnimationControls controls={controls} operationLabel={currentState?.operation}
            comparisons={currentState?.comparisons} complexity={currentState?.complexity} />
        </div>

        <div className="viz-sidebar">
          <ExplanationPanel state={currentState} stepIndex={controls.currentStep} totalSteps={controls.totalSteps} />
          <PseudocodeViewer lines={lcsPseudocode} highlightedLine={currentState?.pseudocodeLine ?? null} title="LCS Algorithm" />
          <ComplexityPanel complexity={LCS_COMPLEXITY} title="LCS Complexity" />

          <div className="viz-info-panel glass-panel">
            <h4 className="viz-info-title">DP Matrix Legend</h4>
            <div className="lcs-legend">
              <div className="lcs-legend-item">
                <span className="lcs-legend-color" style={{ background: 'var(--state-match)' }} />
                <span>Match (diagonal = subsequence extends)</span>
              </div>
              <div className="lcs-legend-item">
                <span className="lcs-legend-color" style={{ background: 'var(--state-mismatch)' }} />
                <span>Mismatch (take max of above/left)</span>
              </div>
              <div className="lcs-legend-item">
                <span className="lcs-legend-color" style={{ background: 'var(--accent-primary)' }} />
                <span>Backtrack path (LCS characters)</span>
              </div>
            </div>
            <h4 className="viz-info-title" style={{ marginTop: 'var(--space-3)' }}>Real-World Uses</h4>
            <ul className="viz-info-list">
              <li>Diff tools (git diff, file comparison)</li>
              <li>DNA sequence alignment</li>
              <li>Plagiarism detection</li>
              <li>Version control systems</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
