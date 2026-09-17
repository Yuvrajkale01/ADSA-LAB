/* ============================================
   Complexity Panel — Time/Space complexity display
   ============================================ */

import React from 'react';
import type { ComplexityInfo, ComplexityClass, StandardComplexityClass } from '../../types';
import './ComplexityPanel.css';

interface Props {
  complexity: ComplexityInfo;
  title?: string;
}

const COMPLEXITY_ORDER: StandardComplexityClass[] = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)'];

function getComplexityWidth(c: ComplexityClass): number {
  const widths: Record<string, number> = {
    'O(1)': 8,
    'O(log n)': 20,
    'O(n)': 35,
    'O(n log n)': 50,
    'O(n²)': 70,
    'O(n³)': 85,
    'O(2ⁿ)': 100,
    'O(n!)': 100,
    'O(V + E)': 45,
    'O(V²)': 70,
    'O(V)': 35,
    'O(m)': 35,
    'O(m·n)': 70,
  };
  return widths[c] || 50;
}

function getComplexityColor(c: ComplexityClass): string {
  const colors: Record<string, string> = {
    'O(1)': '#10b981',
    'O(log n)': '#34d399',
    'O(n)': '#fbbf24',
    'O(n log n)': '#f59e0b',
    'O(n²)': '#f97316',
    'O(n³)': '#ef4444',
    'O(2ⁿ)': '#dc2626',
    'O(n!)': '#dc2626',
    'O(V + E)': '#38bdf8',
    'O(V²)': '#f97316',
    'O(V)': '#fbbf24',
    'O(m)': '#fbbf24',
    'O(m·n)': '#f97316',
  };
  return colors[c] || '#6366f1';
}

const ComplexityBar: React.FC<{ label: string; value: ComplexityClass }> = ({ label, value }) => (
  <div className="complexity-bar-row">
    <span className="complexity-bar-label">{label}</span>
    <div className="complexity-bar-track">
      <div
        className="complexity-bar-fill"
        style={{
          width: `${getComplexityWidth(value)}%`,
          backgroundColor: getComplexityColor(value),
        }}
      />
    </div>
    <span className="complexity-bar-value font-mono">{value}</span>
  </div>
);

export const ComplexityPanel: React.FC<Props> = ({ complexity, title = 'Complexity Analysis' }) => {
  return (
    <div className="complexity-panel">
      <h4 className="complexity-title">{title}</h4>

      <div className="complexity-section">
        <h5 className="complexity-section-title">Time Complexity</h5>
        <ComplexityBar label="Best" value={complexity.time.best} />
        <ComplexityBar label="Average" value={complexity.time.average} />
        <ComplexityBar label="Worst" value={complexity.time.worst} />
      </div>

      <div className="complexity-section">
        <h5 className="complexity-section-title">Space Complexity</h5>
        <ComplexityBar label="Space" value={complexity.space} />
      </div>

      <div className="complexity-scale">
        {COMPLEXITY_ORDER.map(c => (
          <span key={c} className="complexity-scale-item font-mono" style={{ color: getComplexityColor(c) }}>
            {c}
          </span>
        ))}
      </div>
    </div>
  );
};
