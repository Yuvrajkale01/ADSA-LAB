/* ============================================
   B-Tree Visualizer — Multi-way balanced tree
   ============================================ */

import React, { useState, useCallback } from 'react';
import { AnimationControls } from '../../components/visualization/AnimationControls';
import { ExplanationPanel } from '../../components/visualization/ExplanationPanel';
import { ComplexityPanel } from '../../components/visualization/ComplexityPanel';
import { AlgorithmCodePanel } from '../../components/visualization/AlgorithmCodePanel';
import { TheorySection } from '../../components/visualization/TheorySection';
import { useStateEngine } from '../../hooks/useStateEngine';
import { bTreeCodeData } from '../../data/algorithmCodeData';
import type { AlgorithmState, ComplexityInfo } from '../../types';
import '../trees/BSTVisualizer.css';

interface BTreeNode {
  id: string;
  keys: number[];
  children: BTreeNode[];
  leaf: boolean;
  x: number;
  y: number;
}

let btCounter = 0;
function createBTNode(leaf: boolean): BTreeNode {
  return { id: `bt-${btCounter++}`, keys: [], children: [], leaf, x: 0, y: 0 };
}

function cloneBT(n: BTreeNode | null): BTreeNode | null {
  if (!n) return null;
  return { ...n, keys: [...n.keys], children: n.children.map(c => cloneBT(c)!) };
}

function layoutBT(node: BTreeNode | null, depth: number = 0, pos: number = 300, spread: number = 350): void {
  if (!node) return;
  node.x = pos; node.y = depth * 80 + 40;
  if (node.children.length === 0) return;
  const childSpread = spread / node.children.length;
  const startX = pos - spread / 2 + childSpread / 2;
  node.children.forEach((c, i) => layoutBT(c, depth + 1, startX + i * childSpread, childSpread * 0.9));
}

function btHeight(n: BTreeNode | null): number {
  if (!n || n.children.length === 0) return 1;
  return 1 + btHeight(n.children[0]);
}

function btInsert(root: BTreeNode | null, key: number, order: number): { root: BTreeNode; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let stateId = 0;
  const maxKeys = order - 1;

  if (!root) {
    root = createBTNode(true);
    root.keys.push(key);
    layoutBT(root);
    states.push({
      id: stateId++, dataStructureState: cloneBT(root), activeNodes: [{ id: root.id, state: 'inserted' }], activeEdges: [],
      operation: 'INSERT', explanation: `Tree empty. Insert ${key} as root.`, detailedExplanation: 'B-Tree starts with a single root node.',
      pseudocodeLine: 0, comparisons: 0, assignments: 1, swaps: 0, complexity: 'O(log n)', metadata: {}
    });
    return { root, states };
  }

  layoutBT(root);
  states.push({
    id: stateId++, dataStructureState: cloneBT(root), activeNodes: [], activeEdges: [],
    operation: 'START INSERT', explanation: `Inserting ${key} into B-Tree (order ${order}, max ${maxKeys} keys/node).`,
    detailedExplanation: `A B-tree of order ${order} has at most ${order} children per node and ${maxKeys} keys.`,
    pseudocodeLine: 0, comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(log n)', metadata: {}
  });

  // Split child
  function splitChild(parent: BTreeNode, childIndex: number) {
    const child = parent.children[childIndex];
    const midIndex = Math.floor(maxKeys / 2);
    const newRight = createBTNode(child.leaf);
    newRight.keys = child.keys.splice(midIndex + 1);
    const promotedKey = child.keys.pop()!;
    if (!child.leaf) {
      newRight.children = child.children.splice(midIndex + 1);
    }
    parent.keys.splice(childIndex, 0, promotedKey);
    parent.children.splice(childIndex + 1, 0, newRight);

    layoutBT(root);
    states.push({
      id: stateId++, dataStructureState: cloneBT(root),
      activeNodes: [{ id: parent.id, state: 'highlight' }, { id: newRight.id, state: 'inserted' }], activeEdges: [],
      operation: 'SPLIT',
      explanation: `Node full! Split at ${promotedKey}. Promoted ${promotedKey} to parent.`,
      detailedExplanation: `Left: [${child.keys.join(',')}], Promoted: ${promotedKey}, Right: [${newRight.keys.join(',')}]`,
      pseudocodeLine: 4, comparisons: 0, assignments: 3, swaps: 0, complexity: 'O(log n)', metadata: { splitKey: promotedKey }
    });
  }

  // Insert non-full
  function insertNonFull(node: BTreeNode, k: number) {
    if (node.leaf) {
      // Insert key in sorted position
      let i = node.keys.length - 1;
      while (i >= 0 && node.keys[i] > k) { i--; }
      node.keys.splice(i + 1, 0, k);

      layoutBT(root);
      states.push({
        id: stateId++, dataStructureState: cloneBT(root),
        activeNodes: [{ id: node.id, state: 'inserted' }], activeEdges: [],
        operation: 'INSERT IN LEAF', explanation: `Inserted ${k} into leaf [${node.keys.join(', ')}].`,
        detailedExplanation: 'Keys are kept sorted within each node.', pseudocodeLine: 6,
        comparisons: node.keys.length, assignments: 1, swaps: 0, complexity: 'O(log n)', metadata: {}
      });
    } else {
      let i = node.keys.length - 1;
      while (i >= 0 && node.keys[i] > k) i--;
      i++;

      states.push({
        id: stateId++, dataStructureState: cloneBT(root),
        activeNodes: [{ id: node.id, state: 'comparing' }, { id: node.children[i].id, state: 'active' }], activeEdges: [],
        operation: 'TRAVERSE', explanation: `Key ${k} goes to child ${i} of [${node.keys.join(', ')}].`,
        detailedExplanation: 'Navigate to the correct child subtree.', pseudocodeLine: 3,
        comparisons: node.keys.length, assignments: 0, swaps: 0, complexity: 'O(log n)', metadata: {}
      });

      if (node.children[i].keys.length === maxKeys) {
        splitChild(node, i);
        if (k > node.keys[i]) i++;
      }
      insertNonFull(node.children[i], k);
    }
  }

  // Check if root needs splitting
  if (root.keys.length === maxKeys) {
    const newRoot = createBTNode(false);
    newRoot.children.push(root);
    splitChild(newRoot, 0);
    root = newRoot;
    insertNonFull(root, key);
  } else {
    insertNonFull(root, key);
  }

  layoutBT(root);
  states.push({
    id: stateId++, dataStructureState: cloneBT(root), activeNodes: [], activeEdges: [],
    operation: 'INSERT COMPLETE', explanation: `Inserted ${key}. Tree height: ${btHeight(root)}.`,
    detailedExplanation: 'B-tree grows upward (height increases only when root splits).',
    pseudocodeLine: null, comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(log n)', metadata: {}
  });

  return { root, states };
}

