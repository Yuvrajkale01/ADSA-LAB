/* ============================================
   Algorithm Race — Visual Sorting Competition
   Watch algorithms race with animated bars,
   live metrics, step-by-step control, and
   educational explanations.
   ============================================ */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TheorySection } from '../../components/visualization/TheorySection';
import { SORT_ALGORITHMS } from '../../algorithms/sorting/sortingAlgorithms';
import type { SortStep, SortAlgorithmDef } from '../../algorithms/sorting/sortingAlgorithms';
import type { TopicTheory } from '../../data/theoryData';
import './AlgorithmRace.css';

/* ---- Sorting Theory (inline — not a topic page) ---- */
const sortingTheory: TopicTheory = {
  id: 'sorting-race',
  title: 'Sorting Algorithms',
  whatIsIt: 'Sorting algorithms rearrange elements in a specific order (ascending/descending). Different algorithms use different strategies — comparing, swapping, dividing, or building heaps — leading to vastly different performance characteristics.',
  basicRules: [
    'Comparison-based sorts compare pairs of elements to determine order.',
    'O(n²) algorithms (Bubble, Selection, Insertion) are simple but slow on large inputs.',
    'O(n log n) algorithms (Merge, Quick, Heap) use divide-and-conquer for efficiency.',
    'The theoretical lower bound for comparison sorts is Ω(n log n).',
    'Stability means equal elements preserve their original relative order.',
    'In-place algorithms use O(1) extra space; Merge Sort needs O(n).',
  ],
  operations: [
    { name: 'BUBBLE SORT', avgComplexity: 'O(n²)' },
    { name: 'SELECTION SORT', avgComplexity: 'O(n²)' },
    { name: 'INSERTION SORT', avgComplexity: 'O(n²)' },
    { name: 'MERGE SORT', avgComplexity: 'O(n log n)' },
    { name: 'QUICK SORT', avgComplexity: 'O(n log n)' },
    { name: 'HEAP SORT', avgComplexity: 'O(n log n)' },
  ],
  keyInsight: 'On random data with n=1000, Bubble Sort may need ~500,000 comparisons while Quick Sort needs ~10,000 — a 50× difference that grows dramatically with size.',
};

/* ---- Types ---- */
type RaceStatus = 'idle' | 'running' | 'paused' | 'done';
type DataType = 'random' | 'sorted' | 'reverse' | 'nearly-sorted';

interface AlgoRaceState {
  algo: SortAlgorithmDef;
  steps: SortStep[];
  currentStepIdx: number;
  finished: boolean;
  finishOrder: number;
  timeTaken: number;
}

const SPEED_OPTIONS = [
  { label: '0.5x', value: 200 },
  { label: '1x', value: 100 },
  { label: '2x', value: 50 },
  { label: '4x', value: 20 },
  { label: '8x', value: 5 },
];

const SIZE_OPTIONS = [10, 15, 20, 30, 50];

/* ============================================
   MAIN COMPONENT
   ============================================ */
