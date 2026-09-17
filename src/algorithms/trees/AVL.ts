/* ============================================
   AVL Tree Algorithm — Self-balancing BST
   with rotation detection and state snapshots
   ============================================ */

import type { AlgorithmState } from '../../types';

export interface AVLNode {
  id: string;
  value: number;
  left: AVLNode | null;
  right: AVLNode | null;
  height: number;
  balanceFactor: number;
  x: number;
  y: number;
}

let avlCounter = 0;

function createAVLNode(value: number): AVLNode {
  return {
    id: `avl-${avlCounter++}`,
    value, left: null, right: null,
    height: 1, balanceFactor: 0, x: 0, y: 0,
  };
}

function cloneAVL(node: AVLNode | null): AVLNode | null {
  if (!node) return null;
  return { ...node, left: cloneAVL(node.left), right: cloneAVL(node.right) };
}

function layoutAVL(node: AVLNode | null, depth: number = 0, pos: number = 300, spread: number = 200): void {
  if (!node) return;
  node.x = pos;
  node.y = depth * 70 + 50;
  const cs = spread * 0.55;
  layoutAVL(node.left, depth + 1, pos - spread / 2, cs);
  layoutAVL(node.right, depth + 1, pos + spread / 2, cs);
}

function getHeight(n: AVLNode | null): number { return n ? n.height : 0; }
function getBF(n: AVLNode | null): number { return n ? getHeight(n.left) - getHeight(n.right) : 0; }

function updateHeight(n: AVLNode): void {
  n.height = 1 + Math.max(getHeight(n.left), getHeight(n.right));
  n.balanceFactor = getBF(n);
}

function getAllAVLNodes(node: AVLNode | null): AVLNode[] {
  if (!node) return [];
  return [node, ...getAllAVLNodes(node.left), ...getAllAVLNodes(node.right)];
}