const BT_COMPLEXITY: ComplexityInfo = { time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' }, space: 'O(n)' };

// B-Tree SVG Renderer
const BTreeView: React.FC<{ root: BTreeNode | null; activeNodes: { id: string; state: string }[]; width: number; height: number }> = ({ root, activeNodes, width, height }) => {
  if (!root) return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', minHeight: 300 }}>
      <text x={width / 2} y={height / 2} textAnchor="middle" fill="var(--text-muted)" fontSize={14}>Empty B-Tree — insert values to begin</text>
    </svg>
  );

  const stateColors: Record<string, string> = { comparing: '#f59e0b', active: '#6366f1', inserted: '#10b981', highlight: '#fbbf24', error: '#ef4444' };

  function renderEdges(n: BTreeNode): React.ReactNode[] {
    return n.children.flatMap(c => [
      <line key={`e-${n.id}-${c.id}`} x1={n.x} y1={n.y + 20} x2={c.x} y2={c.y - 16} stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />,
      ...renderEdges(c),
    ]);
  }

  function renderNodes(n: BTreeNode): React.ReactNode[] {
    const an = activeNodes.find(a => a.id === n.id);
    const borderColor = an ? stateColors[an.state] || '#4a4a5c' : '#4a4a5c';
    const bg = an ? `${stateColors[an.state]}25` : '#2a2a3d';
    const nodeWidth = Math.max(40, n.keys.length * 30 + 10);
    return [
      ...n.children.flatMap(c => renderNodes(c)),
      <g key={n.id}>
        <rect x={n.x - nodeWidth / 2} y={n.y - 16} width={nodeWidth} height={32} rx={6} fill={bg} stroke={borderColor} strokeWidth={2} />
        {n.keys.map((k, i) => (
          <React.Fragment key={i}>
            <text x={n.x - nodeWidth / 2 + 15 + i * 30} y={n.y} dy="0.35em" textAnchor="middle" fill="#f0f0f5" fontSize={12} fontWeight={700} fontFamily="'JetBrains Mono', monospace">{k}</text>
            {i < n.keys.length - 1 && <line x1={n.x - nodeWidth / 2 + 30 + i * 30} y1={n.y - 12} x2={n.x - nodeWidth / 2 + 30 + i * 30} y2={n.y + 12} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />}
          </React.Fragment>
        ))}
      </g>
    ];
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', minHeight: 300 }}>
      {renderEdges(root)}{renderNodes(root)}
    </svg>
  );
};

