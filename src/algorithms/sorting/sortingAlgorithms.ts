/* ============================================
   Generator-Based Sorting Algorithms
   Each algorithm yields SortStep objects for
   step-by-step animated visualization.
   All metrics are REAL — nothing is faked.
   ============================================ */

export interface SortStep {
  array: number[];
  comparisons: number;
  swaps: number;
  arrayAccesses: number;
  activeIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
  pivotIndex?: number;
  mergeRange?: [number, number];
  heapSize?: number;
  sortedBoundary?: number;
  operation: string;
  explanation: string;
  algorithmPhase: string;
}

export interface SortAlgorithmDef {
  id: string;
  name: string;
  complexity: string;
  bestCase: string;
  worstCase: string;
  spaceComplexity: string;
  color: string;
  generate: (data: number[]) => SortStep[];
}

/* ---- Utility: collect all steps from a generator ---- */
function collectSteps(gen: Generator<SortStep, void, unknown>): SortStep[] {
  const steps: SortStep[] = [];
  let result = gen.next();
  while (!result.done) {
    steps.push(result.value);
    result = gen.next();
  }
  return steps;
}

/* ============================================
   BUBBLE SORT
   ============================================ */
function* bubbleSortGen(data: number[]): Generator<SortStep, void, unknown> {
  const arr = [...data];
  const n = arr.length;
  let comparisons = 0, swaps = 0, arrayAccesses = 0;
  const sorted: Set<number> = new Set();

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      // Compare
      comparisons++;
      arrayAccesses += 2;
      yield {
        array: [...arr],
        comparisons, swaps, arrayAccesses,
        activeIndices: [j, j + 1],
        swappingIndices: [],
        sortedIndices: [...sorted],
        sortedBoundary: n - i,
        operation: `Comparing ${arr[j]} ↔ ${arr[j + 1]}`,
        explanation: `Checking if ${arr[j]} > ${arr[j + 1]}. Bubble sort compares adjacent elements and swaps them if out of order.`,
        algorithmPhase: 'comparing',
      };

      if (arr[j] > arr[j + 1]) {
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        arrayAccesses += 2;
        swapped = true;
        yield {
          array: [...arr],
          comparisons, swaps, arrayAccesses,
          activeIndices: [],
          swappingIndices: [j, j + 1],
          sortedIndices: [...sorted],
          sortedBoundary: n - i,
          operation: `Swapped ${arr[j + 1]} ↔ ${arr[j]}`,
          explanation: `${arr[j + 1]} > ${arr[j]}, so they swap. The larger element "bubbles up" to the right.`,
          algorithmPhase: 'swapping',
        };
      }
    }
    sorted.add(n - 1 - i);
    if (!swapped) break;
  }
  // Mark remaining as sorted
  for (let i = 0; i < n; i++) sorted.add(i);
  yield {
    array: [...arr],
    comparisons, swaps, arrayAccesses,
    activeIndices: [],
    swappingIndices: [],
    sortedIndices: [...sorted],
    operation: 'Sorting complete',
    explanation: 'All elements are now in their correct positions.',
    algorithmPhase: 'done',
  };
}

/* ============================================
   SELECTION SORT
   ============================================ */
function* selectionSortGen(data: number[]): Generator<SortStep, void, unknown> {
  const arr = [...data];
  const n = arr.length;
  let comparisons = 0, swaps = 0, arrayAccesses = 0;
  const sorted: Set<number> = new Set();

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    arrayAccesses++;

    // Scanning for minimum
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      arrayAccesses += 2;
      yield {
        array: [...arr],
        comparisons, swaps, arrayAccesses,
        activeIndices: [j, minIdx],
        swappingIndices: [],
        sortedIndices: [...sorted],
        sortedBoundary: i,
        operation: `Finding minimum: comparing ${arr[j]} with current min ${arr[minIdx]}`,
        explanation: `Scanning unsorted region for the smallest element. Current minimum is ${arr[minIdx]} at index ${minIdx}.`,
        algorithmPhase: 'scanning',
      };

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      // Place minimum in sorted position
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      swaps++;
      arrayAccesses += 2;
      yield {
        array: [...arr],
        comparisons, swaps, arrayAccesses,
        activeIndices: [],
        swappingIndices: [i, minIdx],
        sortedIndices: [...sorted],
        sortedBoundary: i,
        operation: `Placed minimum ${arr[i]} at position ${i}`,
        explanation: `Found minimum ${arr[i]}. Swapping it into position ${i} — the correct sorted location.`,
        algorithmPhase: 'placing',
      };
    }
    sorted.add(i);
  }
  sorted.add(n - 1);
  yield {
    array: [...arr],
    comparisons, swaps, arrayAccesses,
    activeIndices: [],
    swappingIndices: [],
    sortedIndices: [...sorted],
    operation: 'Sorting complete',
    explanation: 'All minimum elements have been placed in their correct positions.',
    algorithmPhase: 'done',
  };
}

