/* ============================================
   Hash Table Algorithm — Multiple strategies
   with state snapshots
   ============================================ */

import type { AlgorithmState, CollisionStrategy } from '../../types';

export interface HashTableEntry {
  key: number;
  value: string;
  state: string;
}

export interface HashBucketState {
  index: number;
  entries: HashTableEntry[];
  state: string;
}

export interface HashTableData {
  buckets: HashBucketState[];
  size: number;
  count: number;
  strategy: CollisionStrategy;
}

function createEmptyTable(size: number, strategy: CollisionStrategy): HashTableData {
  const buckets: HashBucketState[] = [];
  for (let i = 0; i < size; i++) {
    buckets.push({ index: i, entries: [], state: 'normal' });
  }
  return { buckets, size, count: 0, strategy };
}

function cloneTable(table: HashTableData): HashTableData {
  return {
    ...table,
    buckets: table.buckets.map(b => ({
      ...b,
      entries: b.entries.map(e => ({ ...e })),
    })),
  };
}

function hashFunction(key: number, size: number): number {
  return ((key % size) + size) % size;
}

function secondHash(key: number, size: number): number {
  const prime = Math.max(1, size - 1);
  return 1 + (key % prime);
}

// ---- SEPARATE CHAINING INSERT ----
export function hashInsertSC(table: HashTableData, key: number): { table: HashTableData; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let stateId = 0;
  const t = cloneTable(table);
  const index = hashFunction(key, t.size);

  // Step 1: Calculate hash
  states.push({
    id: stateId++,
    dataStructureState: cloneTable(t),
    activeNodes: [{ id: `bucket-${index}`, state: 'active' }],
    activeEdges: [],
    operation: 'HASH',
    explanation: `hash(${key}) = ${key} mod ${t.size} = ${index}`,
    detailedExplanation: `The hash function maps key ${key} to bucket index ${index}.`,
    pseudocodeLine: 0,
    comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(1)',
    metadata: { key, hashValue: index, formula: `${key} mod ${t.size}` },
  });

  // Step 2: Check for collision
  const hasCollision = t.buckets[index].entries.length > 0;
  if (hasCollision) {
    states.push({
      id: stateId++,
      dataStructureState: cloneTable(t),
      activeNodes: [{ id: `bucket-${index}`, state: 'collision' }],
      activeEdges: [],
      operation: 'COLLISION',
      explanation: `Collision at index ${index}! Bucket already has ${t.buckets[index].entries.length} element(s).`,
      detailedExplanation: `With separate chaining, we simply add to the linked list at this bucket.`,
      pseudocodeLine: 2,
      comparisons: 0, assignments: 0, swaps: 0,
      complexity: 'O(1)',
      metadata: { collision: true, existingCount: t.buckets[index].entries.length },
    });
  }

  // Step 3: Insert
  t.buckets[index].entries.push({ key, value: `v${key}`, state: 'inserted' });
  t.count++;

  states.push({
    id: stateId++,
    dataStructureState: cloneTable(t),
    activeNodes: [{ id: `bucket-${index}`, state: 'inserted' }],
    activeEdges: [],
    operation: 'INSERT',
    explanation: `Inserted key ${key} at bucket ${index}. ${hasCollision ? 'Chained to existing elements.' : ''}`,
    detailedExplanation: `Load factor: ${(t.count / t.size).toFixed(2)} (${t.count}/${t.size})`,
    pseudocodeLine: 3,
    comparisons: 0, assignments: 1, swaps: 0,
    complexity: 'O(1)',
    metadata: { loadFactor: t.count / t.size },
  });

  return { table: t, states };
}

