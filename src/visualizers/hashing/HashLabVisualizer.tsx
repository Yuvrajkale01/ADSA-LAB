/* ============================================
   Hash Lab Visualizer — Interactive hash table
   ============================================ */

import React, { useState, useCallback } from 'react';
import { AnimationControls } from '../../components/visualization/AnimationControls';
import { ExplanationPanel } from '../../components/visualization/ExplanationPanel';
import { ComplexityPanel } from '../../components/visualization/ComplexityPanel';
import { TheorySection } from '../../components/visualization/TheorySection';
import { useStateEngine } from '../../hooks/useStateEngine';
import {
  createEmptyTable,
  hashInsertSC,
  hashInsertLP,
  hashInsertQP,
  hashInsertDH,
} from '../../algorithms/hashing/HashTable';
import { AlgorithmCodePanel } from '../../components/visualization/AlgorithmCodePanel';
import {
  hashSeparateChainingCodeData,
  hashLinearProbingCodeData,
  hashQuadraticProbingCodeData,
  hashDoubleHashingCodeData,
} from '../../data/algorithmCodeData';
import type { HashTableData } from '../../algorithms/hashing/HashTable';
import type { CollisionStrategy, ComplexityInfo } from '../../types';
import './HashLabVisualizer.css';

const STRATEGIES: { value: CollisionStrategy; label: string }[] = [
  { value: 'separate-chaining', label: 'Separate Chaining' },
  { value: 'linear-probing', label: 'Linear Probing' },
  { value: 'quadratic-probing', label: 'Quadratic Probing' },
  { value: 'double-hashing', label: 'Double Hashing' },
];

const HASH_COMPLEXITY: ComplexityInfo = {
  time: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' },
  space: 'O(n)',
};

const insertFunctions: Record<CollisionStrategy, typeof hashInsertSC> = {
  'separate-chaining': hashInsertSC,
  'linear-probing': hashInsertLP,
  'quadratic-probing': hashInsertQP,
  'double-hashing': hashInsertDH,
};

