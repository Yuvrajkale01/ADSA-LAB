/* ============================================
   Dashboard Page — Curriculum Syllabus & Dossier
   Editorial learning interface with master-detail navigation
   Replaces generic card grid with structured syllabus
   ============================================ */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, BarChart3, ArrowRight, CheckCircle2, Play } from 'lucide-react';
import { courseUnits } from '../data/courseData';
import { useProgress } from '../hooks/useProgress';
import type { Difficulty } from '../types';
import './Dashboard.css';

const difficultyBadges: Record<Difficulty, { label: string; className: string }> = {
  beginner: { label: 'Beginner', className: 'difficulty-beginner' },
  intermediate: { label: 'Intermediate', className: 'difficulty-intermediate' },
  advanced: { label: 'Advanced', className: 'difficulty-advanced' },
};

export const Dashboard: React.FC = () => {
  const { getUnitProgress, progress: allProgress } = useProgress();
  const [selectedUnitId, setSelectedUnitId] = useState<string>(courseUnits[0].id);

  // Selected unit details
  const activeUnit = courseUnits.find(u => u.id === selectedUnitId) || courseUnits[0];
  const activeTopicIds = activeUnit.topics.map(t => t.id);
  const activeProgress = getUnitProgress(activeTopicIds);

  // Calculate overall platform progress
  const totalTopics = courseUnits.reduce((acc, u) => acc + u.topics.length, 0);
  const completedTopicsCount = Object.values(allProgress.topics || {}).filter(p => p.conceptCompleted).length;
  const overallPercentage = Math.round((completedTopicsCount / Math.max(1, totalTopics)) * 100);

  const activeUnitNumStr = activeUnit.number < 10 ? `0${activeUnit.number}` : `${activeUnit.number}`;

  return (
    <div className="dashboard-page">
      {/* Header Section */}
      <div className="dashboard-header-block">
        <div className="dashboard-header-container">
          <div className="dashboard-kicker font-mono">ACADEMIC CURRICULUM // ALL 6 UNITS</div>
          <h1 className="dashboard-title">Course Syllabus & Laboratory Dossier</h1>
          <p className="dashboard-subtitle">
            A comprehensive, hands-on curriculum covering Advanced Data Structures and Algorithms.
            Select a unit to inspect topics, learning objectives, and interactive laboratories.
          </p>

          {/* Overall Course Progress Bar */}
          <div className="dashboard-progress-strip">
            <div className="progress-strip-info">
              <span className="progress-strip-label font-mono">TOTAL COURSE COMPLETION:</span>
              <span className="progress-strip-percent font-mono">{overallPercentage}%</span>
              <span className="progress-strip-count font-mono">({completedTopicsCount}/{totalTopics} topics)</span>
            </div>
            <div className="progress-strip-track">
              <div className="progress-strip-fill" style={{ width: `${overallPercentage}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Syllabus Workspace */}
      <div className="dashboard-content-container">
        
        {/* Horizontal Unit Navigation Tabs */}
        <div className="unit-navigation-tabs" role="tablist" aria-label="Course Units">
          {courseUnits.map(unit => {
            const isSelected = unit.id === activeUnit.id;
            const unitProgress = getUnitProgress(unit.topics.map(t => t.id));
            const numStr = unit.number < 10 ? `0${unit.number}` : `${unit.number}`;

            return (
              <button
                key={unit.id}
                role="tab"
                aria-selected={isSelected}
                className={`unit-nav-tab ${isSelected ? 'unit-nav-tab-active' : ''}`}
                onClick={() => setSelectedUnitId(unit.id)}
              >
                <div className="unit-tab-top">
                  <span className="unit-tab-num font-mono">{numStr}</span>
                  <span className="unit-tab-pct font-mono">{unitProgress}%</span>
                </div>
                <div className="unit-tab-title">{unit.title}</div>
                <div className="unit-tab-topics-count">{unit.topics.length} topics</div>
                <div className="unit-tab-indicator" />
              </button>
            );
          })}
        </div>

        {/* Selected Unit Dossier (Master-Detail View) */}
        <div className="unit-dossier-layout">
          
          {/* Left Column: Unit Overview & Meta */}
          <div className="unit-dossier-meta">
            <div className="dossier-unit-tag font-mono">UNIT {activeUnitNumStr} SPECIFICATION</div>
            <h2 className="dossier-unit-heading">{activeUnit.title}</h2>
            <p className="dossier-unit-desc">{activeUnit.description}</p>

            <div className="dossier-meta-specs">
              <div className="dossier-spec-row">
                <span className="spec-label font-mono"><Clock size={13} /> ESTIMATED DURATION</span>
                <span className="spec-value font-mono">~{activeUnit.estimatedHours} hours</span>
              </div>
              <div className="dossier-spec-row">
                <span className="spec-label font-mono"><BookOpen size={13} /> TOPICS INCLUDED</span>
                <span className="spec-value font-mono">{activeUnit.topics.length} modules</span>
              </div>
              <div className="dossier-spec-row">
                <span className="spec-label font-mono"><BarChart3 size={13} /> DIFFICULTY</span>
                <span className={`difficulty-badge ${difficultyBadges[activeUnit.difficulty].className}`}>
                  {difficultyBadges[activeUnit.difficulty].label}
                </span>
              </div>
              <div className="dossier-spec-row">
                <span className="spec-label font-mono">UNIT MASTERY</span>
                <span className="spec-value font-mono">{activeProgress}% complete</span>
              </div>
            </div>

            {/* Course Outcomes */}
            <div className="dossier-outcomes">
              <h4 className="dossier-outcomes-title font-mono">COURSE OUTCOMES MAPPED</h4>
              <div className="dossier-outcomes-list">
                {activeUnit.courseOutcomes.map((co, i) => (
                  <span key={i} className="outcome-tag font-mono">{co}</span>
                ))}
              </div>
            </div>

            {/* Quick Launch First Topic */}
            {activeUnit.topics.length > 0 && (
              <Link to={`/learn/${activeUnit.topics[0].id}`} className="dossier-launch-btn">
                <Play size={14} fill="currentColor" />
                <span>Launch Unit: {activeUnit.topics[0].title}</span>
              </Link>
            )}
          </div>

          {/* Right Column: Topic Directory Ledger */}
          <div className="unit-dossier-topics">
            <div className="topics-ledger-header">
              <span className="ledger-title font-mono">MODULE TOPIC DIRECTORY</span>
              <span className="ledger-count font-mono">{activeUnit.topics.length} TOPICS</span>
            </div>

            <div className="topics-ledger-list">
              {activeUnit.topics.map((topic, idx) => {
                const topicProgress = allProgress.topics?.[topic.id];
                const isCompleted = topicProgress?.conceptCompleted;
                const indexStr = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;

                return (
                  <Link
                    key={topic.id}
                    to={`/learn/${topic.id}`}
                    className="topic-ledger-row"
                  >
                    <span className="topic-ledger-num font-mono">{indexStr}</span>
                    
                    <div className="topic-ledger-body">
                      <div className="topic-ledger-title-row">
                        <span className="topic-ledger-title">{topic.title}</span>
                        {isCompleted && (
                          <span className="topic-completed-tag font-mono">
                            <CheckCircle2 size={12} /> COMPLETED
                          </span>
                        )}
                      </div>
                      <span className="topic-ledger-unit font-mono">Unit {activeUnit.number} // Interactive Lab</span>
                    </div>

                    <div className="topic-ledger-action">
                      <span className="topic-launch-label font-mono">OPEN LAB</span>
                      <ArrowRight size={14} className="topic-arrow" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
