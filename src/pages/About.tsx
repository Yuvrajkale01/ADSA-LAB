/* ============================================
   About Page — Project information
   ============================================ */

import React from 'react';
import { courseOutcomes } from '../data/courseData';
import './About.css';

export const About: React.FC = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <span className="viz-badge">About</span>
        <h1 className="about-title">ADSA Visual Lab</h1>
        <p className="about-subtitle">
          An interactive visual learning platform for Advanced Data Structures and Algorithms.
        </p>
      </div>

      <div className="about-grid">
        <div className="about-card glass-panel">
          <h2 className="about-card-title">Problem Statement</h2>
          <p className="about-card-text">
            Traditional ADSA courses rely heavily on static textbooks and lecture slides, making it difficult
            for students to truly understand how complex data structures behave internally. Students memorize
            algorithms without developing deep intuition for why they work.
          </p>
        </div>

        <div className="about-card glass-panel">
          <h2 className="about-card-title">Motivation</h2>
          <p className="about-card-text">
            Visualization dramatically improves comprehension of abstract concepts. By allowing students
            to interact with data structures directly — inserting, deleting, searching, and watching every
            internal state change — we transform passive learning into active exploration.
          </p>
        </div>

        <div className="about-card glass-panel">
          <h2 className="about-card-title">Objectives</h2>
          <ul className="about-list">
            <li>Provide interactive visualizations for all major ADSA course topics</li>
            <li>Enable step-by-step algorithm execution with full state visibility</li>
            <li>Allow direct manipulation of data structures with immediate feedback</li>
            <li>Support comparison between different algorithms and data structures</li>
            <li>Include practice exercises aligned with university lab requirements</li>
            <li>Build deep understanding through visual, interactive learning</li>
          </ul>
        </div>

        <div className="about-card glass-panel">
          <h2 className="about-card-title">Technologies</h2>
          <div className="about-tech-grid">
            {[
              { name: 'React', desc: 'Component-based UI' },
              { name: 'TypeScript', desc: 'Type-safe development' },
              { name: 'Vite', desc: 'Fast build tooling' },
              { name: 'SVG', desc: 'Crisp data structure rendering' },
              { name: 'CSS Custom Properties', desc: 'Design system' },
              { name: 'LocalStorage', desc: 'Progress tracking' },
            ].map(t => (
              <div key={t.name} className="about-tech">
                <span className="about-tech-name">{t.name}</span>
                <span className="about-tech-desc">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="about-card glass-panel">
          <h2 className="about-card-title">Course Outcomes</h2>
          <div className="about-co-list">
            {Object.entries(courseOutcomes).map(([co, desc]) => (
              <div key={co} className="about-co-item">
                <span className="about-co-badge">{co}</span>
                <p className="about-co-text">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="about-card glass-panel">
          <h2 className="about-card-title">Major Features</h2>
          <ul className="about-list">
            <li>32+ interactive topic visualizers across 6 units</li>
            <li>Step-by-step execution with play, pause, and speed control</li>
            <li>Hash Lab — explore 4 collision strategies side by side</li>
            <li>Tree Lab — BST, AVL, Red-Black, 2-3, B-Tree, Splay</li>
            <li>Graph Lab — BFS, DFS, Dijkstra, Bellman-Ford, Topological Sort</li>
            <li>Text Processing — Brute Force, KMP, Boyer-Moore, Tries, Huffman, LCS</li>
            <li>Algorithm Race — compare algorithms on the same input</li>
            <li>Predict Mode — test understanding before seeing the answer</li>
            <li>Practice mode with self-check questions</li>
            <li>10 lab modules aligned with course policy</li>
            <li>Progress tracking with localStorage</li>
            <li>Dark and light mode</li>
          </ul>
        </div>

        <div className="about-card glass-panel">
          <h2 className="about-card-title">Learning Methodology</h2>
          <div className="about-method-flow">
            {['Understand', 'Observe', 'Interact', 'Predict', 'Practice', 'Master'].map((step, i) => (
              <React.Fragment key={step}>
                <div className="about-method-step">
                  <span className="about-method-number font-mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="about-method-label">{step}</span>
                </div>
                {i < 5 && <span className="about-method-arrow">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="about-card glass-panel">
          <h2 className="about-card-title">Creator & Project Ownership</h2>
          <p className="about-card-text">
            <strong>ADSA Visual Lab</strong> is an original interactive laboratory conceived, engineered, and designed to bridge algorithmic theory and visual intuition.
          </p>
          <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
              Designed & Created by Yuvraj K.
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              © 2026 Yuvraj K. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
