/* ============================================
   Home Page — Neo-Brutalist ADSA Visual Lab
   Bold, Editorial, Tactile, High-Contrast
   ============================================ */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Pause, RotateCcw, ArrowUpRight, Zap, Terminal } from 'lucide-react';
import { courseUnits } from '../data/courseData';
import './Home.css';

// ---- Tree Node Structure for Hero Visualizer ----
interface HeroTreeNode {
  id: number;
  val: number;
  left?: HeroTreeNode;
  right?: HeroTreeNode;
  x?: number;
  y?: number;
}

// Initial balanced 7-node BST for hero
function getInitialHeroTree(): HeroTreeNode {
  return {
    id: 1, val: 50,
    left: {
      id: 2, val: 30,
      left: { id: 4, val: 20 },
      right: { id: 5, val: 40 },
    },
    right: {
      id: 3, val: 70,
      left: { id: 6, val: 60 },
      right: { id: 7, val: 80 },
    },
  };
}

// Compute (x, y) coordinates for SVG rendering
function layoutHeroTree(node: HeroTreeNode | undefined, x: number, y: number, spread: number): void {
  if (!node) return;
  node.x = x;
  node.y = y;
  if (node.left) layoutHeroTree(node.left, x - spread, y + 68, spread * 0.52);
  if (node.right) layoutHeroTree(node.right, x + spread, y + 68, spread * 0.52);
}

// Collect all nodes into a flat list
function collectNodes(node?: HeroTreeNode): HeroTreeNode[] {
  if (!node) return [];
  return [node, ...collectNodes(node.left), ...collectNodes(node.right)];
}

// Collect edges
function collectEdges(node?: HeroTreeNode): { from: HeroTreeNode; to: HeroTreeNode }[] {
  if (!node) return [];
  const edges: { from: HeroTreeNode; to: HeroTreeNode }[] = [];
  if (node.left) {
    edges.push({ from: node, to: node.left });
    edges.push(...collectEdges(node.left));
  }
  if (node.right) {
    edges.push({ from: node, to: node.right });
    edges.push(...collectEdges(node.right));
  }
  return edges;
}

