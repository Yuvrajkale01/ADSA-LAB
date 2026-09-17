/* ============================================
   Trie Visualizer — Standard, Compressed, Suffix
   ============================================ */

import React, { useState, useCallback } from 'react';
import { AnimationControls } from '../../components/visualization/AnimationControls';
import { ExplanationPanel } from '../../components/visualization/ExplanationPanel';
import { ComplexityPanel } from '../../components/visualization/ComplexityPanel';
import { TheorySection } from '../../components/visualization/TheorySection';
import { useStateEngine } from '../../hooks/useStateEngine';
import type { AlgorithmState, ComplexityInfo } from '../../types';
import '../trees/BSTVisualizer.css';

interface TrieNode { id: string; char: string; children: TrieNode[]; isEnd: boolean; x: number; y: number; }

let trieCounter = 0;
function createTrieNode(char: string): TrieNode {
  return { id: `trie-${trieCounter++}`, char, children: [], isEnd: false, x: 0, y: 0 };
}

function cloneTrie(n: TrieNode): TrieNode {
  return { ...n, children: n.children.map(c => cloneTrie(c)) };
}

function layoutTrie(node: TrieNode, depth: number = 0, pos: number = 300, spread: number = 300): void {
  node.x = pos; node.y = depth * 55 + 40;
  const childSpread = spread / Math.max(1, node.children.length);
  const startX = pos - spread / 2 + childSpread / 2;
  node.children.forEach((child, i) => layoutTrie(child, depth + 1, startX + i * childSpread, childSpread * 0.8));
}

