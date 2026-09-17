/* ============================================
   Huffman Coding — Greedy compression algorithm
   with tree building + encoding state snapshots
   ============================================ */

import type { AlgorithmState } from '../../types';

export interface HuffmanNode {
  id: string;
  char: string | null;
  freq: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
  code: string;
  x: number;
  y: number;
}

let hCounter = 0;

function createHNode(char: string | null, freq: number): HuffmanNode {
  return {
    id: `huff-${hCounter++}`,
    char, freq,
    left: null, right: null,
    code: '', x: 0, y: 0,
  };
}

function cloneH(n: HuffmanNode | null): HuffmanNode | null {
  if (!n) return null;
  return { ...n, left: cloneH(n.left), right: cloneH(n.right) };
}

function layoutH(node: HuffmanNode | null, depth: number = 0, pos: number = 300, spread: number = 200): void {
  if (!node) return;
  node.x = pos;
  node.y = depth * 60 + 40;
  const cs = spread * 0.52;
  layoutH(node.left, depth + 1, pos - spread / 2, cs);
  layoutH(node.right, depth + 1, pos + spread / 2, cs);
}

function assignCodes(node: HuffmanNode | null, prefix: string = ''): void {
  if (!node) return;
  node.code = prefix;
  if (node.left) assignCodes(node.left, prefix + '0');
  if (node.right) assignCodes(node.right, prefix + '1');
}

// Compute frequency table
export function getFrequencyTable(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const ch of text) {
    freq.set(ch, (freq.get(ch) || 0) + 1);
  }
  return freq;
}

// ---- Build Huffman Tree with snapshots ----
export function buildHuffmanTree(text: string): { root: HuffmanNode | null; states: AlgorithmState[]; codeTable: Map<string, string> } {
  const states: AlgorithmState[] = [];
  let stateId = 0;

  const freq = getFrequencyTable(text);
  const freqEntries = Array.from(freq.entries()).sort((a, b) => a[1] - b[1]);

  states.push({
    id: stateId++,
    dataStructureState: { frequencyTable: freqEntries },
    activeNodes: [], activeEdges: [],
    operation: 'FREQUENCY TABLE',
    explanation: `Character frequencies: ${freqEntries.map(([ch, f]) => `'${ch}'=${f}`).join(', ')}`,
    detailedExplanation: 'First step: count the frequency of each character in the input text.',
    pseudocodeLine: 0, comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(n)', metadata: { frequencies: Object.fromEntries(freqEntries) },
  });

  // Build priority queue (min-heap via sorted array)
  let queue: HuffmanNode[] = freqEntries.map(([ch, f]) => createHNode(ch, f));

  states.push({
    id: stateId++,
    dataStructureState: { queue: queue.map(n => ({ char: n.char, freq: n.freq })) },
    activeNodes: [], activeEdges: [],
    operation: 'INIT QUEUE',
    explanation: `Priority queue (min-heap) initialized with ${queue.length} nodes.`,
    detailedExplanation: 'Each character becomes a leaf node. We repeatedly merge the two smallest.',
    pseudocodeLine: 1, comparisons: 0, assignments: queue.length, swaps: 0,
    complexity: 'O(n log n)', metadata: {},
  });

  let step = 0;
  while (queue.length > 1) {
    queue.sort((a, b) => a.freq - b.freq);
    step++;

    const left = queue.shift()!;
    const right = queue.shift()!;

    states.push({
      id: stateId++,
      dataStructureState: {
        merging: { left: { char: left.char, freq: left.freq }, right: { char: right.char, freq: right.freq } },
        queue: queue.map(n => ({ char: n.char, freq: n.freq })),
      },
      activeNodes: [
        { id: left.id, state: 'active' },
        { id: right.id, state: 'comparing' },
      ],
      activeEdges: [],
      operation: 'EXTRACT TWO MIN',
      explanation: `Extract two minimum: ${left.char ? `'${left.char}'` : '⊕'}(${left.freq}) and ${right.char ? `'${right.char}'` : '⊕'}(${right.freq})`,
      detailedExplanation: `Step ${step}: Take the two nodes with lowest frequency from the priority queue.`,
      pseudocodeLine: 3, comparisons: step, assignments: 0, swaps: 0,
      complexity: 'O(n log n)', metadata: { step },
    });

    const merged = createHNode(null, left.freq + right.freq);
    merged.left = left;
    merged.right = right;

    queue.push(merged);

    states.push({
      id: stateId++,
      dataStructureState: {
        merged: { freq: merged.freq, leftChar: left.char, rightChar: right.char },
        queue: queue.map(n => ({ char: n.char, freq: n.freq })),
      },
      activeNodes: [{ id: merged.id, state: 'inserted' }],
      activeEdges: [],
      operation: 'MERGE',
      explanation: `Merged into new node with frequency ${merged.freq}. Queue size: ${queue.length}.`,
      detailedExplanation: `The merged node becomes parent. Left child = 0, Right child = 1.`,
      pseudocodeLine: 5, comparisons: 0, assignments: 1, swaps: 0,
      complexity: 'O(n log n)', metadata: { mergedFreq: merged.freq },
    });
  }

  const root = queue[0] || null;
  if (root) {
    layoutH(root, 0, 300, 260);
    assignCodes(root);
  }

  // Build code table
  const codeTable = new Map<string, string>();
  function collectCodes(n: HuffmanNode | null) {
    if (!n) return;
    if (n.char) codeTable.set(n.char, n.code);
    collectCodes(n.left);
    collectCodes(n.right);
  }
  collectCodes(root);

  // Code table state
  const codeEntries = Array.from(codeTable.entries());
  states.push({
    id: stateId++,
    dataStructureState: cloneH(root),
    activeNodes: [], activeEdges: [],
    operation: 'HUFFMAN TREE COMPLETE',
    explanation: `Huffman tree built! Codes: ${codeEntries.map(([ch, c]) => `'${ch}'=${c}`).join(', ')}`,
    detailedExplanation: `Original: ${text.length * 8} bits (ASCII). Encoded: ${text.split('').reduce((sum, ch) => sum + (codeTable.get(ch)?.length || 0), 0)} bits. Compression ratio: ${((1 - text.split('').reduce((sum, ch) => sum + (codeTable.get(ch)?.length || 0), 0) / (text.length * 8)) * 100).toFixed(1)}%`,
    pseudocodeLine: null, comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(n log n)',
    metadata: { codeTable: Object.fromEntries(codeEntries) },
  });

  return { root, states, codeTable };
}

export const huffmanPseudocode = [
  'function huffman(text):',
  '  freq = countFrequencies(text)',
  '  Q = priority queue of (char, freq) nodes',
  '  while Q.size > 1:',
  '    left = Q.extractMin()',
  '    right = Q.extractMin()',
  '    merged = new Node(left.freq + right.freq)',
  '    merged.left = left',
  '    merged.right = right',
  '    Q.insert(merged)',
  '  root = Q.extractMin()',
  '  assignCodes(root)  // left=0, right=1',
  '  return root',
];
