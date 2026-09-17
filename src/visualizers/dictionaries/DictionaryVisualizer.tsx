/* ============================================
   Dictionary ADT Visualizer — Vector-based
   with AlgorithmCodePanel integration
   ============================================ */

import React, { useState, useCallback } from 'react';
import { AnimationControls } from '../../components/visualization/AnimationControls';
import { ExplanationPanel } from '../../components/visualization/ExplanationPanel';
import { ComplexityPanel } from '../../components/visualization/ComplexityPanel';
import { AlgorithmCodePanel } from '../../components/visualization/AlgorithmCodePanel';
import { TheorySection } from '../../components/visualization/TheorySection';
import type { AlgorithmCodeData } from '../../components/visualization/AlgorithmCodePanel';
import { useStateEngine } from '../../hooks/useStateEngine';
import type { AlgorithmState, ComplexityInfo } from '../../types';
import '../trees/BSTVisualizer.css';

// ---- Short exam-style algorithm code ----
const dictionaryCodeData: AlgorithmCodeData = {
  code: {
    java: `void insert(String key, String value) {
    for (int i = 0; i < size; i++) {
        if (entries[i].key.equals(key)) {
            entries[i].value = value;
            return;
        }
    }
    entries[size++] = new Entry(key, value);
}

String find(String key) {
    for (int i = 0; i < size; i++) {
        if (entries[i].key.equals(key))
            return entries[i].value;
    }
    return null;
}

void remove(String key) {
    for (int i = 0; i < size; i++) {
        if (entries[i].key.equals(key)) {
            // shift elements left
            for (int j = i; j < size - 1; j++)
                entries[j] = entries[j + 1];
            size--;
            return;
        }
    }
}`,
    python: `def insert(self, key, value):
    for i in range(self.size):
        if self.entries[i].key == key:
            self.entries[i].value = value
            return
    self.entries.append(Entry(key, value))
    self.size += 1

def find(self, key):
    for i in range(self.size):
        if self.entries[i].key == key:
            return self.entries[i].value
    return None

def remove(self, key):
    for i in range(self.size):
        if self.entries[i].key == key:
            self.entries.pop(i)
            self.size -= 1
            return`,
    cpp: `void insert(string key, string value) {
    for (int i = 0; i < size; i++) {
        if (entries[i].key == key) {
            entries[i].value = value;
            return;
        }
    }
    entries[size++] = {key, value};
}

string find(string key) {
    for (int i = 0; i < size; i++) {
        if (entries[i].key == key)
            return entries[i].value;
    }
    return "";
}

void remove(string key) {
    for (int i = 0; i < size; i++) {
        if (entries[i].key == key) {
            for (int j = i; j < size - 1; j++)
                entries[j] = entries[j + 1];
            size--;
            return;
        }
    }
}`,
  },
  stepMap: {
    // These map operation names → 0-indexed line numbers in Java code
    'SEARCH':     [1, 2],      // for loop + key comparison
    'COMPARE':    [12, 13],    // find: for loop + comparison
    'UPDATE':     [3],         // entries[i].value = value
    'INSERT':     [7],         // entries[size++] = new Entry(key, value)
    'FOUND':      [13, 14],    // return entries[i].value
    'NOT FOUND':  [15],        // return null
    'DELETE':     [21, 22],    // found key in remove
    'COMPLETE':   [24, 25],    // shift + size--
  },
};

// pseudocodeLine values used by the algorithm functions:
// 0 = insert: for loop start
// 1 = search: for loop comparing
// 2 = found / update / delete found
// 3 = insert append
// 4 = delete shift
// Map these to actual code lines:
const pseudocodeToCodeLine: Record<number, number> = {
  0: 1,   // for loop in insert
  1: 2,   // key comparison in insert (or find)
  2: 3,   // update value / found
  3: 7,   // append new entry
  4: 24,  // shift elements
};

interface DictEntry { key: string; value: string; state: string }

