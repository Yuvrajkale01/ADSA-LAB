/* ============================================
   BST Algorithm — Pure logic with state snapshots
   ============================================ */

import type { AlgorithmState } from '../../types';

export interface BSTNode {
  id: string;
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
  x: number;
  y: number;
}

// Deep clone the tree for state snapshots
function cloneTree(node: BSTNode | null): BSTNode | null {
  if (!node) return null;
  return {
    ...node,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

// Assign layout positions using Reingold-Tilford-inspired approach
function layoutTree(node: BSTNode | null, depth: number = 0, pos: number = 0, spread: number = 200): void {
  if (!node) return;
  node.x = pos;
  node.y = depth * 70 + 50;
  const childSpread = spread * 0.55;
  layoutTree(node.left, depth + 1, pos - spread / 2, childSpread);
  layoutTree(node.right, depth + 1, pos + spread / 2, childSpread);
}

export function getNodeById(node: BSTNode | null, id: string): BSTNode | null {
  if (!node) return null;
  if (node.id === id) return node;
  return getNodeById(node.left, id) || getNodeById(node.right, id);
}

function getAllNodes(node: BSTNode | null): BSTNode[] {
  if (!node) return [];
  return [node, ...getAllNodes(node.left), ...getAllNodes(node.right)];
}

function treeHeight(node: BSTNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));
}

let nodeCounter = 0;

function createNode(value: number): BSTNode {
  return { id: `node-${nodeCounter++}`, value, left: null, right: null, x: 0, y: 0 };
}

// ---- BST INSERT with state snapshots ----
export function bstInsert(root: BSTNode | null, value: number): { root: BSTNode; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let comparisons = 0;
  let stateId = 0;

  const newNode = createNode(value);

  if (!root) {
    root = newNode;
    layoutTree(root, 0, 300);
    states.push({
      id: stateId++,
      dataStructureState: cloneTree(root),
      activeNodes: [{ id: newNode.id, state: 'inserted' }],
      activeEdges: [],
      operation: 'INSERT',
      explanation: `Tree is empty. Insert ${value} as root.`,
      detailedExplanation: 'The first element inserted becomes the root of the BST.',
      pseudocodeLine: 0,
      comparisons, assignments: 1, swaps: 0,
      complexity: 'O(1)',
      metadata: { insertedValue: value },
    });
    return { root, states };
  }

  // Initial state
  layoutTree(root, 0, 300);
  states.push({
    id: stateId++,
    dataStructureState: cloneTree(root),
    activeNodes: [{ id: root.id, state: 'active' }],
    activeEdges: [],
    operation: 'INSERT',
    explanation: `Inserting ${value}. Start at root (${root.value}).`,
    detailedExplanation: 'BST insertion always starts at the root and traverses down.',
    pseudocodeLine: 1,
    comparisons, assignments: 0, swaps: 0,
    complexity: 'O(log n)',
    metadata: { insertedValue: value },
  });

  let current: BSTNode = root;
  let parent: BSTNode | null = null;
  let direction: 'left' | 'right' = 'left';

  while (current) {
    comparisons++;

    if (value < current.value) {
      states.push({
        id: stateId++,
        dataStructureState: cloneTree(root),
        activeNodes: [{ id: current.id, state: 'comparing' }],
        activeEdges: [],
        operation: 'COMPARE',
        explanation: `${value} < ${current.value} → Go LEFT.`,
        detailedExplanation: `In a BST, values less than the current node go into the left subtree.`,
        pseudocodeLine: 3,
        comparisons, assignments: 0, swaps: 0,
        complexity: 'O(log n)',
        metadata: { comparison: `${value} < ${current.value}`, direction: 'left' },
      });
      parent = current;
      direction = 'left';
      current = current.left!;
    } else if (value > current.value) {
      states.push({
        id: stateId++,
        dataStructureState: cloneTree(root),
        activeNodes: [{ id: current.id, state: 'comparing' }],
        activeEdges: [],
        operation: 'COMPARE',
        explanation: `${value} > ${current.value} → Go RIGHT.`,
        detailedExplanation: `In a BST, values greater than the current node go into the right subtree.`,
        pseudocodeLine: 5,
        comparisons, assignments: 0, swaps: 0,
        complexity: 'O(log n)',
        metadata: { comparison: `${value} > ${current.value}`, direction: 'right' },
      });
      parent = current;
      direction = 'right';
      current = current.right!;
    } else {
      // Duplicate
      states.push({
        id: stateId++,
        dataStructureState: cloneTree(root),
        activeNodes: [{ id: current.id, state: 'error' }],
        activeEdges: [],
        operation: 'DUPLICATE',
        explanation: `${value} already exists in the tree. Skipping insertion.`,
        detailedExplanation: 'BSTs typically do not allow duplicate values.',
        pseudocodeLine: 7,
        comparisons, assignments: 0, swaps: 0,
        complexity: 'O(log n)',
        metadata: { duplicate: true },
      });
      return { root, states };
    }

    if (!current && parent) {
      if (direction === 'left') {
        parent.left = newNode;
      } else {
        parent.right = newNode;
      }
      layoutTree(root, 0, 300);
      states.push({
        id: stateId++,
        dataStructureState: cloneTree(root),
        activeNodes: [{ id: newNode.id, state: 'inserted' }],
        activeEdges: [],
        operation: 'INSERT',
        explanation: `Inserted ${value} as ${direction} child of ${parent.value}.`,
        detailedExplanation: `Found an empty spot. Node ${value} is placed as the ${direction} child.`,
        pseudocodeLine: 9,
        comparisons, assignments: 1, swaps: 0,
        complexity: `O(${Math.ceil(Math.log2(getAllNodes(root).length + 1))})`,
        metadata: { insertedValue: value, parent: parent.value, direction },
      });
    }
  }

  return { root, states };
}

