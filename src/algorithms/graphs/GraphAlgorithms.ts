/* ============================================
   Graph Algorithms — BFS, DFS, Dijkstra,
   Bellman-Ford, Topological Sort
   with state snapshots
   ============================================ */

import type { AlgorithmState, Graph } from '../../types';

function cloneGraph(g: Graph): Graph {
  return {
    ...g,
    nodes: g.nodes.map(n => ({ ...n })),
    edges: g.edges.map(e => ({ ...e })),
  };
}

// ---- BFS ----
export function graphBFS(graph: Graph, startId: string): AlgorithmState[] {
  const states: AlgorithmState[] = [];
  let stateId = 0;
  const visited = new Set<string>();
  const queue: string[] = [startId];
  visited.add(startId);
  const order: string[] = [];

  const g = cloneGraph(graph);

  states.push({
    id: stateId++,
    dataStructureState: cloneGraph(g),
    activeNodes: [{ id: startId, state: 'active' }],
    activeEdges: [],
    operation: 'START BFS',
    explanation: `Starting BFS from node ${startId}. Add to queue.`,
    detailedExplanation: 'BFS explores nodes level by level using a queue.',
    pseudocodeLine: 0, comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(V + E)', metadata: { queue: [...queue], visited: [...visited] },
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);

    states.push({
      id: stateId++,
      dataStructureState: cloneGraph(g),
      activeNodes: [
        { id: current, state: 'active' },
        ...Array.from(visited).filter(v => v !== current).map(v => ({ id: v, state: 'visited' as const })),
      ],
      activeEdges: [],
      operation: 'DEQUEUE',
      explanation: `Dequeue node ${current}. Visit order: [${order.join(', ')}]`,
      detailedExplanation: 'Process the front of the queue.',
      pseudocodeLine: 3, comparisons: 0, assignments: 0, swaps: 0,
      complexity: 'O(V + E)', metadata: { queue: [...queue], current, order: [...order] },
    });

    // Find neighbors
    const neighbors = graph.edges
      .filter(e => (e.source === current || (!graph.directed && e.target === current)))
      .map(e => e.source === current ? e.target : e.source)
      .filter(n => !visited.has(n));

    for (const neighbor of neighbors) {
      visited.add(neighbor);
      queue.push(neighbor);

      const edge = graph.edges.find(
        e => (e.source === current && e.target === neighbor) || (!graph.directed && e.target === current && e.source === neighbor)
      );

      states.push({
        id: stateId++,
        dataStructureState: cloneGraph(g),
        activeNodes: [
          { id: current, state: 'active' },
          { id: neighbor, state: 'frontier' },
          ...Array.from(visited).filter(v => v !== current && v !== neighbor).map(v => ({ id: v, state: 'visited' as const })),
        ],
        activeEdges: edge ? [{ id: edge.id, state: 'examining' as const }] : [],
        operation: 'DISCOVER',
        explanation: `Discovered ${neighbor} from ${current}. Added to queue.`,
        detailedExplanation: `Queue: [${queue.join(', ')}]`,
        pseudocodeLine: 5, comparisons: 0, assignments: 0, swaps: 0,
        complexity: 'O(V + E)', metadata: { queue: [...queue], discovered: neighbor },
      });
    }
  }

  states.push({
    id: stateId++,
    dataStructureState: cloneGraph(g),
    activeNodes: Array.from(visited).map(v => ({ id: v, state: 'visited' as const })),
    activeEdges: [],
    operation: 'BFS COMPLETE',
    explanation: `BFS complete. Visit order: [${order.join(', ')}]`,
    detailedExplanation: `Visited ${visited.size} nodes.`,
    pseudocodeLine: null, comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(V + E)', metadata: { order },
  });

  return states;
}