function dictInsert(entries: DictEntry[], key: string, value: string): { entries: DictEntry[]; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let id = 0;
  const e = entries.map(x => ({ ...x }));

  const existing = e.findIndex(x => x.key === key);
  if (existing >= 0) {
    states.push({ id: id++, dataStructureState: [...e], activeNodes: [{ id: `entry-${existing}`, state: 'comparing' }], activeEdges: [],
      operation: 'SEARCH', explanation: `Key "${key}" found at index ${existing}. Updating value.`,
      detailedExplanation: 'Linear search through the vector to find existing key.', pseudocodeLine: 2,
      comparisons: existing + 1, assignments: 0, swaps: 0, complexity: 'O(n)', metadata: {} });
    e[existing].value = value;
    e[existing].state = 'updated';
    states.push({ id: id++, dataStructureState: [...e], activeNodes: [{ id: `entry-${existing}`, state: 'success' }], activeEdges: [],
      operation: 'UPDATE', explanation: `Updated "${key}" = "${value}".`,
      detailedExplanation: 'Key already exists, so we update the value in place.', pseudocodeLine: 3,
      comparisons: 0, assignments: 1, swaps: 0, complexity: 'O(n)', metadata: {} });
  } else {
    states.push({ id: id++, dataStructureState: [...e], activeNodes: [], activeEdges: [],
      operation: 'SEARCH', explanation: `Key "${key}" not found. Searched all ${e.length} entries.`,
      detailedExplanation: 'Linear search confirms key does not exist.', pseudocodeLine: 1,
      comparisons: e.length, assignments: 0, swaps: 0, complexity: 'O(n)', metadata: {} });
    e.push({ key, value, state: 'inserted' });
    states.push({ id: id++, dataStructureState: [...e], activeNodes: [{ id: `entry-${e.length - 1}`, state: 'inserted' }], activeEdges: [],
      operation: 'INSERT', explanation: `Inserted "${key}" = "${value}" at index ${e.length - 1}.`,
      detailedExplanation: 'Append to end of vector. O(1) for insertion itself.', pseudocodeLine: 7,
      comparisons: 0, assignments: 1, swaps: 0, complexity: 'O(n)', metadata: {} });
  }
  return { entries: e, states };
}

function dictSearch(entries: DictEntry[], key: string): { found: boolean; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let id = 0;
  for (let i = 0; i < entries.length; i++) {
    const isMatch = entries[i].key === key;
    states.push({ id: id++, dataStructureState: entries.map(x => ({ ...x })),
      activeNodes: [{ id: `entry-${i}`, state: isMatch ? 'success' : 'comparing' }], activeEdges: [],
      operation: isMatch ? 'FOUND' : 'COMPARE',
      explanation: isMatch ? `Found "${key}" at index ${i}! Value = "${entries[i].value}".` : `entries[${i}].key = "${entries[i].key}" ≠ "${key}". Continue.`,
      detailedExplanation: isMatch ? 'Sequential search found the key.' : 'Check next entry.',
      pseudocodeLine: isMatch ? 13 : 12, comparisons: i + 1, assignments: 0, swaps: 0, complexity: 'O(n)', metadata: {} });
    if (isMatch) return { found: true, states };
  }
  states.push({ id: id++, dataStructureState: entries.map(x => ({ ...x })), activeNodes: [], activeEdges: [],
    operation: 'NOT FOUND', explanation: `Key "${key}" not found after ${entries.length} comparisons.`,
    detailedExplanation: 'Exhausted all entries.', pseudocodeLine: 15,
    comparisons: entries.length, assignments: 0, swaps: 0, complexity: 'O(n)', metadata: {} });
  return { found: false, states };
}

