/* ============================================
   Graph Lab Visualizer — Interactive graph editor
   + algorithm execution
   ============================================ */

import React, { useState, useCallback, useRef } from 'react';
import { AnimationControls } from '../../components/visualization/AnimationControls';
import { ExplanationPanel } from '../../components/visualization/ExplanationPanel';
import { ComplexityPanel } from '../../components/visualization/ComplexityPanel';
import { TheorySection } from '../../components/visualization/TheorySection';
import { useStateEngine } from '../../hooks/useStateEngine';
import { graphBFS, dijkstra, topologicalSort, createSampleGraph, createDAG } from '../../algorithms/graphs/GraphAlgorithms';
import { AlgorithmCodePanel } from '../../components/visualization/AlgorithmCodePanel';
import { graphBFSCodeData, graphDijkstraCodeData } from '../../data/algorithmCodeData';
import type { Graph, ComplexityInfo, NodeState, EdgeState } from '../../types';
import './GraphLabVisualizer.css';

const GRAPH_COMPLEXITY: ComplexityInfo = {
  time: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V²)' },
  space: 'O(V)',
};

// SVG Graph renderer
const GraphView: React.FC<{
  graph: Graph;
  activeNodes: { id: string; state: NodeState }[];
  activeEdges: { id: string; state: EdgeState }[];
  selectedNode: string | null;
  onNodeClick: (id: string) => void;
  onCanvasClick: (x: number, y: number) => void;
  distances?: Record<string, number>;
}> = ({ graph, activeNodes, activeEdges, selectedNode, onNodeClick, onCanvasClick, distances }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const stateColors: Record<string, string> = {
    normal: '#FFFFFF', active: '#0B4FDF', comparing: '#FEF3C7',
    visited: '#F4F3EE', frontier: '#E0F2FE', relaxed: '#EEF2FF',
    selected: '#0B4FDF', success: '#059669', error: '#DC2626',
  };

  const edgeColors: Record<string, string> = {
    normal: '#DDD9CF', active: '#0B4FDF',
    examining: '#D97706', 'shortest-path': '#059669', relaxed: '#4F46E5',
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRef.current) {
      const rect = svgRef.current!.getBoundingClientRect();
      onCanvasClick(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  return (
    <svg ref={svgRef} viewBox="0 0 500 300" className="graph-svg" onClick={handleSvgClick}>
      {/* Edges */}
      {graph.edges.map(edge => {
        const s = graph.nodes.find(n => n.id === edge.source);
        const t = graph.nodes.find(n => n.id === edge.target);
        if (!s || !t) return null;
        const ae = activeEdges.find(a => a.id === edge.id);
        const color = ae ? edgeColors[ae.state] || edgeColors.normal : edgeColors.normal;
        const width = ae ? 3 : 1.5;

        const mx = (s.x + t.x) / 2;
        const my = (s.y + t.y) / 2;

        return (
          <g key={edge.id}>
            <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={color} strokeWidth={width}
              strokeDasharray={ae?.state === 'examining' ? '5 3' : 'none'} />
            {graph.weighted && (
              <g>
                <rect x={mx - 10} y={my - 8} width={20} height={16} rx={4} fill="var(--bg-primary)" stroke={color} strokeWidth={1} />
                <text x={mx} y={my} dy="0.35em" textAnchor="middle" fill={color}
                  fontSize={10} fontFamily="'JetBrains Mono', monospace">{edge.weight}</text>
              </g>
            )}
            {graph.directed && (
              <polygon
                points={`${t.x},${t.y} ${t.x - 8},${t.y - 5} ${t.x - 8},${t.y + 5}`}
                fill={color}
                transform={`rotate(${Math.atan2(t.y - s.y, t.x - s.x) * 180 / Math.PI}, ${t.x}, ${t.y}) translate(-18, 0)`}
              />
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {graph.nodes.map(node => {
        const an = activeNodes.find(a => a.id === node.id);
        const state = an?.state || (selectedNode === node.id ? 'selected' : 'normal');
        const fill = stateColors[state] || stateColors.normal;

        return (
          <g key={node.id} onClick={() => onNodeClick(node.id)} className="graph-node-group">
            {state !== 'normal' && (
              <circle cx={node.x} cy={node.y} r={22} fill="none" stroke={fill} strokeWidth={1} opacity={0.4} />
            )}
            <circle cx={node.x} cy={node.y} r={16} fill={fill} stroke={state === 'normal' ? '#25262B' : fill} strokeWidth={state === 'normal' ? 1.5 : 2} className="graph-node-circle" />
            <text x={node.x} y={node.y} dy="0.35em" textAnchor="middle" fill={state === 'normal' || state === 'comparing' || state === 'visited' ? '#14151A' : '#FFFFFF'}
              fontSize={12} fontFamily="'JetBrains Mono', monospace" fontWeight={600}>{node.label}</text>
            {distances && distances[node.id] !== undefined && (
              <text x={node.x} y={node.y + 26} textAnchor="middle" fill="var(--text-tertiary)"
                fontSize={10} fontFamily="'JetBrains Mono', monospace">
                {distances[node.id] === Infinity ? '∞' : distances[node.id]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export const GraphLabVisualizer: React.FC = () => {
  const [graph, setGraph] = useState<Graph>(createSampleGraph());
  const [sourceNode, setSourceNode] = useState<string>('A');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeAlgorithm, setActiveAlgorithm] = useState<'bfs' | 'dijkstra' | 'topo'>('bfs');
  const { currentState, controls, loadStates } = useStateEngine();

  const handleBFS = useCallback(() => {
    setActiveAlgorithm('bfs');
    const states = graphBFS(graph, sourceNode);
    loadStates(states);
  }, [graph, sourceNode, loadStates]);

  const handleDijkstra = useCallback(() => {
    setActiveAlgorithm('dijkstra');
    const states = dijkstra(graph, sourceNode);
    loadStates(states);
  }, [graph, sourceNode, loadStates]);

  const handleTopoSort = useCallback(() => {
    setActiveAlgorithm('topo');
    const states = topologicalSort(graph);
    loadStates(states);
  }, [graph, loadStates]);

  const handleLoadSample = useCallback(() => {
    setGraph(createSampleGraph());
    loadStates([]);
    setSourceNode('A');
  }, [loadStates]);

  const handleLoadDAG = useCallback(() => {
    setGraph(createDAG());
    loadStates([]);
    setSourceNode('A');
  }, [loadStates]);

  const handleNodeClick = useCallback((id: string) => {
    setSelectedNode(id);
    setSourceNode(id);
  }, []);

  const handleCanvasClick = useCallback((x: number, y: number) => {
    // Add new node
    const id = String.fromCharCode(65 + graph.nodes.length);
    if (graph.nodes.length >= 26) return;
    setGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, { id, label: id, x, y }],
    }));
  }, [graph.nodes.length]);

  const activeNodes = (currentState?.activeNodes || []) as { id: string; state: NodeState }[];
  const activeEdges = (currentState?.activeEdges || []) as { id: string; state: EdgeState }[];
  const displayGraph = currentState?.dataStructureState || graph;
  const distances = currentState?.metadata?.distances as Record<string, number> | undefined;

  return (
    <div className="graph-lab">
      <TheorySection topicId="graph-basics" />
      <div className="viz-header">
        <div className="viz-header-info">
          <span className="viz-badge">Unit 4 — Graphs</span>
          <h1 className="viz-title">Graph Lab</h1>
          <p className="viz-desc">
            Create graphs, run algorithms, and visualize BFS, Dijkstra, and Topological Sort step by step.
            Click the canvas to add nodes. Click a node to select it as the source.
          </p>
        </div>
      </div>

      <div className="viz-layout">
        <div className="viz-main">
          <div className="viz-controls-bar">
            <div className="viz-input-group">
              <span className="graph-source-label">Source: <strong>{sourceNode}</strong></span>
              <button className="viz-btn viz-btn-insert" onClick={handleBFS}>BFS</button>
              <button className="viz-btn viz-btn-search" onClick={handleDijkstra}>Dijkstra</button>
              <button className="viz-btn viz-btn-secondary" onClick={handleTopoSort}>Topological Sort</button>
            </div>
            <div className="viz-input-group">
              <button className="viz-btn viz-btn-secondary" onClick={handleLoadSample}>Sample Graph</button>
              <button className="viz-btn viz-btn-secondary" onClick={handleLoadDAG}>DAG</button>
              <button className="viz-btn viz-btn-ghost" onClick={() => { setGraph({ directed: false, weighted: true, nodes: [], edges: [] }); loadStates([]); }}>Clear</button>
            </div>
          </div>

          <div className="viz-canvas" style={{ minHeight: 350 }}>
            <GraphView
              graph={displayGraph}
              activeNodes={activeNodes}
              activeEdges={activeEdges}
              selectedNode={selectedNode}
              onNodeClick={handleNodeClick}
              onCanvasClick={handleCanvasClick}
              distances={distances}
            />
          </div>

          <AnimationControls controls={controls} operationLabel={currentState?.operation}
            comparisons={currentState?.comparisons} complexity={currentState?.complexity} />
        </div>

        <div className="viz-sidebar">
          <AlgorithmCodePanel
            codeData={activeAlgorithm === 'dijkstra' ? graphDijkstraCodeData : graphBFSCodeData}
            currentOperation={currentState?.operation}
            highlightedLine={currentState?.pseudocodeLine}
            defaultLanguage="java"
            showLineNumbers={false}
          />

          <ExplanationPanel state={currentState} stepIndex={controls.currentStep} totalSteps={controls.totalSteps} />

          {/* Distance table for Dijkstra */}
          {distances && (
            <div className="viz-info-panel glass-panel">
              <h4 className="viz-info-title">Distance Table</h4>
              <div className="distance-table">
                {Object.entries(distances).map(([node, dist]) => (
                  <div key={node} className="distance-row">
                    <span className="distance-node font-mono">{node}</span>
                    <span className="distance-value font-mono">{dist === Infinity ? '∞' : dist}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ComplexityPanel complexity={GRAPH_COMPLEXITY} title="Graph Complexity" />

          <div className="viz-info-panel glass-panel">
            <h4 className="viz-info-title">Real-World Uses</h4>
            <ul className="viz-info-list">
              <li>Maps & navigation (Dijkstra)</li>
              <li>Social networks (BFS/DFS)</li>
              <li>Build systems (Topological Sort)</li>
              <li>Network routing (Bellman-Ford)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
