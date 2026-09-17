/* ============================================
   Huffman Coding Visualizer
   ============================================ */

import React, { useState, useCallback } from 'react';
import { AnimationControls } from '../../components/visualization/AnimationControls';
import { ExplanationPanel } from '../../components/visualization/ExplanationPanel';
import { PseudocodeViewer } from '../../components/visualization/PseudocodeViewer';
import { ComplexityPanel } from '../../components/visualization/ComplexityPanel';
import { TheorySection } from '../../components/visualization/TheorySection';
import { useStateEngine } from '../../hooks/useStateEngine';
import { buildHuffmanTree, getFrequencyTable, huffmanPseudocode } from '../../algorithms/text/Huffman';
import type { HuffmanNode } from '../../algorithms/text/Huffman';
import type { ComplexityInfo } from '../../types';
import './HuffmanVisualizer.css';

const HUFFMAN_COMPLEXITY: ComplexityInfo = {
  time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
  space: 'O(n)',
};

// Huffman tree SVG renderer
const HuffmanTreeView: React.FC<{ root: HuffmanNode | null; width: number; height: number }> = ({ root, width, height }) => {
  if (!root) {
    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', minHeight: 250 }}>
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="var(--text-muted)" fontSize={14}>
          Enter text and click Build to create the Huffman tree
        </text>
      </svg>
    );
  }

  function renderEdges(node: HuffmanNode | null): React.ReactNode[] {
    if (!node) return [];
    const result: React.ReactNode[] = [];
    if (node.left) {
      result.push(
        <g key={`e-${node.id}-l`}>
          <line x1={node.x} y1={node.y + 16} x2={node.left.x} y2={node.left.y - 16}
            stroke="rgba(99,102,241,0.4)" strokeWidth={1.5} />
          <text x={(node.x + node.left.x) / 2 - 8} y={(node.y + node.left.y) / 2}
            fill="var(--state-success)" fontSize={11} fontWeight={700} fontFamily="'JetBrains Mono', monospace">0</text>
        </g>
      );
      result.push(...renderEdges(node.left));
    }
    if (node.right) {
      result.push(
        <g key={`e-${node.id}-r`}>
          <line x1={node.x} y1={node.y + 16} x2={node.right.x} y2={node.right.y - 16}
            stroke="rgba(99,102,241,0.4)" strokeWidth={1.5} />
          <text x={(node.x + node.right.x) / 2 + 4} y={(node.y + node.right.y) / 2}
            fill="var(--state-comparing)" fontSize={11} fontWeight={700} fontFamily="'JetBrains Mono', monospace">1</text>
        </g>
      );
      result.push(...renderEdges(node.right));
    }
    return result;
  }

  function renderNodes(node: HuffmanNode | null): React.ReactNode[] {
    if (!node) return [];
    const result: React.ReactNode[] = [];
    result.push(...renderNodes(node.left));
    result.push(...renderNodes(node.right));

    const isLeaf = node.char !== null;
    const fill = isLeaf ? '#6366f1' : '#2a2a3d';
    const stroke = isLeaf ? '#818cf8' : '#4a4a5c';

    result.push(
      <g key={node.id}>
        <circle cx={node.x} cy={node.y} r={isLeaf ? 18 : 14} fill={fill} stroke={stroke} strokeWidth={2} />
        {isLeaf ? (
          <>
            <text x={node.x} y={node.y - 3} dy="0" textAnchor="middle" fill="#fff"
              fontSize={12} fontWeight={700} fontFamily="'JetBrains Mono', monospace">
              '{node.char}'
            </text>
            <text x={node.x} y={node.y + 10} textAnchor="middle" fill="rgba(255,255,255,0.7)"
              fontSize={9} fontFamily="'JetBrains Mono', monospace">{node.freq}</text>
          </>
        ) : (
          <text x={node.x} y={node.y} dy="0.35em" textAnchor="middle" fill="var(--text-secondary)"
            fontSize={10} fontFamily="'JetBrains Mono', monospace">{node.freq}</text>
        )}
      </g>
    );
    return result;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', minHeight: 300 }}>
      {renderEdges(root)}
      {renderNodes(root)}
    </svg>
  );
};

