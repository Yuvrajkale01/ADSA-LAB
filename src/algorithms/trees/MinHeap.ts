/* ============================================
   Min Heap Algorithm — Interactive logic with
   step-by-step state snapshots for tree & array.
   Synchronized with AlgorithmCodePanel.
   ============================================ */

import type { AlgorithmState } from '../../types';

export interface HeapItem {
  id: string;
  value: number;
  index: number;
}

export interface HeapState {
  array: number[];
  activeIndex?: number;
  parentIndex?: number;
  comparingIndices?: [number, number];
  opDescription?: string;
}

export function heapParent(i: number): number {
  return Math.floor((i - 1) / 2);
}

export function heapLeft(i: number): number {
  return 2 * i + 1;
}

export function heapRight(i: number): number {
  return 2 * i + 2;
}

// ---- Min Heap Insert with States ----
export function minHeapInsert(heap: number[], value: number): { newHeap: number[]; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let stateId = 0;
  const arr = [...heap];

  // Step 1: Add to end of array (heap.add(value))
  arr.push(value);
  let currentIndex = arr.length - 1;

  states.push({
    id: stateId++,
    dataStructureState: [...arr],
    activeNodes: [{ id: `heap-${currentIndex}`, state: 'inserted' }],
    activeEdges: [],
    operation: `op ${stateId}: insert(${value})`,
    explanation: `Appended ${value} at index [${currentIndex}]. Now siftUp to restore min-heap property.`,
    detailedExplanation: `Elements are always initially added at the next available leaf position (end of array).`,
    pseudocodeLine: 1, // line 1: heap.add(value)
    comparisons: 0,
    assignments: 1,
    swaps: 0,
    complexity: 'O(log n)',
    metadata: {
      array: [...arr],
      currentIndex,
      parentIndex: heapParent(currentIndex),
      op: 'insert',
    },
  });

  // Step 2: Sift Up
  states.push({
    id: stateId++,
    dataStructureState: [...arr],
    activeNodes: [{ id: `heap-${currentIndex}`, state: 'active' }],
    activeEdges: [],
    operation: 'siftUp',
    explanation: `Calling siftUp(${currentIndex}). Checking parent at index ${heapParent(currentIndex)}.`,
    detailedExplanation: `Compare current node with its parent: parent index = floor((i - 1) / 2).`,
    pseudocodeLine: 2, // line 2: siftUp(heap.size() - 1)
    comparisons: 0,
    assignments: 0,
    swaps: 0,
    complexity: 'O(log n)',
    metadata: {
      array: [...arr],
      currentIndex,
      parentIndex: heapParent(currentIndex),
    },
  });

  let comparisons = 0;
  let swaps = 0;

  while (currentIndex > 0) {
    const parentIdx = heapParent(currentIndex);
    comparisons++;

    states.push({
      id: stateId++,
      dataStructureState: [...arr],
      activeNodes: [
        { id: `heap-${currentIndex}`, state: 'comparing' },
        { id: `heap-${parentIdx}`, state: 'comparing' },
      ],
      activeEdges: [],
      operation: 'COMPARE',
      explanation: `Comparing heap[${parentIdx}] = ${arr[parentIdx]} > heap[${currentIndex}] = ${arr[currentIndex]}?`,
      detailedExplanation: `In a min heap, parent must be smaller than or equal to children.`,
      pseudocodeLine: 13, // while (i > 0 && heap.get(parent(i)) > heap.get(i))
      comparisons,
      assignments: 0,
      swaps,
      complexity: 'O(log n)',
      metadata: {
        array: [...arr],
        currentIndex,
        parentIndex: parentIdx,
      },
    });

    if (arr[parentIdx] > arr[currentIndex]) {
      // Swap
      swaps++;
      const temp = arr[parentIdx];
      arr[parentIdx] = arr[currentIndex];
      arr[currentIndex] = temp;

      states.push({
        id: stateId++,
        dataStructureState: [...arr],
        activeNodes: [
          { id: `heap-${parentIdx}`, state: 'active' },
          { id: `heap-${currentIndex}`, state: 'visited' },
        ],
        activeEdges: [],
        operation: 'SWAP',
        explanation: `Swapped parent ${temp} with child ${arr[parentIdx]}. Index moves to ${parentIdx}.`,
        detailedExplanation: `Node moved up one level toward the root.`,
        pseudocodeLine: 14, // swap(i, parent(i)); i = parent(i);
        comparisons,
        assignments: 2,
        swaps,
        complexity: 'O(log n)',
        metadata: {
          array: [...arr],
          currentIndex: parentIdx,
          parentIndex: heapParent(parentIdx),
        },
      });

      currentIndex = parentIdx;
    } else {
      states.push({
        id: stateId++,
        dataStructureState: [...arr],
        activeNodes: [{ id: `heap-${currentIndex}`, state: 'success' }],
        activeEdges: [],
        operation: 'DONE',
        explanation: `Heap property satisfied! ${arr[parentIdx]} <= ${arr[currentIndex]}.`,
        detailedExplanation: `The inserted element is now in its proper sorted heap position.`,
        pseudocodeLine: 3, // done
        comparisons,
        assignments: 0,
        swaps,
        complexity: 'O(log n)',
        metadata: {
          array: [...arr],
          currentIndex,
        },
      });
      break;
    }
  }

  return { newHeap: arr, states };
}

