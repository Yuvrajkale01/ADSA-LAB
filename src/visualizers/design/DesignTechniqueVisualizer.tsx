/* ============================================
   Design Techniques Visualizer — Unit 6
   D&C, Greedy, DP, Branch & Bound, Backtracking
   ============================================ */

import React, { useState, useCallback } from 'react';
import { AnimationControls } from '../../components/visualization/AnimationControls';
import { ExplanationPanel } from '../../components/visualization/ExplanationPanel';
import { ComplexityPanel } from '../../components/visualization/ComplexityPanel';
import { TheorySection } from '../../components/visualization/TheorySection';
import { useStateEngine } from '../../hooks/useStateEngine';
import type { AlgorithmState, ComplexityInfo } from '../../types';
import '../trees/BSTVisualizer.css';

// ---- MERGE SORT (Divide & Conquer demo) ----
function mergeSortTrace(arr: number[]): AlgorithmState[] {
  const states: AlgorithmState[] = [];
  let id = 0;

  states.push({ id: id++, dataStructureState: { array: [...arr], highlights: [] }, activeNodes: [], activeEdges: [],
    operation: 'START', explanation: `Merge Sort on [${arr.join(', ')}]`,
    detailedExplanation: 'Divide & Conquer: split array in half, sort each half, merge.', pseudocodeLine: 0,
    comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(n log n)', metadata: {} });

  function sort(a: number[], l: number, r: number, depth: number) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    states.push({ id: id++, dataStructureState: { array: [...arr], split: { l, m, r }, depth },
      activeNodes: [], activeEdges: [], operation: 'DIVIDE',
      explanation: `Split [${l}..${r}] at midpoint ${m}. Left: [${l}..${m}], Right: [${m + 1}..${r}].`,
      detailedExplanation: `Depth ${depth}: Dividing the problem into two halves.`, pseudocodeLine: 2,
      comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(n log n)', metadata: { depth } });

    sort(a, l, m, depth + 1);
    sort(a, m + 1, r, depth + 1);

    // Merge
    const left = a.slice(l, m + 1), right = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) { a[k++] = left[i] <= right[j] ? left[i++] : right[j++]; }
    while (i < left.length) a[k++] = left[i++];
    while (j < right.length) a[k++] = right[j++];

    // Copy back to arr for display
    for (let x = l; x <= r; x++) arr[x] = a[x];

    states.push({ id: id++, dataStructureState: { array: [...arr], merged: { l, r } },
      activeNodes: [], activeEdges: [], operation: 'MERGE',
      explanation: `Merged [${l}..${r}] → [${a.slice(l, r + 1).join(', ')}]`,
      detailedExplanation: 'Combine two sorted halves into one sorted sequence.', pseudocodeLine: 5,
      comparisons: 0, assignments: r - l + 1, swaps: 0, complexity: 'O(n log n)', metadata: {} });
  }

  const a = [...arr];
  sort(a, 0, a.length - 1, 0);
  states.push({ id: id++, dataStructureState: { array: [...arr], sorted: true }, activeNodes: [], activeEdges: [],
    operation: 'COMPLETE', explanation: `Sorted: [${arr.join(', ')}]`,
    detailedExplanation: 'Divide & Conquer produces O(n log n) sorting.', pseudocodeLine: null,
    comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(n log n)', metadata: {} });
  return states;
}

// ---- ACTIVITY SELECTION (Greedy demo) ----
function activitySelection(activities: { id: number; start: number; end: number }[]): AlgorithmState[] {
  const states: AlgorithmState[] = [];
  let id = 0;
  const sorted = [...activities].sort((a, b) => a.end - b.end);

  states.push({ id: id++, dataStructureState: { activities: sorted, selected: [] }, activeNodes: [], activeEdges: [],
    operation: 'SORT BY END TIME', explanation: `Sorted ${sorted.length} activities by end time.`,
    detailedExplanation: 'Greedy choice: always pick the activity that finishes earliest.', pseudocodeLine: 0,
    comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(n log n)', metadata: {} });

  const selected: typeof sorted = [sorted[0]];
  states.push({ id: id++, dataStructureState: { activities: sorted, selected: [...selected] },
    activeNodes: [{ id: `act-${sorted[0].id}`, state: 'inserted' }], activeEdges: [],
    operation: 'SELECT FIRST', explanation: `Select activity ${sorted[0].id} [${sorted[0].start}-${sorted[0].end}].`,
    detailedExplanation: 'First activity (earliest end time) is always selected.', pseudocodeLine: 1,
    comparisons: 0, assignments: 1, swaps: 0, complexity: 'O(n)', metadata: {} });

  let lastEnd = sorted[0].end;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start >= lastEnd) {
      selected.push(sorted[i]);
      lastEnd = sorted[i].end;
      states.push({ id: id++, dataStructureState: { activities: sorted, selected: [...selected] },
        activeNodes: [{ id: `act-${sorted[i].id}`, state: 'inserted' }], activeEdges: [],
        operation: 'SELECT', explanation: `Activity ${sorted[i].id} [${sorted[i].start}-${sorted[i].end}] starts after ${sorted[i - 1]?.end || lastEnd}. Select it!`,
        detailedExplanation: `Compatible with previous selection. ${selected.length} selected so far.`, pseudocodeLine: 4,
        comparisons: i, assignments: 1, swaps: 0, complexity: 'O(n)', metadata: {} });
    } else {
      states.push({ id: id++, dataStructureState: { activities: sorted, selected: [...selected] },
        activeNodes: [{ id: `act-${sorted[i].id}`, state: 'error' }], activeEdges: [],
        operation: 'SKIP', explanation: `Activity ${sorted[i].id} [${sorted[i].start}-${sorted[i].end}] overlaps. Skip.`,
        detailedExplanation: `Start time ${sorted[i].start} < last end time ${lastEnd}.`, pseudocodeLine: 3,
        comparisons: i, assignments: 0, swaps: 0, complexity: 'O(n)', metadata: {} });
    }
  }

  states.push({ id: id++, dataStructureState: { activities: sorted, selected: [...selected] }, activeNodes: [], activeEdges: [],
    operation: 'COMPLETE', explanation: `Selected ${selected.length} non-overlapping activities: [${selected.map(a => a.id).join(', ')}]`,
    detailedExplanation: 'Greedy gives optimal solution for activity selection.', pseudocodeLine: null,
    comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(n log n)', metadata: {} });
  return states;
}

// ---- FIBONACCI DP (tabulation demo) ----
function fibDP(n: number): AlgorithmState[] {
  const states: AlgorithmState[] = [];
  let id = 0;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 0; dp[1] = 1;

  states.push({ id: id++, dataStructureState: { dp: [...dp], n }, activeNodes: [], activeEdges: [],
    operation: 'INITIALIZE', explanation: `Computing Fibonacci(${n}) using DP tabulation.`,
    detailedExplanation: 'Bottom-up: fill table from base cases.', pseudocodeLine: 0,
    comparisons: 0, assignments: 2, swaps: 0, complexity: 'O(n)', metadata: {} });

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    states.push({ id: id++, dataStructureState: { dp: [...dp], current: i },
      activeNodes: [{ id: `dp-${i}`, state: 'inserted' }], activeEdges: [],
      operation: 'FILL', explanation: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
      detailedExplanation: `Using previously computed values. No redundant computation.`, pseudocodeLine: 2,
      comparisons: 0, assignments: 1, swaps: 0, complexity: 'O(n)', metadata: {} });
  }

  states.push({ id: id++, dataStructureState: { dp: [...dp], result: dp[n] }, activeNodes: [], activeEdges: [],
    operation: 'COMPLETE', explanation: `Fibonacci(${n}) = ${dp[n]}. Computed in O(n) time and O(n) space.`,
    detailedExplanation: 'Recursive approach would be O(2^n). DP eliminates overlapping subproblems.', pseudocodeLine: null,
    comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(n)', metadata: {} });
  return states;
}

// ---- N-QUEENS (Backtracking demo) ----
function nQueens(n: number): AlgorithmState[] {
  const states: AlgorithmState[] = [];
  let id = 0;
  const board: number[] = new Array(n).fill(-1); // board[row] = col

  states.push({ id: id++, dataStructureState: { board: [...board], n }, activeNodes: [], activeEdges: [],
    operation: 'START', explanation: `Placing ${n} queens on a ${n}×${n} board using backtracking.`,
    detailedExplanation: 'Try placing one queen per row. Backtrack on conflict.', pseudocodeLine: 0,
    comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(n!)', metadata: {} });

  function isSafe(row: number, col: number): boolean {
    for (let r = 0; r < row; r++) {
      if (board[r] === col || Math.abs(board[r] - col) === Math.abs(r - row)) return false;
    }
    return true;
  }

  function solve(row: number): boolean {
    if (row === n) {
      states.push({ id: id++, dataStructureState: { board: [...board], n, solved: true }, activeNodes: [], activeEdges: [],
        operation: 'SOLUTION FOUND', explanation: `All ${n} queens placed! Solution: [${board.join(', ')}]`,
        detailedExplanation: `Queens at columns: ${board.map((c, r) => `row ${r} → col ${c}`).join(', ')}`, pseudocodeLine: null,
        comparisons: 0, assignments: 0, swaps: 0, complexity: 'O(n!)', metadata: {} });
      return true;
    }
    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        board[row] = col;
        states.push({ id: id++, dataStructureState: { board: [...board], n, placing: { row, col } },
          activeNodes: [{ id: `cell-${row}-${col}`, state: 'inserted' }], activeEdges: [],
          operation: 'PLACE', explanation: `Place queen at (${row}, ${col}).`,
          detailedExplanation: 'Position is safe — no conflicts with existing queens.', pseudocodeLine: 3,
          comparisons: row, assignments: 1, swaps: 0, complexity: 'O(n!)', metadata: {} });
        if (solve(row + 1)) return true;
        board[row] = -1;
        states.push({ id: id++, dataStructureState: { board: [...board], n, backtrack: { row, col } },
          activeNodes: [{ id: `cell-${row}-${col}`, state: 'deleted' }], activeEdges: [],
          operation: 'BACKTRACK', explanation: `Backtrack from (${row}, ${col}). No solution in subtree.`,
          detailedExplanation: 'Remove queen and try next column.', pseudocodeLine: 5,
          comparisons: 0, assignments: 1, swaps: 0, complexity: 'O(n!)', metadata: {} });
      }
    }
    return false;
  }

  solve(0);
  return states;
}

// ---- Array visualization helper ----
const ArrayView: React.FC<{ data: any; type: string }> = ({ data, type }) => {
  if (type === 'merge-sort' && data?.array) {
    return (
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'flex-end', minHeight: 200, padding: 'var(--space-4)' }}>
        {data.array.map((val: number, i: number) => {
          const isHighlight = data.merged && i >= data.merged.l && i <= data.merged.r;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: 32, height: Math.max(20, val * 2.5), background: isHighlight ? 'var(--state-success)' : data.sorted ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', transition: 'all 0.3s ease' }} />
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{val}</span>
            </div>
          );
        })}
      </div>
    );
  }
  if (type === 'activity' && data?.activities) {
    const maxEnd = Math.max(...data.activities.map((a: any) => a.end));
    const selectedIds = new Set((data.selected || []).map((a: any) => a.id));
    return (
      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {data.activities.map((a: any) => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="font-mono" style={{ width: 30, fontSize: '11px', color: 'var(--text-tertiary)' }}>A{a.id}</span>
            <div style={{ position: 'relative', flex: 1, height: 24 }}>
              <div style={{ position: 'absolute', left: `${(a.start / maxEnd) * 100}%`, width: `${((a.end - a.start) / maxEnd) * 100}%`, height: '100%',
                background: selectedIds.has(a.id) ? 'var(--state-success)' : 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
                border: `1px solid ${selectedIds.has(a.id) ? 'var(--state-success)' : 'var(--border-subtle)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="font-mono" style={{ fontSize: '9px', color: selectedIds.has(a.id) ? '#fff' : 'var(--text-muted)' }}>{a.start}-{a.end}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (type === 'dp' && data?.dp) {
    return (
      <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', padding: 'var(--space-4)', justifyContent: 'center' }}>
        {data.dp.map((val: number, i: number) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, padding: '4px',
            background: i === data.current ? 'rgba(16,185,129,0.15)' : 'var(--bg-surface)', border: `1px solid ${i === data.current ? 'var(--state-success)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-sm)' }}>
            <span className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{i}</span>
            <span className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: i === data.current ? 'var(--state-success)' : 'var(--text-primary)' }}>{val}</span>
          </div>
        ))}
      </div>
    );
  }
  if (type === 'nqueens' && data?.board) {
    const n = data.n || 4;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px', padding: 'var(--space-4)' }}>
        {Array.from({ length: n }, (_, r) => (
          <div key={r} style={{ display: 'flex', gap: '1px' }}>
            {Array.from({ length: n }, (_, c) => {
              const hasQueen = data.board[r] === c;
              const isDark = (r + c) % 2 === 1;
              return (
                <div key={c} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: hasQueen ? 'var(--accent-primary)' : isDark ? 'var(--bg-tertiary)' : 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)', borderRadius: '2px', fontSize: '18px' }}>
                  {hasQueen ? '♛' : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
  return <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-12)' }}>Select a technique and run to see visualization</div>;
};

type Technique = 'divide-and-conquer' | 'greedy' | 'dynamic-programming' | 'backtracking';

const techniqueInfo: Record<Technique, { title: string; desc: string; complexity: ComplexityInfo; demo: string }> = {
  'divide-and-conquer': { title: 'Divide and Conquer', desc: 'Merge Sort — split, sort halves, merge.', complexity: { time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' }, space: 'O(n)' }, demo: 'merge-sort' },
  'greedy': { title: 'Greedy Algorithm', desc: 'Activity Selection — pick earliest-finishing activity.', complexity: { time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' }, space: 'O(n)' }, demo: 'activity' },
  'dynamic-programming': { title: 'Dynamic Programming', desc: 'Fibonacci — tabulation eliminates redundant computation.', complexity: { time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' }, space: 'O(n)' }, demo: 'dp' },
  'backtracking': { title: 'Backtracking', desc: 'N-Queens — place queens with constraint checking.', complexity: { time: { best: 'O(n!)', average: 'O(n!)', worst: 'O(n!)' }, space: 'O(n)' }, demo: 'nqueens' },
};

export const DesignTechniqueVisualizer: React.FC<{ technique?: Technique }> = ({ technique: propTechnique }) => {
  const [technique, setTechnique] = useState<Technique>(propTechnique || 'divide-and-conquer');
  const { currentState, controls, loadStates } = useStateEngine();
  const info = techniqueInfo[technique];

  const handleRun = useCallback(() => {
    let states: AlgorithmState[] = [];
    switch (technique) {
      case 'divide-and-conquer':
        states = mergeSortTrace([38, 27, 43, 3, 9, 82, 10, 15, 52, 31]);
        break;
      case 'greedy':
        states = activitySelection([
          { id: 1, start: 1, end: 4 }, { id: 2, start: 3, end: 5 }, { id: 3, start: 0, end: 6 },
          { id: 4, start: 5, end: 7 }, { id: 5, start: 3, end: 9 }, { id: 6, start: 5, end: 9 },
          { id: 7, start: 6, end: 10 }, { id: 8, start: 8, end: 11 }, { id: 9, start: 8, end: 12 },
          { id: 10, start: 2, end: 14 }, { id: 11, start: 12, end: 16 },
        ]);
        break;
      case 'dynamic-programming':
        states = fibDP(12);
        break;
      case 'backtracking':
        states = nQueens(6);
        break;
    }
    loadStates(states);
  }, [technique, loadStates]);

  return (
    <div className="bst-visualizer">
      <TheorySection topicId={technique} />
      <div className="viz-header">
        <div className="viz-header-info">
          <span className="viz-badge">Unit 6 — Design Techniques</span>
          <h1 className="viz-title">{info.title}</h1>
          <p className="viz-desc">{info.desc}</p>
        </div>
      </div>
      <div className="viz-layout">
        <div className="viz-main">
          <div className="viz-controls-bar">
            <div className="viz-input-group">
              <select className="viz-input" value={technique} onChange={e => { setTechnique(e.target.value as Technique); loadStates([]); }}>
                <option value="divide-and-conquer">Divide & Conquer (Merge Sort)</option>
                <option value="greedy">Greedy (Activity Selection)</option>
                <option value="dynamic-programming">Dynamic Programming (Fibonacci)</option>
                <option value="backtracking">Backtracking (N-Queens)</option>
              </select>
              <button className="viz-btn viz-btn-insert" onClick={handleRun}>Run</button>
              <button className="viz-btn viz-btn-ghost" onClick={() => loadStates([])}>Reset</button>
            </div>
          </div>
          <div className="viz-canvas" style={{ minHeight: 'auto' }}>
            <ArrayView data={currentState?.dataStructureState} type={info.demo} />
          </div>
          <AnimationControls controls={controls} operationLabel={currentState?.operation} comparisons={currentState?.comparisons} complexity={currentState?.complexity} />
        </div>
        <div className="viz-sidebar">
          <ExplanationPanel state={currentState} stepIndex={controls.currentStep} totalSteps={controls.totalSteps} />
          <ComplexityPanel complexity={info.complexity} title={`${info.title} Complexity`} />
          <div className="viz-info-panel glass-panel">
            <h4 className="viz-info-title">Design Techniques Overview</h4>
            <ul className="viz-info-list">
              <li><strong>D&C:</strong> Split → Solve → Combine (Merge Sort, Quick Sort)</li>
              <li><strong>Greedy:</strong> Locally optimal → Globally optimal (Activity, Huffman)</li>
              <li><strong>DP:</strong> Overlapping subproblems + memoization (Fibonacci, LCS)</li>
              <li><strong>B&B:</strong> Explore with bounds pruning (Knapsack, TSP)</li>
              <li><strong>Backtracking:</strong> Explore with constraint checking (N-Queens, Sudoku)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
