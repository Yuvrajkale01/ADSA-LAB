/* ============================================
   Text Pattern Matching Algorithms
   Brute Force, KMP (with LPS), Boyer-Moore
   ============================================ */

import type { AlgorithmState } from '../../types';

// ---- BRUTE FORCE ----
export function bruteForceMatch(text: string, pattern: string): AlgorithmState[] {
  const states: AlgorithmState[] = [];
  let stateId = 0;
  let comparisons = 0;

  states.push({
    id: stateId++,
    dataStructureState: { text, pattern, alignment: 0, charIndex: 0 },
    activeNodes: [], activeEdges: [],
    operation: 'START',
    explanation: `Brute force: compare pattern "${pattern}" against text "${text}".`,
    detailedExplanation: 'Try every possible alignment and compare character by character.',
    pseudocodeLine: 0, comparisons, assignments: 0, swaps: 0,
    complexity: 'O(n·m)', metadata: { text, pattern },
  });

  for (let i = 0; i <= text.length - pattern.length; i++) {
    let matched = true;
    for (let j = 0; j < pattern.length; j++) {
      comparisons++;
      const isMatch = text[i + j] === pattern[j];

      states.push({
        id: stateId++,
        dataStructureState: {
          text, pattern, alignment: i, charIndex: j,
          textHighlights: [{ index: i + j, state: isMatch ? 'match' : 'mismatch' }],
          patternHighlights: [{ index: j, state: isMatch ? 'match' : 'mismatch' }],
        },
        activeNodes: [], activeEdges: [],
        operation: isMatch ? 'MATCH' : 'MISMATCH',
        explanation: isMatch
          ? `text[${i + j}]='${text[i + j]}' = pattern[${j}]='${pattern[j]}' ✓`
          : `text[${i + j}]='${text[i + j]}' ≠ pattern[${j}]='${pattern[j]}' ✗`,
        detailedExplanation: isMatch
          ? 'Characters match. Continue comparing.'
          : `Mismatch at position ${j}. Shift pattern right by 1.`,
        pseudocodeLine: 3, comparisons, assignments: 0, swaps: 0,
        complexity: 'O(n·m)', metadata: { alignment: i, charIndex: j, isMatch },
      });

      if (!isMatch) {
        matched = false;
        break;
      }
    }

    if (matched) {
      states.push({
        id: stateId++,
        dataStructureState: { text, pattern, alignment: i, foundAt: i },
        activeNodes: [], activeEdges: [],
        operation: 'PATTERN FOUND',
        explanation: `Pattern found at index ${i}!`,
        detailedExplanation: `All ${pattern.length} characters matched starting at position ${i}.`,
        pseudocodeLine: 6, comparisons, assignments: 0, swaps: 0,
        complexity: `O(${comparisons})`, metadata: { foundAt: i },
      });
      return states;
    }
  }

  states.push({
    id: stateId++,
    dataStructureState: { text, pattern, alignment: -1 },
    activeNodes: [], activeEdges: [],
    operation: 'NOT FOUND',
    explanation: `Pattern "${pattern}" not found in text.`,
    detailedExplanation: `Exhausted all ${text.length - pattern.length + 1} alignments with ${comparisons} comparisons.`,
    pseudocodeLine: null, comparisons, assignments: 0, swaps: 0,
    complexity: `O(${comparisons})`, metadata: { notFound: true },
  });

  return states;
}

// ---- KMP: Build LPS Array ----
export function buildLPS(pattern: string): { lps: number[]; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let stateId = 0;
  const lps = new Array(pattern.length).fill(0);
  let len = 0;
  let i = 1;

  states.push({
    id: stateId++,
    dataStructureState: { pattern, lps: [...lps], i, len },
    activeNodes: [], activeEdges: [],
    operation: 'BUILD LPS',
    explanation: `Building LPS (Longest Proper Prefix which is also Suffix) array for "${pattern}".`,
    detailedExplanation: 'The LPS array tells us how far back to fall when a mismatch occurs, avoiding redundant comparisons.',
    pseudocodeLine: 0, comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(m)', metadata: { pattern },
  });

  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      states.push({
        id: stateId++,
        dataStructureState: { pattern, lps: [...lps], i, len },
        activeNodes: [], activeEdges: [],
        operation: 'LPS MATCH',
        explanation: `pattern[${i}]='${pattern[i]}' = pattern[${len - 1}]='${pattern[len - 1]}'. LPS[${i}] = ${len}.`,
        detailedExplanation: `Found prefix-suffix match of length ${len}. This means we can skip ${len} characters on mismatch.`,
        pseudocodeLine: 3, comparisons: 0, assignments: 1, swaps: 0,
        complexity: 'O(m)', metadata: { lps: [...lps] },
      });
      i++;
    } else {
      if (len !== 0) {
        states.push({
          id: stateId++,
          dataStructureState: { pattern, lps: [...lps], i, len: lps[len - 1] },
          activeNodes: [], activeEdges: [],
          operation: 'LPS FALLBACK',
          explanation: `Mismatch at pattern[${i}]='${pattern[i]}'. Fall back: len = LPS[${len - 1}] = ${lps[len - 1]}.`,
          detailedExplanation: 'Instead of resetting, use the LPS value to skip ahead.',
          pseudocodeLine: 6, comparisons: 0, assignments: 0, swaps: 0,
          complexity: 'O(m)', metadata: { lps: [...lps] },
        });
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        states.push({
          id: stateId++,
          dataStructureState: { pattern, lps: [...lps], i, len },
          activeNodes: [], activeEdges: [],
          operation: 'LPS ZERO',
          explanation: `No prefix-suffix match at position ${i}. LPS[${i}] = 0.`,
          detailedExplanation: 'No proper prefix found that is also a suffix.',
          pseudocodeLine: 8, comparisons: 0, assignments: 1, swaps: 0,
          complexity: 'O(m)', metadata: { lps: [...lps] },
        });
        i++;
      }
    }
  }

  states.push({
    id: stateId++,
    dataStructureState: { pattern, lps: [...lps] },
    activeNodes: [], activeEdges: [],
    operation: 'LPS COMPLETE',
    explanation: `LPS array: [${lps.join(', ')}]`,
    detailedExplanation: 'LPS construction complete. Ready for KMP pattern matching.',
    pseudocodeLine: null, comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(m)', metadata: { lps: [...lps] },
  });

  return { lps, states };
}