/* ============================================
   INSERTION SORT
   ============================================ */
function* insertionSortGen(data: number[]): Generator<SortStep, void, unknown> {
  const arr = [...data];
  const n = arr.length;
  let comparisons = 0, swaps = 0, arrayAccesses = 0;
  const sorted: Set<number> = new Set([0]);

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    arrayAccesses++;
    let j = i - 1;

    yield {
      array: [...arr],
      comparisons, swaps, arrayAccesses,
      activeIndices: [i],
      swappingIndices: [],
      sortedIndices: [...sorted],
      sortedBoundary: i,
      operation: `Inserting ${key} into sorted region`,
      explanation: `Picking up element ${key} at index ${i}. Will find its correct position in the sorted region [0..${i - 1}].`,
      algorithmPhase: 'picking',
    };

    while (j >= 0 && arr[j] > key) {
      comparisons++;
      arrayAccesses += 2;

      // Shift
      arr[j + 1] = arr[j];
      swaps++;
      arrayAccesses++;

      yield {
        array: [...arr],
        comparisons, swaps, arrayAccesses,
        activeIndices: [j + 1],
        swappingIndices: [j, j + 1],
        sortedIndices: [...sorted],
        sortedBoundary: i,
        operation: `Shifting ${arr[j + 1]} right`,
        explanation: `${arr[j + 1]} > ${key}, so it shifts right to make room for ${key}.`,
        algorithmPhase: 'shifting',
      };
      j--;
    }
    if (j >= 0) {
      comparisons++;
      arrayAccesses++;
    }

    arr[j + 1] = key;
    arrayAccesses++;
    sorted.add(i);

    yield {
      array: [...arr],
      comparisons, swaps, arrayAccesses,
      activeIndices: [j + 1],
      swappingIndices: [],
      sortedIndices: [...sorted],
      sortedBoundary: i + 1,
      operation: `Inserted ${key} at position ${j + 1}`,
      explanation: `Placed ${key} at index ${j + 1}. The sorted region is now [0..${i}].`,
      algorithmPhase: 'inserted',
    };
  }

  yield {
    array: [...arr],
    comparisons, swaps, arrayAccesses,
    activeIndices: [],
    swappingIndices: [],
    sortedIndices: Array.from({ length: n }, (_, i) => i),
    operation: 'Sorting complete',
    explanation: 'All elements have been inserted into their correct positions.',
    algorithmPhase: 'done',
  };
}

/* ============================================
   MERGE SORT
   ============================================ */
function* mergeSortGen(data: number[]): Generator<SortStep, void, unknown> {
  const arr = [...data];
  const n = arr.length;
  let comparisons = 0, swaps = 0, arrayAccesses = 0;
  const sorted: Set<number> = new Set();

  function* mergeSort(l: number, r: number): Generator<SortStep, void, unknown> {
    if (l >= r) return;

    const m = Math.floor((l + r) / 2);

    yield {
      array: [...arr],
      comparisons, swaps, arrayAccesses,
      activeIndices: [l, m, r],
      swappingIndices: [],
      sortedIndices: [...sorted],
      mergeRange: [l, r],
      operation: `Splitting [${l}..${r}] at midpoint ${m}`,
      explanation: `Divide: splitting subarray [${l}..${r}] into [${l}..${m}] and [${m + 1}..${r}].`,
      algorithmPhase: 'splitting',
    };

    yield* mergeSort(l, m);
    yield* mergeSort(m + 1, r);

    // Merge
    const left = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    arrayAccesses += (r - l + 1);
    let i = 0, j = 0, k = l;

    yield {
      array: [...arr],
      comparisons, swaps, arrayAccesses,
      activeIndices: [],
      swappingIndices: [],
      sortedIndices: [...sorted],
      mergeRange: [l, r],
      operation: `Merging [${l}..${m}] and [${m + 1}..${r}]`,
      explanation: `Conquer: merging two sorted halves back together by comparing elements.`,
      algorithmPhase: 'merging',
    };

    while (i < left.length && j < right.length) {
      comparisons++;
      arrayAccesses += 2;

      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
        swaps++;
      }
      arrayAccesses++;
      k++;

      yield {
        array: [...arr],
        comparisons, swaps, arrayAccesses,
        activeIndices: [k - 1],
        swappingIndices: [],
        sortedIndices: [...sorted],
        mergeRange: [l, r],
        operation: `Placed ${arr[k - 1]} at position ${k - 1}`,
        explanation: `Comparing elements from both halves and placing the smaller one (${arr[k - 1]}) into position.`,
        algorithmPhase: 'merging',
      };
    }

    while (i < left.length) {
      arr[k] = left[i];
      arrayAccesses += 2;
      i++;
      k++;
    }
    while (j < right.length) {
      arr[k] = right[j];
      arrayAccesses += 2;
      j++;
      k++;
    }

    // Mark merged region as sorted if this is a final merge
    if (l === 0 && r === n - 1) {
      for (let x = l; x <= r; x++) sorted.add(x);
    }
  }

  yield* mergeSort(0, n - 1);

  for (let i = 0; i < n; i++) sorted.add(i);
  yield {
    array: [...arr],
    comparisons, swaps, arrayAccesses,
    activeIndices: [],
    swappingIndices: [],
    sortedIndices: [...sorted],
    operation: 'Sorting complete',
    explanation: 'All subarrays have been merged. The array is fully sorted.',
    algorithmPhase: 'done',
  };
}