function dictDelete(entries: DictEntry[], key: string): { entries: DictEntry[]; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let id = 0;
  const e = entries.map(x => ({ ...x }));
  const idx = e.findIndex(x => x.key === key);
  if (idx >= 0) {
    states.push({ id: id++, dataStructureState: [...e], activeNodes: [{ id: `entry-${idx}`, state: 'deleted' }], activeEdges: [],
      operation: 'DELETE', explanation: `Found "${key}" at index ${idx}. Removing.`,
      detailedExplanation: 'Remove from vector shifts remaining elements.', pseudocodeLine: 22,
      comparisons: idx + 1, assignments: 0, swaps: 0, complexity: 'O(n)', metadata: {} });
    e.splice(idx, 1);
    states.push({ id: id++, dataStructureState: [...e], activeNodes: [], activeEdges: [],
      operation: 'COMPLETE', explanation: `Deleted "${key}". ${e.length} entries remain.`,
      detailedExplanation: 'Elements after the deleted entry shift left.', pseudocodeLine: 24,
      comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(n)', metadata: {} });
  } else {
    states.push({ id: id++, dataStructureState: [...e], activeNodes: [], activeEdges: [],
      operation: 'NOT FOUND', explanation: `Key "${key}" not found.`, detailedExplanation: '',
      pseudocodeLine: null, comparisons: e.length, assignments: 0, swaps: 0, complexity: 'O(n)', metadata: {} });
  }
  return { entries: e, states };
}

const DICT_COMPLEXITY: ComplexityInfo = { time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' }, space: 'O(n)' };

const DictView: React.FC<{ entries: DictEntry[]; activeNodes: { id: string; state: string }[] }> = ({ entries, activeNodes }) => {
  const stateColors: Record<string, string> = { comparing: '#f59e0b', success: '#10b981', inserted: '#10b981', deleted: '#ef4444', updated: '#6366f1' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minHeight: 200, padding: 'var(--space-4)' }}>
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-12)' }}>Empty dictionary — insert key-value pairs to begin</div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <span style={{ width: 40, fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' as const }}>Idx</span>
            <span style={{ flex: 1, fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' as const }}>Key</span>
            <span style={{ flex: 1, fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' as const }}>Value</span>
          </div>
          {entries.map((entry, i) => {
            const an = activeNodes.find(a => a.id === `entry-${i}`);
            const borderColor = an ? stateColors[an.state] || 'var(--border-subtle)' : 'var(--border-subtle)';
            const bg = an ? `${stateColors[an.state]}15` : 'var(--bg-surface)';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)',
                background: bg, border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-md)', transition: 'all 0.3s ease' }}>
                <span className="font-mono" style={{ width: 40, fontSize: '12px', color: 'var(--text-tertiary)' }}>{i}</span>
                <span className="font-mono" style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{entry.key}</span>
                <span className="font-mono" style={{ flex: 1, fontSize: '13px', color: 'var(--accent-primary)' }}>{entry.value}</span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export const DictionaryVisualizer: React.FC = () => {
  const [entries, setEntries] = useState<DictEntry[]>([]);
  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');
  const { currentState, controls, loadStates } = useStateEngine();

  const handleInsert = useCallback(() => {
    if (!keyInput.trim()) return;
    const { entries: e, states } = dictInsert(entries, keyInput.trim(), valueInput.trim() || `val_${keyInput}`);
    setEntries(e); loadStates(states); setKeyInput(''); setValueInput('');
  }, [entries, keyInput, valueInput, loadStates]);

  const handleSearch = useCallback(() => {
    if (!keyInput.trim()) return;
    const { states } = dictSearch(entries, keyInput.trim());
    loadStates(states);
  }, [entries, keyInput, loadStates]);

  const handleDelete = useCallback(() => {
    if (!keyInput.trim()) return;
    const { entries: e, states } = dictDelete(entries, keyInput.trim());
    setEntries(e); loadStates(states); setKeyInput('');
  }, [entries, keyInput, loadStates]);

  const handleDemo = useCallback(() => {
    const demoData: [string, string][] = [['apple', '🍎'], ['banana', '🍌'], ['cherry', '🍒'], ['date', '📅'], ['elderberry', '🫐']];
    let e: DictEntry[] = [];
    const allStates: AlgorithmState[] = [];
    for (const [k, v] of demoData) { const r = dictInsert(e, k, v); e = r.entries; allStates.push(...r.states); }
    setEntries(e); loadStates(allStates);
  }, [loadStates]);

  return (
    <div className="bst-visualizer">
      <TheorySection topicId="dictionary-adt" />
      <div className="viz-header">
        <div className="viz-header-info">
          <span className="viz-badge">Unit 1 — Dictionaries</span>
          <h1 className="viz-title">Dictionary ADT</h1>
          <p className="viz-desc">A dictionary stores key-value pairs. This visualization uses a Vector (array list) implementation with linear search. Insert, search, and delete to see sequential operations.</p>
        </div>
        <div className="viz-stats">
          <div className="viz-stat"><span className="viz-stat-label">Entries</span><span className="viz-stat-value font-mono">{entries.length}</span></div>
        </div>
      </div>

      {/* ---- Main layout: Visualization LEFT, Code RIGHT ---- */}
      <div className="viz-layout" style={{ gridTemplateColumns: '1fr 380px' }}>
        <div className="viz-main">
          <div className="viz-controls-bar">
            <div className="viz-input-group">
              <input type="text" className="viz-input" placeholder="Key" value={keyInput} onChange={e => setKeyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleInsert()} />
              <input type="text" className="viz-input" placeholder="Value" value={valueInput} onChange={e => setValueInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleInsert()} />
              <button className="viz-btn viz-btn-insert" onClick={handleInsert}>Insert</button>
              <button className="viz-btn viz-btn-search" onClick={handleSearch}>Search</button>
              <button className="viz-btn viz-btn-delete" onClick={handleDelete}>Delete</button>
              <button className="viz-btn viz-btn-secondary" onClick={handleDemo}>Demo</button>
              <button className="viz-btn viz-btn-ghost" onClick={() => { setEntries([]); loadStates([]); }}>Reset</button>
            </div>
          </div>
          <div className="viz-canvas" style={{ minHeight: 'auto' }}>
            <DictView entries={currentState?.dataStructureState || entries} activeNodes={currentState?.activeNodes || []} />
          </div>
          <AnimationControls controls={controls} operationLabel={currentState?.operation} comparisons={currentState?.comparisons} complexity={currentState?.complexity} />
          {/* Explanation below the visualization */}
          <ExplanationPanel state={currentState} stepIndex={controls.currentStep} totalSteps={controls.totalSteps} />
        </div>

        {/* ---- Right side: Code panel + info ---- */}
        <div className="viz-sidebar">
          {/* Algorithm Code Panel — the new feature */}
          <AlgorithmCodePanel
            codeData={{ ...dictionaryCodeData, lineMap: pseudocodeToCodeLine }}
            currentOperation={currentState?.operation || null}
            highlightedLine={currentState?.pseudocodeLine ?? null}
          />
          <ComplexityPanel complexity={DICT_COMPLEXITY} title="Dictionary (Vector) Complexity" />
          <div className="viz-info-panel glass-panel">
            <h4 className="viz-info-title">Dictionary ADT Operations</h4>
            <ul className="viz-info-list">
              <li><strong>insert(key, value)</strong> — O(n) search + O(1) append</li>
              <li><strong>find(key)</strong> — O(n) sequential search</li>
              <li><strong>remove(key)</strong> — O(n) search + O(n) shift</li>
              <li><strong>size()</strong> — O(1)</li>
            </ul>
            <h4 className="viz-info-title" style={{ marginTop: 'var(--space-3)' }}>Why Learn This?</h4>
            <p className="viz-info-text">Understanding the naive Dictionary ADT motivates why hashing (Unit 2) and trees (Unit 3) are needed — they improve lookup from O(n) to O(1) or O(log n).</p>
          </div>
        </div>
      </div>
    </div>
  );
};