// ---- BST SEARCH with state snapshots ----
export function bstSearch(root: BSTNode | null, value: number): { found: boolean; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let comparisons = 0;
  let stateId = 0;

  if (!root) {
    states.push({
      id: stateId++,
      dataStructureState: null,
      activeNodes: [],
      activeEdges: [],
      operation: 'SEARCH',
      explanation: `Tree is empty. ${value} not found.`,
      detailedExplanation: 'Cannot search in an empty tree.',
      pseudocodeLine: 0,
      comparisons, assignments: 0, swaps: 0,
      complexity: 'O(1)',
      metadata: { found: false },
    });
    return { found: false, states };
  }

  let current: BSTNode | null = root;

  states.push({
    id: stateId++,
    dataStructureState: cloneTree(root),
    activeNodes: [{ id: root.id, state: 'active' }],
    activeEdges: [],
    operation: 'SEARCH',
    explanation: `Searching for ${value}. Start at root (${root.value}).`,
    detailedExplanation: 'BST search begins at the root, comparing the target with each node.',
    pseudocodeLine: 0,
    comparisons, assignments: 0, swaps: 0,
    complexity: 'O(log n)',
    metadata: { searchValue: value },
  });

  while (current) {
    comparisons++;

    if (value === current.value) {
      states.push({
        id: stateId++,
        dataStructureState: cloneTree(root),
        activeNodes: [{ id: current.id, state: 'success' }],
        activeEdges: [],
        operation: 'FOUND',
        explanation: `Found ${value}!`,
        detailedExplanation: `The target value ${value} matches the current node. Search successful.`,
        pseudocodeLine: 2,
        comparisons, assignments: 0, swaps: 0,
        complexity: `O(${comparisons})`,
        metadata: { found: true },
      });
      return { found: true, states };
    }

    if (value < current.value) {
      states.push({
        id: stateId++,
        dataStructureState: cloneTree(root),
        activeNodes: [{ id: current.id, state: 'comparing' }],
        activeEdges: [],
        operation: 'COMPARE',
        explanation: `${value} < ${current.value} → Search LEFT subtree.`,
        detailedExplanation: 'Target is smaller, so it can only be in the left subtree.',
        pseudocodeLine: 4,
        comparisons, assignments: 0, swaps: 0,
        complexity: 'O(log n)',
        metadata: { direction: 'left' },
      });
      current = current.left;
    } else {
      states.push({
        id: stateId++,
        dataStructureState: cloneTree(root),
        activeNodes: [{ id: current.id, state: 'comparing' }],
        activeEdges: [],
        operation: 'COMPARE',
        explanation: `${value} > ${current.value} → Search RIGHT subtree.`,
        detailedExplanation: 'Target is larger, so it can only be in the right subtree.',
        pseudocodeLine: 6,
        comparisons, assignments: 0, swaps: 0,
        complexity: 'O(log n)',
        metadata: { direction: 'right' },
      });
      current = current.right;
    }
  }

  states.push({
    id: stateId++,
    dataStructureState: cloneTree(root),
    activeNodes: [],
    activeEdges: [],
    operation: 'NOT FOUND',
    explanation: `${value} not found in the tree.`,
    detailedExplanation: 'Reached a null node — the value does not exist in the BST.',
    pseudocodeLine: 8,
    comparisons, assignments: 0, swaps: 0,
    complexity: `O(${comparisons})`,
    metadata: { found: false },
  });

  return { found: false, states };
}