// ---- KMP Pattern Matching ----
export function kmpMatch(text: string, pattern: string): AlgorithmState[] {
  const { lps, states: lpsStates } = buildLPS(pattern);
  const states: AlgorithmState[] = [...lpsStates];
  let stateId = states.length;
  let comparisons = 0;

  let i = 0; // text index
  let j = 0; // pattern index

  states.push({
    id: stateId++,
    dataStructureState: { text, pattern, lps, i, j, alignment: 0 },
    activeNodes: [], activeEdges: [],
    operation: 'START KMP SEARCH',
    explanation: `Searching for "${pattern}" in "${text}" using KMP.`,
    detailedExplanation: 'KMP uses the LPS array to skip unnecessary comparisons.',
    pseudocodeLine: 0, comparisons, assignments: 0, swaps: 0,
    complexity: 'O(n + m)', metadata: { lps },
  });

  while (i < text.length) {
    comparisons++;
    const isMatch = text[i] === pattern[j];

    states.push({
      id: stateId++,
      dataStructureState: {
        text, pattern, lps, i, j, alignment: i - j,
        textHighlights: [{ index: i, state: isMatch ? 'match' : 'mismatch' }],
        patternHighlights: [{ index: j, state: isMatch ? 'match' : 'mismatch' }],
      },
      activeNodes: [], activeEdges: [],
      operation: isMatch ? 'MATCH' : 'MISMATCH',
      explanation: isMatch
        ? `text[${i}]='${text[i]}' = pattern[${j}]='${pattern[j]}' ✓`
        : `text[${i}]='${text[i]}' ≠ pattern[${j}]='${pattern[j]}' ✗`,
      detailedExplanation: isMatch
        ? 'Match! Advance both pointers.'
        : j > 0
          ? `Use LPS fallback: j = LPS[${j - 1}] = ${lps[j - 1]}. Skip ${j - lps[j - 1]} characters!`
          : 'At start of pattern. Advance text pointer.',
      pseudocodeLine: 3, comparisons, assignments: 0, swaps: 0,
      complexity: 'O(n + m)', metadata: { i, j, alignment: i - j },
    });

    if (isMatch) {
      i++;
      j++;
      if (j === pattern.length) {
        states.push({
          id: stateId++,
          dataStructureState: { text, pattern, lps, foundAt: i - j },
          activeNodes: [], activeEdges: [],
          operation: 'PATTERN FOUND',
          explanation: `Pattern found at index ${i - j}!`,
          detailedExplanation: `KMP found the match with only ${comparisons} comparisons (brute force would need up to ${text.length * pattern.length}).`,
          pseudocodeLine: 6, comparisons, assignments: 0, swaps: 0,
          complexity: `O(${comparisons})`, metadata: { foundAt: i - j },
        });
        return states;
      }
    } else {
      if (j !== 0) {
        j = lps[j - 1];
      } else {
        i++;
      }
    }
  }

  states.push({
    id: stateId++,
    dataStructureState: { text, pattern, lps, alignment: -1 },
    activeNodes: [], activeEdges: [],
    operation: 'NOT FOUND',
    explanation: `Pattern not found. ${comparisons} comparisons used.`,
    detailedExplanation: 'KMP exhausted all positions without finding a match.',
    pseudocodeLine: null, comparisons, assignments: 0, swaps: 0,
    complexity: `O(${comparisons})`, metadata: { notFound: true },
  });

  return states;
}

export const kmpPseudocode = [
  'function KMP(text, pattern):',
  '  lps = buildLPS(pattern)',
  '  i = 0, j = 0',
  '  while i < len(text):',
  '    if text[i] == pattern[j]:',
  '      i++, j++',
  '      if j == len(pattern):',
  '        return i - j  // found!',
  '    else:',
  '      if j != 0:',
  '        j = lps[j-1]  // fallback',
  '      else:',
  '        i++',
  '  return -1  // not found',
];

export const bfPseudocode = [
  'function bruteForce(text, pattern):',
  '  for i = 0 to len(text) - len(pattern):',
  '    match = true',
  '    for j = 0 to len(pattern):',
  '      if text[i+j] != pattern[j]:',
  '        match = false, break',
  '    if match:',
  '      return i  // found!',
  '  return -1  // not found',
];
