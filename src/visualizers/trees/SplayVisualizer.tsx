/* ============================================
   Splay Tree Visualizer
   ============================================ */

import React, { useState, useCallback } from 'react';
import { AnimationControls } from '../../components/visualization/AnimationControls';
import { ExplanationPanel } from '../../components/visualization/ExplanationPanel';
import { PseudocodeViewer } from '../../components/visualization/PseudocodeViewer';
import { ComplexityPanel } from '../../components/visualization/ComplexityPanel';
import { TheorySection } from '../../components/visualization/TheorySection';
import { useStateEngine } from '../../hooks/useStateEngine';
import { splayInsert, splaySearch, splayPseudocode } from '../../algorithms/trees/SplayTree';
import type { SplayNode } from '../../algorithms/trees/SplayTree';
import type { ComplexityInfo } from '../../types';
import '../trees/BSTVisualizer.css';

const SPLAY_COMPLEXITY: ComplexityInfo = {
  time: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n) amortized' },
  space: 'O(n)',
};

// Reuse the simple tree SVG renderer pattern
const SplayTreeView: React.FC<{
  root: SplayNode | null;
  activeNodes: { id: string; state: string }[];
  width: number;
  height: number;
}> = ({ root, activeNodes, width, height }) => {
  if (!root) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', minHeight: 350 }}>
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="var(--text-muted)" fontSize={14}>
          Empty tree — insert values to begin
        </text>
      </svg>
    );
  }

  const stateColors: Record<string, { fill: string; stroke: string; text: string }> = {
    normal: { fill: '#2a2a3d', stroke: '#4a4a5c', text: '#f0f0f5' },
    active: { fill: '#6366f1', stroke: '#818cf8', text: '#fff' },
    comparing: { fill: '#f59e0b', stroke: '#d97706', text: '#000' },
    inserted: { fill: '#10b981', stroke: '#059669', text: '#fff' },
    error: { fill: '#ef4444', stroke: '#dc2626', text: '#fff' },
    success: { fill: '#10b981', stroke: '#059669', text: '#fff' },
    highlight: { fill: '#fbbf24', stroke: '#d97706', text: '#000' },
  };

  function renderEdges(node: SplayNode | null): React.ReactNode[] {
    if (!node) return [];
    const r: React.ReactNode[] = [];
    if (node.left) {
      r.push(<line key={`e-${node.id}-l`} x1={node.x} y1={node.y + 20} x2={node.left.x} y2={node.left.y - 20}
        stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />);
      r.push(...renderEdges(node.left));
    }
    if (node.right) {
      r.push(<line key={`e-${node.id}-r`} x1={node.x} y1={node.y + 20} x2={node.right.x} y2={node.right.y - 20}
        stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />);
      r.push(...renderEdges(node.right));
    }
    return r;
  }

  function renderNodes(node: SplayNode | null): React.ReactNode[] {
    if (!node) return [];
    const r: React.ReactNode[] = [];
    r.push(...renderNodes(node.left));
    r.push(...renderNodes(node.right));
    const an = activeNodes.find(a => a.id === node.id);
    const s = an?.state || 'normal';
    const c = stateColors[s] || stateColors.normal;
    const isRoot = node === root;

    r.push(
      <g key={node.id}>
        {s !== 'normal' && <circle cx={node.x} cy={node.y} r={26} fill="none" stroke={c.stroke} strokeWidth={1} opacity={0.3} />}
        <circle cx={node.x} cy={node.y} r={20} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
        <text x={node.x} y={node.y} dy="0.35em" textAnchor="middle" fill={c.text}
          fontSize={12} fontFamily="'JetBrains Mono', monospace" fontWeight={600}>{node.value}</text>
        {isRoot && (
          <text x={node.x} y={node.y - 28} textAnchor="middle" fill="var(--accent-primary)"
            fontSize={9} fontWeight={700}>ROOT</text>
        )}
      </g>
    );
    return r;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', minHeight: 350 }}>
      {renderEdges(root)}
      {renderNodes(root)}
    </svg>
  );
};

