/* ======================================
   ADSA Visual Lab — Type Definitions
   ====================================== */

// ---- State Engine Types ----
export type NodeState = 'normal' | 'active' | 'comparing' | 'visited' | 'selected' | 'inserted' | 'deleted' | 'collision' | 'error' | 'success' | 'highlight' | 'frontier' | 'relaxed' | 'match' | 'mismatch';

export type EdgeState = 'normal' | 'active' | 'examining' | 'shortest-path' | 'relaxed' | 'deleted';

export interface AlgorithmState {
  id: number;
  dataStructureState: any;
  activeNodes: { id: string; state: NodeState }[];
  activeEdges: { id: string; state: EdgeState }[];
  operation: string;
  explanation: string;
  detailedExplanation: string;
  pseudocodeLine: number | null;
  comparisons: number;
  assignments: number;
  swaps: number;
  complexity: string;
  metadata: Record<string, any>;
}

export interface AnimationControls {
  isPlaying: boolean;
  speed: number;
  currentStep: number;
  totalSteps: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stepForward: () => void;
  stepBack: () => void;
  restart: () => void;
  goToStep: (step: number) => void;
  setSpeed: (speed: number) => void;
}

// ---- Course Data Types ----
export type UnitId = 'dictionaries' | 'hashing' | 'trees' | 'graphs' | 'text' | 'design-techniques';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface CourseUnit {
  id: UnitId;
  number: number;
  title: string;
  description: string;
  topics: CourseTopic[];
  estimatedHours: number;
  difficulty: Difficulty;
  courseOutcomes: string[];
}

export interface CourseTopic {
  id: string;
  title: string;
  unitId: UnitId;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  hasVisualizer: boolean;
  prerequisites: string[];
  courseOutcomes: string[];
}

// ---- Complexity ----
export type StandardComplexityClass = 'O(1)' | 'O(log n)' | 'O(n)' | 'O(n log n)' | 'O(n²)' | 'O(n³)' | 'O(2ⁿ)';

export type ComplexityClass =
  | StandardComplexityClass
  | 'O(n!)'
  | 'O(V + E)'
  | 'O(V²)'
  | 'O(V)'
  | 'O(E log V)'
  | 'O(m)'
  | 'O(m·n)'
  | 'O(log n) amortized'
  | (string & {});

export interface ComplexityInfo {
  time: {
    best: ComplexityClass;
    average: ComplexityClass;
    worst: ComplexityClass;
  };
  space: ComplexityClass;
}

// ---- Progress ----
export interface TopicProgress {
  topicId: string;
  opened: boolean;
  conceptCompleted: boolean;
  visualizerUsed: boolean;
  quizCompleted: boolean;
  practiceCompleted: boolean;
  labExplored: boolean;
  lastAccessed: number;
}

export interface CourseProgress {
  topics: Record<string, TopicProgress>;
  overallPercentage: number;
  lastUpdated: number;
}

// ---- Tree Types ----
export interface TreeNode<T = number> {
  id: string;
  value: T;
  left?: TreeNode<T> | null;
  right?: TreeNode<T> | null;
  parent?: TreeNode<T> | null;
  // AVL
  height?: number;
  balanceFactor?: number;
  // Red-Black
  color?: 'red' | 'black';
  // B-Tree
  keys?: T[];
  children?: TreeNode<T>[];
  isLeaf?: boolean;
  // Visual positioning
  x?: number;
  y?: number;
}

// ---- Graph Types ----
export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  state?: NodeState;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  directed: boolean;
  state?: EdgeState;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
}

// ---- Hash Table Types ----
export type CollisionStrategy = 'separate-chaining' | 'linear-probing' | 'quadratic-probing' | 'double-hashing';

export interface HashEntry {
  key: string | number;
  value: any;
  state?: NodeState;
}

export interface HashBucket {
  index: number;
  entries: HashEntry[];
  state?: NodeState;
}

export interface HashTableState {
  buckets: HashBucket[];
  size: number;
  count: number;
  loadFactor: number;
  strategy: CollisionStrategy;
  hashFunction: string;
}

// ---- Text Processing Types ----
export interface TextComparisonState {
  textIndex: number;
  patternIndex: number;
  patternOffset: number;
  isMatch: boolean;
  characters: {
    index: number;
    char: string;
    state: 'normal' | 'comparing' | 'match' | 'mismatch' | 'skipped';
  }[];
}

// ---- Quiz Types ----
export type QuizQuestionType = 'multiple-choice' | 'predict-step' | 'identify-node' | 'arrange-steps' | 'predict-complexity';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options: string[];
  correctAnswer: number | number[];
  explanation: string;
  topicId: string;
}

// ---- Lab Types ----
export interface LabModule {
  id: string;
  number: number;
  title: string;
  problemStatement: string;
  conceptRequired: string;
  starterCode: string;
  expectedOutput: string;
  testCases: { input: string; output: string }[];
  complexity: ComplexityInfo;
  topicId: string;
}

// ---- Theme ----
export type Theme = 'dark' | 'light' | 'system';
