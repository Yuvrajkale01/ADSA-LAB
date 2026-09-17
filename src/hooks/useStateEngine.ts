/* ============================================
   useStateEngine — React hook for StateEngine
   ============================================ */

import { useState, useEffect, useRef, useCallback } from 'react';
import { StateEngine } from '../engine/StateEngine';
import type { AlgorithmState, AnimationControls } from '../types';

export function useStateEngine(initialStates: AlgorithmState[] = []) {
  const engineRef = useRef<StateEngine>(new StateEngine(initialStates));
  const [currentState, setCurrentState] = useState<AlgorithmState | null>(
    initialStates.length > 0 ? initialStates[0] : null
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(initialStates.length);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);

  // Subscribe to engine events
  useEffect(() => {
    const engine = engineRef.current;
    const unsubscribe = engine.onStateChange((state, index) => {
      setCurrentState(state);
      setCurrentStep(index);
      setTotalSteps(engine.getTotalSteps());
      setIsPlaying(engine.getIsPlaying());
    });
    return () => {
      unsubscribe();
      engine.destroy();
    };
  }, []);

  const loadStates = useCallback((states: AlgorithmState[]) => {
    engineRef.current.loadStates(states);
    setCurrentState(states.length > 0 ? states[0] : null);
    setCurrentStep(0);
    setTotalSteps(states.length);
    setIsPlaying(false);
  }, []);

  const controls: AnimationControls = {
    isPlaying,
    speed,
    currentStep,
    totalSteps,
    play: useCallback(() => engineRef.current.play(), []),
    pause: useCallback(() => engineRef.current.pause(), []),
    toggle: useCallback(() => engineRef.current.toggle(), []),
    stepForward: useCallback(() => engineRef.current.stepForward(), []),
    stepBack: useCallback(() => engineRef.current.stepBack(), []),
    restart: useCallback(() => engineRef.current.restart(), []),
    goToStep: useCallback((step: number) => engineRef.current.goToStep(step), []),
    setSpeed: useCallback((s: number) => {
      engineRef.current.setSpeed(s);
      setSpeedState(s);
    }, []),
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          engineRef.current.toggle();
          break;
        case 'ArrowRight':
          e.preventDefault();
          engineRef.current.stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          engineRef.current.stepBack();
          break;
        case 'r':
          if (!e.ctrlKey && !e.metaKey) {
            engineRef.current.restart();
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    currentState,
    currentStep,
    totalSteps,
    controls,
    loadStates,
    getEngine: useCallback(() => engineRef.current, []),
  };
}
