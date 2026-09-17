/* ============================================
   Splay Tree Algorithm — Self-adjusting BST
   with zig, zig-zig, zig-zag operations
   ============================================ */

import type { AlgorithmState } from '../../types';

export interface SplayNode {
  id: string;
  value: number;
  left: SplayNode | null;
  right: SplayNode | null;
  x: number;
  y: number;
}

let splayCounter = 0;

function createSplayNode(value: number): SplayNode {
  return { id: `splay-${splayCounter++}`, value, left: null, right: null, x: 0, y: 0 };
}

function cloneSplay(n: SplayNode | null): SplayNode | null {
  if (!n) return null;
  return { ...n, left: cloneSplay(n.left), right: cloneSplay(n.right) };
}

function layoutSplay(node: SplayNode | null, depth: number = 0, pos: number = 300, spread: number = 200): void {
  if (!node) return;
  node.x = pos;
  node.y = depth * 70 + 50;
  const cs = spread * 0.55;
  layoutSplay(node.left, depth + 1, pos - spread / 2, cs);
  layoutSplay(node.right, depth + 1, pos + spread / 2, cs);
}

function rightRotate(x: SplayNode): SplayNode {
  const y = x.left!;
  x.left = y.right;
  y.right = x;
  return y;
}

function leftRotate(x: SplayNode): SplayNode {
  const y = x.right!;
  x.right = y.left;
  y.left = x;
  return y;
}

// Splay operation — brings the target key to the root
function splay(root: SplayNode | null, key: number, states: AlgorithmState[], stateIdRef: { val: number }): SplayNode | null {
  if (!root) return null;
  if (root.value === key) return root;

  if (key < root.value) {
    if (!root.left) return root;

    if (key < root.left.value) {
      // Zig-Zig (Left Left)
      root.left.left = splay(root.left.left, key, states, stateIdRef);
      layoutSplay(root, 0, 300);
      states.push({
        id: stateIdRef.val++,
        dataStructureState: cloneSplay(root),
        activeNodes: [{ id: root.id, state: 'highlight' }],
        activeEdges: [],
        operation: 'ZIG-ZIG (Left-Left)',
        explanation: `Zig-Zig: key ${key} is in left-left subtree of ${root.value}. Right-rotate twice.`,
        detailedExplanation: 'Zig-zig brings the accessed node two levels up with two same-direction rotations.',
        pseudocodeLine: 3, comparisons: 1, assignments: 2, swaps: 0,
        complexity: 'O(log n) amortized', metadata: { rotationType: 'zig-zig' },
      });
      root = rightRotate(root);
    } else if (key > root.left.value) {
      // Zig-Zag (Left Right)
      root.left.right = splay(root.left.right, key, states, stateIdRef);
      if (root.left.right) {
        layoutSplay(root, 0, 300);
        states.push({
          id: stateIdRef.val++,
          dataStructureState: cloneSplay(root),
          activeNodes: [{ id: root.left.id, state: 'highlight' }],
          activeEdges: [],
          operation: 'ZIG-ZAG (Left-Right)',
          explanation: `Zig-Zag: key ${key} is in left-right subtree. Left-rotate at ${root.left.value}, then right-rotate at ${root.value}.`,
          detailedExplanation: 'Zig-zag handles the case where the node is in opposite-direction subtrees.',
          pseudocodeLine: 6, comparisons: 1, assignments: 4, swaps: 0,
          complexity: 'O(log n) amortized', metadata: { rotationType: 'zig-zag' },
        });
        root.left = leftRotate(root.left);
      }
    }

    if (!root.left) return root;
    root = rightRotate(root); // Zig
  } else {
    if (!root.right) return root;

    if (key > root.right.value) {
      // Zag-Zag (Right Right)
      root.right.right = splay(root.right.right, key, states, stateIdRef);
      layoutSplay(root, 0, 300);
      states.push({
        id: stateIdRef.val++,
        dataStructureState: cloneSplay(root),
        activeNodes: [{ id: root.id, state: 'highlight' }],
        activeEdges: [],
        operation: 'ZAG-ZAG (Right-Right)',
        explanation: `Zag-Zag: key ${key} is in right-right subtree of ${root.value}. Left-rotate twice.`,
        detailedExplanation: 'Mirror of zig-zig for right subtrees.',
        pseudocodeLine: 10, comparisons: 1, assignments: 2, swaps: 0,
        complexity: 'O(log n) amortized', metadata: { rotationType: 'zag-zag' },
      });
      root = leftRotate(root);
    } else if (key < root.right.value) {
      // Zag-Zig (Right Left)
      root.right.left = splay(root.right.left, key, states, stateIdRef);
      if (root.right.left) {
        layoutSplay(root, 0, 300);
        states.push({
          id: stateIdRef.val++,
          dataStructureState: cloneSplay(root),
          activeNodes: [{ id: root.right.id, state: 'highlight' }],
          activeEdges: [],
          operation: 'ZAG-ZIG (Right-Left)',
          explanation: `Zag-Zig: key ${key} is in right-left subtree. Right-rotate at ${root.right.value}, then left-rotate at ${root.value}.`,
          detailedExplanation: 'Mirror of zig-zag for right subtrees.',
          pseudocodeLine: 13, comparisons: 1, assignments: 4, swaps: 0,
          complexity: 'O(log n) amortized', metadata: { rotationType: 'zag-zig' },
        });
        root.right = rightRotate(root.right);
      }
    }

    if (!root.right) return root;
    root = leftRotate(root); // Zag
  }

  return root;
}

