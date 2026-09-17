/* ============================================
   BST Visualizer — Interactive BST playground
   ============================================ */

import React, { useState, useCallback } from 'react';
import { TreeRenderer } from '../../components/visualization/TreeRenderer';
import { AnimationControls } from '../../components/visualization/AnimationControls';
import { ExplanationPanel } from '../../components/visualization/ExplanationPanel';
import { AlgorithmCodePanel } from '../../components/visualization/AlgorithmCodePanel';
import { ComplexityPanel } from '../../components/visualization/ComplexityPanel';
import { TheorySection } from '../../components/visualization/TheorySection';
import { useStateEngine } from '../../hooks/useStateEngine';
import { bstCodeData } from '../../data/algorithmCodeData';
import {
  bstInsert,
  bstSearch,
  bstDelete,
  bstInorder,
  treeHeight,
  getAllNodes,
} from '../../algorithms/trees/BST';
import type { BSTNode } from '../../algorithms/trees/BST';
import type { ComplexityInfo } from '../../types';
import './BSTVisualizer.css';

const BST_COMPLEXITY: ComplexityInfo = {
  time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
  space: 'O(n)',
};

export const BSTVisualizer: React.FC = () => {
  const [root, setRoot] = useState<BSTNode | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [bulkInput, setBulkInput] = useState('50, 30, 70, 20, 40, 60, 80');
  const [, setActiveOperation] = useState<'insert' | 'search' | 'delete'>('insert');
  const { currentState, controls, loadStates } = useStateEngine();

  const handleInsert = useCallback(() => {
    const val = parseInt(inputValue.trim());
    if (isNaN(val)) return;
    const { root: newRoot, states } = bstInsert(root, val);
    setRoot(newRoot);
    loadStates(states);
    setActiveOperation('insert');
    setInputValue('');
  }, [root, inputValue, loadStates]);

  const handleSearch = useCallback(() => {
    const val = parseInt(inputValue.trim());
    if (isNaN(val)) return;
    const { states } = bstSearch(root, val);
    loadStates(states);
    setActiveOperation('search');
  }, [root, inputValue, loadStates]);

  const handleDelete = useCallback(() => {
    const val = parseInt(inputValue.trim());
    if (isNaN(val)) return;
    const { root: newRoot, states } = bstDelete(root, val);
    setRoot(newRoot);
    loadStates(states);
    setActiveOperation('delete');
    setInputValue('');
  }, [root, inputValue, loadStates]);

  const handleBulkInsert = useCallback(() => {
    const values = bulkInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (values.length === 0) return;
    let currentRoot: BSTNode | null = null;
    const allStates: any[] = [];
    for (const v of values) {
      const { root: newRoot, states } = bstInsert(currentRoot, v);
      currentRoot = newRoot;
      allStates.push(...states);
    }
    setRoot(currentRoot);
    loadStates(allStates);
    setActiveOperation('insert');
  }, [bulkInput, loadStates]);

  const handleTraversal = useCallback(() => {
    if (!root) return;
    const states = bstInorder(root);
    loadStates(states);
  }, [root, loadStates]);

  const handleRandom = useCallback(() => {
    const count = 7 + Math.floor(Math.random() * 5);
    const values = new Set<number>();
    while (values.size < count) {
      values.add(Math.floor(Math.random() * 99) + 1);
    }
    const arr = Array.from(values);
    setBulkInput(arr.join(', '));
    let currentRoot: BSTNode | null = null;
    const allStates: any[] = [];
    for (const v of arr) {
      const { root: newRoot, states } = bstInsert(currentRoot, v);
      currentRoot = newRoot;
      allStates.push(...states);
    }
    setRoot(currentRoot);
    loadStates(allStates);
    setActiveOperation('insert');
  }, [loadStates]);

  const handleReset = useCallback(() => {
    setRoot(null);
    loadStates([]);
    setInputValue('');
  }, [loadStates]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInsert();
    }
  };

  // Get current active nodes from state for rendering
  const activeNodes = currentState?.activeNodes || [];
  const treeToRender = currentState?.dataStructureState || root;

  const nodeCount = root ? getAllNodes(root).length : 0;
  const height = root ? treeHeight(root) : 0;

  return (
    <div className="bst-visualizer">
      {/* Theory Section */}
      <TheorySection topicId="bst" />

      {/* Concept header */}
      <div className="viz-header">
        <div className="viz-header-info">
          <span className="viz-badge">Unit 3 — Trees</span>
          <h1 className="viz-title">Binary Search Tree</h1>
          <p className="viz-desc">
            A binary search tree maintains sorted order: left children are smaller, right children are larger.
            Insert, search, and delete values to see the BST in action.
          </p>
        </div>
        <div className="viz-stats">
          <div className="viz-stat">
            <span className="viz-stat-label">Nodes</span>
            <span className="viz-stat-value font-mono">{nodeCount}</span>
          </div>
          <div className="viz-stat">
            <span className="viz-stat-label">Height</span>
            <span className="viz-stat-value font-mono">{height}</span>
          </div>
        </div>
      </div>

      <div className="viz-layout">
        {/* Main canvas */}
        <div className="viz-main">
          {/* Controls bar */}
          <div className="viz-controls-bar">
            <div className="viz-input-group">
              <input
                type="number"
                className="viz-input"
                placeholder="Enter value..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="viz-btn viz-btn-insert" onClick={handleInsert}>Insert</button>
              <button className="viz-btn viz-btn-search" onClick={handleSearch}>Search</button>
              <button className="viz-btn viz-btn-delete" onClick={handleDelete}>Delete</button>
            </div>
            <div className="viz-input-group">
              <button className="viz-btn viz-btn-secondary" onClick={handleTraversal}>Inorder</button>
              <button className="viz-btn viz-btn-secondary" onClick={handleRandom}>Random</button>
              <button className="viz-btn viz-btn-ghost" onClick={handleReset}>Reset</button>
            </div>
          </div>

          {/* Bulk insert */}
          <div className="viz-bulk-bar">
            <input
              type="text"
              className="viz-input viz-input-wide"
              placeholder="e.g., 50, 30, 70, 20, 40, 60, 80"
              value={bulkInput}
              onChange={e => setBulkInput(e.target.value)}
            />
            <button className="viz-btn viz-btn-insert" onClick={handleBulkInsert}>Build Tree</button>
          </div>

          {/* Visualization canvas */}
          <div className="viz-canvas">
            <TreeRenderer
              root={treeToRender}
              activeNodes={activeNodes}
              width={600}
              height={Math.max(350, height * 80 + 80)}
            />
          </div>

          {/* Animation controls */}
          <AnimationControls
            controls={controls}
            operationLabel={currentState?.operation}
            comparisons={currentState?.comparisons}
            assignments={currentState?.assignments}
            complexity={currentState?.complexity}
          />
        </div>

        {/* Side panel */}
        <div className="viz-sidebar">
          <ExplanationPanel
            state={currentState}
            stepIndex={controls.currentStep}
            totalSteps={controls.totalSteps}
          />

          <AlgorithmCodePanel
            codeData={bstCodeData}
            currentOperation={currentState?.operation}
            highlightedLine={currentState?.pseudocodeLine}
            defaultLanguage="java"
            showLineNumbers={false}
          />

          <ComplexityPanel complexity={BST_COMPLEXITY} title="BST Complexity" />

          {/* Why BST? */}
          <div className="viz-info-panel glass-panel">
            <h4 className="viz-info-title">Why BST?</h4>
            <p className="viz-info-text">
              BSTs provide efficient searching, insertion, and deletion with O(log n) average case.
              The sorted property enables fast lookups — much better than O(n) linear search in arrays.
            </p>
            <h4 className="viz-info-title" style={{ marginTop: 'var(--space-3)' }}>Real-World Uses</h4>
            <ul className="viz-info-list">
              <li>Database indexing</li>
              <li>File system organization</li>
              <li>Symbol tables in compilers</li>
              <li>Priority queues (with augmentation)</li>
            </ul>
            <h4 className="viz-info-title" style={{ marginTop: 'var(--space-3)' }}>Common Mistakes</h4>
            <ul className="viz-info-list">
              <li>Forgetting BST can degrade to O(n) with sorted input</li>
              <li>Confusing inorder successor with predecessor in deletion</li>
              <li>Not handling all 3 delete cases (leaf, one child, two children)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
