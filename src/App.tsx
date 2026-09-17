/* ============================================
   Main Application — Routing & Shell
   ============================================ */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';
import { TopNav } from './components/layout/TopNav';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { useTheme } from './hooks/useTheme';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { About } from './pages/About';
import { VisualizerHub } from './pages/VisualizerHub';
// Tree visualizers
import { BSTVisualizer } from './visualizers/trees/BSTVisualizer';
import { AVLVisualizer } from './visualizers/trees/AVLVisualizer';
import { SplayVisualizer } from './visualizers/trees/SplayVisualizer';
import { RedBlackVisualizer } from './visualizers/trees/RedBlackVisualizer';
import { BTreeVisualizer } from './visualizers/trees/BTreeVisualizer';
import { MinHeapVisualizer } from './visualizers/trees/MinHeapVisualizer';
// Hashing
import { HashLabVisualizer } from './visualizers/hashing/HashLabVisualizer';
// Graphs
import { GraphLabVisualizer } from './visualizers/graphs/GraphLabVisualizer';
// Text processing
import { TextVisualizer } from './visualizers/text/TextVisualizer';
import { HuffmanVisualizer } from './visualizers/text/HuffmanVisualizer';
import { LCSVisualizer } from './visualizers/text/LCSVisualizer';
import { TrieVisualizer } from './visualizers/text/TrieVisualizer';
// Dictionaries
import { DictionaryVisualizer } from './visualizers/dictionaries/DictionaryVisualizer';
// Design Techniques
import { DesignTechniqueVisualizer } from './visualizers/design/DesignTechniqueVisualizer';
// Special
import { AlgorithmRace } from './visualizers/special/AlgorithmRace';
import './App.css';

// Placeholder for topics that are info-only (no interactive visualizer)
const TopicPlaceholder: React.FC<{ id: string; title: string }> = ({ title }) => (
  <div style={{ padding: 'var(--space-8)', maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
    <span className="viz-badge">Info Topic</span>
    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, margin: '12px 0 8px', color: 'var(--text-primary)' }}>
      {title}
    </h1>
    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
      This topic is conceptual. Explore the interactive visualizers for hands-on learning.
    </p>
  </div>
);

// Map topic IDs to their components — EVERY topic from courseData is wired here
const topicComponents: Record<string, React.FC> = {
  // Unit 1: Dictionaries
  'dictionary-adt': DictionaryVisualizer,
  // Unit 2: Hashing
  'hash-functions': HashLabVisualizer,
  'separate-chaining': () => <HashLabVisualizer initialStrategy="separate-chaining" />,
  'linear-probing': () => <HashLabVisualizer initialStrategy="linear-probing" />,
  'quadratic-probing': () => <HashLabVisualizer initialStrategy="quadratic-probing" />,
  'double-hashing': () => <HashLabVisualizer initialStrategy="double-hashing" />,
  'rehashing': () => <HashLabVisualizer initialStrategy="separate-chaining" />,
  'extendible-hashing': () => <HashLabVisualizer initialStrategy="separate-chaining" />,
  // Unit 3: Trees
  'bst': BSTVisualizer,
  'avl': AVLVisualizer,
  'red-black': RedBlackVisualizer,
  'two-three-tree': () => <BTreeVisualizer initialOrder={3} />,
  'b-tree': () => <BTreeVisualizer initialOrder={3} />,
  'splay-tree': SplayVisualizer,
  'min-heap': MinHeapVisualizer,
  'heap': MinHeapVisualizer,
  // Unit 4: Graphs
  'graph-basics': GraphLabVisualizer,
  'topological-sort': GraphLabVisualizer,
  'dijkstra': GraphLabVisualizer,
  'bellman-ford': GraphLabVisualizer,
  // Unit 5: Text Processing
  'string-operations': () => <TextVisualizer initialAlgorithm="brute-force" />,
  'brute-force-matching': () => <TextVisualizer initialAlgorithm="brute-force" />,
  'boyer-moore': () => <TextVisualizer initialAlgorithm="brute-force" />,
  'kmp': () => <TextVisualizer initialAlgorithm="kmp" />,
  'standard-trie': TrieVisualizer,
  'compressed-trie': TrieVisualizer,
  'suffix-trie': TrieVisualizer,
  'huffman': HuffmanVisualizer,
  'lcs': LCSVisualizer,
  // Unit 6: Design Techniques
  'divide-and-conquer': () => <DesignTechniqueVisualizer technique="divide-and-conquer" />,
  'greedy': () => <DesignTechniqueVisualizer technique="greedy" />,
  'dynamic-programming': () => <DesignTechniqueVisualizer technique="dynamic-programming" />,
  'branch-and-bound': () => <DesignTechniqueVisualizer technique="backtracking" />,
  'backtracking': () => <DesignTechniqueVisualizer technique="backtracking" />,
};

const TopicRoute: React.FC<{ topicId: string }> = ({ topicId }) => {
  const Component = topicComponents[topicId];
  if (Component) return <Component />;
  return <TopicPlaceholder id={topicId} title={topicId} />;
};

const AppLayout: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Only show sidebar on learn/topic pages
  const showSidebar = location.pathname.startsWith('/learn');
  const isHomePage = location.pathname === '/';

  return (
    <div className="app-layout">
      <TopNav
        theme={theme}
        onThemeChange={setTheme}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <div className="app-body">
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main
          className={`app-content ${showSidebar ? 'app-content-with-sidebar' : ''} ${isHomePage ? 'app-content-full' : ''}`}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<Dashboard />} />
            <Route path="/learn/:topicId" element={<LearnTopicWrapper />} />
            <Route path="/visualizer" element={<VisualizerHub />} />
            <Route path="/race" element={<AlgorithmRace />} />
            <Route path="/practice" element={
              <TopicPlaceholder id="practice" title="Practice Mode" />
            } />
            <Route path="/labs" element={
              <TopicPlaceholder id="labs" title="Lab Exercises" />
            } />
            <Route path="/compare" element={
              <TopicPlaceholder id="compare" title="Compare Mode" />
            } />
            <Route path="/about" element={<About />} />
          </Routes>
          <Footer />
        </main>
      </div>
    </div>
  );
};

const LearnTopicWrapper: React.FC = () => {
  const { topicId = '' } = useParams<{ topicId: string }>();
  return <TopicRoute topicId={topicId} />;
};

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
