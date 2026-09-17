/* ============================================
   Red-Black Tree Visualizer
   ============================================ */

import React, { useState, useCallback } from 'react';
import { AnimationControls } from '../../components/visualization/AnimationControls';
import { ExplanationPanel } from '../../components/visualization/ExplanationPanel';
import { ComplexityPanel } from '../../components/visualization/ComplexityPanel';
import { AlgorithmCodePanel } from '../../components/visualization/AlgorithmCodePanel';
import { TheorySection } from '../../components/visualization/TheorySection';
import { useStateEngine } from '../../hooks/useStateEngine';
import { redBlackCodeData } from '../../data/algorithmCodeData';
import type { AlgorithmState, ComplexityInfo } from '../../types';
import '../trees/BSTVisualizer.css';

// Red-Black Tree Node
interface RBNode {
  id: string;
  value: number;
  color: 'red' | 'black';
  left: RBNode | null;
  right: RBNode | null;
  parent: RBNode | null;
  x: number;
  y: number;
}

const NIL_NODE: RBNode = { id: 'nil', value: -1, color: 'black', left: null, right: null, parent: null, x: 0, y: 0 };

let rbCounter = 0;
function createRBNode(value: number, color: 'red' | 'black' = 'red'): RBNode {
  return { id: `rb-${rbCounter++}`, value, color, left: null, right: null, parent: null, x: 0, y: 0 };
}

function cloneRB(n: RBNode | null): RBNode | null {
  if (!n || n === NIL_NODE) return null;
  return { ...n, left: cloneRB(n.left), right: cloneRB(n.right), parent: null };
}

function layoutRB(node: RBNode | null, depth: number = 0, pos: number = 300, spread: number = 200): void {
  if (!node) return;
  node.x = pos; node.y = depth * 70 + 50;
  const cs = spread * 0.55;
  layoutRB(node.left, depth + 1, pos - spread / 2, cs);
  layoutRB(node.right, depth + 1, pos + spread / 2, cs);
}

function getHeight(n: RBNode | null): number {
  if (!n) return 0;
  return 1 + Math.max(getHeight(n.left), getHeight(n.right));
}

function countNodes(n: RBNode | null): number {
  if (!n) return 0;
  return 1 + countNodes(n.left) + countNodes(n.right);
}