export const AlgorithmRace: React.FC = () => {
  const [selectedAlgos, setSelectedAlgos] = useState<Set<string>>(
    new Set(['bubble', 'insertion', 'selection', 'merge', 'quick', 'heap'])
  );
  const [dataSize, setDataSize] = useState(20);
  const [dataType, setDataType] = useState<DataType>('random');
  const [customInput, setCustomInput] = useState('');
  const [speedIdx, setSpeedIdx] = useState(1); // 1x
  const [status, setStatus] = useState<RaceStatus>('idle');
  const [raceStates, setRaceStates] = useState<AlgoRaceState[]>([]);
  const [focusedAlgo, setFocusedAlgo] = useState<string | null>(null);

  const animFrameRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  const finishCountRef = useRef<number>(0);
  const raceStatesRef = useRef<AlgoRaceState[]>([]);
  const statusRef = useRef<RaceStatus>('idle');
  const startTimeRef = useRef<number>(0);

  // Keep refs in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  /* ---- Generate input data ---- */
  const generateData = useCallback((): number[] => {
    // Custom input takes priority
    if (customInput.trim()) {
      const parsed = customInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      if (parsed.length >= 2) return parsed;
    }

    let data: number[] = [];
    switch (dataType) {
      case 'random':
        data = Array.from({ length: dataSize }, () => Math.floor(Math.random() * 100) + 1);
        break;
      case 'sorted':
        data = Array.from({ length: dataSize }, (_, i) => Math.floor((i / dataSize) * 100) + 1);
        break;
      case 'reverse':
        data = Array.from({ length: dataSize }, (_, i) => Math.floor(((dataSize - i) / dataSize) * 100) + 1);
        break;
      case 'nearly-sorted':
        data = Array.from({ length: dataSize }, (_, i) => Math.floor((i / dataSize) * 100) + 1);
        for (let i = 0; i < Math.floor(dataSize * 0.1); i++) {
          const a = Math.floor(Math.random() * dataSize);
          const b = Math.floor(Math.random() * dataSize);
          [data[a], data[b]] = [data[b], data[a]];
        }
        break;
    }
    return data;
  }, [dataSize, dataType, customInput]);

  /* ---- Toggle algorithm selection ---- */
  const toggleAlgo = (id: string) => {
    setSelectedAlgos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ---- Prepare race (generate steps for all algos) ---- */
  const prepareRace = useCallback((): AlgoRaceState[] => {
    const data = generateData();
    const states: AlgoRaceState[] = [];

    for (const algo of SORT_ALGORITHMS) {
      if (!selectedAlgos.has(algo.id)) continue;
      const steps = algo.generate(data);
      states.push({
        algo,
        steps,
        currentStepIdx: 0,
        finished: false,
        finishOrder: 0,
        timeTaken: 0,
      });
    }
    return states;
  }, [selectedAlgos, generateData]);

  /* ---- Animation loop ---- */
  const tickRef = useRef<(timestamp: number) => void>(() => {});

  const tick = useCallback((timestamp: number) => {
    if (statusRef.current !== 'running') return;

    const delay = SPEED_OPTIONS[speedIdx]?.value ?? 100;
    if (timestamp - lastTickRef.current < delay) {
      animFrameRef.current = requestAnimationFrame(tickRef.current);
      return;
    }
    lastTickRef.current = timestamp;

    let allDone = true;
    const updated = raceStatesRef.current.map(rs => {
      if (rs.finished) return rs;

      const nextIdx = rs.currentStepIdx + 1;
      if (nextIdx >= rs.steps.length) {
        finishCountRef.current++;
        return {
          ...rs,
          currentStepIdx: rs.steps.length - 1,
          finished: true,
          finishOrder: finishCountRef.current,
          timeTaken: performance.now() - startTimeRef.current,
        };
      }

      allDone = false;
      return { ...rs, currentStepIdx: nextIdx };
    });

    raceStatesRef.current = updated;
    setRaceStates([...updated]);

    if (allDone || updated.every(s => s.finished)) {
      setStatus('done');
      statusRef.current = 'done';
      return;
    }

    animFrameRef.current = requestAnimationFrame(tickRef.current);
  }, [speedIdx]);

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  /* ---- START ---- */
  const handleStart = useCallback(() => {
    const states = prepareRace();
    if (states.length < 2) return;

    finishCountRef.current = 0;
    raceStatesRef.current = states;
    startTimeRef.current = performance.now();
    setRaceStates(states);
    setStatus('running');
    statusRef.current = 'running';
    lastTickRef.current = 0;

    animFrameRef.current = requestAnimationFrame(tickRef.current);
  }, [prepareRace]);

  /* ---- PAUSE / RESUME ---- */
  const handlePauseResume = useCallback(() => {
    if (status === 'running') {
      setStatus('paused');
      statusRef.current = 'paused';
      cancelAnimationFrame(animFrameRef.current);
    } else if (status === 'paused') {
      setStatus('running');
      statusRef.current = 'running';
      lastTickRef.current = 0;
      animFrameRef.current = requestAnimationFrame(tickRef.current);
    }
  }, [status]);

  /* ---- STEP ---- */
  const handleStep = useCallback(() => {
    if (status !== 'paused' && status !== 'idle') return;
    if (raceStatesRef.current.length === 0) {
      // First step — prepare
      const states = prepareRace();
      if (states.length < 2) return;
      finishCountRef.current = 0;
      raceStatesRef.current = states;
      startTimeRef.current = performance.now();
      setRaceStates(states);
      setStatus('paused');
      statusRef.current = 'paused';
      return;
    }

    const updated = raceStatesRef.current.map(rs => {
      if (rs.finished) return rs;
      const nextIdx = rs.currentStepIdx + 1;
      if (nextIdx >= rs.steps.length) {
        finishCountRef.current++;
        return {
          ...rs,
          currentStepIdx: rs.steps.length - 1,
          finished: true,
          finishOrder: finishCountRef.current,
          timeTaken: performance.now() - startTimeRef.current,
        };
      }
      return { ...rs, currentStepIdx: nextIdx };
    });

    raceStatesRef.current = updated;
    setRaceStates([...updated]);

    if (updated.every(s => s.finished)) {
      setStatus('done');
      statusRef.current = 'done';
    }
  }, [status, prepareRace]);

  /* ---- RESET ---- */
  const handleReset = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setStatus('idle');
    statusRef.current = 'idle';
    setRaceStates([]);
    raceStatesRef.current = [];
    finishCountRef.current = 0;
    setFocusedAlgo(null);
  }, []);

  /* ---- RANDOMIZE ---- */
  const handleRandomize = useCallback(() => {
    handleReset();
    setCustomInput('');
  }, [handleReset]);

  /* ---- Cleanup ---- */
  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  /* ---- Derived state ---- */
  const currentLeader = raceStates.length > 0
    ? [...raceStates]
        .filter(s => !s.finished)
        .sort((a, b) => {
          const pctA = a.steps.length > 0 ? a.currentStepIdx / a.steps.length : 0;
          const pctB = b.steps.length > 0 ? b.currentStepIdx / b.steps.length : 0;
          return pctB - pctA;
        })[0]?.algo.name ?? null
    : null;

  const winner = raceStates.find(s => s.finishOrder === 1);
  const sortedFinishers = [...raceStates].filter(s => s.finished).sort((a, b) => a.finishOrder - b.finishOrder);

  // Focused algorithm explanation
  const focusedState = focusedAlgo
    ? raceStates.find(s => s.algo.id === focusedAlgo)
    : raceStates.find(s => !s.finished) ?? raceStates[0];

  const focusedStep = focusedState
    ? focusedState.steps[focusedState.currentStepIdx]
    : null;

  /* ---- Data type insight text ---- */
  const getInsight = () => {
    switch (dataType) {
      case 'sorted':
        return 'On sorted data, Insertion Sort performs best (O(n)) since no shifts are needed. Bubble Sort also benefits. Quick Sort may degrade to O(n²) if the pivot selection is poor.';
      case 'reverse':
        return 'Reverse-sorted data is the worst case for Bubble Sort and Insertion Sort (maximum swaps). Merge Sort and Heap Sort maintain O(n log n) regardless.';
      case 'nearly-sorted':
        return 'Nearly sorted data favors Insertion Sort (almost O(n)) and Bubble Sort. Merge Sort has consistent O(n log n) regardless of input order.';
      default:
        return 'On random data, O(n log n) algorithms like Merge Sort, Quick Sort, and Heap Sort vastly outperform O(n²) algorithms. The difference grows dramatically with larger inputs.';
    }
  };

  /* ============================================
     RENDER
     ============================================ */
  return (
    <div className="race-page">
      {/* ---- Theory Section ---- */}
      <TheorySection topicId="sorting-race" theoryOverride={sortingTheory} />

      {/* ---- Hero Header ---- */}
      <div className="race-hero">
        <div className="race-hero-badge">
          <span className="sticker-badge sticker-badge-coral">SPECIAL FEATURE</span>
        </div>
        <h1 className="race-hero-title">ALGORITHM RACE</h1>
        <p className="race-hero-desc">
          Select sorting algorithms, configure the input, and race them side-by-side.
          Watch every comparison, swap, and decision in real time.
        </p>
      </div>

      {/* ---- Configuration Panel ---- */}
      <div className="race-config brutal-card">
        {/* Algorithm selection */}
        <div className="race-config-section">
          <h3 className="race-config-title">Select Algorithms</h3>
          <div className="race-algo-grid">
            {SORT_ALGORITHMS.map(algo => (
              <button
                key={algo.id}
                className={`race-algo-btn ${selectedAlgos.has(algo.id) ? 'race-algo-btn-active' : ''}`}
                onClick={() => toggleAlgo(algo.id)}
                disabled={status === 'running'}
              >
                <span className="race-algo-name">{algo.name}</span>
                <span className="race-algo-complexity font-mono">{algo.complexity}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Data configuration */}
        <div className="race-config-section">
          <h3 className="race-config-title">Input Data</h3>
          <div className="race-data-config">
            <div className="race-config-item">
              <label className="race-config-label">Array Size</label>
              <select
                className="race-select"
                value={dataSize}
                onChange={e => setDataSize(Number(e.target.value))}
                disabled={status === 'running'}
              >
                {SIZE_OPTIONS.map(s => (
                  <option key={s} value={s}>{s} elements</option>
                ))}
              </select>
            </div>
            <div className="race-config-item">
              <label className="race-config-label">Data Type</label>
              <select
                className="race-select"
                value={dataType}
                onChange={e => setDataType(e.target.value as DataType)}
                disabled={status === 'running'}
              >
                <option value="random">Random</option>
                <option value="sorted">Already Sorted</option>
                <option value="reverse">Reverse Sorted</option>
                <option value="nearly-sorted">Nearly Sorted</option>
              </select>
            </div>
            <div className="race-config-item">
              <label className="race-config-label">Custom Array</label>
              <input
                type="text"
                className="race-input-field"
                placeholder="42, 17, 8, 91, 33, 4"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                disabled={status === 'running'}
              />
            </div>
          </div>
        </div>

        {/* Speed control */}
        <div className="race-config-section">
          <h3 className="race-config-title">Speed</h3>
          <div className="race-speed-row">
            {SPEED_OPTIONS.map((opt, i) => (
              <button
                key={opt.label}
                className={`race-speed-btn ${speedIdx === i ? 'race-speed-btn-active' : ''}`}
                onClick={() => setSpeedIdx(i)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="race-controls">
          {status === 'idle' && (
            <button
              className="race-ctrl-btn race-ctrl-start"
              onClick={handleStart}
              disabled={selectedAlgos.size < 2}
            >
              ▶ START RACE
            </button>
          )}
          {(status === 'running' || status === 'paused') && (
            <button className="race-ctrl-btn race-ctrl-pause" onClick={handlePauseResume}>
              {status === 'running' ? '⏸ PAUSE' : '▶ RESUME'}
            </button>
          )}
          {(status === 'paused' || status === 'idle') && (
            <button className="race-ctrl-btn race-ctrl-step" onClick={handleStep}>
              ⏭ STEP
            </button>
          )}
          <button className="race-ctrl-btn race-ctrl-reset" onClick={handleReset}>
            ↺ RESET
          </button>
          <button className="race-ctrl-btn race-ctrl-random" onClick={handleRandomize} disabled={status === 'running'}>
            ⟳ RANDOMIZE
          </button>

          {/* Status badge */}
          <span className={`race-status-badge race-status-${status}`}>
            {status === 'idle' && 'READY'}
            {status === 'running' && 'RACING'}
            {status === 'paused' && 'PAUSED'}
            {status === 'done' && 'FINISHED'}
          </span>
        </div>
      </div>

      {/* ---- Race Arena ---- */}
      {raceStates.length > 0 && (
        <div className="race-arena brutal-card">
          {/* Current leader */}
          {status === 'running' && currentLeader && (
            <div className="race-leader-banner">
              <span className="race-leader-label">CURRENT LEADER</span>
              <span className="race-leader-name">{currentLeader}</span>
            </div>
          )}

          {/* Algorithm tracks */}
          <div className="race-tracks">
            {raceStates.map(rs => {
              const step = rs.steps[rs.currentStepIdx];
              if (!step) return null;
              const pct = rs.steps.length > 0 ? Math.round((rs.currentStepIdx / (rs.steps.length - 1)) * 100) : 0;
              const maxVal = Math.max(...step.array, 1);
              const isLeader = !rs.finished && currentLeader === rs.algo.name;
              const showLabels = step.array.length <= 30;

              return (
                <div
                  key={rs.algo.id}
                  className={`race-track ${rs.finished ? 'race-track-finished' : ''} ${isLeader ? 'race-track-leader' : ''}`}
                  onClick={() => setFocusedAlgo(rs.algo.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Header */}
                  <div className="race-track-header">
                    <div className="race-track-left">
                      {rs.finishOrder > 0 && (
                        <span className="race-track-rank">
                          {rs.finishOrder === 1 ? '★' : `#${rs.finishOrder}`}
                        </span>
                      )}
                      <span className="race-track-name" style={{ color: rs.algo.color }}>
                        {rs.algo.name}
                      </span>
                      <span className="race-track-complexity font-mono">{rs.algo.complexity}</span>
                    </div>
                    <div className="race-track-metrics">
                      <div className="race-track-metric">
                        <span className="race-track-metric-label">CMP</span>
                        <span className="race-track-metric-val">{step.comparisons}</span>
                      </div>
                      <div className="race-track-metric">
                        <span className="race-track-metric-label">SWP</span>
                        <span className="race-track-metric-val">{step.swaps}</span>
                      </div>
                      <div className="race-track-metric">
                        <span className="race-track-metric-label">ACC</span>
                        <span className="race-track-metric-val">{step.arrayAccesses}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bar visualization */}
                  <div className="race-bars-container">
                    {step.array.map((val, idx) => {
                      const heightPct = (val / maxVal) * 100;
                      let barClass = 'race-bar race-bar-default';

                      if (step.sortedIndices.includes(idx)) {
                        barClass = 'race-bar race-bar-sorted';
                      }
                      if (step.pivotIndex === idx) {
                        barClass = 'race-bar race-bar-pivot';
                      }
                      if (step.mergeRange && idx >= step.mergeRange[0] && idx <= step.mergeRange[1] && !step.sortedIndices.includes(idx)) {
                        barClass = 'race-bar race-bar-merge';
                      }
                      if (step.heapSize !== undefined && idx < step.heapSize && step.activeIndices.includes(idx)) {
                        barClass = 'race-bar race-bar-heap';
                      }
                      if (step.activeIndices.includes(idx) && !step.sortedIndices.includes(idx) && step.pivotIndex !== idx) {
                        barClass = 'race-bar race-bar-active';
                      }
                      if (step.swappingIndices.includes(idx)) {
                        barClass = 'race-bar race-bar-swapping';
                      }

                      return (
                        <div
                          key={idx}
                          className={barClass}
                          style={{ height: `${heightPct}%` }}
                        >
                          {showLabels && (
                            <span className="race-bar-label">{val}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress */}
                  <div className="race-progress-row">
                    <div className="race-progress-bar">
                      <div
                        className="race-progress-fill"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: rs.algo.color,
                        }}
                      />
                    </div>
                    <span className="race-progress-pct">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation panel */}
          {focusedStep && focusedState && (
            <div className="race-explanation">
              <div className="race-explanation-title">CURRENT STEP</div>
              <div className="race-explanation-algo" style={{ color: focusedState.algo.color }}>
                {focusedState.algo.name}
              </div>
              <div className="race-explanation-text">
                <strong>{focusedStep.operation}</strong>
                <br />
                {focusedStep.explanation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---- Winner Announcement ---- */}
      {status === 'done' && winner && (
        <div className="race-winner-section">
          <div className="race-winner-card">
            <span className="race-winner-label">W I N N E R</span>
            <span className="race-winner-name">{winner.algo.name}</span>
            <span className="race-winner-stats">
              {winner.steps[winner.steps.length - 1]?.comparisons ?? 0} comparisons ·{' '}
              {winner.steps[winner.steps.length - 1]?.swaps ?? 0} swaps ·{' '}
              {winner.steps.length} steps
            </span>
          </div>
        </div>
      )}

      {/* ---- Final Standings ---- */}
      {status === 'done' && sortedFinishers.length > 0 && (
        <div className="race-standings brutal-card">
          <h3 className="race-standings-title">FINAL STANDINGS</h3>
          <div className="race-standings-list">
            {sortedFinishers.map(rs => {
              const lastStep = rs.steps[rs.steps.length - 1];
              return (
                <div
                  key={rs.algo.id}
                  className={`race-standing-row ${rs.finishOrder === 1 ? 'race-standing-row-winner' : ''}`}
                >
                  <span className="race-standing-rank">
                    {rs.finishOrder === 1 ? '★' : `${rs.finishOrder}.`}
                  </span>
                  <span className="race-standing-name" style={{ color: rs.finishOrder === 1 ? '#000' : rs.algo.color }}>
                    {rs.algo.name}
                  </span>
                  <span className="race-standing-time">
                    {lastStep ? `${lastStep.comparisons} cmp · ${lastStep.swaps} swp · ${rs.steps.length} steps` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- Performance Comparison ---- */}
      {status === 'done' && sortedFinishers.length > 0 && (
        <div className="race-perf-section">
          <h3 className="race-perf-title">PERFORMANCE COMPARISON</h3>
          <div className="race-perf-grid">
            {sortedFinishers.map(rs => {
              const lastStep = rs.steps[rs.steps.length - 1];
              if (!lastStep) return null;
              return (
                <div key={rs.algo.id} className="race-perf-card">
                  <div className="race-perf-card-name" style={{ color: rs.algo.color }}>
                    {rs.finishOrder === 1 && '★ '}{rs.algo.name}
                  </div>
                  <div className="race-perf-metrics">
                    <div className="race-perf-metric-row">
                      <span className="race-perf-metric-label">Comparisons</span>
                      <span className="race-perf-metric-value">{lastStep.comparisons.toLocaleString()}</span>
                    </div>
                    <div className="race-perf-metric-row">
                      <span className="race-perf-metric-label">Swaps</span>
                      <span className="race-perf-metric-value">{lastStep.swaps.toLocaleString()}</span>
                    </div>
                    <div className="race-perf-metric-row">
                      <span className="race-perf-metric-label">Array Accesses</span>
                      <span className="race-perf-metric-value">{lastStep.arrayAccesses.toLocaleString()}</span>
                    </div>
                    <div className="race-perf-metric-row">
                      <span className="race-perf-metric-label">Total Steps</span>
                      <span className="race-perf-metric-value">{rs.steps.length.toLocaleString()}</span>
                    </div>
                    <div className="race-perf-metric-row">
                      <span className="race-perf-metric-label">Finish Order</span>
                      <span className="race-perf-metric-value">#{rs.finishOrder}</span>
                    </div>
                  </div>
                  <div className="race-perf-complexity-badge">
                    AVG: {rs.algo.complexity} · BEST: {rs.algo.bestCase} · WORST: {rs.algo.worstCase}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- Educational Insight ---- */}
      {status === 'done' && (
        <div className="race-insight">
          <div className="race-insight-title">■ WHAT DID WE LEARN?</div>
          <p className="race-insight-text">{getInsight()}</p>
        </div>
      )}
    </div>
  );
};