/* ============================================
   QUICK SORT
   ============================================ */
function* quickSortGen(data: number[]): Generator<SortStep, void, unknown> {
  const arr = [...data];
  const n = arr.length;
  let comparisons = 0, swaps = 0, arrayAccesses = 0;
  const sorted: Set<number> = new Set();

  function* quickSort(low: number, high: number): Generator<SortStep, void, unknown> {
    if (low >= high) {
      if (low === high) sorted.add(low);
      return;
    }

    // Partition
    const pivotVal = arr[high];
    arrayAccesses++;

    yield {
      array: [...arr],
      comparisons, swaps, arrayAccesses,
      activeIndices: [],
      swappingIndices: [],
      sortedIndices: [...sorted],
      pivotIndex: high,
      operation: `Pivot selected: ${pivotVal}`,
      explanation: `Choosing ${pivotVal} (last element) as pivot. Will partition elements: smaller to left, larger to right.`,
      algorithmPhase: 'pivot-selection',
    };

    let i = low - 1;

    for (let j = low; j < high; j++) {
      comparisons++;
      arrayAccesses += 2;

      yield {
        array: [...arr],
        comparisons, swaps, arrayAccesses,
        activeIndices: [j],
        swappingIndices: [],
        sortedIndices: [...sorted],
        pivotIndex: high,
        operation: `Comparing ${arr[j]} with pivot ${pivotVal}`,
        explanation: `Is ${arr[j]} < ${pivotVal}? ${arr[j] < pivotVal ? 'Yes → move to left partition.' : 'No → stays in right partition.'}`,
        algorithmPhase: 'partitioning',
      };

      if (arr[j] < pivotVal) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        swaps++;
        arrayAccesses += 2;

        if (i !== j) {
          yield {
            array: [...arr],
            comparisons, swaps, arrayAccesses,
            activeIndices: [],
            swappingIndices: [i, j],
            sortedIndices: [...sorted],
            pivotIndex: high,
            operation: `Swapped ${arr[i]} ↔ ${arr[j]}`,
            explanation: `Moving ${arr[i]} to the left partition.`,
            algorithmPhase: 'partitioning',
          };
        }
      }
    }

    // Place pivot in correct position
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    swaps++;
    arrayAccesses += 2;
    const pivotPos = i + 1;
    sorted.add(pivotPos);

    yield {
      array: [...arr],
      comparisons, swaps, arrayAccesses,
      activeIndices: [],
      swappingIndices: [pivotPos],
      sortedIndices: [...sorted],
      pivotIndex: pivotPos,
      operation: `Pivot ${pivotVal} placed at position ${pivotPos}`,
      explanation: `Pivot ${pivotVal} is now in its final sorted position. Left partition: [${low}..${pivotPos - 1}], Right: [${pivotPos + 1}..${high}].`,
      algorithmPhase: 'pivot-placed',
    };

    yield* quickSort(low, pivotPos - 1);
    yield* quickSort(pivotPos + 1, high);
  }

  yield* quickSort(0, n - 1);

  for (let i = 0; i < n; i++) sorted.add(i);
  yield {
    array: [...arr],
    comparisons, swaps, arrayAccesses,
    activeIndices: [],
    swappingIndices: [],
    sortedIndices: [...sorted],
    operation: 'Sorting complete',
    explanation: 'All elements have been partitioned and placed in their correct positions.',
    algorithmPhase: 'done',
  };
}

/* ============================================
   HEAP SORT
   ============================================ */
