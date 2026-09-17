/* ============================================
   LCS Algorithm — Longest Common Subsequence
   with DP matrix state snapshots
   ============================================ */

import type { AlgorithmState } from '../../types';

export interface LCSMatrix {
  rows: number;
  cols: number;
  cells: number[][];
  arrows: ('diag' | 'up' | 'left' | 'none')[][];
  text1: string;
  text2: string;
}

function cloneMatrix(m: LCSMatrix): LCSMatrix {
  return {
    ...m,
    cells: m.cells.map(r => [...r]),
    arrows: m.arrows.map(r => [...r]),
  };
}

export function lcsCompute(s1: string, s2: string): { lcs: string; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let stateId = 0;
  let comparisons = 0;
  const m = s1.length;
  const n = s2.length;

  // Initialize matrix
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const arrows: ('diag' | 'up' | 'left' | 'none')[][] = Array.from(
    { length: m + 1 }, () => new Array(n + 1).fill('none' as const)
  );

  const matrix: LCSMatrix = { rows: m + 1, cols: n + 1, cells: dp, arrows, text1: s1, text2: s2 };

  states.push({
    id: stateId++,
    dataStructureState: cloneMatrix(matrix),
    activeNodes: [], activeEdges: [],
    operation: 'INITIALIZE',
    explanation: `Computing LCS of "${s1}" and "${s2}". Matrix size: ${m + 1}×${n + 1}.`,
    detailedExplanation: 'Dynamic programming approach: build a matrix where dp[i][j] = length of LCS of s1[0..i-1] and s2[0..j-1].',
    pseudocodeLine: 0, comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(m·n)', metadata: { s1, s2 },
  });

  // Fill matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      comparisons++;
      const isMatch = s1[i - 1] === s2[j - 1];

      if (isMatch) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        arrows[i][j] = 'diag';

        states.push({
          id: stateId++,
          dataStructureState: cloneMatrix(matrix),
          activeNodes: [{ id: `cell-${i}-${j}`, state: 'match' }],
          activeEdges: [],
          operation: 'MATCH',
          explanation: `s1[${i - 1}]='${s1[i - 1]}' = s2[${j - 1}]='${s2[j - 1]}' → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}`,
          detailedExplanation: 'Characters match! Take the diagonal value + 1. This extends the common subsequence.',
          pseudocodeLine: 3, comparisons, assignments: 1, swaps: 0,
          complexity: 'O(m·n)', metadata: { i, j, char: s1[i - 1], value: dp[i][j] },
        });
      } else {
        if (dp[i - 1][j] >= dp[i][j - 1]) {
          dp[i][j] = dp[i - 1][j];
          arrows[i][j] = 'up';
        } else {
          dp[i][j] = dp[i][j - 1];
          arrows[i][j] = 'left';
        }

        // Only emit states for interesting cells to keep total manageable
        if ((i + j) % 2 === 0 || i === m || j === n) {
          states.push({
            id: stateId++,
            dataStructureState: cloneMatrix(matrix),
            activeNodes: [{ id: `cell-${i}-${j}`, state: 'mismatch' }],
            activeEdges: [],
            operation: 'MISMATCH',
            explanation: `s1[${i - 1}]='${s1[i - 1]}' ≠ s2[${j - 1}]='${s2[j - 1]}' → dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}`,
            detailedExplanation: `No match. Take the maximum of the cell above (${dp[i - 1][j]}) or left (${dp[i][j - 1]}).`,
            pseudocodeLine: 5, comparisons, assignments: 1, swaps: 0,
            complexity: 'O(m·n)', metadata: { i, j, value: dp[i][j] },
          });
        }
      }
    }
  }

  // Backtrack to find LCS string
  let lcs = '';
  let i = m, j = n;
  const backtrackCells: { i: number; j: number }[] = [];

  while (i > 0 && j > 0) {
    if (arrows[i][j] === 'diag') {
      lcs = s1[i - 1] + lcs;
      backtrackCells.push({ i, j });
      i--;
      j--;
    } else if (arrows[i][j] === 'up') {
      i--;
    } else {
      j--;
    }
  }

  states.push({
    id: stateId++,
    dataStructureState: cloneMatrix(matrix),
    activeNodes: backtrackCells.map(c => ({ id: `cell-${c.i}-${c.j}`, state: 'success' as const })),
    activeEdges: [],
    operation: 'LCS FOUND',
    explanation: `LCS = "${lcs}" (length ${lcs.length}). Found by backtracking through the matrix.`,
    detailedExplanation: `The longest common subsequence of "${s1}" and "${s2}" is "${lcs}". Total comparisons: ${comparisons}.`,
    pseudocodeLine: null, comparisons, assignments: 0, swaps: 0,
    complexity: `O(${m}×${n}) = O(${m * n})`,
    metadata: { lcs, length: lcs.length, backtrack: backtrackCells },
  });

  return { lcs, states };
}

export const lcsPseudocode = [
  'function LCS(s1, s2):',
  '  dp[0..m][0..n] = 0',
  '  for i = 1 to m:',
  '    for j = 1 to n:',
  '      if s1[i-1] == s2[j-1]:',
  '        dp[i][j] = dp[i-1][j-1] + 1',
  '      else:',
  '        dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
  '  // Backtrack from dp[m][n]',
  '  return reconstructLCS(dp)',
];
