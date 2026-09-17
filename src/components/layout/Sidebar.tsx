/* ============================================
   Sidebar — Course navigation
   Clean, architectural numbering, high readability
   ============================================ */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';
import { courseUnits } from '../../data/courseData';
import './Sidebar.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedUnits, setExpandedUnits] = React.useState<Set<string>>(new Set(['hashing', 'trees']));

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`} role="navigation" aria-label="Course navigation">
        <div className="sidebar-header">
          <BookOpen size={15} className="sidebar-header-icon" />
          <span className="sidebar-header-title">Curriculum Index</span>
        </div>

        <div className="sidebar-content">
          {courseUnits.map(unit => {
            const isExpanded = expandedUnits.has(unit.id);
            const unitNumberStr = unit.number < 10 ? `0${unit.number}` : `${unit.number}`;

            return (
              <div key={unit.id} className="sidebar-unit">
                <button
                  className="sidebar-unit-header"
                  onClick={() => toggleUnit(unit.id)}
                  aria-expanded={isExpanded}
                >
                  <span className="sidebar-unit-num font-mono">{unitNumberStr}</span>
                  <div className="sidebar-unit-info">
                    <span className="sidebar-unit-title">{unit.title}</span>
                    <span className="sidebar-unit-count">{unit.topics.length} topics</span>
                  </div>
                  <span className="sidebar-chevron">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </button>

                {isExpanded && (
                  <div className="sidebar-topics">
                    {unit.topics.map(topic => {
                      const isActive = location.pathname === `/learn/${topic.id}`;
                      return (
                        <Link
                          key={topic.id}
                          to={`/learn/${topic.id}`}
                          className={`sidebar-topic ${isActive ? 'sidebar-topic-active' : ''}`}
                          onClick={() => {
                            if (window.innerWidth < 768) onClose();
                          }}
                        >
                          <span className="sidebar-topic-indicator" />
                          <span className="sidebar-topic-title">{topic.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