export function splayInsert(root: SplayNode | null, value: number): { root: SplayNode; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  const stateIdRef = { val: 0 };

  if (!root) {
    const newNode = createSplayNode(value);
    layoutSplay(newNode);
    states.push({
      id: stateIdRef.val++,
      dataStructureState: cloneSplay(newNode),
      activeNodes: [{ id: newNode.id, state: 'inserted' }],
      activeEdges: [],
      operation: 'INSERT',
      explanation: `Tree empty. Insert ${value} as root.`,
      detailedExplanation: 'First node becomes the root of the splay tree.',
      pseudocodeLine: 0, comparisons: 0, assignments: 1, swaps: 0,
      complexity: 'O(1)', metadata: {},
    });
    return { root: newNode, states };
  }

  // Splay the closest node to the root
  root = splay(root, value, states, stateIdRef)!;
  layoutSplay(root, 0, 300);

  if (root.value === value) {
    states.push({
      id: stateIdRef.val++,
      dataStructureState: cloneSplay(root),
      activeNodes: [{ id: root.id, state: 'error' }],
      activeEdges: [],
      operation: 'DUPLICATE',
      explanation: `${value} already exists (now at root after splay).`,
      detailedExplanation: 'Splay trees bring the last accessed node to root even on duplicates.',
      pseudocodeLine: null, comparisons: 0, assignments: 0, swaps: 0,
      complexity: 'O(log n) amortized', metadata: {},
    });
    return { root, states };
  }

  const newNode = createSplayNode(value);

  if (value < root.value) {
    newNode.right = root;
    newNode.left = root.left;
    root.left = null;
  } else {
    newNode.left = root;
    newNode.right = root.right;
    root.right = null;
  }

  layoutSplay(newNode, 0, 300);
  states.push({
    id: stateIdRef.val++,
    dataStructureState: cloneSplay(newNode),
    activeNodes: [{ id: newNode.id, state: 'inserted' }],
    activeEdges: [],
    operation: 'INSERT + SPLAY',
    explanation: `Inserted ${value} as new root. Previous root ${root.value} becomes child.`,
    detailedExplanation: 'After splay, the new node becomes root. The old root becomes left or right child.',
    pseudocodeLine: null, comparisons: 0, assignments: 1, swaps: 0,
    complexity: 'O(log n) amortized', metadata: {},
  });

  return { root: newNode, states };
}

export function splaySearch(root: SplayNode | null, value: number): { root: SplayNode | null; found: boolean; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  const stateIdRef = { val: 0 };

  if (!root) {
    states.push({
      id: stateIdRef.val++,
      dataStructureState: null,
      activeNodes: [], activeEdges: [],
      operation: 'NOT FOUND',
      explanation: `Tree empty. ${value} not found.`,
      detailedExplanation: '',
      pseudocodeLine: null, comparisons: 0, assignments: 0, swaps: 0,
      complexity: 'O(1)', metadata: {},
    });
    return { root, found: false, states };
  }

  states.push({
    id: stateIdRef.val++,
    dataStructureState: cloneSplay(root),
    activeNodes: [], activeEdges: [],
    operation: 'SEARCH + SPLAY',
    explanation: `Searching for ${value}. Splay will bring it (or closest) to root.`,
    detailedExplanation: 'In splay trees, every search operation splays the tree, bringing frequently accessed nodes to the top.',
    pseudocodeLine: 0, comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(log n) amortized', metadata: {},
  });

  root = splay(root, value, states, stateIdRef)!;
  layoutSplay(root, 0, 300);
  const found = root.value === value;

  states.push({
    id: stateIdRef.val++,
    dataStructureState: cloneSplay(root),
    activeNodes: [{ id: root.id, state: found ? 'success' : 'error' }],
    activeEdges: [],
    operation: found ? 'FOUND' : 'NOT FOUND',
    explanation: found
      ? `Found ${value}! It is now the root (splay property).`
      : `${value} not found. Closest value ${root.value} is now at root.`,
    detailedExplanation: found
      ? 'The splay tree brings the accessed node to root, making future access O(1).'
      : 'Even when not found, the closest node is splayed to root for amortized efficiency.',
    pseudocodeLine: null, comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(log n) amortized', metadata: { found },
  });

  return { root, found, states };
}

export const splayPseudocode = [
  'function splay(root, key):',
  '  if root.key == key: return root',
  '  if key < root.key:',
  '    if key < root.left.key:     // Zig-Zig',
  '      splay(root.left.left, key)',
  '      root = rightRotate(root)',
  '    elif key > root.left.key:   // Zig-Zag',
  '      splay(root.left.right, key)',
  '      root.left = leftRotate(root.left)',
  '    root = rightRotate(root)    // Zig',
  '  else:',
  '    if key > root.right.key:    // Zag-Zag',
  '      splay(root.right.right, key)',
  '      root = leftRotate(root)',
  '    elif key < root.right.key:  // Zag-Zig',
  '      splay(root.right.left, key)',
  '      root.right = rightRotate(root.right)',
  '    root = leftRotate(root)     // Zag',
  '  return root',
];
