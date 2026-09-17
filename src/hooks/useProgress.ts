/* ============================================
   useProgress — localStorage progress tracking
   ============================================ */

import { useState, useCallback, useEffect } from 'react';
import type { TopicProgress, CourseProgress } from '../types';

const STORAGE_KEY = 'adsa-visual-lab-progress';

function getDefaultProgress(): CourseProgress {
  return {
    topics: {},
    overallPercentage: 0,
    lastUpdated: Date.now(),
  };
}

function loadProgress(): CourseProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore parse errors
  }
  return getDefaultProgress();
}

function saveProgress(progress: CourseProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore storage errors
  }
}

function getDefaultTopicProgress(topicId: string): TopicProgress {
  return {
    topicId,
    opened: false,
    conceptCompleted: false,
    visualizerUsed: false,
    quizCompleted: false,
    practiceCompleted: false,
    labExplored: false,
    lastAccessed: Date.now(),
  };
}

export function useProgress() {
  const [progress, setProgress] = useState<CourseProgress>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const markTopicOpened = useCallback((topicId: string) => {
    setProgress(prev => {
      const topic = prev.topics[topicId] || getDefaultTopicProgress(topicId);
      return {
        ...prev,
        topics: {
          ...prev.topics,
          [topicId]: { ...topic, opened: true, lastAccessed: Date.now() },
        },
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const markConceptCompleted = useCallback((topicId: string) => {
    setProgress(prev => {
      const topic = prev.topics[topicId] || getDefaultTopicProgress(topicId);
      return {
        ...prev,
        topics: {
          ...prev.topics,
          [topicId]: { ...topic, conceptCompleted: true, lastAccessed: Date.now() },
        },
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const markVisualizerUsed = useCallback((topicId: string) => {
    setProgress(prev => {
      const topic = prev.topics[topicId] || getDefaultTopicProgress(topicId);
      return {
        ...prev,
        topics: {
          ...prev.topics,
          [topicId]: { ...topic, visualizerUsed: true, lastAccessed: Date.now() },
        },
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const markQuizCompleted = useCallback((topicId: string) => {
    setProgress(prev => {
      const topic = prev.topics[topicId] || getDefaultTopicProgress(topicId);
      return {
        ...prev,
        topics: {
          ...prev.topics,
          [topicId]: { ...topic, quizCompleted: true, lastAccessed: Date.now() },
        },
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const getTopicProgress = useCallback((topicId: string): TopicProgress => {
    return progress.topics[topicId] || getDefaultTopicProgress(topicId);
  }, [progress]);

  const getUnitProgress = useCallback((topicIds: string[]): number => {
    if (topicIds.length === 0) return 0;
    let completed = 0;
    for (const id of topicIds) {
      const tp = progress.topics[id];
      if (tp) {
        let score = 0;
        if (tp.opened) score += 0.15;
        if (tp.conceptCompleted) score += 0.25;
        if (tp.visualizerUsed) score += 0.25;
        if (tp.quizCompleted) score += 0.2;
        if (tp.practiceCompleted) score += 0.15;
        completed += score;
      }
    }
    return Math.round((completed / topicIds.length) * 100);
  }, [progress]);

  const getOverallProgress = useCallback((allTopicIds: string[]): number => {
    return getUnitProgress(allTopicIds);
  }, [getUnitProgress]);

  const resetProgress = useCallback(() => {
    setProgress(getDefaultProgress());
  }, []);

  return {
    progress,
    markTopicOpened,
    markConceptCompleted,
    markVisualizerUsed,
    markQuizCompleted,
    getTopicProgress,
    getUnitProgress,
    getOverallProgress,
    resetProgress,
  };
}
