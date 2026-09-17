/* ============================================
   Theory Section — Educational intro before
   every interactive simulation
   ============================================ */

import React, { useState } from 'react';
import { getTheoryForTopic } from '../../data/theoryData';
import type { TopicTheory } from '../../data/theoryData';
import './TheorySection.css';

interface TheorySectionProps {
  topicId: string;
  /** Override: pass theory data directly instead of looking up by topicId */
  theoryOverride?: TopicTheory;
}

export const TheorySection: React.FC<TheorySectionProps> = ({ topicId, theoryOverride }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const theory = theoryOverride || getTheoryForTopic(topicId);

  if (!theory) return null;

  return (
    <div className="theory-section brutal-card">
      <button
        className="theory-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls={`theory-content-${topicId}`}
      >
        <div className="theory-toggle-left">
          <span className="sticker-badge sticker-badge-blue">CONCEPT</span>
          <span className="theory-toggle-title">{theory.title}</span>
        </div>
        <span className={`theory-chevron ${isExpanded ? 'theory-chevron-open' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="theory-content" id={`theory-content-${topicId}`}>
          {/* WHAT IS IT? */}
          <div className="theory-definition">
            <h3 className="theory-label">WHAT IS {theory.title.toUpperCase()}?</h3>
            <p className="theory-text">{theory.whatIsIt}</p>
          </div>

          <div className="theory-columns">
            {/* BASIC RULES */}
            <div className="theory-rules brutal-card">
              <h4 className="theory-sublabel">BASIC RULES</h4>
              <ul className="theory-rule-list">
                {theory.basicRules.map((rule, i) => (
                  <li key={i} className="theory-rule-item">
                    <span className="theory-bullet">●</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* OPERATIONS + COMPLEXITY */}
            <div className="theory-ops-block">
              <div className="theory-ops brutal-card">
                <h4 className="theory-sublabel">OPERATIONS</h4>
                <div className="theory-op-tags">
                  {theory.operations.map((op, i) => (
                    <span key={i} className="theory-op-tag sticker-badge">{op.name}</span>
                  ))}
                </div>
              </div>

              <div className="theory-complexity brutal-card">
                <h4 className="theory-sublabel">COMPLEXITY</h4>
                <div className="theory-complexity-grid">
                  {theory.operations.map((op, i) => (
                    <div key={i} className="theory-complexity-row">
                      <span className="theory-complexity-op font-mono">{op.name}</span>
                      <span className="theory-complexity-arrow">→</span>
                      <span className="theory-complexity-val font-mono">{op.avgComplexity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* KEY INSIGHT */}
          <div className="theory-insight brutal-card">
            <span className="theory-insight-icon">■</span>
            <span className="theory-insight-label">KEY INSIGHT</span>
            <span className="theory-insight-text">{theory.keyInsight}</span>
          </div>
        </div>
      )}
    </div>
  );
};
