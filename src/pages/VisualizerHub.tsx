/* ============================================
   Visualizer Hub — Central Laboratory Directory
   Clean directory index of all 32 algorithms
   ============================================ */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import './VisualizerHub.css';

interface VisualizerItem {
  id: string;
  title: string;
  description: string;
  unit: string;
  path: string;
  complexity: string;
  highlight?: boolean;
}

const visualizers: VisualizerItem[] = [
  // Unit 1
  { id: 'dict', title: 'Dictionary ADT', description: 'Vector-based key-value store with linear and indexed lookup', unit: 'Dictionaries', path: '/learn/dictionary-adt', complexity: 'O(n)' },
  // Unit 2
  { id: 'hash', title: 'Hash Lab', description: 'Separate chaining, linear probing, quadratic probing & double hashing', unit: 'Hashing', path: '/learn/separate-chaining', complexity: 'O(1) avg' },
  // Unit 3
  { id: 'bst', title: 'Binary Search Tree', description: 'Ordered binary tree with insert, search, delete & tree traversals', unit: 'Trees', path: '/learn/bst', complexity: 'O(log n)' },
  { id: 'avl', title: 'AVL Tree', description: 'Height-balanced BST with self-balancing LL, RR, LR & RL rotations', unit: 'Trees', path: '/learn/avl', complexity: 'O(log n)', highlight: true },
  { id: 'rb', title: 'Red-Black Tree', description: 'Balanced BST with strict black-height invariant and recoloring', unit: 'Trees', path: '/learn/red-black', complexity: 'O(log n)' },
  { id: '23', title: '2-3 Tree', description: 'Multi-way balanced search tree with 2-nodes and 3-nodes', unit: 'Trees', path: '/learn/two-three-tree', complexity: 'O(log n)' },
  { id: 'btree', title: 'B-Tree', description: 'Disk-optimized balanced multi-way tree with configurable order M', unit: 'Trees', path: '/learn/b-tree', complexity: 'O(log n)' },
  { id: 'heap', title: 'Min-Heap & Priority Queue', description: 'Dual Tree & Array synchronized view with sift-up and sift-down', unit: 'Trees', path: '/learn/min-heap', complexity: 'O(log n)' },
  { id: 'splay', title: 'Splay Tree', description: 'Self-adjusting BST bringing recently accessed nodes to root via zig-zig and zig-zag', unit: 'Trees', path: '/learn/splay-tree', complexity: 'O(log n) amortized' },
  // Unit 4
  { id: 'graph', title: 'Graph Lab', description: 'Interactive graph canvas with BFS, Dijkstra & Topological Sort', unit: 'Graphs', path: '/learn/graph-basics', complexity: 'O(V + E)', highlight: true },
  // Unit 5
  { id: 'kmp', title: 'Pattern Matching (KMP)', description: 'Brute Force vs Knuth-Morris-Pratt with partial match failure table', unit: 'Text', path: '/learn/kmp', complexity: 'O(n + m)' },
  { id: 'trie', title: 'Standard Trie', description: 'Prefix tree for string search, auto-complete and lexical sorting', unit: 'Text', path: '/learn/standard-trie', complexity: 'O(m)' },
  { id: 'huffman', title: 'Huffman Coding', description: 'Greedy prefix code tree construction for lossless data compression', unit: 'Text', path: '/learn/huffman', complexity: 'O(n log n)' },
  { id: 'lcs', title: 'LCS (Dynamic Programming Matrix)', description: 'Longest Common Subsequence computed step-by-step in a 2D DP matrix', unit: 'Text', path: '/learn/lcs', complexity: 'O(m·n)', highlight: true },
  // Unit 6
  { id: 'dnc', title: 'Divide & Conquer (Merge Sort)', description: 'Recursive problem breakdown with visual split and merge phases', unit: 'Design', path: '/learn/divide-and-conquer', complexity: 'O(n log n)' },
  { id: 'greedy', title: 'Greedy Choice (Activity Selection)', description: 'Locally optimal choice strategy picking earliest finishing activities', unit: 'Design', path: '/learn/greedy', complexity: 'O(n log n)' },
  { id: 'dp', title: 'Dynamic Programming (Fibonacci & Matrix)', description: 'Overlapping subproblems solved with bottom-up tabulation', unit: 'Design', path: '/learn/dynamic-programming', complexity: 'O(n)' },
  { id: 'bt', title: 'Backtracking (N-Queens)', description: 'Systematic constraint satisfaction with recursive state tree pruning', unit: 'Design', path: '/learn/backtracking', complexity: 'O(n!)' },
  // Special
  { id: 'race', title: '⚡ Algorithm Race', description: 'Side-by-side empirical performance comparison on identical datasets', unit: 'Special', path: '/race', complexity: 'Multi-Alg', highlight: true },
];

