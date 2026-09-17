/* ============================================
   Pseudocode Viewer — Highlighted code trace
   ============================================ */

import React from 'react';
import './PseudocodeViewer.css';

interface Props {
  lines: string[];
  highlightedLine: number | null;
  title?: string;
}

export const PseudocodeViewer: React.FC<Props> = ({ lines, highlightedLine, title = 'Pseudocode' }) => {
  return (
    <div className="pseudocode-viewer">
      <div className="pseudocode-header">
        <span className="pseudocode-title">{title}</span>
        {highlightedLine !== null && (
          <span className="pseudocode-line-indicator font-mono">Line {highlightedLine + 1}</span>
        )}
      </div>
      <div className="pseudocode-body">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`pseudocode-line ${highlightedLine === i ? 'pseudocode-line-active' : ''}`}
          >
            <span className="pseudocode-line-number font-mono">{i + 1}</span>
            <span className="pseudocode-line-text font-mono">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