// ---- LINEAR PROBING INSERT ----
export function hashInsertLP(table: HashTableData, key: number): { table: HashTableData; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let stateId = 0;
  const t = cloneTable(table);
  const index = hashFunction(key, t.size);
  let probes = 0;

  // Step 1: Calculate hash
  states.push({
    id: stateId++,
    dataStructureState: cloneTable(t),
    activeNodes: [{ id: `bucket-${index}`, state: 'active' }],
    activeEdges: [],
    operation: 'HASH',
    explanation: `hash(${key}) = ${key} mod ${t.size} = ${index}`,
    detailedExplanation: `Initial index computed. Now check if bucket ${index} is available.`,
    pseudocodeLine: 0,
    comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(1)',
    metadata: { key, hashValue: index },
  });

  let current = index;
  while (t.buckets[current].entries.length > 0) {
    probes++;

    if (t.buckets[current].entries[0].key === key) {
      states.push({
        id: stateId++,
        dataStructureState: cloneTable(t),
        activeNodes: [{ id: `bucket-${current}`, state: 'error' }],
        activeEdges: [],
        operation: 'DUPLICATE',
        explanation: `Key ${key} already exists at index ${current}.`,
        detailedExplanation: 'Duplicate keys are not allowed.',
        pseudocodeLine: 2,
        comparisons: probes, assignments: 0, swaps: 0,
        complexity: `O(${probes})`,
        metadata: { duplicate: true },
      });
      return { table: t, states };
    }

    states.push({
      id: stateId++,
      dataStructureState: cloneTable(t),
      activeNodes: [{ id: `bucket-${current}`, state: 'collision' }],
      activeEdges: [],
      operation: 'PROBE',
      explanation: `Bucket ${current} occupied (key=${t.buckets[current].entries[0].key}). Linear probe → try ${(current + 1) % t.size}.`,
      detailedExplanation: `Linear probing: next = (current + 1) mod ${t.size}. Probe #${probes}.`,
      pseudocodeLine: 4,
      comparisons: probes, assignments: 0, swaps: 0,
      complexity: `O(${probes})`,
      metadata: { probe: probes, from: current, to: (current + 1) % t.size },
    });

    current = (current + 1) % t.size;

    if (current === index) {
      states.push({
        id: stateId++,
        dataStructureState: cloneTable(t),
        activeNodes: [],
        activeEdges: [],
        operation: 'TABLE FULL',
        explanation: 'Hash table is full! Cannot insert.',
        detailedExplanation: 'All buckets are occupied. Rehashing is needed.',
        pseudocodeLine: 6,
        comparisons: probes, assignments: 0, swaps: 0,
        complexity: 'O(n)',
        metadata: { tableFull: true },
      });
      return { table: t, states };
    }
  }

  t.buckets[current].entries.push({ key, value: `v${key}`, state: 'inserted' });
  t.count++;

  states.push({
    id: stateId++,
    dataStructureState: cloneTable(t),
    activeNodes: [{ id: `bucket-${current}`, state: 'inserted' }],
    activeEdges: [],
    operation: 'INSERT',
    explanation: `Inserted key ${key} at index ${current}. ${probes > 0 ? `After ${probes} probe(s).` : 'No collision.'}`,
    detailedExplanation: `Load factor: ${(t.count / t.size).toFixed(2)}`,
    pseudocodeLine: 7,
    comparisons: probes, assignments: 1, swaps: 0,
    complexity: probes > 0 ? `O(${probes + 1})` : 'O(1)',
    metadata: { loadFactor: t.count / t.size, probes },
  });

  return { table: t, states };
}

// ---- QUADRATIC PROBING INSERT ----
export function hashInsertQP(table: HashTableData, key: number): { table: HashTableData; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let stateId = 0;
  const t = cloneTable(table);
  const index = hashFunction(key, t.size);
  let probes = 0;

  states.push({
    id: stateId++,
    dataStructureState: cloneTable(t),
    activeNodes: [{ id: `bucket-${index}`, state: 'active' }],
    activeEdges: [],
    operation: 'HASH',
    explanation: `hash(${key}) = ${key} mod ${t.size} = ${index}`,
    detailedExplanation: 'Compute initial hash index.',
    pseudocodeLine: 0,
    comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(1)',
    metadata: { key, hashValue: index },
  });

  let i = 0;
  let current = index;
  while (t.buckets[current].entries.length > 0 && i < t.size) {
    probes++;
    i++;
    const next = (index + i * i) % t.size;

    states.push({
      id: stateId++,
      dataStructureState: cloneTable(t),
      activeNodes: [{ id: `bucket-${current}`, state: 'collision' }],
      activeEdges: [],
      operation: 'PROBE',
      explanation: `Bucket ${current} occupied. Quadratic probe: (${index} + ${i}²) mod ${t.size} = ${next}.`,
      detailedExplanation: `Quadratic probing reduces primary clustering by using i² offsets.`,
      pseudocodeLine: 3,
      comparisons: probes, assignments: 0, swaps: 0,
      complexity: `O(${probes})`,
      metadata: { probe: probes, i, formula: `(${index} + ${i}²) mod ${t.size}` },
    });

    current = next;
  }

  if (i >= t.size) {
    states.push({
      id: stateId++, dataStructureState: cloneTable(t), activeNodes: [], activeEdges: [],
      operation: 'TABLE FULL', explanation: 'Cannot find empty slot.',
      detailedExplanation: 'Table may need rehashing.', pseudocodeLine: 5,
      comparisons: probes, assignments: 0, swaps: 0, complexity: 'O(n)', metadata: {},
    });
    return { table: t, states };
  }

  t.buckets[current].entries.push({ key, value: `v${key}`, state: 'inserted' });
  t.count++;

  states.push({
    id: stateId++,
    dataStructureState: cloneTable(t),
    activeNodes: [{ id: `bucket-${current}`, state: 'inserted' }],
    activeEdges: [],
    operation: 'INSERT',
    explanation: `Inserted key ${key} at index ${current}. ${probes > 0 ? `${probes} probe(s).` : 'No collision.'}`,
    detailedExplanation: `Load factor: ${(t.count / t.size).toFixed(2)}`,
    pseudocodeLine: 6,
    comparisons: probes, assignments: 1, swaps: 0,
    complexity: probes > 0 ? `O(${probes + 1})` : 'O(1)',
    metadata: { loadFactor: t.count / t.size, probes },
  });

  return { table: t, states };
}