// Hash Table visual component
const HashTableView: React.FC<{
  table: HashTableData;
  activeNodes: { id: string; state: string }[];
}> = ({ table, activeNodes }) => {
  const getNodeState = (index: number) => {
    const active = activeNodes.find(a => a.id === `bucket-${index}`);
    return active?.state || 'normal';
  };

  const stateColors: Record<string, string> = {
    normal: 'var(--state-normal)',
    active: 'var(--state-active)',
    collision: 'var(--state-collision)',
    inserted: 'var(--state-inserted)',
    error: 'var(--state-error)',
  };

  return (
    <div className="hash-table-view">
      <div className="hash-table-header">
        <span className="hash-table-info font-mono">
          Size: {table.size} | Count: {table.count} | Load: {(table.count / table.size).toFixed(2)}
        </span>
      </div>
      <div className="hash-buckets">
        {table.buckets.map((bucket, i) => {
          const state = getNodeState(i);
          return (
            <div
              key={i}
              className={`hash-bucket hash-bucket-${state}`}
              style={{ borderColor: stateColors[state] || stateColors.normal }}
            >
              <div className="hash-bucket-index font-mono">{i}</div>
              <div className="hash-bucket-content">
                {bucket.entries.length === 0 ? (
                  <span className="hash-bucket-empty">∅</span>
                ) : table.strategy === 'separate-chaining' ? (
                  <div className="hash-chain">
                    {bucket.entries.map((entry, j) => (
                      <React.Fragment key={j}>
                        {j > 0 && <span className="hash-chain-arrow">→</span>}
                        <span className="hash-chain-node font-mono">{entry.key}</span>
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <span className="hash-bucket-value font-mono">
                    {bucket.entries[0]?.key}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const HashLabVisualizer: React.FC<{ initialStrategy?: CollisionStrategy }> = ({
  initialStrategy = 'separate-chaining',
}) => {
  const [tableSize, setTableSize] = useState(10);
  const [strategy, setStrategy] = useState<CollisionStrategy>(initialStrategy);
  const [table, setTable] = useState<HashTableData>(() => createEmptyTable(10, initialStrategy));
  const [inputValue, setInputValue] = useState('');
  const { currentState, controls, loadStates } = useStateEngine();

  const handleInsert = useCallback(() => {
    const val = parseInt(inputValue.trim());
    if (isNaN(val)) return;
    const insertFn = insertFunctions[strategy];
    const { table: newTable, states } = insertFn(table, val);
    setTable(newTable);
    loadStates(states);
    setInputValue('');
  }, [table, inputValue, strategy, loadStates]);

  const handleReset = useCallback(() => {
    const newTable = createEmptyTable(tableSize, strategy);
    setTable(newTable);
    loadStates([]);
  }, [tableSize, strategy, loadStates]);

  const handleStrategyChange = useCallback((newStrategy: CollisionStrategy) => {
    setStrategy(newStrategy);
    const newTable = createEmptyTable(tableSize, newStrategy);
    setTable(newTable);
    loadStates([]);
  }, [tableSize, loadStates]);

  const handleSizeChange = useCallback((newSize: number) => {
    setTableSize(newSize);
    const newTable = createEmptyTable(newSize, strategy);
    setTable(newTable);
    loadStates([]);
  }, [strategy, loadStates]);

  const handleBulkInsert = useCallback(() => {
    const keys = [42, 17, 29, 8, 53, 22, 37, 12, 59, 31];
    let t = createEmptyTable(tableSize, strategy);
    const allStates: any[] = [];
    const insertFn = insertFunctions[strategy];
    for (const k of keys) {
      const { table: newT, states } = insertFn(t, k);
      t = newT;
      allStates.push(...states);
    }
    setTable(t);
    loadStates(allStates);
  }, [tableSize, strategy, loadStates]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleInsert();
  };

  const activeNodes = currentState?.activeNodes || [];
  const displayTable = currentState?.dataStructureState || table;

  return (
    <div className="hash-lab">
      <TheorySection topicId={strategy} />
      <div className="viz-header">
        <div className="viz-header-info">
          <span className="viz-badge">Unit 2 — Hashing</span>
          <h1 className="viz-title">Hash Lab</h1>
          <p className="viz-desc">
            Explore hash table operations with different collision resolution strategies.
            Insert keys, observe hash calculations, collisions, and probe sequences.
          </p>
        </div>
      </div>

      <div className="viz-layout">
        <div className="viz-main">
          {/* Configuration */}
          <div className="hash-config">
            <div className="hash-config-item">
              <label className="hash-config-label">Table Size</label>
              <select
                className="viz-input"
                value={tableSize}
                onChange={e => handleSizeChange(Number(e.target.value))}
              >
                {[7, 10, 11, 13, 16, 20].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="hash-config-item">
              <label className="hash-config-label">Collision Strategy</label>
              <select
                className="viz-input"
                value={strategy}
                onChange={e => handleStrategyChange(e.target.value as CollisionStrategy)}
              >
                {STRATEGIES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Input */}
          <div className="viz-controls-bar">
            <div className="viz-input-group">
              <input
                type="number"
                className="viz-input"
                placeholder="Enter key..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="viz-btn viz-btn-insert" onClick={handleInsert}>Insert</button>
              <button className="viz-btn viz-btn-secondary" onClick={handleBulkInsert}>Demo Data</button>
              <button className="viz-btn viz-btn-ghost" onClick={handleReset}>Reset</button>
            </div>
          </div>

          {/* Hash table visualization */}
          <div className="viz-canvas" style={{ minHeight: 'auto', padding: 'var(--space-4)' }}>
            <HashTableView table={displayTable} activeNodes={activeNodes} />
          </div>

          <AnimationControls
            controls={controls}
            operationLabel={currentState?.operation}
            comparisons={currentState?.comparisons}
            complexity={currentState?.complexity}
          />
        </div>

        <div className="viz-sidebar">
          <AlgorithmCodePanel
            codeData={
              strategy === 'separate-chaining'
                ? hashSeparateChainingCodeData
                : strategy === 'linear-probing'
                ? hashLinearProbingCodeData
                : strategy === 'quadratic-probing'
                ? hashQuadraticProbingCodeData
                : hashDoubleHashingCodeData
            }
            currentOperation={currentState?.operation}
            highlightedLine={currentState?.pseudocodeLine}
            defaultLanguage="java"
            showLineNumbers={false}
            onReset={handleReset}
          />

          <ExplanationPanel
            state={currentState}
            stepIndex={controls.currentStep}
            totalSteps={controls.totalSteps}
          />
          <ComplexityPanel complexity={HASH_COMPLEXITY} title="Hash Table Complexity" />

          <div className="viz-info-panel glass-panel">
            <h4 className="viz-info-title">Hash Function</h4>
            <p className="viz-info-text font-mono" style={{ fontSize: '13px' }}>
              h(key) = key mod {tableSize}
            </p>
            {strategy === 'double-hashing' && (
              <p className="viz-info-text font-mono" style={{ fontSize: '13px', marginTop: '4px' }}>
                h₂(key) = 1 + (key mod {Math.max(1, tableSize - 1)})
              </p>
            )}
            <h4 className="viz-info-title" style={{ marginTop: 'var(--space-3)' }}>Why Hashing?</h4>
            <ul className="viz-info-list">
              <li>O(1) average-case lookup</li>
              <li>Databases & caches</li>
              <li>Symbol tables in compilers</li>
              <li>Password verification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