// ---- BST DELETE with state snapshots ----
export function bstDelete(root: BSTNode | null, value: number): { root: BSTNode | null; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let comparisons = 0;
  let stateId = 0;

  function findMin(node: BSTNode): BSTNode {
    while (node.left) node = node.left;
    return node;
  }

  function deleteNode(node: BSTNode | null, val: number): BSTNode | null {
    if (!node) {
      states.push({
        id: stateId++,
        dataStructureState: cloneTree(root),
        activeNodes: [],
        activeEdges: [],
        operation: 'NOT FOUND',
        explanation: `${val} not found in the tree.`,
        detailedExplanation: 'Cannot delete a value that does not exist.',
        pseudocodeLine: 0,
        comparisons, assignments: 0, swaps: 0,
        complexity: 'O(log n)',
        metadata: {},
      });
      return null;
    }

    comparisons++;
    if (val < node.value) {
      states.push({
        id: stateId++,
        dataStructureState: cloneTree(root),
        activeNodes: [{ id: node.id, state: 'comparing' }],
        activeEdges: [],
        operation: 'SEARCH FOR DELETE',
        explanation: `${val} < ${node.value} → Search LEFT.`,
        detailedExplanation: 'Looking for the node to delete in the left subtree.',
        pseudocodeLine: 2,
        comparisons, assignments: 0, swaps: 0,
        complexity: 'O(log n)',
        metadata: {},
      });
      node.left = deleteNode(node.left, val);
    } else if (val > node.value) {
      states.push({
        id: stateId++,
        dataStructureState: cloneTree(root),
        activeNodes: [{ id: node.id, state: 'comparing' }],
        activeEdges: [],
        operation: 'SEARCH FOR DELETE',
        explanation: `${val} > ${node.value} → Search RIGHT.`,
        detailedExplanation: 'Looking for the node to delete in the right subtree.',
        pseudocodeLine: 4,
        comparisons, assignments: 0, swaps: 0,
        complexity: 'O(log n)',
        metadata: {},
      });
      node.right = deleteNode(node.right, val);
    } else {
      // Found the node
      if (!node.left && !node.right) {
        states.push({
          id: stateId++,
          dataStructureState: cloneTree(root),
          activeNodes: [{ id: node.id, state: 'deleted' }],
          activeEdges: [],
          operation: 'DELETE LEAF',
          explanation: `Found ${val}. It's a leaf node — simply remove it.`,
          detailedExplanation: 'Leaf nodes have no children, so they can be removed directly.',
          pseudocodeLine: 7,
          comparisons, assignments: 1, swaps: 0,
          complexity: 'O(log n)',
          metadata: { case: 'leaf' },
        });
        return null;
      } else if (!node.left) {
        states.push({
          id: stateId++,
          dataStructureState: cloneTree(root),
          activeNodes: [{ id: node.id, state: 'deleted' }],
          activeEdges: [],
          operation: 'DELETE (ONE CHILD)',
          explanation: `Found ${val}. Has only right child — replace with right child.`,
          detailedExplanation: 'When a node has only one child, that child takes its place.',
          pseudocodeLine: 9,
          comparisons, assignments: 1, swaps: 0,
          complexity: 'O(log n)',
          metadata: { case: 'one-child-right' },
        });
        return node.right;
      } else if (!node.right) {
        states.push({
          id: stateId++,
          dataStructureState: cloneTree(root),
          activeNodes: [{ id: node.id, state: 'deleted' }],
          activeEdges: [],
          operation: 'DELETE (ONE CHILD)',
          explanation: `Found ${val}. Has only left child — replace with left child.`,
          detailedExplanation: 'When a node has only one child, that child takes its place.',
          pseudocodeLine: 11,
          comparisons, assignments: 1, swaps: 0,
          complexity: 'O(log n)',
          metadata: { case: 'one-child-left' },
        });
        return node.left;
      } else {
        const successor = findMin(node.right);
        states.push({
          id: stateId++,
          dataStructureState: cloneTree(root),
          activeNodes: [
            { id: node.id, state: 'deleted' },
            { id: successor.id, state: 'highlight' },
          ],
          activeEdges: [],
          operation: 'DELETE (TWO CHILDREN)',
          explanation: `Found ${val}. Has two children — replace with inorder successor (${successor.value}).`,
          detailedExplanation: 'The inorder successor is the smallest value in the right subtree. It maintains BST property.',
          pseudocodeLine: 13,
          comparisons, assignments: 2, swaps: 0,
          complexity: 'O(log n)',
          metadata: { case: 'two-children', successor: successor.value },
        });
        node.value = successor.value;
        node.id = successor.id;
        node.right = deleteNode(node.right, successor.value);
      }
    }
    return node;
  }

  root = deleteNode(root, value);
  if (root) layoutTree(root, 0, 300);

  // Final state
  states.push({
    id: stateId++,
    dataStructureState: cloneTree(root),
    activeNodes: [],
    activeEdges: [],
    operation: 'DELETE COMPLETE',
    explanation: root ? `Deletion of ${value} complete. Tree rebalanced.` : 'Tree is now empty.',
    detailedExplanation: '',
    pseudocodeLine: null,
    comparisons, assignments: 0, swaps: 0,
    complexity: `O(${comparisons})`,
    metadata: {},
  });

  return { root, states };
}