// Simplified RB insert with recoloring and rotation snapshots
function rbInsert(root: RBNode | null, value: number): { root: RBNode; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let stateId = 0;

  // BST insert first
  function bstInsert(node: RBNode | null, val: number, parent: RBNode | null): RBNode {
    if (!node) {
      const newNode = createRBNode(val, 'red');
      newNode.parent = parent;
      return newNode;
    }
    if (val < node.value) {
      node.left = bstInsert(node.left, val, node);
    } else if (val > node.value) {
      node.right = bstInsert(node.right, val, node);
    }
    return node;
  }

  if (!root) {
    root = createRBNode(value, 'black');
    layoutRB(root);
    states.push({ id: stateId++, dataStructureState: cloneRB(root), activeNodes: [{ id: root.id, state: 'inserted' }], activeEdges: [],
      operation: 'INSERT ROOT', explanation: `Insert ${value} as root. Color: BLACK (root is always black).`,
      detailedExplanation: 'Property: Root is always black.',
      pseudocodeLine: 0, comparisons: 0, assignments: 1, swaps: 0, complexity: 'O(log n)', metadata: {} });
    return { root, states };
  }

  // Start state
  layoutRB(root);
  states.push({ id: stateId++, dataStructureState: cloneRB(root), activeNodes: [], activeEdges: [],
    operation: 'START INSERT', explanation: `Inserting ${value} into Red-Black tree.`,
    detailedExplanation: 'Step 1: BST insert as RED node. Step 2: Fix violations.',
    pseudocodeLine: 0, comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(log n)', metadata: {} });

  // BST insert
  root = bstInsert(root, value, null);
  layoutRB(root);

  states.push({ id: stateId++, dataStructureState: cloneRB(root), activeNodes: [], activeEdges: [],
    operation: 'BST INSERT', explanation: `Inserted ${value} as RED leaf (BST order maintained).`,
    detailedExplanation: 'New nodes are always inserted as RED to minimize black-height violations.',
    pseudocodeLine: 2, comparisons: 0, assignments: 1, swaps: 0, complexity: 'O(log n)', metadata: {} });

  // Fix-up: simplified approach - find violation and show recoloring/rotation concept
  function findNode(node: RBNode | null, val: number): RBNode | null {
    if (!node) return null;
    if (node.value === val) return node;
    return val < node.value ? findNode(node.left, val) : findNode(node.right, val);
  }

  function findParent(node: RBNode | null, val: number): RBNode | null {
    if (!node) return null;
    if ((node.left && node.left.value === val) || (node.right && node.right.value === val)) return node;
    return val < node.value ? findParent(node.left, val) : findParent(node.right, val);
  }

  const inserted = findNode(root, value);
  const parent = findParent(root, value);

  if (parent && parent.color === 'red') {
    const grandparent = findParent(root, parent.value);
    if (grandparent) {
      const uncle = grandparent.left === parent ? grandparent.right : grandparent.left;
      const uncleColor = uncle?.color || 'black';

      states.push({ id: stateId++, dataStructureState: cloneRB(root),
        activeNodes: [
          { id: inserted!.id, state: 'error' },
          { id: parent.id, state: 'error' },
        ], activeEdges: [],
        operation: 'VIOLATION DETECTED',
        explanation: `Red-Red violation! Node ${value} and parent ${parent.value} are both RED.`,
        detailedExplanation: 'RB Property: No red node can have a red child.',
        pseudocodeLine: 4, comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(log n)',
        metadata: { uncleColor } });

      if (uncleColor === 'red') {
        // Case 1: Recolor
        parent.color = 'black';
        if (uncle) uncle.color = 'black';
        if (grandparent !== root) grandparent.color = 'red';

        layoutRB(root);
        states.push({ id: stateId++, dataStructureState: cloneRB(root),
          activeNodes: [
            { id: parent.id, state: 'success' },
            { id: grandparent.id, state: grandparent === root ? 'success' : 'comparing' },
          ], activeEdges: [],
          operation: 'RECOLOR (Case 1)',
          explanation: `Uncle is RED → Recolor: parent=${parent.value}→BLACK, uncle→BLACK, grandparent=${grandparent.value}→${grandparent === root ? 'BLACK(root)' : 'RED'}.`,
          detailedExplanation: 'When uncle is red, recoloring is sufficient. Push the "redness" upward.',
          pseudocodeLine: 6, comparisons: 0, assignments: 3, swaps: 0, complexity: 'O(log n)', metadata: {} });
      } else {
        // Case 2/3: Rotation
        const isLeftChild = grandparent.left === parent;
        const isLeftInsert = parent.left === inserted;

        if (isLeftChild && isLeftInsert) {
          // LL → right rotate grandparent, swap colors
          states.push({ id: stateId++, dataStructureState: cloneRB(root),
            activeNodes: [{ id: grandparent.id, state: 'highlight' }, { id: parent.id, state: 'active' }], activeEdges: [],
            operation: 'LL CASE → RIGHT ROTATE + RECOLOR',
            explanation: `LL case: Right-rotate at ${grandparent.value}, swap colors of ${parent.value} and ${grandparent.value}.`,
            detailedExplanation: 'Similar to AVL LL rotation, but with color swaps instead of height updates.',
            pseudocodeLine: 8, comparisons: 0, assignments: 4, swaps: 0, complexity: 'O(1)', metadata: {} });
          // Perform rotation
          grandparent.left = parent.right;
          parent.right = grandparent;
          parent.color = 'black';
          grandparent.color = 'red';
          // Reattach
          const gp = findParent(root, grandparent.value);
          if (gp) { if (gp.left === grandparent) gp.left = parent; else gp.right = parent; }
          else root = parent;
        } else if (!isLeftChild && !isLeftInsert) {
          // RR → left rotate grandparent, swap colors
          states.push({ id: stateId++, dataStructureState: cloneRB(root),
            activeNodes: [{ id: grandparent.id, state: 'highlight' }, { id: parent.id, state: 'active' }], activeEdges: [],
            operation: 'RR CASE → LEFT ROTATE + RECOLOR',
            explanation: `RR case: Left-rotate at ${grandparent.value}, swap colors.`,
            detailedExplanation: 'Mirror of LL case.',
            pseudocodeLine: 10, comparisons: 0, assignments: 4, swaps: 0, complexity: 'O(1)', metadata: {} });
          grandparent.right = parent.left;
          parent.left = grandparent;
          parent.color = 'black';
          grandparent.color = 'red';
          const gp = findParent(root, grandparent.value);
          if (gp) { if (gp.left === grandparent) gp.left = parent; else gp.right = parent; }
          else root = parent;
        } else if (isLeftChild && !isLeftInsert) {
          // LR → left rotate parent, then right rotate grandparent
          states.push({ id: stateId++, dataStructureState: cloneRB(root),
            activeNodes: [{ id: grandparent.id, state: 'highlight' }, { id: parent.id, state: 'active' }, { id: inserted!.id, state: 'comparing' }], activeEdges: [],
            operation: 'LR CASE → LEFT-RIGHT ROTATE + RECOLOR',
            explanation: `LR case: Left-rotate at ${parent.value}, then right-rotate at ${grandparent.value}, recolor.`,
            detailedExplanation: 'Double rotation similar to AVL LR case, with color adjustments.',
            pseudocodeLine: 12, comparisons: 0, assignments: 6, swaps: 0, complexity: 'O(1)', metadata: {} });
          // Left rotate parent
          parent.right = inserted!.left;
          inserted!.left = parent;
          grandparent.left = inserted;
          // Right rotate grandparent
          grandparent.left = inserted!.right;
          inserted!.right = grandparent;
          inserted!.color = 'black';
          grandparent.color = 'red';
          const gp = findParent(root, grandparent.value);
          if (gp) { if (gp.left === grandparent) gp.left = inserted; else gp.right = inserted; }
          else root = inserted!;
        } else {
          // RL → right rotate parent, then left rotate grandparent
          states.push({ id: stateId++, dataStructureState: cloneRB(root),
            activeNodes: [{ id: grandparent.id, state: 'highlight' }, { id: parent.id, state: 'active' }, { id: inserted!.id, state: 'comparing' }], activeEdges: [],
            operation: 'RL CASE → RIGHT-LEFT ROTATE + RECOLOR',
            explanation: `RL case: Right-rotate at ${parent.value}, then left-rotate at ${grandparent.value}, recolor.`,
            detailedExplanation: 'Mirror of LR case.',
            pseudocodeLine: 14, comparisons: 0, assignments: 6, swaps: 0, complexity: 'O(1)', metadata: {} });
          parent.left = inserted!.right;
          inserted!.right = parent;
          grandparent.right = inserted;
          grandparent.right = inserted!.left;
          inserted!.left = grandparent;
          inserted!.color = 'black';
          grandparent.color = 'red';
          const gp = findParent(root, grandparent.value);
          if (gp) { if (gp.left === grandparent) gp.left = inserted; else gp.right = inserted; }
          else root = inserted!;
        }
      }
    }
  }

  // Ensure root is black
  root.color = 'black';
  layoutRB(root);

  states.push({ id: stateId++, dataStructureState: cloneRB(root), activeNodes: [], activeEdges: [],
    operation: 'INSERT COMPLETE', explanation: `Inserted ${value}. Nodes: ${countNodes(root)}, Height: ${getHeight(root)}.`,
    detailedExplanation: 'All 5 Red-Black properties are maintained.',
    pseudocodeLine: null, comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(log n)', metadata: {} });

  return { root, states };
}

const RB_COMPLEXITY: ComplexityInfo = { time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' }, space: 'O(n)' };

// RB Tree SVG Renderer
const RBTreeView: React.FC<{ root: RBNode | null; activeNodes: { id: string; state: string }[]; width: number; height: number }> = ({ root, activeNodes, width, height }) => {
  if (!root) return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', minHeight: 350 }}>
      <text x={width / 2} y={height / 2} textAnchor="middle" fill="var(--text-muted)" fontSize={14}>Empty tree — insert values to begin</text>
    </svg>
  );

  function renderEdges(n: RBNode | null): React.ReactNode[] {
    if (!n) return [];
    const r: React.ReactNode[] = [];
    if (n.left) { r.push(<line key={`e-${n.id}-l`} x1={n.x} y1={n.y + 20} x2={n.left.x} y2={n.left.y - 20} stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />); r.push(...renderEdges(n.left)); }
    if (n.right) { r.push(<line key={`e-${n.id}-r`} x1={n.x} y1={n.y + 20} x2={n.right.x} y2={n.right.y - 20} stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />); r.push(...renderEdges(n.right)); }
    return r;
  }

  function renderNodes(n: RBNode | null): React.ReactNode[] {
    if (!n) return [];
    const r: React.ReactNode[] = [];
    r.push(...renderNodes(n.left)); r.push(...renderNodes(n.right));
    const an = activeNodes.find(a => a.id === n.id);
    const stateStroke = an ? (an.state === 'error' ? '#ef4444' : an.state === 'success' ? '#10b981' : an.state === 'highlight' ? '#fbbf24' : an.state === 'active' ? '#6366f1' : '') : '';
    const fill = n.color === 'red' ? '#dc2626' : '#1e1e2e';
    const stroke = stateStroke || (n.color === 'red' ? '#ef4444' : '#6b7280');
    r.push(
      <g key={n.id}>
        {an && <circle cx={n.x} cy={n.y} r={26} fill="none" stroke={stroke} strokeWidth={1} opacity={0.4} />}
        <circle cx={n.x} cy={n.y} r={20} fill={fill} stroke={stroke} strokeWidth={2.5} />
        <text x={n.x} y={n.y} dy="0.35em" textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700} fontFamily="'JetBrains Mono', monospace">{n.value}</text>
        <text x={n.x} y={n.y + 30} textAnchor="middle" fill={n.color === 'red' ? '#ef4444' : '#6b7280'} fontSize={9} fontWeight={600}>{n.color.toUpperCase()}</text>
      </g>
    );
    return r;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', minHeight: 350 }}>
      {renderEdges(root)}{renderNodes(root)}
    </svg>
  );
};

export const RedBlackVisualizer: React.FC = () => {
  const [root, setRoot] = useState<RBNode | null>(null);
  const [inputValue, setInputValue] = useState('');
  const { currentState, controls, loadStates } = useStateEngine();

  const handleInsert = useCallback(() => {
    const val = parseInt(inputValue.trim());
    if (isNaN(val)) return;
    const { root: r, states } = rbInsert(root, val);
    setRoot(r); loadStates(states); setInputValue('');
  }, [root, inputValue, loadStates]);

  const handleDemo = useCallback(() => {
    rbCounter = 0;
    let r: RBNode | null = null;
    const allStates: AlgorithmState[] = [];
    for (const v of [10, 20, 30, 15, 25, 5, 35]) {
      const res = rbInsert(r, v); r = res.root; allStates.push(...res.states);
    }
    setRoot(r); loadStates(allStates);
  }, [loadStates]);

  const treeH = root ? getHeight(root) : 0;
  const displayTree = currentState?.dataStructureState || root;

  return (
    <div className="bst-visualizer">
      <TheorySection topicId="red-black" />
      <div className="viz-header">
        <div className="viz-header-info">
          <span className="viz-badge">Unit 3 — Trees</span>
          <h1 className="viz-title">Red-Black Tree</h1>
          <p className="viz-desc">A self-balancing BST where each node is colored RED or BLACK. Recoloring and rotations maintain 5 key properties guaranteeing O(log n) operations.</p>
        </div>
        <div className="viz-stats">
          <div className="viz-stat"><span className="viz-stat-label">Nodes</span><span className="viz-stat-value font-mono">{root ? countNodes(root) : 0}</span></div>
          <div className="viz-stat"><span className="viz-stat-label">Height</span><span className="viz-stat-value font-mono">{treeH}</span></div>
        </div>
      </div>
      <div className="viz-layout">
        <div className="viz-main">
          <div className="viz-controls-bar">
            <div className="viz-input-group">
              <input type="number" className="viz-input" placeholder="Value..." value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleInsert()} />
              <button className="viz-btn viz-btn-insert" onClick={handleInsert}>Insert</button>
              <button className="viz-btn viz-btn-secondary" onClick={handleDemo}>Demo</button>
              <button className="viz-btn viz-btn-ghost" onClick={() => { rbCounter = 0; setRoot(null); loadStates([]); }}>Reset</button>
            </div>
          </div>
          <div className="viz-canvas"><RBTreeView root={displayTree} activeNodes={currentState?.activeNodes || []} width={600} height={Math.max(350, treeH * 80 + 80)} /></div>
          <AnimationControls controls={controls} operationLabel={currentState?.operation} comparisons={currentState?.comparisons} complexity={currentState?.complexity} />
        </div>
        <div className="viz-sidebar">
          <AlgorithmCodePanel
            codeData={redBlackCodeData}
            currentOperation={currentState?.operation}
            highlightedLine={currentState?.pseudocodeLine}
            defaultLanguage="java"
            showLineNumbers={false}
          />
          <ExplanationPanel state={currentState} stepIndex={controls.currentStep} totalSteps={controls.totalSteps} />
          <ComplexityPanel complexity={RB_COMPLEXITY} title="Red-Black Complexity" />
          <div className="viz-info-panel glass-panel">
            <h4 className="viz-info-title">5 RB Properties</h4>
            <ol className="viz-info-list" style={{ paddingLeft: 'var(--space-4)' }}>
              <li>Every node is RED or BLACK</li>
              <li>Root is always BLACK</li>
              <li>Every NIL leaf is BLACK</li>
              <li>RED node → both children BLACK</li>
              <li>All paths from a node to NIL have equal black nodes</li>
            </ol>
            <h4 className="viz-info-title" style={{ marginTop: 'var(--space-3)' }}>AVL vs Red-Black</h4>
            <ul className="viz-info-list">
              <li>AVL: stricter balance, faster lookups</li>
              <li>RB: fewer rotations on insert/delete</li>
              <li>RB used in: Java TreeMap, C++ std::map, Linux kernel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