// ---- DOUBLE HASHING INSERT ----
export function hashInsertDH(table: HashTableData, key: number): { table: HashTableData; states: AlgorithmState[] } {
  const states: AlgorithmState[] = [];
  let stateId = 0;
  const t = cloneTable(table);
  const h1 = hashFunction(key, t.size);
  const h2 = secondHash(key, t.size);
  let probes = 0;

  states.push({
    id: stateId++,
    dataStructureState: cloneTable(t),
    activeNodes: [{ id: `bucket-${h1}`, state: 'active' }],
    activeEdges: [],
    operation: 'HASH',
    explanation: `h₁(${key}) = ${h1}, h₂(${key}) = ${h2}`,
    detailedExplanation: `Double hashing uses two hash functions. h₁ for initial index, h₂ for step size.`,
    pseudocodeLine: 0,
    comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(1)',
    metadata: { key, h1, h2 },
  });

  let i = 0;
  let current = h1;
  while (t.buckets[current].entries.length > 0 && i < t.size) {
    probes++;
    i++;
    const next = (h1 + i * h2) % t.size;

    states.push({
      id: stateId++,
      dataStructureState: cloneTable(t),
      activeNodes: [{ id: `bucket-${current}`, state: 'collision' }],
      activeEdges: [],
      operation: 'PROBE',
      explanation: `Bucket ${current} occupied. Double hash: (${h1} + ${i}×${h2}) mod ${t.size} = ${next}.`,
      detailedExplanation: `Using second hash function for step size reduces clustering.`,
      pseudocodeLine: 3,
      comparisons: probes, assignments: 0, swaps: 0,
      complexity: `O(${probes})`,
      metadata: { probe: probes, formula: `(${h1} + ${i}×${h2}) mod ${t.size}` },
    });

    current = next;
  }

  if (i >= t.size) {
    states.push({
      id: stateId++, dataStructureState: cloneTable(t), activeNodes: [], activeEdges: [],
      operation: 'TABLE FULL', explanation: 'Table full.', detailedExplanation: '',
      pseudocodeLine: 5, comparisons: probes, assignments: 0, swaps: 0, complexity: 'O(n)', metadata: {},
    });
    return { table: t, states };
  }

  t.buckets[current].entries.push({ key, value: `v${key}`, state: 'inserted' });
  t.count++;

  states.push({
    id: stateId++,
    dataStructureState: cloneTable(t),
    activeNodes: [{ id: `bucket-${current}`, state: 'inserted' }],
    activeEdges: [],
    operation: 'INSERT',
    explanation: `Inserted key ${key} at index ${current}. ${probes > 0 ? `${probes} probe(s).` : 'No collision.'}`,
    detailedExplanation: `Load factor: ${(t.count / t.size).toFixed(2)}`,
    pseudocodeLine: 6,
    comparisons: probes, assignments: 1, swaps: 0,
    complexity: probes > 0 ? `O(${probes + 1})` : 'O(1)',
    metadata: { loadFactor: t.count / t.size, probes },
  });

  return { table: t, states };
}

export { createEmptyTable, cloneTable, hashFunction };