// ---- Dijkstra ----
export function dijkstra(graph: Graph, startId: string): AlgorithmState[] {
  const states: AlgorithmState[] = [];
  let stateId = 0;
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  const g = cloneGraph(graph);

  // Initialize
  for (const node of graph.nodes) {
    dist[node.id] = node.id === startId ? 0 : Infinity;
    prev[node.id] = null;
  }

  states.push({
    id: stateId++,
    dataStructureState: cloneGraph(g),
    activeNodes: [{ id: startId, state: 'active' }],
    activeEdges: [],
    operation: 'INITIALIZE',
    explanation: `Initialize distances. ${startId} = 0, all others = ∞`,
    detailedExplanation: "Dijkstra's finds shortest paths from a single source using a greedy approach.",
    pseudocodeLine: 0, comparisons: 0, assignments: graph.nodes.length, swaps: 0,
    complexity: 'O(V² ) or O((V+E) log V)',
    metadata: { distances: { ...dist } },
  });

  for (let i = 0; i < graph.nodes.length; i++) {
    // Find unvisited node with minimum distance
    let minDist = Infinity;
    let minNode: string | null = null;
    for (const node of graph.nodes) {
      if (!visited.has(node.id) && dist[node.id] < minDist) {
        minDist = dist[node.id];
        minNode = node.id;
      }
    }

    if (!minNode || minDist === Infinity) break;

    visited.add(minNode);

    states.push({
      id: stateId++,
      dataStructureState: cloneGraph(g),
      activeNodes: [
        { id: minNode, state: 'active' },
        ...Array.from(visited).filter(v => v !== minNode).map(v => ({ id: v, state: 'visited' as const })),
      ],
      activeEdges: [],
      operation: 'SELECT',
      explanation: `Select node ${minNode} with distance ${dist[minNode]}.`,
      detailedExplanation: 'Pick the unvisited node with the smallest known distance.',
      pseudocodeLine: 4, comparisons: i, assignments: 0, swaps: 0,
      complexity: 'O(V²)',
      metadata: { distances: { ...dist }, selected: minNode },
    });

    // Relax edges
    const edges = graph.edges.filter(
      e => e.source === minNode || (!graph.directed && e.target === minNode)
    );

    for (const edge of edges) {
      const neighbor = edge.source === minNode ? edge.target : edge.source;
      if (visited.has(neighbor)) continue;

      const newDist = dist[minNode] + edge.weight;

      if (newDist < dist[neighbor]) {
        states.push({
          id: stateId++,
          dataStructureState: cloneGraph(g),
          activeNodes: [
            { id: minNode, state: 'active' },
            { id: neighbor, state: 'relaxed' },
            ...Array.from(visited).filter(v => v !== minNode).map(v => ({ id: v, state: 'visited' as const })),
          ],
          activeEdges: [{ id: edge.id, state: 'relaxed' }],
          operation: 'RELAX',
          explanation: `Relax edge ${minNode}→${neighbor}: ${dist[neighbor] === Infinity ? '∞' : dist[neighbor]} → ${newDist} (via ${minNode})`,
          detailedExplanation: `${dist[minNode]} + ${edge.weight} = ${newDist} < ${dist[neighbor] === Infinity ? '∞' : dist[neighbor]}. Update!`,
          pseudocodeLine: 7, comparisons: 0, assignments: 1, swaps: 0,
          complexity: 'O(V²)',
          metadata: { distances: { ...dist, [neighbor]: newDist }, edge: `${minNode}→${neighbor}` },
        });

        dist[neighbor] = newDist;
        prev[neighbor] = minNode;
      } else {
        states.push({
          id: stateId++,
          dataStructureState: cloneGraph(g),
          activeNodes: [
            { id: minNode, state: 'active' },
            { id: neighbor, state: 'comparing' },
          ],
          activeEdges: [{ id: edge.id, state: 'examining' }],
          operation: 'NO IMPROVEMENT',
          explanation: `Edge ${minNode}→${neighbor}: ${newDist} ≥ ${dist[neighbor]}. No update.`,
          detailedExplanation: 'Current path to this neighbor is already shorter.',
          pseudocodeLine: 8, comparisons: 1, assignments: 0, swaps: 0,
          complexity: 'O(V²)',
          metadata: { distances: { ...dist } },
        });
      }
    }
  }

  // Final
  states.push({
    id: stateId++,
    dataStructureState: cloneGraph(g),
    activeNodes: graph.nodes.map(n => ({ id: n.id, state: 'visited' as const })),
    activeEdges: [],
    operation: 'DIJKSTRA COMPLETE',
    explanation: `Shortest paths from ${startId}: ${graph.nodes.map(n => `${n.id}=${dist[n.id] === Infinity ? '∞' : dist[n.id]}`).join(', ')}`,
    detailedExplanation: "Dijkstra's algorithm guarantees optimal shortest paths for non-negative weights.",
    pseudocodeLine: null, comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(V²)',
    metadata: { distances: { ...dist }, predecessors: { ...prev } },
  });

  return states;
}