export const VisualizerHub: React.FC = () => {
  const [filterUnit, setFilterUnit] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const units = ['All', 'Dictionaries', 'Hashing', 'Trees', 'Graphs', 'Text', 'Design', 'Special'];

  const filteredItems = useMemo(() => {
    return visualizers.filter(item => {
      const matchesUnit = filterUnit === 'All' || item.unit === filterUnit;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.unit.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesUnit && matchesSearch;
    });
  }, [filterUnit, searchQuery]);

  return (
    <div className="hub-page">
      {/* Header */}
      <div className="hub-header-block">
        <div className="hub-header-container">
          <div className="hub-kicker font-mono">LABORATORY DIRECTORY</div>
          <h1 className="hub-title">Interactive Algorithm Visualizers</h1>
          <p className="hub-subtitle">
            Every core data structure and algorithmic paradigm from the ADSA curriculum,
            rendered with interactive state manipulation, synchronized code, and complexity analysis.
          </p>

          {/* Search & Filter Bar */}
          <div className="hub-controls-row">
            <div className="hub-search-box">
              <Search size={15} className="hub-search-icon" />
              <input
                type="text"
                className="hub-search-input"
                placeholder="Filter by algorithm, data structure, or complexity (e.g., AVL, Dijkstra, O(log n))..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="hub-search-clear font-mono" onClick={() => setSearchQuery('')}>
                  CLEAR
                </button>
              )}
            </div>

            <div className="hub-unit-filters">
              {units.map(unit => (
                <button
                  key={unit}
                  className={`hub-filter-btn ${filterUnit === unit ? 'hub-filter-btn-active' : ''}`}
                  onClick={() => setFilterUnit(unit)}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Directory Content */}
      <div className="hub-container">
        <div className="hub-results-meta font-mono">
          <span>SHOWING {filteredItems.length} OF {visualizers.length} ALGORITHM WORKBENCHES</span>
        </div>

        <div className="hub-directory-table-wrapper">
          <table className="hub-directory-table">
            <thead>
              <tr>
                <th>ALGORITHM / DATA STRUCTURE</th>
                <th>CURRICULUM UNIT</th>
                <th>THEORETICAL BOUND</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} className="hub-directory-row">
                  <td className="hub-cell-main">
                    <Link to={item.path} className="hub-algo-link">
                      <span className="hub-algo-title">{item.title}</span>
                      {item.highlight && <span className="hub-algo-featured font-mono">CORE LAB</span>}
                    </Link>
                    <p className="hub-algo-desc">{item.description}</p>
                  </td>

                  <td className="hub-cell-unit">
                    <span className="hub-unit-pill font-mono">{item.unit}</span>
                  </td>

                  <td className="hub-cell-complexity">
                    <span className="hub-complexity-badge font-mono">{item.complexity}</span>
                  </td>

                  <td className="hub-cell-action">
                    <Link to={item.path} className="hub-launch-btn">
                      <span>Launch</span>
                      <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