// ---- Min Heap Extract Min with States ----
export function minHeapExtractMin(heap: number[]): { newHeap: number[]; min: number | null; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let stateId = 0;

  if (heap.length === 0) {
    return { newHeap: [], min: null, states };
  }

  const arr = [...heap];
  const minVal = arr[0];

  states.push({
    id: stateId++,
    dataStructureState: [...arr],
    activeNodes: [{ id: 'heap-0', state: 'active' }],
    activeEdges: [],
    operation: `extractMin()`,
    explanation: `Extracting minimum element: ${minVal} at root (index 0).`,
    detailedExplanation: `In a min heap, the minimum element is always stored at index 0.`,
    pseudocodeLine: 6, // int min = heap.get(0);
    comparisons: 0,
    assignments: 1,
    swaps: 0,
    complexity: 'O(log n)',
    metadata: { array: [...arr], currentIndex: 0 },
  });

  if (arr.length === 1) {
    return { newHeap: [], min: minVal, states };
  }

  // Replace root with last element
  const lastVal = arr.pop()!;
  arr[0] = lastVal;

  states.push({
    id: stateId++,
    dataStructureState: [...arr],
    activeNodes: [{ id: 'heap-0', state: 'active' }],
    activeEdges: [],
    operation: 'REPLACE_ROOT',
    explanation: `Moved last element (${lastVal}) to root index 0. Now calling siftDown(0).`,
    detailedExplanation: `Replacing the root with the last leaf keeps the complete binary tree structure intact.`,
    pseudocodeLine: 7, // heap.set(0, heap.remove(heap.size() - 1));
    comparisons: 0,
    assignments: 1,
    swaps: 0,
    complexity: 'O(log n)',
    metadata: { array: [...arr], currentIndex: 0 },
  });

  // Sift Down
  let i = 0;
  let comparisons = 0;
  let swaps = 0;

  while (heapLeft(i) < arr.length) {
    const left = heapLeft(i);
    const right = heapRight(i);
    let smallest = i;

    comparisons++;
    if (left < arr.length && arr[left] < arr[smallest]) {
      smallest = left;
    }
    if (right < arr.length) {
      comparisons++;
      if (arr[right] < arr[smallest]) {
        smallest = right;
      }
    }

    states.push({
      id: stateId++,
      dataStructureState: [...arr],
      activeNodes: [
        { id: `heap-${i}`, state: 'active' },
        { id: `heap-${smallest}`, state: 'comparing' },
      ],
      activeEdges: [],
      operation: 'COMPARE_CHILDREN',
      explanation: `Comparing node ${arr[i]} with smallest child: ${arr[smallest]} at index ${smallest}.`,
      detailedExplanation: `Find the smallest among node and its children (argMin).`,
      pseudocodeLine: 21, // int smallest = argMin(i, leftChild(i), rightChild(i));
      comparisons,
      assignments: 0,
      swaps,
      complexity: 'O(log n)',
      metadata: { array: [...arr], currentIndex: i, smallestIndex: smallest },
    });

    if (smallest === i) {
      states.push({
        id: stateId++,
        dataStructureState: [...arr],
        activeNodes: [{ id: `heap-${i}`, state: 'success' }],
        activeEdges: [],
        operation: 'DONE',
        explanation: `Node ${arr[i]} is smaller than its children. Sift down complete!`,
        detailedExplanation: `Min-heap property restored at all levels.`,
        pseudocodeLine: 22, // if (smallest == i) return;
        comparisons,
        assignments: 0,
        swaps,
        complexity: 'O(log n)',
        metadata: { array: [...arr], currentIndex: i },
      });
      break;
    }

    // Swap
    swaps++;
    const temp = arr[i];
    arr[i] = arr[smallest];
    arr[smallest] = temp;

    states.push({
      id: stateId++,
      dataStructureState: [...arr],
      activeNodes: [
        { id: `heap-${smallest}`, state: 'active' },
        { id: `heap-${i}`, state: 'visited' },
      ],
      activeEdges: [],
      operation: 'SWAP_SIFT_DOWN',
      explanation: `Swapped node ${temp} with child ${arr[i]}. Continuing down at index ${smallest}.`,
      detailedExplanation: `Push the violation down until it reaches a valid position or leaf.`,
      pseudocodeLine: 23, // swap(i, smallest); i = smallest;
      comparisons,
      assignments: 2,
      swaps,
      complexity: 'O(log n)',
      metadata: { array: [...arr], currentIndex: smallest },
    });

    i = smallest;
  }

  return { newHeap: arr, min: minVal, states };
}