export const BTreeVisualizer: React.FC<{ initialOrder?: number }> = ({
  initialOrder = 3,
}) => {
  const [root, setRoot] = useState<BTreeNode | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [order, setOrder] = useState(initialOrder);
  const { currentState, controls, loadStates } = useStateEngine();

  const handleInsert = useCallback(() => {
    const val = parseInt(inputValue.trim());
    if (isNaN(val)) return;
    const { root: r, states } = btInsert(root, val, order);
    setRoot(r); loadStates(states); setInputValue('');
  }, [root, inputValue, order, loadStates]);

  const handleDemo = useCallback(() => {
    btCounter = 0;
    let r: BTreeNode | null = null;
    const allStates: AlgorithmState[] = [];
    for (const v of [10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 35, 15]) {
      const res = btInsert(r, v, order); r = res.root; allStates.push(...res.states);
    }
    setRoot(r); loadStates(allStates);
  }, [order, loadStates]);

  const displayTree = currentState?.dataStructureState || root;
  const treeH = root ? btHeight(root) : 0;

  return (
    <div className="bst-visualizer">
      <TheorySection topicId="b-tree" />
      <div className="viz-header">
        <div className="viz-header-info">
          <span className="viz-badge">Unit 3 — Trees</span>
          <h1 className="viz-title">B-Tree</h1>
          <p className="viz-desc">A generalized balanced multi-way search tree optimized for disk-based storage. Each node can hold multiple keys. When a node overflows, it splits and promotes a key upward.</p>
        </div>
        <div className="viz-stats">
          <div className="viz-stat"><span className="viz-stat-label">Order</span><span className="viz-stat-value font-mono">{order}</span></div>
          <div className="viz-stat"><span className="viz-stat-label">Height</span><span className="viz-stat-value font-mono">{treeH}</span></div>
        </div>
      </div>
      <div className="viz-layout">
        <div className="viz-main">
          <div className="viz-controls-bar">
            <div className="viz-input-group">
              <input type="number" className="viz-input" placeholder="Value..." value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleInsert()} />
              <select className="viz-input" value={order} onChange={e => { setOrder(Number(e.target.value)); btCounter = 0; setRoot(null); loadStates([]); }}>
                <option value={3}>Order 3 (2-3 Tree)</option>
                <option value={4}>Order 4</option>
                <option value={5}>Order 5</option>
              </select>
              <button className="viz-btn viz-btn-insert" onClick={handleInsert}>Insert</button>
              <button className="viz-btn viz-btn-secondary" onClick={handleDemo}>Demo</button>
              <button className="viz-btn viz-btn-ghost" onClick={() => { btCounter = 0; setRoot(null); loadStates([]); }}>Reset</button>
            </div>
          </div>
          <div className="viz-canvas"><BTreeView root={displayTree} activeNodes={currentState?.activeNodes || []} width={600} height={Math.max(300, treeH * 90 + 80)} /></div>
          <AnimationControls controls={controls} operationLabel={currentState?.operation} comparisons={currentState?.comparisons} complexity={currentState?.complexity} />
        </div>
        <div className="viz-sidebar">
          <AlgorithmCodePanel
            codeData={bTreeCodeData}
            currentOperation={currentState?.operation}
            highlightedLine={currentState?.pseudocodeLine}
            defaultLanguage="java"
            showLineNumbers={false}
          />
          <ExplanationPanel state={currentState} stepIndex={controls.currentStep} totalSteps={controls.totalSteps} />
          <ComplexityPanel complexity={BT_COMPLEXITY} title="B-Tree Complexity" />
          <div className="viz-info-panel glass-panel">
            <h4 className="viz-info-title">B-Tree Properties (Order m)</h4>
            <ul className="viz-info-list">
              <li>Each node has at most m children</li>
              <li>Each non-root node has at least ⌈m/2⌉ children</li>
              <li>Root has at least 2 children (if non-leaf)</li>
              <li>All leaves at the same depth</li>
              <li>A node with k children has k-1 keys</li>
            </ul>
            <h4 className="viz-info-title" style={{ marginTop: 'var(--space-3)' }}>Why B-Trees?</h4>
            <p className="viz-info-text">B-Trees minimize disk I/O by keeping the tree shallow. Each node holds many keys, reducing the number of disk reads needed to find a key.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