export const HuffmanVisualizer: React.FC = () => {
  const [inputText, setInputText] = useState('ABRACADABRA');
  const [root, setRoot] = useState<HuffmanNode | null>(null);
  const [codeTable, setCodeTable] = useState<Map<string, string>>(new Map());
  const { currentState, controls, loadStates } = useStateEngine();

  const handleBuild = useCallback(() => {
    if (!inputText.trim()) return;
    const { root: r, states, codeTable: ct } = buildHuffmanTree(inputText);
    setRoot(r);
    setCodeTable(ct);
    loadStates(states);
  }, [inputText, loadStates]);

  const freq = getFrequencyTable(inputText);
  const originalBits = inputText.length * 8;
  const encodedBits = inputText.split('').reduce((sum, ch) => sum + (codeTable.get(ch)?.length || 0), 0);

  return (
    <div className="huffman-viz">
      <TheorySection topicId="huffman" />
      <div className="viz-header">
        <div className="viz-header-info">
          <span className="viz-badge">Unit 5 — Text Processing</span>
          <h1 className="viz-title">Huffman Coding</h1>
          <p className="viz-desc">
            A greedy algorithm for lossless data compression. Characters with higher frequency get shorter codes.
            Watch the tree build step by step as it merges the two lowest-frequency nodes.
          </p>
        </div>
      </div>

      <div className="viz-layout">
        <div className="viz-main">
          <div className="viz-controls-bar">
            <div className="viz-input-group" style={{ flex: 1 }}>
              <input type="text" className="viz-input viz-input-wide font-mono"
                placeholder="Enter text to compress..."
                value={inputText} onChange={e => setInputText(e.target.value.toUpperCase())} />
              <button className="viz-btn viz-btn-insert" onClick={handleBuild}>Build Tree</button>
              <button className="viz-btn viz-btn-ghost" onClick={() => { setRoot(null); setCodeTable(new Map()); loadStates([]); }}>Reset</button>
            </div>
          </div>

          {/* Frequency table */}
          <div className="huffman-freq-bar glass-panel">
            <span className="huffman-freq-label">Frequencies:</span>
            {Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).map(([ch, f]) => (
              <div key={ch} className="huffman-freq-item">
                <span className="huffman-freq-char font-mono">'{ch}'</span>
                <span className="huffman-freq-count font-mono">{f}</span>
              </div>
            ))}
          </div>

          <div className="viz-canvas">
            <HuffmanTreeView root={root} width={600} height={380} />
          </div>

          <AnimationControls controls={controls} operationLabel={currentState?.operation}
            comparisons={currentState?.comparisons} complexity={currentState?.complexity} />
        </div>

        <div className="viz-sidebar">
          <ExplanationPanel state={currentState} stepIndex={controls.currentStep} totalSteps={controls.totalSteps} />
          <PseudocodeViewer lines={huffmanPseudocode} highlightedLine={currentState?.pseudocodeLine ?? null} title="Huffman Algorithm" />

          {/* Code table */}
          {codeTable.size > 0 && (
            <div className="viz-info-panel glass-panel">
              <h4 className="viz-info-title">Code Table</h4>
              <div className="huffman-code-table">
                {Array.from(codeTable.entries()).sort((a, b) => a[1].length - b[1].length).map(([ch, code]) => (
                  <div key={ch} className="huffman-code-row">
                    <span className="font-mono" style={{ color: 'var(--text-primary)' }}>'{ch}'</span>
                    <span className="font-mono" style={{ color: 'var(--accent-primary)' }}>{code}</span>
                    <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{code.length} bits</span>
                  </div>
                ))}
              </div>
              <div className="huffman-compression-stats">
                <div className="huffman-stat-row">
                  <span>Original (ASCII)</span>
                  <span className="font-mono">{originalBits} bits</span>
                </div>
                <div className="huffman-stat-row">
                  <span>Huffman encoded</span>
                  <span className="font-mono" style={{ color: 'var(--state-success)' }}>{encodedBits} bits</span>
                </div>
                <div className="huffman-stat-row" style={{ fontWeight: 700 }}>
                  <span>Savings</span>
                  <span className="font-mono" style={{ color: 'var(--state-success)' }}>
                    {originalBits > 0 ? ((1 - encodedBits / originalBits) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <ComplexityPanel complexity={HUFFMAN_COMPLEXITY} title="Huffman Complexity" />
        </div>
      </div>
    </div>
  );
};
