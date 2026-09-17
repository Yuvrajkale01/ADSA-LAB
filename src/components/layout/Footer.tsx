/* ============================================
   Global Authorship & Navigation Footer
   Designed & Created by Yuvraj K.
   ============================================ */

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="brutal-footer" role="contentinfo" aria-label="Project Footer">
      <div className="footer-container">
        {/* Brand Column */}
        <div className="footer-brand-col">
          <div className="footer-logo">
            <span className="footer-logo-badge font-mono">λ</span>
            <span className="footer-logo-text">ADSA VISUAL LAB</span>
          </div>
          <p className="footer-copy">
            Advanced Data Structures & Algorithms Interactive Learning Platform.
            Built for students, engineers, and computer scientists who learn by seeing.
          </p>
          <div className="footer-stamp font-mono">
            STATUS: ALL 32 LABS OPERATIONAL // LATENCY: 0MS
          </div>
        </div>

        {/* Navigation Column */}
        <div className="footer-links-col font-mono">
          <div className="footer-col-title">NAVIGATION</div>
          <Link to="/learn" className="footer-link">Full Syllabus</Link>
          <Link to="/visualizer" className="footer-link">Visualizer Hub</Link>
          <Link to="/race" className="footer-link">Algorithm Race</Link>
          <Link to="/about" className="footer-link">Course Policy & Docs</Link>
        </div>

        {/* Featured Labs Column */}
        <div className="footer-links-col font-mono">
          <div className="footer-col-title">FEATURED LABS</div>
          <Link to="/learn/avl" className="footer-link">AVL Tree Rotations</Link>
          <Link to="/learn/red-black" className="footer-link">Red-Black Balancing</Link>
          <Link to="/learn/dijkstra" className="footer-link">Dijkstra Shortest Path</Link>
          <Link to="/learn/separate-chaining" className="footer-link">Hash Chaining & Probing</Link>
        </div>

        {/* Authorship & Creator Column */}
        <div className="footer-links-col font-mono">
          <div className="footer-col-title">PROJECT CREATOR</div>
          <div className="footer-author-box">
            <div className="footer-author-name">Designed & Created by Yuvraj K.</div>
            <div className="footer-author-role">Interactive Algorithm Visualization & Lab Architecture</div>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Copyright & Authorship */}
      <div className="footer-bottom-bar font-mono">
        <span>© {currentYear} Yuvraj K. All rights reserved.</span>
        <span className="footer-authorship-tag">Designed & Created by Yuvraj K.</span>
        <span>HIGH-CONTRAST LABORATORY • PURE REACT 19</span>
      </div>
    </footer>
  );
};
