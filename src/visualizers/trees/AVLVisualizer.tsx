/* ============================================
   AVL Visualizer — Interactive AVL Tree playground
   ============================================ */

import React, { useState, useCallback } from 'react';
import { AnimationControls } from '../../components/visualization/AnimationControls';
import { ExplanationPanel } from '../../components/visualization/ExplanationPanel';
import { AlgorithmCodePanel } from '../../components/visualization/AlgorithmCodePanel';
import { ComplexityPanel } from '../../components/visualization/ComplexityPanel';
import { TheorySection } from '../../components/visualization/TheorySection';
import { useStateEngine } from '../../hooks/useStateEngine';
import { avlInsert, getAllAVLNodes } from '../../algorithms/trees/AVL';
import { avlCodeData } from '../../data/algorithmCodeData';
import type { AVLNode } from '../../algorithms/trees/AVL';
import type { ComplexityInfo } from '../../types';
import '../trees/BSTVisualizer.css'; // reuse BST styles

const AVL_COMPLEXITY: ComplexityInfo = {
  time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
  space: 'O(n)',
};

// AVL-specific tree renderer that shows balance factors
const AVLTreeRenderer: React.FC<{
  root: AVLNode | null;
  activeNodes: { id: string; state: string }[];
  width: number;
  height: number;
}> = ({ root, activeNodes, width, height }) => {
  if (!root) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', minHeight: 350 }}>
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="var(--text-muted)" fontSize={14} fontFamily="Inter, sans-serif">
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

  function renderEdges(node: AVLNode | null): React.ReactNode[] {
    if (!node) return [];
    const result: React.ReactNode[] = [];
    if (node.left) {
      result.push(<line key={`e-${node.id}-l`} x1={node.x} y1={node.y + 20} x2={node.left.x} y2={node.left.y - 20}
        stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />);
      result.push(...renderEdges(node.left));
    }
    if (node.right) {
      result.push(<line key={`e-${node.id}-r`} x1={node.x} y1={node.y + 20} x2={node.right.x} y2={node.right.y - 20}
        stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />);
      result.push(...renderEdges(node.right));
    }
    return result;
  }

  function renderNodes(node: AVLNode | null): React.ReactNode[] {
    if (!node) return [];
    const result: React.ReactNode[] = [];
    result.push(...renderNodes(node.left));
    result.push(...renderNodes(node.right));

    const activeInfo = activeNodes.find(a => a.id === node.id);
    const state = activeInfo?.state || 'normal';
    const c = stateColors[state] || stateColors.normal;
    const bf = node.balanceFactor;
    const bfColor = Math.abs(bf) > 1 ? '#ef4444' : bf === 0 ? '#10b981' : '#f59e0b';

    result.push(
      <g key={node.id}>
        {state !== 'normal' && (
          <circle cx={node.x} cy={node.y} r={26} fill="none" stroke={c.stroke} strokeWidth={1} opacity={0.3} />
        )}
        <circle cx={node.x} cy={node.y} r={20} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
        <text x={node.x} y={node.y} dy="0.35em" textAnchor="middle" fill={c.text}
          fontSize={12} fontFamily="'JetBrains Mono', monospace" fontWeight={600}>{node.value}</text>
        {/* Balance factor badge */}
        <circle cx={node.x + 18} cy={node.y - 18} r={9} fill={bfColor} stroke="none" opacity={0.9} />
        <text x={node.x + 18} y={node.y - 18} dy="0.35em" textAnchor="middle" fill="#fff"
          fontSize={9} fontFamily="'JetBrains Mono', monospace" fontWeight={700}>{bf > 0 ? `+${bf}` : bf}</text>
      </g>
    );
    return result;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', minHeight: 350 }}>
      {renderEdges(root)}
      {renderNodes(root)}
    </svg>
  );
};