function trieInsert(root: TrieNode, word: string): { root: TrieNode; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let id = 0;
  let current = root;

  states.push({ id: id++, dataStructureState: cloneTrie(root), activeNodes: [{ id: root.id, state: 'active' }], activeEdges: [],
    operation: 'INSERT', explanation: `Inserting "${word}" into trie.`,
    detailedExplanation: 'Traverse character by character, creating nodes as needed.',
    pseudocodeLine: 0, comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(m)', metadata: { word } });

  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    let child = current.children.find(c => c.char === ch);
    if (child) {
      states.push({ id: id++, dataStructureState: cloneTrie(root), activeNodes: [{ id: child.id, state: 'comparing' }], activeEdges: [],
        operation: 'TRAVERSE', explanation: `'${ch}' exists at depth ${i + 1}. Follow existing path.`,
        detailedExplanation: 'Character already in trie, no new node needed.',
        pseudocodeLine: 2, comparisons: i + 1, assignments: 0, swaps: 0, complexity: 'O(m)', metadata: {} });
    } else {
      child = createTrieNode(ch);
      current.children.push(child);
      current.children.sort((a, b) => a.char.localeCompare(b.char));
      layoutTrie(root, 0, 300, 350);
      states.push({ id: id++, dataStructureState: cloneTrie(root), activeNodes: [{ id: child.id, state: 'inserted' }], activeEdges: [],
        operation: 'CREATE NODE', explanation: `'${ch}' not found. Created new node at depth ${i + 1}.`,
        detailedExplanation: 'New branch in the trie for this character.',
        pseudocodeLine: 4, comparisons: i + 1, assignments: 1, swaps: 0, complexity: 'O(m)', metadata: {} });
    }
    current = child;
  }

  current.isEnd = true;
  layoutTrie(root, 0, 300, 350);
  states.push({ id: id++, dataStructureState: cloneTrie(root), activeNodes: [{ id: current.id, state: 'success' }], activeEdges: [],
    operation: 'MARK END', explanation: `Marked '${current.char}' as end of word "${word}".`,
    detailedExplanation: 'The isEnd flag distinguishes complete words from prefixes.',
    pseudocodeLine: 6, comparisons: 0, assignments: 1, swaps: 0, complexity: 'O(m)', metadata: {} });

  return { root, states };
}

function trieSearch(root: TrieNode, word: string): AlgorithmState[] {
  const states: AlgorithmState[] = [];
  let id = 0, current: TrieNode | undefined = root;

  states.push({ id: id++, dataStructureState: cloneTrie(root), activeNodes: [{ id: root.id, state: 'active' }], activeEdges: [],
    operation: 'SEARCH', explanation: `Searching for "${word}".`, detailedExplanation: 'Follow characters from root.',
    pseudocodeLine: 0, comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(m)', metadata: {} });

  for (let i = 0; i < word.length; i++) {
    const child: TrieNode | undefined = current?.children.find(c => c.char === word[i]);
    if (!child) {
      states.push({ id: id++, dataStructureState: cloneTrie(root), activeNodes: [], activeEdges: [],
        operation: 'NOT FOUND', explanation: `'${word[i]}' not found at depth ${i + 1}. "${word}" does not exist.`,
        detailedExplanation: 'No path for this character — word not in trie.', pseudocodeLine: null,
        comparisons: i + 1, assignments: 0, swaps: 0, complexity: 'O(m)', metadata: {} });
      return states;
    }
    states.push({ id: id++, dataStructureState: cloneTrie(root), activeNodes: [{ id: child.id, state: 'comparing' }], activeEdges: [],
      operation: 'MATCH', explanation: `Found '${word[i]}' at depth ${i + 1}.`, detailedExplanation: 'Continue to next character.',
      pseudocodeLine: 2, comparisons: i + 1, assignments: 0, swaps: 0, complexity: 'O(m)', metadata: {} });
    current = child;
  }

  const found = current?.isEnd || false;
  states.push({ id: id++, dataStructureState: cloneTrie(root), activeNodes: [{ id: current!.id, state: found ? 'success' : 'error' }], activeEdges: [],
    operation: found ? 'FOUND' : 'PREFIX ONLY',
    explanation: found ? `"${word}" found in trie!` : `"${word}" is a prefix but not a complete word.`,
    detailedExplanation: found ? 'All characters matched and isEnd = true.' : 'Path exists but isEnd = false.',
    pseudocodeLine: null, comparisons: word.length, assignments: 0, swaps: 0, complexity: 'O(m)', metadata: {} });

  return states;
}

const TRIE_COMPLEXITY: ComplexityInfo = { time: { best: 'O(m)', average: 'O(m)', worst: 'O(m)' }, space: 'O(ALPHABET × m × n)' };

const TrieTreeView: React.FC<{ root: TrieNode; activeNodes: { id: string; state: string }[]; width: number; height: number }> = ({ root, activeNodes, width, height }) => {
  const stateColors: Record<string, { fill: string; stroke: string }> = {
    normal: { fill: '#2a2a3d', stroke: '#4a4a5c' }, active: { fill: '#6366f1', stroke: '#818cf8' },
    comparing: { fill: '#f59e0b', stroke: '#d97706' }, inserted: { fill: '#10b981', stroke: '#059669' },
    success: { fill: '#10b981', stroke: '#059669' }, error: { fill: '#ef4444', stroke: '#dc2626' },
  };

  function renderEdges(node: TrieNode): React.ReactNode[] {
    return node.children.flatMap(child => [
      <line key={`e-${node.id}-${child.id}`} x1={node.x} y1={node.y + 14} x2={child.x} y2={child.y - 14} stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />,
      ...renderEdges(child),
    ]);
  }

  function renderNodes(node: TrieNode): React.ReactNode[] {
    const an = activeNodes.find(a => a.id === node.id);
    const s = an?.state || 'normal';
    const c = stateColors[s] || stateColors.normal;
    return [
      ...node.children.flatMap(ch => renderNodes(ch)),
      <g key={node.id}>
        {node.isEnd && <circle cx={node.x} cy={node.y} r={18} fill="none" stroke="#10b981" strokeWidth={2} strokeDasharray="3 2" />}
        <circle cx={node.x} cy={node.y} r={14} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
        <text x={node.x} y={node.y} dy="0.35em" textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700} fontFamily="'JetBrains Mono', monospace">
          {node.char === '' ? '⊙' : node.char}
        </text>
      </g>
    ];
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', minHeight: 300 }}>
      {renderEdges(root)}
      {renderNodes(root)}
    </svg>
  );
};

export const TrieVisualizer: React.FC = () => {
  const [root, setRoot] = useState<TrieNode>(() => { const r = createTrieNode(''); layoutTrie(r); return r; });
  const [inputWord, setInputWord] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const { currentState, controls, loadStates } = useStateEngine();

  const handleInsert = useCallback(() => {
    const w = inputWord.trim().toLowerCase();
    if (!w) return;
    const { root: r, states } = trieInsert(root, w);
    setRoot({ ...r }); setWords(prev => [...new Set([...prev, w])]); loadStates(states); setInputWord('');
  }, [root, inputWord, loadStates]);

  const handleSearch = useCallback(() => {
    const w = inputWord.trim().toLowerCase();
    if (!w) return;
    const states = trieSearch(root, w);
    loadStates(states);
  }, [root, inputWord, loadStates]);

  const handleDemo = useCallback(() => {
    trieCounter = 0;
    let r = createTrieNode('');
    const demoWords = ['the', 'their', 'there', 'them', 'then', 'this', 'thin', 'ten', 'tea'];
    const allStates: AlgorithmState[] = [];
    for (const w of demoWords) { const res = trieInsert(r, w); r = res.root; allStates.push(...res.states); }
    setRoot({ ...r }); setWords(demoWords); loadStates(allStates);
  }, [loadStates]);

  const handleReset = useCallback(() => {
    trieCounter = 0; const r = createTrieNode(''); layoutTrie(r);
    setRoot(r); setWords([]); loadStates([]);
  }, [loadStates]);

  const displayRoot = currentState?.dataStructureState || root;

  return (
    <div className="bst-visualizer">
      <TheorySection topicId="standard-trie" />
      <div className="viz-header">
        <div className="viz-header-info">
          <span className="viz-badge">Unit 5 — Text Processing</span>
          <h1 className="viz-title">Standard Trie</h1>
          <p className="viz-desc">A trie stores strings character-by-character. Each node represents a character, paths from root to marked nodes form words. Insert and search words to see the trie grow.</p>
        </div>
        <div className="viz-stats">
          <div className="viz-stat"><span className="viz-stat-label">Words</span><span className="viz-stat-value font-mono">{words.length}</span></div>
        </div>
      </div>
      <div className="viz-layout">
        <div className="viz-main">
          <div className="viz-controls-bar">
            <div className="viz-input-group">
              <input type="text" className="viz-input" placeholder="Enter word..." value={inputWord} onChange={e => setInputWord(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleInsert()} />
              <button className="viz-btn viz-btn-insert" onClick={handleInsert}>Insert</button>
              <button className="viz-btn viz-btn-search" onClick={handleSearch}>Search</button>
              <button className="viz-btn viz-btn-secondary" onClick={handleDemo}>Demo</button>
              <button className="viz-btn viz-btn-ghost" onClick={handleReset}>Reset</button>
            </div>
          </div>
          {words.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', padding: 'var(--space-2) 0' }}>
              {words.map(w => (<span key={w} className="font-mono" style={{ fontSize: '11px', padding: '2px 6px', background: 'var(--accent-primary-muted)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>{w}</span>))}
            </div>
          )}
          <div className="viz-canvas"><TrieTreeView root={displayRoot} activeNodes={currentState?.activeNodes || []} width={600} height={380} /></div>
          <AnimationControls controls={controls} operationLabel={currentState?.operation} comparisons={currentState?.comparisons} complexity={currentState?.complexity} />
        </div>
        <div className="viz-sidebar">
          <ExplanationPanel state={currentState} stepIndex={controls.currentStep} totalSteps={controls.totalSteps} />
          <ComplexityPanel complexity={TRIE_COMPLEXITY} title="Trie Complexity" />
          <div className="viz-info-panel glass-panel">
            <h4 className="viz-info-title">Trie Properties</h4>
            <ul className="viz-info-list">
              <li>Search time depends on word length (m), not number of words (n)</li>
              <li>Dashed circle = end of a complete word</li>
              <li>Prefix sharing reduces space</li>
              <li>Supports autocomplete naturally</li>
            </ul>
            <h4 className="viz-info-title" style={{ marginTop: 'var(--space-3)' }}>Real-World Uses</h4>
            <ul className="viz-info-list"><li>Autocomplete / type-ahead</li><li>Spell checkers</li><li>IP routing tables</li><li>DNA sequence matching</li></ul>
          </div>
        </div>
      </div>
    </div>
  );
};
