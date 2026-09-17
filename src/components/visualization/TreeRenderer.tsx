/* ============================================
   Tree Renderer — SVG-based tree visualization
   ============================================ */

import React from 'react';
import type { NodeState } from '../../types';
import type { BSTNode } from '../../algorithms/trees/BST';
import './TreeRenderer.css';

interface ActiveNodeInfo {
  id: string;
  state: NodeState;
}

interface Props {
  root: BSTNode | null;
  activeNodes?: ActiveNodeInfo[];
  width?: number;
  height?: number;
  nodeRadius?: number;
  showValues?: boolean;
  showBalanceFactor?: boolean;
  nodeColor?: (node: BSTNode) => string | undefined;
  renderNodeExtra?: (node: BSTNode) => React.ReactNode;
}

const STATE_COLORS: Record<NodeState, { fill: string; stroke: string; textColor: string }> = {
  normal: { fill: '#FFFFFF', stroke: '#25262B', textColor: '#14151A' },
  active: { fill: '#0B4FDF', stroke: '#083DB0', textColor: '#FFFFFF' },
  comparing: { fill: '#FEF3C7', stroke: '#D97706', textColor: '#92400E' },
  visited: { fill: '#F4F3EE', stroke: '#71717A', textColor: '#545763' },
  selected: { fill: '#0B4FDF', stroke: '#083DB0', textColor: '#FFFFFF' },
  inserted: { fill: '#ECFDF5', stroke: '#059669', textColor: '#065F46' },
  deleted: { fill: '#FEF2F2', stroke: '#DC2626', textColor: '#991B1B' },
  collision: { fill: '#FFF7ED', stroke: '#EA580C', textColor: '#9A3412' },
  error: { fill: '#FEF2F2', stroke: '#DC2626', textColor: '#991B1B' },
  success: { fill: '#059669', stroke: '#047857', textColor: '#FFFFFF' },
  highlight: { fill: '#FEF3C7', stroke: '#D97706', textColor: '#92400E' },
  frontier: { fill: '#E0F2FE', stroke: '#0284C7', textColor: '#075985' },
  relaxed: { fill: '#EEF2FF', stroke: '#4F46E5', textColor: '#3730A3' },
  match: { fill: '#ECFDF5', stroke: '#059669', textColor: '#065F46' },
  mismatch: { fill: '#FEF2F2', stroke: '#DC2626', textColor: '#991B1B' },
};

const TreeNodeComponent: React.FC<{
  node: BSTNode;
  activeNodes: ActiveNodeInfo[];
  nodeRadius: number;
  nodeColor?: (node: BSTNode) => string | undefined;
  renderNodeExtra?: (node: BSTNode) => React.ReactNode;
}> = ({ node, activeNodes, nodeRadius, nodeColor, renderNodeExtra }) => {
  const activeInfo = activeNodes.find(a => a.id === node.id);
  const state = activeInfo?.state || 'normal';
  const colors = STATE_COLORS[state];
  const customColor = nodeColor?.(node);

  return (
    <g className={`tree-node tree-node-${state}`}>
      {/* Node circle */}
      <circle
        cx={node.x}
        cy={node.y}
        r={nodeRadius}
        fill={customColor || colors.fill}
        stroke={colors.stroke}
        strokeWidth={state === 'active' || state === 'selected' ? 2.5 : 1.5}
        className="node-circle"
      />
      {/* Value text */}
      <text
        x={node.x}
        y={node.y}
        dy="0.35em"
        textAnchor="middle"
        fill={colors.textColor}
        fontSize={nodeRadius > 20 ? 13 : 11.5}
        fontFamily="'JetBrains Mono', monospace"
        fontWeight={600}
        className="node-text"
      >
        {node.value}
      </text>
      {renderNodeExtra?.(node)}
    </g>
  );
};

function renderEdges(node: BSTNode | null, activeNodes: ActiveNodeInfo[]): React.ReactNode[] {
  if (!node) return [];
  const edges: React.ReactNode[] = [];

  if (node.left) {
    const isActive = activeNodes.some(a => a.id === node.left!.id && a.state !== 'normal');
    edges.push(
      <line
        key={`edge-${node.id}-${node.left.id}`}
        x1={node.x}
        y1={node.y + 20}
        x2={node.left.x}
        y2={node.left.y - 20}
        stroke={isActive ? 'var(--accent-primary, #0B4FDF)' : 'var(--border-default, #DDD9CF)'}
        strokeWidth={isActive ? 2.5 : 1.5}
        className="tree-edge"
      />
    );
    edges.push(...renderEdges(node.left, activeNodes));
  }

  if (node.right) {
    const isActive = activeNodes.some(a => a.id === node.right!.id && a.state !== 'normal');
    edges.push(
      <line
        key={`edge-${node.id}-${node.right.id}`}
        x1={node.x}
        y1={node.y + 20}
        x2={node.right.x}
        y2={node.right.y - 20}
        stroke={isActive ? 'var(--accent-primary, #0B4FDF)' : 'var(--border-default, #DDD9CF)'}
        strokeWidth={isActive ? 2.5 : 1.5}
        className="tree-edge"
      />
    );
    edges.push(...renderEdges(node.right, activeNodes));
  }

  return edges;
}

function renderNodes(
  node: BSTNode | null,
  activeNodes: ActiveNodeInfo[],
  nodeRadius: number,
  nodeColor?: (node: BSTNode) => string | undefined,
  renderNodeExtra?: (node: BSTNode) => React.ReactNode
): React.ReactNode[] {
  if (!node) return [];
  return [
    ...renderNodes(node.left, activeNodes, nodeRadius, nodeColor, renderNodeExtra),
    ...renderNodes(node.right, activeNodes, nodeRadius, nodeColor, renderNodeExtra),
    <TreeNodeComponent
      key={node.id}
      node={node}
      activeNodes={activeNodes}
      nodeRadius={nodeRadius}
      nodeColor={nodeColor}
      renderNodeExtra={renderNodeExtra}
    />,
  ];
}

export const TreeRenderer: React.FC<Props> = ({
  root,
  activeNodes = [],
  width = 600,
  height = 400,
  nodeRadius = 20,
  nodeColor,
  renderNodeExtra,
}) => {
  if (!root) {
    return (
      <svg className="tree-renderer" viewBox={`0 0 ${width} ${height}`}>
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize={14}
          fontFamily="'Inter', sans-serif"
        >
          Empty tree — insert values to begin
        </text>
      </svg>
    );
  }

  return (
    <svg className="tree-renderer" viewBox={`0 0 ${width} ${height}`}>
      {/* Edges first (behind nodes) */}
      {renderEdges(root, activeNodes)}
      {/* Nodes on top */}
      {renderNodes(root, activeNodes, nodeRadius, nodeColor, renderNodeExtra)}
    </svg>
  );
};