export const AVLVisualizer: React.FC = () => {
  const [root, setRoot] = useState<AVLNode | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [bulkInput, setBulkInput] = useState('30, 20, 10, 25, 40, 35, 50');
  const { currentState, controls, loadStates } = useStateEngine();

  const handleInsert = useCallback(() => {
    const val = parseInt(inputValue.trim());
    if (isNaN(val)) return;
    const { root: newRoot, states } = avlInsert(root, val);
    setRoot(newRoot);
    loadStates(states);
    setInputValue('');
  }, [root, inputValue, loadStates]);

  const handleBulkInsert = useCallback(() => {
    const values = bulkInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (values.length === 0) return;
    let currentRoot: AVLNode | null = null;
    const allStates: any[] = [];
    for (const v of values) {
      const { root: newRoot, states } = avlInsert(currentRoot, v);
      currentRoot = newRoot;
      allStates.push(...states);
    }
    setRoot(currentRoot);
    loadStates(allStates);
  }, [bulkInput, loadStates]);

  const handleRandom = useCallback(() => {
    const count = 7 + Math.floor(Math.random() * 4);
    const values = new Set<number>();
    while (values.size < count) values.add(Math.floor(Math.random() * 99) + 1);
    const arr = Array.from(values);
    setBulkInput(arr.join(', '));
    let currentRoot: AVLNode | null = null;
    const allStates: any[] = [];
    for (const v of arr) {
      const { root: newRoot, states } = avlInsert(currentRoot, v);
      currentRoot = newRoot;
      allStates.push(...states);
    }
    setRoot(currentRoot);
    loadStates(allStates);
  }, [loadStates]);

  const handleReset = useCallback(() => {
    setRoot(null);
    loadStates([]);
  }, [loadStates]);

  const activeNodes = currentState?.activeNodes || [];
  const treeToRender = currentState?.dataStructureState || root;
  const nodeCount = root ? getAllAVLNodes(root).length : 0;
  const treeH = root ? root.height : 0;

  return (
    <div className="bst-visualizer">
      <TheorySection topicId="avl" />
      <div className="viz-header">
        <div className="viz-header-info">
          <span className="viz-badge">Unit 3 — Trees</span>
          <h1 className="viz-title">AVL Tree</h1>
          <p className="viz-desc">
            A self-balancing BST where the balance factor (height difference of left and right subtrees)
            is maintained between -1 and 1 using rotations. Watch LL, RR, LR, RL rotations in action.
          </p>
        </div>
        <div className="viz-stats">
          <div className="viz-stat">
            <span className="viz-stat-label">Nodes</span>
            <span className="viz-stat-value font-mono">{nodeCount}</span>
          </div>
          <div className="viz-stat">
            <span className="viz-stat-label">Height</span>
            <span className="viz-stat-value font-mono">{treeH}</span>
          </div>
        </div>
      </div>

      <div className="viz-layout">
        <div className="viz-main">
          <div className="viz-controls-bar">
            <div className="viz-input-group">
              <input type="number" className="viz-input" placeholder="Enter value..."
                value={inputValue} onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInsert()} />
              <button className="viz-btn viz-btn-insert" onClick={handleInsert}>Insert</button>
              <button className="viz-btn viz-btn-secondary" onClick={handleRandom}>Random</button>
              <button className="viz-btn viz-btn-ghost" onClick={handleReset}>Reset</button>
            </div>
          </div>
          <div className="viz-bulk-bar">
            <input type="text" className="viz-input viz-input-wide" placeholder="e.g., 30, 20, 10, 25, 40, 35, 50"
              value={bulkInput} onChange={e => setBulkInput(e.target.value)} />
            <button className="viz-btn viz-btn-insert" onClick={handleBulkInsert}>Build Tree</button>
          </div>

          <div className="viz-canvas">
            <AVLTreeRenderer root={treeToRender} activeNodes={activeNodes} width={600} height={Math.max(350, treeH * 80 + 80)} />
          </div>

          <AnimationControls controls={controls} operationLabel={currentState?.operation}
            comparisons={currentState?.comparisons} complexity={currentState?.complexity} />
        </div>

        <div className="viz-sidebar">
          <ExplanationPanel state={currentState} stepIndex={controls.currentStep} totalSteps={controls.totalSteps} />
          <AlgorithmCodePanel
            codeData={avlCodeData}
            currentOperation={currentState?.operation}
            highlightedLine={currentState?.pseudocodeLine}
            defaultLanguage="java"
            showLineNumbers={false}
          />
          <ComplexityPanel complexity={AVL_COMPLEXITY} title="AVL Complexity" />
          <div className="viz-info-panel glass-panel">
            <h4 className="viz-info-title">AVL Rotations</h4>
            <ul className="viz-info-list">
              <li><strong>LL:</strong> Right rotation — inserted in left-left</li>
              <li><strong>RR:</strong> Left rotation — inserted in right-right</li>
              <li><strong>LR:</strong> Left-right rotation — left then right</li>
              <li><strong>RL:</strong> Right-left rotation — right then left</li>
            </ul>
            <h4 className="viz-info-title" style={{ marginTop: 'var(--space-3)' }}>Why AVL?</h4>
            <p className="viz-info-text">
              Unlike BSTs, AVL trees guarantee O(log n) worst-case for all operations by maintaining strict balance.
              BSTs can degenerate to O(n) with sorted input — AVL prevents this.
            </p>
            <h4 className="viz-info-title" style={{ marginTop: 'var(--space-3)' }}>Real-World Uses</h4>
            <ul className="viz-info-list">
              <li>Database indexing (where strict balance matters)</li>
              <li>In-memory dictionaries/maps</li>
              <li>File system metadata</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
