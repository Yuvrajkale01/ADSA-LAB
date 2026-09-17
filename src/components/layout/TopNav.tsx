/* ============================================
   TopNav — Neo-Brutalist Header
   Clear theme indicator, high-contrast actions
   ============================================ */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Moon, Sun, Menu, X, Zap } from 'lucide-react';
import type { Theme } from '../../types';
import './TopNav.css';

interface Props {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}

const navLinks = [
  { path: '/learn', label: 'Syllabus' },
  { path: '/visualizer', label: 'Visualizers' },
  { path: '/race', label: 'Algorithm Race', highlight: true },
  { path: '/about', label: 'Course Docs' },
];

export const TopNav: React.FC<Props> = ({ theme, onThemeChange, onMenuToggle, sidebarOpen }) => {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTheme = () => {
    // Direct Light <-> Dark toggle for clarity
    onThemeChange(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="brutal-header">
      {/* Main Neo-Brutalist Navigation Bar */}
      <nav className="top-nav" role="navigation" aria-label="Main navigation">
        <div className="nav-left">
          {/* Mobile-only menu toggle (completely hidden on desktop) */}
          <button
            className="brutal-btn nav-mobile-menu-btn"
            onClick={onMenuToggle}
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          <Link to="/" className="nav-logo">
            <span className="nav-logo-glyph">λ</span>
            <span className="nav-logo-text">ADSA</span>
            <span className="nav-logo-badge">LAB</span>
          </Link>
        </div>

        <div className="nav-center">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive ? 'nav-link-active' : ''} ${link.highlight ? 'nav-link-highlight' : ''}`}
              >
                {link.highlight && <Zap size={13} className="nav-link-icon" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="nav-right">
          {searchOpen ? (
            <div className="nav-search-wrapper">
              <Search size={14} className="nav-search-icon" />
              <input
                type="text"
                className="nav-search-input font-mono"
                placeholder="Search topics (e.g. AVL, Dijkstra)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onBlur={() => { setSearchOpen(false); setSearchQuery(''); }}
                autoFocus
              />
            </div>
          ) : (
            <button
              className="brutal-btn nav-action-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              title="Search Topics (Ctrl+K)"
            >
              <Search size={14} />
              <span className="nav-shortcut-key font-mono">⌘K</span>
            </button>
          )}

          {/* High-visibility Theme Toggle Button with Sun/Moon Icon & Text Label */}
          <button
            className="brutal-btn nav-theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Current mode: ${theme}. Click to switch to ${theme === 'dark' ? 'light' : 'dark'} mode.`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Moon size={14} className="theme-toggle-icon moon-icon" />
            ) : (
              <Sun size={14} className="theme-toggle-icon sun-icon" />
            )}
            <span className="theme-toggle-label font-mono">
              {theme === 'dark' ? 'DARK' : 'LIGHT'}
            </span>
          </button>

          <Link to="/visualizer" className="brutal-btn brutal-btn-yellow nav-cta-btn">
            <span>ENTER LAB</span>
            <span className="nav-cta-arrow">→</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};
