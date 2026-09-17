/* ============================================
   Min Heap Visualizer — Dual Tree & Array View
   Pixel-perfect match to user reference screenshot
   Synchronized with AlgorithmCodePanel
   ============================================ */

import React, { useState, useCallback } from 'react';
import { AnimationControls } from '../../components/visualization/AnimationControls';
import { ExplanationPanel } from '../../components/visualization/ExplanationPanel';
import { ComplexityPanel } from '../../components/visualization/ComplexityPanel';
import { AlgorithmCodePanel } from '../../components/visualization/AlgorithmCodePanel';
import { TheorySection } from '../../components/visualization/TheorySection';
import { useStateEngine } from '../../hooks/useStateEngine';
import { minHeapInsert, minHeapExtractMin, heapParent } from '../../algorithms/trees/MinHeap';
import { minHeapCodeData } from '../../data/algorithmCodeData';
import type { ComplexityInfo } from '../../types';
import './MinHeapVisualizer.css';

const HEAP_COMPLEXITY: ComplexityInfo = {
  time: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
  space: 'O(n)',
};

export const MinHeapVisualizer: React.FC = () => {
  const [heap, setHeap] = useState<number[]>([5]);
  const [inputValue, setInputValue] = useState<string>('');
  const [opCounter, setOpCounter] = useState<number>(1);
  const { currentState, controls, loadStates } = useStateEngine();

  // Current array state from engine or static heap
  const currentArray: number[] = (currentState?.dataStructureState as number[]) || heap;
  const activeIdx = currentState?.metadata?.currentIndex as number | undefined;
  const parentIdx = currentState?.metadata?.parentIndex as number | undefined;

  // Insert handler
  const handleInsert = useCallback(() => {
    const val = parseInt(inputValue.trim(), 10);
    if (isNaN(val)) return;

    const { newHeap, states } = minHeapInsert(heap, val);
    setHeap(newHeap);
    loadStates(states);
    setOpCounter(prev => prev + 1);
    setInputValue('');
  }, [heap, inputValue, loadStates]);

  // Extract Min handler
  const handleExtractMin = useCallback(() => {
    if (heap.length === 0) return;
    const { newHeap, states } = minHeapExtractMin(heap);
    setHeap(newHeap);
    loadStates(states);
    setOpCounter(prev => prev + 1);
  }, [heap, loadStates]);

  // Demo sequence
  const handleDemo = useCallback(() => {
    let h: number[] = [];
    const allStates = [];
    for (const val of [15, 10, 20, 8, 25, 5]) {
      const res = minHeapInsert(h, val);
      h = res.newHeap;
      allStates.push(...res.states);
    }
    setHeap(h);
    loadStates(allStates);
  }, [loadStates]);

  const handleReset = useCallback(() => {
    setHeap([]);
    loadStates([]);
    setOpCounter(1);
  }, [loadStates]);

  // Tree node layout positions
  const getNodePos = (index: number) => {
    const level = Math.floor(Math.log2(index + 1));
    const levelStart = Math.pow(2, level) - 1;
    const posInLevel = index - levelStart;
    const totalInLevel = Math.pow(2, level);
    const width = 460;
    const spacing = width / (totalInLevel + 1);
    const x = spacing * (posInLevel + 1);
    const y = 50 + level * 70;
    return { x, y };
  };

  return (
    <div className="bst-visualizer min-heap-page">
      <TheorySection topicId="min-heap" />
      {/* Header */}
      <div className="viz-header">
        <div className="viz-header-info">
          <span className="viz-badge">Unit 3 — Trees & Priority Queues</span>
          <h1 className="viz-title">Min-Heap & Priority Queue</h1>
          <p className="viz-desc">
            A complete binary tree where every parent node is less than or equal to its children.
            Backed by a contiguous array with O(log n) insert and extract-min.
          </p>
        </div>
        <div className="viz-stats">
          <div className="viz-stat">
            <span className="viz-stat-label">Size</span>
            <span className="viz-stat-value font-mono">{currentArray.length}</span>
          </div>
          <div className="viz-stat">
            <span className="viz-stat-label">Min</span>
            <span className="viz-stat-value font-mono">{currentArray[0] ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Canvas | Right Code Panel */}
      <div className="viz-layout">
        {/* Left Side: Visualization */}
        <div className="viz-main">
          {/* Controls Bar */}
          <div className="viz-controls-bar">
            <div className="viz-input-group">
              <input
                type="number"
                className="viz-input"
                placeholder="Value..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInsert()}
                style={{ width: '110px' }}
              />
              <button className="viz-btn viz-btn-insert" onClick={handleInsert}>
                Insert
              </button>
              <button
                className="viz-btn viz-btn-delete"
                onClick={handleExtractMin}
                disabled={currentArray.length === 0}
              >
                Extract Min
              </button>
              <button className="viz-btn viz-btn-secondary" onClick={handleDemo}>
                Demo
              </button>
              <button className="viz-btn viz-btn-ghost" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>

          {/* Visual Canvas matching reference screenshot */}
          <div className="viz-canvas heap-canvas">
            {/* Op indicator */}
            <div className="heap-op-indicator">
              {currentState?.operation || `op ${opCounter - 1}: ready`}
            </div>

            {/* Tree View */}
            <div className="heap-tree-container">
              <svg className="heap-tree-svg" viewBox="0 0 460 260">
                {/* Edges */}
                {currentArray.map((_, idx) => {
                  if (idx === 0) return null;
                  const pIdx = heapParent(idx);
                  const pPos = getNodePos(pIdx);
                  const cPos = getNodePos(idx);
                  const isComparing =
                    (activeIdx === idx && parentIdx === pIdx) ||
                    (activeIdx === pIdx && parentIdx === idx);

                  return (
                    <line
                      key={`edge-${pIdx}-${idx}`}
                      x1={pPos.x}
                      y1={pPos.y}
                      x2={cPos.x}
                      y2={cPos.y}
                      stroke={isComparing ? '#388bfd' : 'rgba(255,255,255,0.18)'}
                      strokeWidth={isComparing ? 2.5 : 1.5}
                      strokeDasharray={isComparing ? '4 3' : 'none'}
                    />
                  );
                })}

                {/* Nodes */}
                {currentArray.map((val, idx) => {
                  const { x, y } = getNodePos(idx);
                  const isActive = activeIdx === idx;
                  const isParent = parentIdx === idx;

                  return (
                    <g key={`node-${idx}`} className="heap-node-group">
                      {/* Pointer marker (i) above active node */}
                      {isActive && (
                        <text
                          x={x}
                          y={y - 28}
                          textAnchor="middle"
                          fill="#58a6ff"
                          fontSize="13"
                          fontFamily="'JetBrains Mono', monospace"
                          fontWeight="700"
                        >
                          i
                        </text>
                      )}

                      {/* Outer pulse circle if active */}
                      {isActive && (
                        <circle
                          cx={x}
                          cy={y}
                          r={23}
                          fill="none"
                          stroke="#58a6ff"
                          strokeWidth="1.5"
                          opacity="0.6"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r={18}
                        className={`heap-circle ${
                          isActive
                            ? 'heap-circle-active'
                            : isParent
                            ? 'heap-circle-parent'
                            : ''
                        }`}
                      />

                      {/* Value inside circle */}
                      <text
                        x={x}
                        y={y}
                        dy="0.35em"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="13"
                        fontFamily="'JetBrains Mono', monospace"
                        fontWeight="600"
                      >
                        {val}
                      </text>

                      {/* Index below circle: [0], [1] */}
                      <text
                        x={x}
                        y={y + 30}
                        textAnchor="middle"
                        fill="#8b949e"
                        fontSize="11"
                        fontFamily="'JetBrains Mono', monospace"
                      >
                        [{idx}]
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Array Representation below tree */}
            <div className="heap-array-section">
              <span className="heap-array-title">array</span>
              <div className="heap-array-cells">
                {currentArray.map((val, idx) => {
                  const isActive = activeIdx === idx;
                  return (
                    <div
                      key={`arr-${idx}`}
                      className={`heap-cell-wrapper ${isActive ? 'heap-cell-active' : ''}`}
                    >
                      <div className="heap-cell-box font-mono">{val}</div>
                      <span className="heap-cell-idx font-mono">{idx}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Animation Controls Bar */}
          <AnimationControls
            controls={controls}
            operationLabel={currentState?.operation}
            comparisons={currentState?.comparisons}
            complexity={currentState?.complexity}
          />

          {/* Explanation underneath */}
          <ExplanationPanel
            state={currentState}
            stepIndex={controls.currentStep}
            totalSteps={controls.totalSteps}
          />
        </div>

        {/* Right Side: AlgorithmCodePanel + Complexity & Info */}
        <div className="viz-sidebar">
          {/* Synchronized Read-Only Code Panel */}
          <AlgorithmCodePanel
            codeData={minHeapCodeData}
            currentOperation={currentState?.operation}
            highlightedLine={currentState?.pseudocodeLine}
            defaultLanguage="java"
            showLineNumbers={false}
            onReset={handleReset}
          />

          <ComplexityPanel complexity={HEAP_COMPLEXITY} title="Min Heap Complexity" />

          {/* Array Index Formula Card */}
          <div className="viz-info-panel glass-panel">
            <h4 className="viz-info-title">Heap Array Formulas (0-indexed)</h4>
            <ul className="viz-info-list font-mono" style={{ fontSize: '12px' }}>
              <li><strong>Parent(i):</strong> ⌊(i - 1) / 2⌋</li>
              <li><strong>Left Child(i):</strong> 2i + 1</li>
              <li><strong>Right Child(i):</strong> 2i + 2</li>
            </ul>
            <h4 className="viz-info-title" style={{ marginTop: 'var(--space-3)' }}>
              Core Operations
            </h4>
            <ul className="viz-info-list" style={{ fontSize: '12.5px' }}>
              <li><strong>siftUp(i):</strong> Swap element with its parent while parent &gt; element.</li>
              <li><strong>siftDown(i):</strong> Swap with smallest child until min-heap property is satisfied.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