// ---- Topological Sort (Kahn's) ----
export function topologicalSort(graph: Graph): AlgorithmState[] {
  const states: AlgorithmState[] = [];
  let stateId = 0;

  if (!graph.directed) {
    states.push({
      id: stateId++,
      dataStructureState: cloneGraph(graph),
      activeNodes: [], activeEdges: [],
      operation: 'ERROR',
      explanation: 'Topological sort requires a directed graph.',
      detailedExplanation: 'Switch to directed mode to use topological sort.',
      pseudocodeLine: null, comparisons: 0, assignments: 0, swaps: 0,
      complexity: 'O(V + E)', metadata: {},
    });
    return states;
  }

  const inDegree: Record<string, number> = {};
  for (const node of graph.nodes) inDegree[node.id] = 0;
  for (const edge of graph.edges) {
    inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
  }

  const queue: string[] = [];
  for (const node of graph.nodes) {
    if (inDegree[node.id] === 0) queue.push(node.id);
  }

  const result: string[] = [];
  const g = cloneGraph(graph);

  states.push({
    id: stateId++,
    dataStructureState: cloneGraph(g),
    activeNodes: queue.map(id => ({ id, state: 'frontier' as const })),
    activeEdges: [],
    operation: 'INITIALIZE',
    explanation: `In-degrees: ${graph.nodes.map(n => `${n.id}=${inDegree[n.id]}`).join(', ')}. Nodes with in-degree 0: [${queue.join(', ')}]`,
    detailedExplanation: "Kahn's algorithm starts with nodes that have no incoming edges.",
    pseudocodeLine: 0, comparisons: 0, assignments: 0, swaps: 0,
    complexity: 'O(V + E)', metadata: { inDegree: { ...inDegree } },
  });

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    states.push({
      id: stateId++,
      dataStructureState: cloneGraph(g),
      activeNodes: [
        { id: node, state: 'active' },
        ...result.filter(r => r !== node).map(r => ({ id: r, state: 'visited' as const })),
      ],
      activeEdges: [],
      operation: 'SELECT',
      explanation: `Select ${node} (in-degree 0). Order so far: [${result.join(', ')}]`,
      detailedExplanation: 'Remove node from queue and add to topological order.',
      pseudocodeLine: 3, comparisons: 0, assignments: 0, swaps: 0,
      complexity: 'O(V + E)', metadata: { order: [...result] },
    });

    // Remove outgoing edges
    const outEdges = graph.edges.filter(e => e.source === node);
    for (const edge of outEdges) {
      inDegree[edge.target]--;
      if (inDegree[edge.target] === 0) {
        queue.push(edge.target);
        states.push({
          id: stateId++,
          dataStructureState: cloneGraph(g),
          activeNodes: [
            { id: node, state: 'active' },
            { id: edge.target, state: 'frontier' },
          ],
          activeEdges: [{ id: edge.id, state: 'examining' }],
          operation: 'DECREMENT',
          explanation: `Remove edge ${node}→${edge.target}. In-degree of ${edge.target} now 0 — add to queue.`,
          detailedExplanation: `Queue: [${queue.join(', ')}]`,
          pseudocodeLine: 5, comparisons: 0, assignments: 1, swaps: 0,
          complexity: 'O(V + E)', metadata: { inDegree: { ...inDegree } },
        });
      }
    }
  }

  if (result.length !== graph.nodes.length) {
    states.push({
      id: stateId++,
      dataStructureState: cloneGraph(g),
      activeNodes: [], activeEdges: [],
      operation: 'CYCLE DETECTED',
      explanation: '⚠ Graph contains a cycle! Topological ordering is not possible.',
      detailedExplanation: `Only ${result.length} of ${graph.nodes.length} nodes were processed. Remaining nodes form a cycle.`,
      pseudocodeLine: null, comparisons: 0, assignments: 0, swaps: 0,
      complexity: 'O(V + E)', metadata: { hasCycle: true },
    });
  } else {
    states.push({
      id: stateId++,
      dataStructureState: cloneGraph(g),
      activeNodes: result.map(r => ({ id: r, state: 'visited' as const })),
      activeEdges: [],
      operation: 'COMPLETE',
      explanation: `Topological order: [${result.join(' → ')}]`,
      detailedExplanation: 'All nodes processed without cycles. Valid topological ordering found.',
      pseudocodeLine: null, comparisons: 0, assignments: 0, swaps: 0,
      complexity: 'O(V + E)', metadata: { order: result },
    });
  }

  return states;
}

// ---- Sample Graphs ----
export function createSampleGraph(): Graph {
  return {
    directed: false,
    weighted: true,
    nodes: [
      { id: 'A', label: 'A', x: 100, y: 100 },
      { id: 'B', label: 'B', x: 250, y: 50 },
      { id: 'C', label: 'C', x: 400, y: 100 },
      { id: 'D', label: 'D', x: 100, y: 250 },
      { id: 'E', label: 'E', x: 250, y: 200 },
      { id: 'F', label: 'F', x: 400, y: 250 },
    ],
    edges: [
      { id: 'e1', source: 'A', target: 'B', weight: 4, directed: false },
      { id: 'e2', source: 'A', target: 'D', weight: 2, directed: false },
      { id: 'e3', source: 'B', target: 'C', weight: 3, directed: false },
      { id: 'e4', source: 'B', target: 'E', weight: 1, directed: false },
      { id: 'e5', source: 'C', target: 'F', weight: 5, directed: false },
      { id: 'e6', source: 'D', target: 'E', weight: 7, directed: false },
      { id: 'e7', source: 'E', target: 'F', weight: 2, directed: false },
    ],
  };
}

export function createDAG(): Graph {
  return {
    directed: true,
    weighted: false,
    nodes: [
      { id: 'A', label: 'A', x: 100, y: 50 },
      { id: 'B', label: 'B', x: 250, y: 50 },
      { id: 'C', label: 'C', x: 100, y: 150 },
      { id: 'D', label: 'D', x: 250, y: 150 },
      { id: 'E', label: 'E', x: 175, y: 250 },
    ],
    edges: [
      { id: 'e1', source: 'A', target: 'C', weight: 1, directed: true },
      { id: 'e2', source: 'A', target: 'D', weight: 1, directed: true },
      { id: 'e3', source: 'B', target: 'D', weight: 1, directed: true },
      { id: 'e4', source: 'C', target: 'E', weight: 1, directed: true },
      { id: 'e5', source: 'D', target: 'E', weight: 1, directed: true },
    ],
  };
}
