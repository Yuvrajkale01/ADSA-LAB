/* ============================================
   State Snapshot Engine
   Core animation/stepping system for all
   algorithm visualizers
   ============================================ */

import type { AlgorithmState } from '../types';

export type StateChangeCallback = (state: AlgorithmState, index: number) => void;

export class StateEngine {
  private states: AlgorithmState[] = [];
  private currentIndex: number = -1;
  private isPlaying: boolean = false;
  private speed: number = 1;
  private intervalId: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<StateChangeCallback> = new Set();
  private baseInterval: number = 1000; // ms between steps at 1x

  constructor(states: AlgorithmState[] = []) {
    this.states = states;
    if (states.length > 0) {
      this.currentIndex = 0;
    }
  }

  // ---- State Management ----

  loadStates(states: AlgorithmState[]): void {
    this.stop();
    this.states = states;
    this.currentIndex = states.length > 0 ? 0 : -1;
    this.notifyListeners();
  }

  getStates(): AlgorithmState[] {
    return this.states;
  }

  getCurrentState(): AlgorithmState | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.states.length) {
      return null;
    }
    return this.states[this.currentIndex];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getTotalSteps(): number {
    return this.states.length;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getSpeed(): number {
    return this.speed;
  }

  // ---- Controls ----

  play(): void {
    if (this.states.length === 0) return;
    if (this.currentIndex >= this.states.length - 1) {
      this.currentIndex = 0;
      this.notifyListeners();
    }
    this.isPlaying = true;
    this.startAutoPlay();
    this.notifyListeners();
  }

  pause(): void {
    this.isPlaying = false;
    this.stopAutoPlay();
    this.notifyListeners();
  }

  toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  stepForward(): void {
    if (this.currentIndex < this.states.length - 1) {
      this.pause();
      this.currentIndex++;
      this.notifyListeners();
    }
  }

  stepBack(): void {
    if (this.currentIndex > 0) {
      this.pause();
      this.currentIndex--;
      this.notifyListeners();
    }
  }

  restart(): void {
    this.pause();
    this.currentIndex = 0;
    this.notifyListeners();
  }

  goToStep(step: number): void {
    const clampedStep = Math.max(0, Math.min(step, this.states.length - 1));
    this.pause();
    this.currentIndex = clampedStep;
    this.notifyListeners();
  }

  setSpeed(speed: number): void {
    this.speed = speed;
    if (this.isPlaying) {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }

  stop(): void {
    this.isPlaying = false;
    this.stopAutoPlay();
    this.currentIndex = this.states.length > 0 ? 0 : -1;
  }

  // ---- Listeners ----

  onStateChange(callback: StateChangeCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    const state = this.getCurrentState();
    if (state) {
      this.listeners.forEach(cb => cb(state, this.currentIndex));
    }
  }

  // ---- Auto Play ----

  private startAutoPlay(): void {
    this.stopAutoPlay();
    const interval = this.baseInterval / this.speed;
    this.intervalId = setInterval(() => {
      if (this.currentIndex < this.states.length - 1) {
        this.currentIndex++;
        this.notifyListeners();
      } else {
        this.pause();
      }
    }, interval);
  }

  private stopAutoPlay(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // ---- Cleanup ----

  destroy(): void {
    this.stop();
    this.listeners.clear();
  }
}

// ---- Helper: Create an empty algorithm state ----
export function createEmptyState(id: number, operation: string = ''): AlgorithmState {
  return {
    id,
    dataStructureState: null,
    activeNodes: [],
    activeEdges: [],
    operation,
    explanation: '',
    detailedExplanation: '',
    pseudocodeLine: null,
    comparisons: 0,
    assignments: 0,
    swaps: 0,
    complexity: '',
    metadata: {},
  };
}

// ---- Helper: Create a state from a previous state ----
export function createNextState(prev: AlgorithmState, overrides: Partial<AlgorithmState>): AlgorithmState {
  return {
    ...prev,
    id: prev.id + 1,
    activeNodes: [],
    activeEdges: [],
    ...overrides,
  };
}