function* heapSortGen(data: number[]): Generator<SortStep, void, unknown> {
  const arr = [...data];
  const n = arr.length;
  let comparisons = 0, swaps = 0, arrayAccesses = 0;
  const sorted: Set<number> = new Set();

  function* heapify(size: number, i: number): Generator<SortStep, void, unknown> {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < size) {
      comparisons++;
      arrayAccesses += 2;
      if (arr[left] > arr[largest]) largest = left;
    }

    if (right < size) {
      comparisons++;
      arrayAccesses += 2;
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest !== i) {
      yield {
        array: [...arr],
        comparisons, swaps, arrayAccesses,
        activeIndices: [i, largest],
        swappingIndices: [],
        sortedIndices: [...sorted],
        heapSize: size,
        operation: `Heapify: ${arr[i]} < ${arr[largest]}`,
        explanation: `Node ${arr[i]} at index ${i} is smaller than its child ${arr[largest]}. Swapping to maintain max-heap property.`,
        algorithmPhase: 'heapifying',
      };

      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      swaps++;
      arrayAccesses += 2;

      yield {
        array: [...arr],
        comparisons, swaps, arrayAccesses,
        activeIndices: [],
        swappingIndices: [i, largest],
        sortedIndices: [...sorted],
        heapSize: size,
        operation: `Swapped ${arr[i]} ↔ ${arr[largest]}`,
        explanation: `Heap property restored at index ${i}. Continuing to heapify downward.`,
        algorithmPhase: 'heapifying',
      };

      yield* heapify(size, largest);
    }
  }

  // Build max heap
  yield {
    array: [...arr],
    comparisons, swaps, arrayAccesses,
    activeIndices: [],
    swappingIndices: [],
    sortedIndices: [],
    heapSize: n,
    operation: 'Building max heap',
    explanation: 'Converting the array into a max-heap by heapifying from the last non-leaf node upward.',
    algorithmPhase: 'building-heap',
  };

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i);
  }

  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    yield {
      array: [...arr],
      comparisons, swaps, arrayAccesses,
      activeIndices: [0, i],
      swappingIndices: [],
      sortedIndices: [...sorted],
      heapSize: i + 1,
      operation: `Extract max: ${arr[0]} → position ${i}`,
      explanation: `The root (${arr[0]}) is the largest in the heap. Moving it to position ${i} (end of unsorted region).`,
      algorithmPhase: 'extracting',
    };

    [arr[0], arr[i]] = [arr[i], arr[0]];
    swaps++;
    arrayAccesses += 2;
    sorted.add(i);

    yield {
      array: [...arr],
      comparisons, swaps, arrayAccesses,
      activeIndices: [],
      swappingIndices: [0, i],
      sortedIndices: [...sorted],
      heapSize: i,
      operation: `Placed ${arr[i]} at position ${i}`,
      explanation: `${arr[i]} is now in its final sorted position. Re-heapifying the remaining ${i} elements.`,
      algorithmPhase: 'extracting',
    };

    yield* heapify(i, 0);
  }

  sorted.add(0);
  yield {
    array: [...arr],
    comparisons, swaps, arrayAccesses,
    activeIndices: [],
    swappingIndices: [],
    sortedIndices: [...sorted],
    operation: 'Sorting complete',
    explanation: 'All elements have been extracted from the heap in order.',
    algorithmPhase: 'done',
  };
}

/* ============================================
   ALGORITHM DEFINITIONS
   ============================================ */

export const SORT_ALGORITHMS: SortAlgorithmDef[] = [
  {
    id: 'bubble',
    name: 'Bubble Sort',
    complexity: 'O(n²)',
    bestCase: 'O(n)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    color: '#ef4444',
    generate: (data) => collectSteps(bubbleSortGen(data)),
  },
  {
    id: 'selection',
    name: 'Selection Sort',
    complexity: 'O(n²)',
    bestCase: 'O(n²)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    color: '#f59e0b',
    generate: (data) => collectSteps(selectionSortGen(data)),
  },
  {
    id: 'insertion',
    name: 'Insertion Sort',
    complexity: 'O(n²)',
    bestCase: 'O(n)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    color: '#10b981',
    generate: (data) => collectSteps(insertionSortGen(data)),
  },
  {
    id: 'merge',
    name: 'Merge Sort',
    complexity: 'O(n log n)',
    bestCase: 'O(n log n)',
    worstCase: 'O(n log n)',
    spaceComplexity: 'O(n)',
    color: '#6366f1',
    generate: (data) => collectSteps(mergeSortGen(data)),
  },
  {
    id: 'quick',
    name: 'Quick Sort',
    complexity: 'O(n log n)',
    bestCase: 'O(n log n)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(log n)',
    color: '#8b5cf6',
    generate: (data) => collectSteps(quickSortGen(data)),
  },
  {
    id: 'heap',
    name: 'Heap Sort',
    complexity: 'O(n log n)',
    bestCase: 'O(n log n)',
    worstCase: 'O(n log n)',
    spaceComplexity: 'O(1)',
    color: '#ec4899',
    generate: (data) => collectSteps(heapSortGen(data)),
  },
];