// ---- BST Traversals ----
export function bstInorder(root: BSTNode | null): AlgorithmState[] {
  const states: AlgorithmState[] = [];
  let stateId = 0;
  const result: number[] = [];

  function inorder(node: BSTNode | null) {
    if (!node) return;
    inorder(node.left);
    result.push(node.value);
    states.push({
      id: stateId++,
      dataStructureState: cloneTree(root),
      activeNodes: [{ id: node.id, state: 'visited' }],
      activeEdges: [],
      operation: 'VISIT',
      explanation: `Visit node ${node.value}. Inorder so far: [${result.join(', ')}]`,
      detailedExplanation: 'Inorder traversal visits: Left → Node → Right. This produces sorted order in a BST.',
      pseudocodeLine: 2,
      comparisons: 0, assignments: 0, swaps: 0,
      complexity: 'O(n)',
      metadata: { traversalOrder: [...result] },
    });
    inorder(node.right);
  }

  if (root) {
    states.push({
      id: stateId++,
      dataStructureState: cloneTree(root),
      activeNodes: [],
      activeEdges: [],
      operation: 'START INORDER',
      explanation: 'Starting inorder traversal (Left → Node → Right).',
      detailedExplanation: 'Inorder traversal of a BST produces elements in sorted ascending order.',
      pseudocodeLine: 0,
      comparisons: 0, assignments: 0, swaps: 0,
      complexity: 'O(n)',
      metadata: {},
    });
    inorder(root);
  }

  return states;
}

export function buildBSTFromValues(values: number[]): BSTNode | null {
  let root: BSTNode | null = null;
  for (const v of values) {
    const result = bstInsert(root, v);
    root = result.root;
  }
  return root;
}

export const bstPseudocode = {
  insert: [
    'function insert(root, value):',
    '  if root is null:',
    '    return new Node(value)',
    '  if value < root.value:',
    '    root.left = insert(root.left, value)',
    '  else if value > root.value:',
    '    root.right = insert(root.right, value)',
    '  else:',
    '    // duplicate, skip',
    '  return root',
  ],
  search: [
    'function search(root, value):',
    '  if root is null:',
    '    return NOT_FOUND',
    '  if value == root.value:',
    '    return FOUND',
    '  if value < root.value:',
    '    return search(root.left, value)',
    '  else:',
    '    return search(root.right, value)',
  ],
  delete: [
    'function delete(root, value):',
    '  if root is null: return null',
    '  if value < root.value:',
    '    root.left = delete(root.left, value)',
    '  else if value > root.value:',
    '    root.right = delete(root.right, value)',
    '  else:',
    '    if no children: return null',
    '    if one child: return that child',
    '    if two children:',
    '      successor = min(root.right)',
    '      root.value = successor.value',
    '      root.right = delete(root.right, successor)',
    '    return root',
  ],
};

export { cloneTree, layoutTree, getAllNodes, treeHeight };