export const SplayVisualizer: React.FC = () => {
  const [root, setRoot] = useState<SplayNode | null>(null);
  const [inputValue, setInputValue] = useState('');
  const { currentState, controls, loadStates } = useStateEngine();

  const handleInsert = useCallback(() => {
    const val = parseInt(inputValue.trim());
    if (isNaN(val)) return;
    const { root: newRoot, states } = splayInsert(root, val);
    setRoot(newRoot);
    loadStates(states);
    setInputValue('');
  }, [root, inputValue, loadStates]);

  const handleSearch = useCallback(() => {
    const val = parseInt(inputValue.trim());
    if (isNaN(val)) return;
    const { root: newRoot, states } = splaySearch(root, val);
    setRoot(newRoot);
    loadStates(states);
  }, [root, inputValue, loadStates]);

  const handleBulkInsert = useCallback(() => {
    const values = [40, 20, 60, 10, 30, 50, 70];
    let r: SplayNode | null = null;
    const allStates: any[] = [];
    for (const v of values) {
      const { root: newR, states } = splayInsert(r, v);
      r = newR;
      allStates.push(...states);
    }
    setRoot(r);
    loadStates(allStates);
  }, [loadStates]);

  const handleReset = useCallback(() => {
    setRoot(null);
    loadStates([]);
  }, [loadStates]);

  const activeNodes = currentState?.activeNodes || [];
  const treeToRender = currentState?.dataStructureState || root;

  return (
    <div className="bst-visualizer">
      <TheorySection topicId="splay-tree" />
      <div className="viz-header">
        <div className="viz-header-info">
          <span className="viz-badge">Unit 3 — Trees</span>
          <h1 className="viz-title">Splay Tree</h1>
          <p className="viz-desc">
            A self-adjusting BST where recently accessed elements are moved to the root via splaying.
            Observe zig, zig-zig, and zig-zag rotations as the tree restructures itself.
          </p>
        </div>
      </div>

      <div className="viz-layout">
        <div className="viz-main">
          <div className="viz-controls-bar">
            <div className="viz-input-group">
              <input type="number" className="viz-input" placeholder="Value..."
                value={inputValue} onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInsert()} />
              <button className="viz-btn viz-btn-insert" onClick={handleInsert}>Insert</button>
              <button className="viz-btn viz-btn-search" onClick={handleSearch}>Search</button>
              <button className="viz-btn viz-btn-secondary" onClick={handleBulkInsert}>Demo</button>
              <button className="viz-btn viz-btn-ghost" onClick={handleReset}>Reset</button>
            </div>
          </div>

          <div className="viz-canvas">
            <SplayTreeView root={treeToRender} activeNodes={activeNodes} width={600} height={400} />
          </div>

          <AnimationControls controls={controls} operationLabel={currentState?.operation}
            comparisons={currentState?.comparisons} complexity={currentState?.complexity} />
        </div>

        <div className="viz-sidebar">
          <ExplanationPanel state={currentState} stepIndex={controls.currentStep} totalSteps={controls.totalSteps} />
          <PseudocodeViewer lines={splayPseudocode} highlightedLine={currentState?.pseudocodeLine ?? null} title="Splay Operation" />
          <ComplexityPanel complexity={SPLAY_COMPLEXITY} title="Splay Tree Complexity" />
          <div className="viz-info-panel glass-panel">
            <h4 className="viz-info-title">Key Insight</h4>
            <p className="viz-info-text">
              Splay trees have no explicit balance condition like AVL or Red-Black trees.
              Instead, they achieve O(log n) <em>amortized</em> time through the splay operation:
              frequently accessed nodes stay near the root.
            </p>
            <h4 className="viz-info-title" style={{ marginTop: 'var(--space-3)' }}>Splay Operations</h4>
            <ul className="viz-info-list">
              <li><strong>Zig:</strong> Node is child of root — single rotation</li>
              <li><strong>Zig-Zig:</strong> Same direction (LL or RR) — two same rotations</li>
              <li><strong>Zig-Zag:</strong> Opposite direction (LR or RL) — two different rotations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