// ---- Rotations ----
function rightRotate(y: AVLNode): AVLNode {
  const x = y.left!;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function leftRotate(x: AVLNode): AVLNode {
  const y = x.right!;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

// ---- AVL INSERT with full rotation snapshots ----
export function avlInsert(root: AVLNode | null, value: number): { root: AVLNode; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let stateId = 0;
  let comparisons = 0;

  function insert(node: AVLNode | null, val: number): AVLNode {
    if (!node) {
      const newNode = createAVLNode(val);
      if (root) layoutAVL(root, 0, 300);
      states.push({
        id: stateId++,
        dataStructureState: root ? cloneAVL(root) : cloneAVL(newNode),
        activeNodes: [{ id: newNode.id, state: 'inserted' }],
        activeEdges: [],
        operation: 'INSERT',
        explanation: `Inserted ${val} as a new leaf node.`,
        detailedExplanation: 'New nodes always start with height 1 and balance factor 0.',
        pseudocodeLine: 1,
        comparisons, assignments: 1, swaps: 0,
        complexity: 'O(log n)',
        metadata: { insertedValue: val },
      });
      return newNode;
    }

    comparisons++;
    if (val < node.value) {
      states.push({
        id: stateId++,
        dataStructureState: cloneAVL(root || node),
        activeNodes: [{ id: node.id, state: 'comparing' }],
        activeEdges: [],
        operation: 'COMPARE',
        explanation: `${val} < ${node.value} → Go LEFT.`,
        detailedExplanation: 'Traversing left subtree in BST fashion.',
        pseudocodeLine: 3,
        comparisons, assignments: 0, swaps: 0,
        complexity: 'O(log n)',
        metadata: {},
      });
      node.left = insert(node.left, val);
    } else if (val > node.value) {
      states.push({
        id: stateId++,
        dataStructureState: cloneAVL(root || node),
        activeNodes: [{ id: node.id, state: 'comparing' }],
        activeEdges: [],
        operation: 'COMPARE',
        explanation: `${val} > ${node.value} → Go RIGHT.`,
        detailedExplanation: 'Traversing right subtree in BST fashion.',
        pseudocodeLine: 5,
        comparisons, assignments: 0, swaps: 0,
        complexity: 'O(log n)',
        metadata: {},
      });
      node.right = insert(node.right, val);
    } else {
      states.push({
        id: stateId++,
        dataStructureState: cloneAVL(root || node),
        activeNodes: [{ id: node.id, state: 'error' }],
        activeEdges: [],
        operation: 'DUPLICATE',
        explanation: `${val} already exists. Skipping.`,
        detailedExplanation: 'AVL trees do not allow duplicates.',
        pseudocodeLine: 7,
        comparisons, assignments: 0, swaps: 0,
        complexity: 'O(log n)',
        metadata: {},
      });
      return node;
    }

    // Update height
    updateHeight(node);
    const bf = node.balanceFactor;

    // Check balance
    if (bf > 1 || bf < -1) {
      layoutAVL(root || node, 0, 300);
      states.push({
        id: stateId++,
        dataStructureState: cloneAVL(root || node),
        activeNodes: [{ id: node.id, state: 'error' }],
        activeEdges: [],
        operation: 'IMBALANCE DETECTED',
        explanation: `Node ${node.value} has balance factor ${bf}. Imbalanced!`,
        detailedExplanation: `Balance factor must be -1, 0, or 1. |${bf}| > 1 means rotation is needed.`,
        pseudocodeLine: 9,
        comparisons, assignments: 0, swaps: 0,
        complexity: 'O(log n)',
        metadata: { balanceFactor: bf, imbalancedNode: node.value },
      });

      // LL Case
      if (bf > 1 && val < node.left!.value) {
        states.push({
          id: stateId++,
          dataStructureState: cloneAVL(root || node),
          activeNodes: [
            { id: node.id, state: 'highlight' },
            { id: node.left!.id, state: 'active' },
          ],
          activeEdges: [],
          operation: 'LL CASE → RIGHT ROTATION',
          explanation: `LL imbalance at ${node.value}. Performing RIGHT rotation.`,
          detailedExplanation: `Inserted in the left subtree of the left child. Single right rotation fixes this.`,
          pseudocodeLine: 11,
          comparisons, assignments: 2, swaps: 0,
          complexity: 'O(1)',
          metadata: { rotationType: 'LL', pivot: node.value },
        });
        node = rightRotate(node);
      }
      // RR Case
      else if (bf < -1 && val > node.right!.value) {
        states.push({
          id: stateId++,
          dataStructureState: cloneAVL(root || node),
          activeNodes: [
            { id: node.id, state: 'highlight' },
            { id: node.right!.id, state: 'active' },
          ],
          activeEdges: [],
          operation: 'RR CASE → LEFT ROTATION',
          explanation: `RR imbalance at ${node.value}. Performing LEFT rotation.`,
          detailedExplanation: `Inserted in the right subtree of the right child. Single left rotation fixes this.`,
          pseudocodeLine: 13,
          comparisons, assignments: 2, swaps: 0,
          complexity: 'O(1)',
          metadata: { rotationType: 'RR', pivot: node.value },
        });
        node = leftRotate(node);
      }
      // LR Case
      else if (bf > 1 && val > node.left!.value) {
        states.push({
          id: stateId++,
          dataStructureState: cloneAVL(root || node),
          activeNodes: [
            { id: node.id, state: 'highlight' },
            { id: node.left!.id, state: 'active' },
          ],
          activeEdges: [],
          operation: 'LR CASE → LEFT-RIGHT ROTATION',
          explanation: `LR imbalance at ${node.value}. First LEFT rotate at ${node.left!.value}, then RIGHT rotate at ${node.value}.`,
          detailedExplanation: `Inserted in the right subtree of the left child. Double rotation needed.`,
          pseudocodeLine: 15,
          comparisons, assignments: 4, swaps: 0,
          complexity: 'O(1)',
          metadata: { rotationType: 'LR', pivot: node.value },
        });
        node.left = leftRotate(node.left!);
        node = rightRotate(node);
      }
      // RL Case
      else if (bf < -1 && val < node.right!.value) {
        states.push({
          id: stateId++,
          dataStructureState: cloneAVL(root || node),
          activeNodes: [
            { id: node.id, state: 'highlight' },
            { id: node.right!.id, state: 'active' },
          ],
          activeEdges: [],
          operation: 'RL CASE → RIGHT-LEFT ROTATION',
          explanation: `RL imbalance at ${node.value}. First RIGHT rotate at ${node.right!.value}, then LEFT rotate at ${node.value}.`,
          detailedExplanation: `Inserted in the left subtree of the right child. Double rotation needed.`,
          pseudocodeLine: 17,
          comparisons, assignments: 4, swaps: 0,
          complexity: 'O(1)',
          metadata: { rotationType: 'RL', pivot: node.value },
        });
        node.right = rightRotate(node.right!);
        node = leftRotate(node);
      }

      // After rotation
      layoutAVL(node, 0, 300);
      states.push({
        id: stateId++,
        dataStructureState: cloneAVL(node),
        activeNodes: [{ id: node.id, state: 'success' }],
        activeEdges: [],
        operation: 'BALANCED',
        explanation: `Rotation complete. Node ${node.value} is now balanced (BF = ${getBF(node)}).`,
        detailedExplanation: 'The AVL property is restored. All balance factors are within [-1, 1].',
        pseudocodeLine: 19,
        comparisons, assignments: 0, swaps: 0,
        complexity: 'O(log n)',
        metadata: { newBalanceFactor: getBF(node) },
      });
    }

    return node;
  }

  // Initial state
  if (root) {
    layoutAVL(root, 0, 300);
    states.push({
      id: stateId++,
      dataStructureState: cloneAVL(root),
      activeNodes: [],
      activeEdges: [],
      operation: 'START INSERT',
      explanation: `Inserting ${value} into AVL tree.`,
      detailedExplanation: 'AVL insertion follows BST insertion, then checks and fixes balance.',
      pseudocodeLine: 0,
      comparisons: 0, assignments: 0, swaps: 0,
      complexity: 'O(log n)',
      metadata: {},
    });
  }

  root = insert(root, value);
  layoutAVL(root, 0, 300);

  // Final state
  states.push({
    id: stateId++,
    dataStructureState: cloneAVL(root),
    activeNodes: [],
    activeEdges: [],
    operation: 'INSERT COMPLETE',
    explanation: `Insertion of ${value} complete. Tree height: ${root.height}. Total nodes: ${getAllAVLNodes(root).length}.`,
    detailedExplanation: 'AVL tree maintains O(log n) height guarantee.',
    pseudocodeLine: null,
    comparisons, assignments: 0, swaps: 0,
    complexity: 'O(log n)',
    metadata: { treeHeight: root.height },
  });

  return { root, states };
}

export const avlPseudocode = [
  'function avlInsert(node, value):',
  '  if node is null: return new Node(value)',
  '  // BST insertion',
  '  if value < node.value:',
  '    node.left = avlInsert(node.left, value)',
  '  else if value > node.value:',
  '    node.right = avlInsert(node.right, value)',
  '  else: return node  // duplicate',
  '  // Update height',
  '  node.height = 1 + max(height(left), height(right))',
  '  bf = balanceFactor(node)',
  '  // LL Case',
  '  if bf > 1 and value < node.left.value:',
  '    return rightRotate(node)',
  '  // RR Case',
  '  if bf < -1 and value > node.right.value:',
  '    return leftRotate(node)',
  '  // LR Case',
  '  if bf > 1 and value > node.left.value:',
  '    node.left = leftRotate(node.left)',
  '    return rightRotate(node)',
  '  // RL Case',
  '  if bf < -1 and value < node.right.value:',
  '    node.right = rightRotate(node.right)',
  '    return leftRotate(node)',
  '  return node',
];

export { cloneAVL, layoutAVL, getAllAVLNodes };