export const Home: React.FC = () => {
  // Tree state
  const [tree, setTree] = useState<HeroTreeNode>(getInitialHeroTree);
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [comparingNodeId, setComparingNodeId] = useState<number | null>(null);
  const [targetFoundId, setTargetFoundId] = useState<number | null>(null);
  const [liveExplanation, setLiveExplanation] = useState('Tree initialized. Select an operation or watch automated execution.');
  const [activeOperation, setActiveOperation] = useState('IDLE');
  const [comparisons, setComparisons] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const timerRef = useRef<number | null>(null);

  // Compute layout whenever tree changes
  const root = tree;
  layoutHeroTree(root, 340, 52, 140);
  const nodes = collectNodes(root);
  const edges = collectEdges(root);

  // Clear animation timers
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Algorithm 1: Search for a value step-by-step
  const performSearch = useCallback((targetVal: number) => {
    clearTimers();
    setActiveOperation(`SEARCH(${targetVal})`);
    setComparisons(0);
    setTargetFoundId(null);

    const steps: { current: HeroTreeNode; desc: string; isMatch: boolean }[] = [];
    let curr: HeroTreeNode | undefined = tree;
    let comps = 0;

    while (curr) {
      comps++;
      if (curr.val === targetVal) {
        steps.push({
          current: curr,
          desc: `COMPARE ${targetVal} == ${curr.val} → TARGET IDENTIFIED in ${comps} comparison(s). O(log n) efficiency confirmed.`,
          isMatch: true,
        });
        break;
      } else if (targetVal < curr.val) {
        steps.push({
          current: curr,
          desc: `COMPARE ${targetVal} < ${curr.val} → Navigating LEFT subtree branch.`,
          isMatch: false,
        });
        curr = curr.left;
      } else {
        steps.push({
          current: curr,
          desc: `COMPARE ${targetVal} > ${curr.val} → Navigating RIGHT subtree branch.`,
          isMatch: false,
        });
        curr = curr.right;
      }
    }

    // Play through steps
    let stepIdx = 0;
    const playStep = () => {
      if (stepIdx < steps.length) {
        const s = steps[stepIdx];
        setComparingNodeId(s.current.id);
        setActiveNodeId(s.current.id);
        setComparisons(stepIdx + 1);
        setLiveExplanation(s.desc);

        if (s.isMatch) {
          setTargetFoundId(s.current.id);
          setComparingNodeId(null);
        }

        stepIdx++;
        timerRef.current = window.setTimeout(playStep, 950);
      } else {
        timerRef.current = window.setTimeout(() => {
          setActiveNodeId(null);
          setComparingNodeId(null);
        }, 1200);
      }
    };
    playStep();
  }, [tree, clearTimers]);

  // Algorithm 2: Inorder traversal
  const performInorder = useCallback(() => {
    clearTimers();
    setActiveOperation('INORDER_TRAVERSAL()');
    setComparisons(0);
    setTargetFoundId(null);

    const order: HeroTreeNode[] = [];
    const traverse = (node?: HeroTreeNode) => {
      if (!node) return;
      traverse(node.left);
      order.push(node);
      traverse(node.right);
    };
    traverse(tree);

    let idx = 0;
    const playNext = () => {
      if (idx < order.length) {
        const n = order[idx];
        setActiveNodeId(n.id);
        setComparingNodeId(null);
        setTargetFoundId(n.id);
        setComparisons(idx + 1);
        setLiveExplanation(`VISIT [${n.val}] in sorted sequence (Left Subtree → Root → Right Subtree).`);
        idx++;
        timerRef.current = window.setTimeout(playNext, 650);
      } else {
        setLiveExplanation(`Inorder traversal complete. Monotonically sorted order: ${order.map(n => n.val).join(' → ')}`);
        timerRef.current = window.setTimeout(() => {
          setActiveNodeId(null);
          setTargetFoundId(null);
        }, 1500);
      }
    };
    playNext();
  }, [tree, clearTimers]);

  // Algorithm 3: Reset tree to default balanced state
  const handleReset = useCallback(() => {
    clearTimers();
    setTree(getInitialHeroTree());
    setActiveNodeId(null);
    setComparingNodeId(null);
    setTargetFoundId(null);
    setComparisons(0);
    setActiveOperation('RESET');
    setLiveExplanation('Tree restored to canonical 7-node balanced BST (Height: 3, Root: 50).');
  }, [clearTimers]);

  // Continuous auto-demonstration loop
  useEffect(() => {
    if (!isAutoPlaying) {
      clearTimers();
      return;
    }

    const demoActions = [
      () => performSearch(40),
      () => performSearch(70),
      () => performSearch(20),
      () => performInorder(),
      () => performSearch(60),
    ];

    let actionIdx = 0;
    const interval = window.setInterval(() => {
      if (actionIdx >= demoActions.length) {
        actionIdx = 0;
      }
      demoActions[actionIdx]();
      actionIdx++;
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimers();
    };
  }, [isAutoPlaying, performSearch, performInorder, clearTimers]);

  return (
    <div className="home-page">

      {/* ========================================================
          1. HERO SECTION: Typographic Power + Live Interactive Lab
          ======================================================== */}
      <section className="hero-section">
        <div className="hero-container">

          {/* Top Graphic Sticker Bar */}
          <div className="hero-sticker-bar">
            <span className="sticker-badge sticker-badge-yellow hero-sticker-main">
              <Terminal size={12} />
              FIG. 01 // INTERACTIVE CS LABORATORY
            </span>
            <span className="sticker-badge sticker-badge-lime hero-sticker-alt">
              100% LIVE EXECUTION
            </span>
            <span className="sticker-badge sticker-badge-pink hero-sticker-meta font-mono">
              32 LABS • O(1) TO O(N!)
            </span>
          </div>

          {/* Main Typographic Statement */}
          <div className="hero-headline-block">
            <h1 className="hero-headline">
              MASTER THE<br />
              <span className="hero-headline-highlight">MACHINES.</span>
            </h1>
            <p className="hero-subheadline">
              Stop memorizing algorithms from static slides. Step inside an interactive Neo-Brutalist
              computer science lab where data structures physically rotate, compare, and allocate in memory.
            </p>
          </div>

          {/* CTA Button Strip */}
          <div className="hero-action-strip">
            <Link to="/visualizer" className="brutal-btn brutal-btn-blue hero-main-btn">
              <span>EXPLORE ALL 32 VISUALIZERS</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/race" className="brutal-btn brutal-btn-lime hero-race-btn">
              <Zap size={16} />
              <span>ALGORITHM RACE ⚡</span>
            </Link>
            <Link to="/learn" className="brutal-btn brutal-btn-white hero-syllabus-btn">
              <span>COURSE SYLLABUS</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* ========================================================
              HERO CENTERPIECE: Heavy Framed Interactive Workbench
              ======================================================== */}
          <div className="hero-workbench-frame">
            {/* Workbench Title Header */}
            <div className="workbench-frame-header">
              <div className="workbench-dots">
                <span className="window-dot dot-yellow" />
                <span className="window-dot dot-lime" />
                <span className="window-dot dot-pink" />
              </div>
              <div className="workbench-frame-title font-mono">
                LAB_WORKBENCH // BINARY_SEARCH_TREE.STEP_TRACE
              </div>
              <div className="workbench-badges">
                <span className="workbench-stat-pill pill-yellow font-mono">
                  OP: <strong>{activeOperation}</strong>
                </span>
                <span className="workbench-stat-pill pill-lime font-mono">
                  COMPS: <strong>{comparisons}</strong>
                </span>
                <span className="workbench-stat-pill pill-pink font-mono">
                  TIME: <strong>O(log n)</strong>
                </span>
              </div>
            </div>

            {/* SVG Interactive Canvas */}
            <div className="workbench-canvas-area viz-canvas">
              <svg className="hero-tree-svg" viewBox="0 0 680 300" preserveAspectRatio="xMidYMid meet">
                {/* Connecting Edges */}
                {edges.map((e, i) => {
                  const isEdgeActive =
                    (activeNodeId === e.to.id && comparingNodeId === e.to.id) ||
                    (targetFoundId === e.to.id);
                  return (
                    <line
                      key={i}
                      x1={e.from.x}
                      y1={e.from.y}
                      x2={e.to.x}
                      y2={e.to.y}
                      className={isEdgeActive ? 'hero-edge-active' : 'hero-edge'}
                    />
                  );
                })}

                {/* Tree Nodes */}
                {nodes.map(n => {
                  const isActive = activeNodeId === n.id;
                  const isComparing = comparingNodeId === n.id;
                  const isFound = targetFoundId === n.id;

                  let nodeFill = 'var(--node-bg)';
                  let nodeStroke = 'var(--node-border)';
                  let textFill = 'var(--node-text)';

                  if (isFound) {
                    nodeFill = 'var(--brutal-lime)';
                    textFill = '#000000';
                  } else if (isComparing) {
                    nodeFill = 'var(--brutal-yellow)';
                    textFill = '#000000';
                  } else if (isActive) {
                    nodeFill = 'var(--brutal-blue)';
                    textFill = '#FFFFFF';
                  }

                  return (
                    <g
                      key={n.id}
                      className="hero-node-group"
                      onClick={() => performSearch(n.val)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Drop shadow circle for node */}
                      <circle cx={(n.x || 0) + 3} cy={(n.y || 0) + 3} r="22" fill="var(--node-shadow)" />
                      {/* Foreground node circle */}
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r="22"
                        fill={nodeFill}
                        stroke={nodeStroke}
                        strokeWidth="2.5"
                      />
                      <text
                        x={n.x}
                        y={(n.y || 0) + 5}
                        textAnchor="middle"
                        fill={textFill}
                        fontWeight="800"
                        fontSize="14"
                        fontFamily="var(--font-mono)"
                      >
                        {n.val}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Workbench Control Console */}
            <div className="workbench-console">
              <div className="console-explanation">
                <span className="console-prompt font-mono">▶</span>
                <span className="console-text font-mono">{liveExplanation}</span>
              </div>

              <div className="console-controls">
                <button
                  className="brutal-btn console-btn console-btn-search"
                  onClick={() => performSearch(40)}
                  title="Search for key 40 in BST"
                >
                  Search(40)
                </button>
                <button
                  className="brutal-btn console-btn console-btn-search"
                  onClick={() => performSearch(70)}
                  title="Search for key 70 in BST"
                >
                  Search(70)
                </button>
                <button
                  className="brutal-btn brutal-btn-lime console-btn"
                  onClick={performInorder}
                  title="Run Inorder Traversal"
                >
                  Inorder
                </button>
                <button
                  className="brutal-btn console-btn console-btn-reset"
                  onClick={handleReset}
                  title="Reset Tree State"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  className={`brutal-btn console-btn ${isAutoPlaying ? 'brutal-btn-pink' : 'brutal-btn-white'}`}
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  title={isAutoPlaying ? 'Pause Automated Demo' : 'Resume Automated Demo'}
                >
                  {isAutoPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isAutoPlaying ? 'Auto' : 'Paused'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          2. VIBRANT CORAL EDITORIAL SECTION (Dorksense Reference)
          ======================================================== */}
      <section className="editorial-manifesto-section">
        <div className="manifesto-container">
          <div className="manifesto-badge-row">
            <span className="sticker-badge sticker-badge-white">CORE METHODOLOGY</span>
          </div>

          <h2 className="manifesto-headline">
            Theory is cheap.<br />
            Watch the memory move.
          </h2>

          <p className="manifesto-subcopy font-mono">
            OUR PLATFORM RUNS ON DETERMINISTIC STATE TRANSITIONS, SYNCHRONIZED CODE POINTERS, AND ZERO FAKE ANIMATIONS.
          </p>

          {/* 3 Asymmetric Numbered Feature Cards (Dorksense style: 01, 02, 03) */}
          <div className="manifesto-cards-grid">
            <div className="brutal-card manifesto-card card-cream">
              <div className="card-top-row">
                <span className="card-num font-mono">01</span>
                <span className="card-glyph font-mono">↗</span>
              </div>
              <h3 className="card-title">Deterministic Step Engine</h3>
              <p className="card-desc">
                Scrub forward and backward through memory reallocations. Step into recursive stack frames,
                inspect pointer swaps, and witness AVL/Red-Black tree rotations exactly as they occur in RAM.
              </p>
            </div>

            <div className="brutal-card manifesto-card card-lime">
              <div className="card-top-row">
                <span className="card-num font-mono">02</span>
                <span className="card-glyph font-mono">↗</span>
              </div>
              <h3 className="card-title">Synchronized Source Logic</h3>
              <p className="card-desc">
                Watch verified Java, Python, and C++ source code execute line-by-line in lockstep with visual
                data structure states. Understand how each line modifies pointers, weights, and memory addresses.
              </p>
            </div>

            <div className="brutal-card manifesto-card card-pink">
              <div className="card-top-row">
                <span className="card-num font-mono">03</span>
                <span className="card-glyph font-mono">↗</span>
              </div>
              <h3 className="card-title">Empirical Complexity Bounds</h3>
              <p className="card-desc">
                Never memorize Big-O blindly again. Watch live operation meters tally exact comparisons,
                recursion depth, and space overhead to prove theoretical asymptotic bounds on real input sizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. DATA STRUCTURES AS THE VISUAL LANGUAGE
          ======================================================== */}
      <section className="ds-showcase-section">
        <div className="showcase-container">
          <div className="showcase-header">
            <span className="sticker-badge sticker-badge-yellow">VISUAL TAXONOMY</span>
            <h2 className="showcase-headline">Data Structures Are Physical Architecture</h2>
            <p className="showcase-subtitle">
              Every data structure embodies an engineering trade-off between contiguous memory, pointer overhead,
              and branching factor. Explore them through their physical geometries.
            </p>
          </div>

          {/* Asymmetric Showcase Grid */}
          <div className="ds-asymmetric-grid">

            {/* Card 1: Trees & Hierarchies (Wide Top Card) */}
            <div className="brutal-card ds-card ds-card-trees">
              <div className="ds-card-badge-row">
                <span className="sticker-badge sticker-badge-lime">UNIT 03 // HIERARCHIES</span>
                <span className="ds-complexity-tag font-mono">O(log n) SEARCH & INSERT</span>
              </div>
              <div className="ds-card-body">
                <div className="ds-card-text">
                  <h3 className="ds-card-title">Self-Balancing Tree Systems</h3>
                  <p className="ds-card-description">
                    Master BSTs, AVL double rotations, Red-Black color flips, Splay amortized splaying,
                    and multi-way B-Trees used in production database storage engines.
                  </p>
                  <div className="ds-card-chips">
                    <Link to="/learn/avl" className="ds-chip font-mono">AVL Rotations</Link>
                    <Link to="/learn/red-black" className="ds-chip font-mono">Red-Black</Link>
                    <Link to="/learn/b-tree" className="ds-chip font-mono">B-Trees</Link>
                    <Link to="/learn/splay-tree" className="ds-chip font-mono">Splay Trees</Link>
                  </div>
                </div>
                {/* Physical ASCII/SVG Visual Representation */}
                <div className="ds-visual-box ds-visual-tree">
                  <div className="ascii-tree font-mono">
                    <div className="tree-row"><span>[50]</span></div>
                    <div className="tree-row-branches"><span>/&nbsp;&nbsp;&nbsp;&nbsp;\</span></div>
                    <div className="tree-row"><span>[30]</span><span>[70]</span></div>
                    <div className="tree-row-branches"><span>/&nbsp;&nbsp;\&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;\</span></div>
                    <div className="tree-row"><span>[20]</span><span>[40]</span><span>[60]</span><span>[80]</span></div>
                  </div>
                  <span className="ds-visual-caption font-mono">CANONICAL BALANCED HEIGHT: 3</span>
                </div>
              </div>
            </div>

            {/* Card 2: Hashing & Memory Buckets (Left Asymmetric) */}
            <div className="brutal-card ds-card ds-card-hash">
              <div className="ds-card-badge-row">
                <span className="sticker-badge sticker-badge-yellow">UNIT 02 // HASHING</span>
                <span className="ds-complexity-tag font-mono">O(1) AVERAGE LOOKUP</span>
              </div>
              <h3 className="ds-card-title">Hash Tables & Collision Resolution</h3>
              <p className="ds-card-description">
                Inspect load factors, polynomial hash functions, separate chaining buckets,
                linear/quadratic probing cascades, and dynamic directory doubling in extendible hashing.
              </p>
              {/* Physical Memory Slots Demonstration */}
              <div className="ds-hash-slots font-mono">
                <div className="hash-slot slot-filled">
                  <span className="slot-idx">00</span>
                  <span className="slot-val">"alice" → #92</span>
                </div>
                <div className="hash-slot slot-collision">
                  <span className="slot-idx">01</span>
                  <span className="slot-val">COLLISION! [x2]</span>
                </div>
                <div className="hash-slot slot-empty">
                  <span className="slot-idx">02</span>
                  <span className="slot-val">[NULL]</span>
                </div>
                <div className="hash-slot slot-filled">
                  <span className="slot-idx">03</span>
                  <span className="slot-val">"bob" → #44</span>
                </div>
              </div>
              <Link to="/learn/separate-chaining" className="ds-card-link font-mono">
                <span>LAUNCH HASH LAB</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Card 3: Graph Theory & Shortest Path (Right Asymmetric) */}
            <div className="brutal-card ds-card ds-card-graphs">
              <div className="ds-card-badge-row">
                <span className="sticker-badge sticker-badge-pink">UNIT 04 // NETWORKS</span>
                <span className="ds-complexity-tag font-mono">O(V + E log V) DIJKSTRA</span>
              </div>
              <h3 className="ds-card-title">Graph Traversal & Optimization</h3>
              <p className="ds-card-description">
                Construct custom weighted directed graphs. Run Dijkstra with min-heap priority queues,
                detect negative cycles with Bellman-Ford, and compute topological dependency orders.
              </p>
              {/* Graph ASCII Diagram */}
              <div className="ds-graph-network font-mono">
                <div className="graph-node-row">
                  <span className="g-node g-node-active">(A)</span>
                  <span className="g-edge">──[4]──▶</span>
                  <span className="g-node">(B)</span>
                  <span className="g-edge">──[2]──▶</span>
                  <span className="g-node g-node-target">(C)</span>
                </div>
                <div className="graph-subtext font-mono">
                  <span>SHORTEST PATH RELAXED: [A → B → C] = 6</span>
                </div>
              </div>
              <Link to="/learn/dijkstra" className="ds-card-link font-mono">
                <span>LAUNCH GRAPH LAB</span>
                <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          4. COMPLETE 6-UNIT SYLLABUS LEDGER
          ======================================================== */}
      <section className="curriculum-ledger-section">
        <div className="ledger-container">
          <div className="ledger-header-row">
            <div>
              <span className="sticker-badge sticker-badge-lime">CURRICULUM SYLLABUS</span>
              <h2 className="ledger-headline">Complete 6-Unit Academic Ledger</h2>
              <p className="ledger-subtitle">
                A rigorous, structured course sequence from foundational dictionaries to advanced NP-complete approximations.
              </p>
            </div>
            <Link to="/learn" className="brutal-btn brutal-btn-black font-mono">
              <span>EXPLORE FULL DOSSIER</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Neo-Brutalist Ledger Table */}
          <div className="ledger-table-box brutal-card">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th className="font-mono">UNIT</th>
                  <th>TITLE</th>
                  <th>CORE TOPICS & ALGORITHMS</th>
                  <th className="font-mono">HOURS</th>
                  <th>DIFFICULTY</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {courseUnits.map(unit => {
                  const unitNum = unit.number < 10 ? `0${unit.number}` : `${unit.number}`;
                  return (
                    <tr key={unit.id} className="ledger-row">
                      <td className="ledger-unit-num font-mono">
                        <span className="unit-stamp">{unitNum}</span>
                      </td>
                      <td className="ledger-unit-title">
                        <Link to="/learn" className="unit-title-link">
                          {unit.title}
                        </Link>
                      </td>
                      <td className="ledger-topics-cell">
                        <div className="ledger-tag-cluster">
                          {unit.topics.slice(0, 4).map(t => (
                            <span key={t.id} className="ledger-topic-tag font-mono">{t.title}</span>
                          ))}
                          {unit.topics.length > 4 && (
                            <span className="ledger-topic-tag tag-more font-mono">+{unit.topics.length - 4} more</span>
                          )}
                        </div>
                      </td>
                      <td className="ledger-hours font-mono">~{unit.estimatedHours}h</td>
                      <td>
                        <span className={`diff-sticker diff-${unit.difficulty} font-mono`}>
                          {unit.difficulty.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <Link to="/learn" className="brutal-btn brutal-btn-white ledger-inspect-btn">
                          <span>INSPECT</span>
                          <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. DIRECT JUMP LAUNCHPAD
          ======================================================== */}
      <section className="launchpad-section">
        <div className="launchpad-container">
          <div className="brutal-card launchpad-banner">
            <div className="launchpad-content">
              <span className="sticker-badge sticker-badge-yellow">INSTANT ACCESS</span>
              <h2 className="launchpad-headline">Zero Setup. Jump Directly into a Visual Lab.</h2>
              <p className="launchpad-lead">
                Every algorithm is an independent, sandbox-ready simulation with step controls, speed modulation, and synchronized code.
              </p>
              <div className="launchpad-chips-strip">
                <Link to="/learn/bst" className="brutal-btn brutal-btn-white launch-chip">Binary Search Tree</Link>
                <Link to="/learn/avl" className="brutal-btn brutal-btn-lime launch-chip">AVL Tree</Link>
                <Link to="/learn/red-black" className="brutal-btn brutal-btn-pink launch-chip">Red-Black Tree</Link>
                <Link to="/learn/separate-chaining" className="brutal-btn brutal-btn-yellow launch-chip">Hash Lab</Link>
                <Link to="/learn/dijkstra" className="brutal-btn brutal-btn-blue launch-chip">Dijkstra Shortest Path</Link>
                <Link to="/learn/kmp" className="brutal-btn brutal-btn-white launch-chip">KMP Matching</Link>
                <Link to="/learn/trie" className="brutal-btn brutal-btn-white launch-chip">Trie Structures</Link>
                <Link to="/learn/lcs" className="brutal-btn brutal-btn-white launch-chip">LCS Matrix</Link>
                <Link to="/race" className="brutal-btn brutal-btn-coral launch-chip launch-race">⚡ ALGORITHM RACE</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
