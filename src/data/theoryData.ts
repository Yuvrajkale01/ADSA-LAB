/* ============================================
   Theory Data — Concise educational content
   for every major ADSA topic
   ============================================ */

export interface TheoryOperation {
  name: string;
  avgComplexity: string;
  worstComplexity?: string;
}

export interface TopicTheory {
  id: string;
  title: string;
  whatIsIt: string;
  basicRules: string[];
  operations: TheoryOperation[];
  keyInsight: string;
}

export const theoryData: Record<string, TopicTheory> = {
  /* ======== UNIT 1: DICTIONARIES ======== */
  'dictionary-adt': {
    id: 'dictionary-adt',
    title: 'Dictionary ADT',
    whatIsIt: 'A Dictionary is an abstract data type that stores key-value pairs and supports efficient lookup, insertion, and deletion by key.',
    basicRules: [
      'Each entry consists of a unique key and an associated value.',
      'Keys must be comparable or hashable for lookup.',
      'Duplicate keys are typically not allowed.',
      'Can be implemented using arrays, linked lists, hash tables, or trees.',
      'The Java Vector class and Enumeration interface provide one implementation approach.',
      'Performance depends heavily on the underlying implementation.',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(1) to O(n)', worstComplexity: 'O(n)' },
      { name: 'SEARCH', avgComplexity: 'O(1) to O(n)', worstComplexity: 'O(n)' },
      { name: 'DELETE', avgComplexity: 'O(1) to O(n)', worstComplexity: 'O(n)' },
    ],
    keyInsight: 'Dictionaries trade space for speed — the right implementation can make lookups nearly instant.',
  },

  /* ======== UNIT 2: HASHING ======== */
  'hash-functions': {
    id: 'hash-functions',
    title: 'Hash Functions',
    whatIsIt: 'A hash function maps a key to a position (index) in a hash table, enabling near-constant-time data access.',
    basicRules: [
      'Converts any key into an integer index within the table range.',
      'A good hash function distributes keys uniformly across buckets.',
      'Different keys can produce the same index — this is called a collision.',
      'Common methods: division (key % size), multiplication, mid-square.',
      'The table size should ideally be a prime number to reduce clustering.',
      'Hash functions must be deterministic — same key always gives same index.',
    ],
    operations: [
      { name: 'HASH', avgComplexity: 'O(1)' },
      { name: 'INSERT', avgComplexity: 'O(1)', worstComplexity: 'O(n)' },
      { name: 'SEARCH', avgComplexity: 'O(1)', worstComplexity: 'O(n)' },
    ],
    keyInsight: 'The quality of the hash function determines whether your hash table is O(1) or degrades to O(n).',
  },

  'separate-chaining': {
    id: 'separate-chaining',
    title: 'Separate Chaining',
    whatIsIt: 'Separate Chaining resolves collisions by storing all elements that hash to the same index in a linked list at that bucket.',
    basicRules: [
      'Each bucket in the hash table contains a linked list.',
      'When a collision occurs, the new element is appended to the list.',
      'Search traverses the list at the hashed index.',
      'Performance degrades if many keys hash to the same bucket.',
      'Load factor (n/m) determines average chain length.',
      'Works well when the number of elements is unpredictable.',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(1)', worstComplexity: 'O(n)' },
      { name: 'SEARCH', avgComplexity: 'O(1 + α)', worstComplexity: 'O(n)' },
      { name: 'DELETE', avgComplexity: 'O(1 + α)', worstComplexity: 'O(n)' },
    ],
    keyInsight: 'α (load factor) = n/m. Keep α < 1 for optimal performance. Chaining gracefully handles high load.',
  },

  'linear-probing': {
    id: 'linear-probing',
    title: 'Linear Probing',
    whatIsIt: 'Linear Probing is an open addressing strategy where, on collision, we check the next slot sequentially until an empty one is found.',
    basicRules: [
      'On collision at index h, probe h+1, h+2, h+3, ... (mod table size).',
      'All elements are stored directly in the table — no linked lists.',
      'Suffers from primary clustering: consecutive filled slots form long runs.',
      'Deletion requires special "deleted" markers to maintain search correctness.',
      'Load factor must stay below ~0.7 for good performance.',
      'Simple to implement but sensitive to hash function quality.',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(1)', worstComplexity: 'O(n)' },
      { name: 'SEARCH', avgComplexity: 'O(1)', worstComplexity: 'O(n)' },
      { name: 'DELETE', avgComplexity: 'O(1)', worstComplexity: 'O(n)' },
    ],
    keyInsight: 'Primary clustering means one collision creates a chain reaction — nearby slots fill up, causing more collisions.',
  },

  'quadratic-probing': {
    id: 'quadratic-probing',
    title: 'Quadratic Probing',
    whatIsIt: 'Quadratic Probing resolves collisions by probing positions at quadratic intervals: h+1², h+2², h+3², reducing clustering.',
    basicRules: [
      'Probe sequence: h(k) + 1², h(k) + 2², h(k) + 3², ... (mod size).',
      'Reduces primary clustering compared to linear probing.',
      'Can suffer from secondary clustering — keys with same hash follow same probe path.',
      'Table size must be prime for guaranteed insertion when load < 0.5.',
      'Not all positions may be probed — insertion can fail even with empty slots.',
      'Better distribution than linear probing but more complex.',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(1)', worstComplexity: 'O(n)' },
      { name: 'SEARCH', avgComplexity: 'O(1)', worstComplexity: 'O(n)' },
      { name: 'DELETE', avgComplexity: 'O(1)', worstComplexity: 'O(n)' },
    ],
    keyInsight: 'Quadratic jumps spread probes more evenly, but two keys hashing to the same slot still follow identical paths.',
  },

  'double-hashing': {
    id: 'double-hashing',
    title: 'Double Hashing',
    whatIsIt: 'Double Hashing uses a second hash function to determine the probe step size, giving each key a unique probe sequence.',
    basicRules: [
      'Probe: h₁(k) + i·h₂(k) for i = 0, 1, 2, ... (mod size).',
      'h₂(k) must never return 0 — otherwise probing gets stuck.',
      'Eliminates both primary and secondary clustering.',
      'Common choice: h₂(k) = prime - (k mod prime).',
      'Most uniform distribution among open addressing methods.',
      'Slightly more expensive per probe due to computing two hash functions.',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(1)', worstComplexity: 'O(n)' },
      { name: 'SEARCH', avgComplexity: 'O(1)', worstComplexity: 'O(n)' },
      { name: 'DELETE', avgComplexity: 'O(1)', worstComplexity: 'O(n)' },
    ],
    keyInsight: 'Each key gets its own unique probe sequence — the closest to ideal uniform hashing in open addressing.',
  },

  'rehashing': {
    id: 'rehashing',
    title: 'Rehashing',
    whatIsIt: 'Rehashing is the process of creating a larger hash table and re-inserting all existing elements when the load factor exceeds a threshold.',
    basicRules: [
      'Triggered when load factor exceeds a threshold (commonly 0.7).',
      'A new table is created, typically double the size.',
      'The new size should be the next prime number after doubling.',
      'Every existing element must be re-hashed and re-inserted.',
      'Old hash positions are generally invalid in the new table.',
      'Amortized cost keeps average insertion at O(1).',
    ],
    operations: [
      { name: 'REHASH', avgComplexity: 'O(n)' },
      { name: 'INSERT (amortized)', avgComplexity: 'O(1)' },
    ],
    keyInsight: 'Rehashing is expensive (O(n)) but happens rarely enough that each insertion is still O(1) on average.',
  },

  'extendible-hashing': {
    id: 'extendible-hashing',
    title: 'Extendible Hashing',
    whatIsIt: 'Extendible Hashing is a dynamic hashing scheme that uses a directory of pointers to buckets, doubling the directory instead of rehashing all elements.',
    basicRules: [
      'Uses a directory that maps hash prefixes to buckets.',
      'Global depth determines how many bits of the hash are used.',
      'Each bucket has a local depth tracking its split history.',
      'When a bucket overflows, it splits and the directory may double.',
      'Only the overflowing bucket is redistributed — not all elements.',
      'Efficient for disk-based storage where full rehashing is costly.',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(1)' },
      { name: 'SEARCH', avgComplexity: 'O(1)' },
      { name: 'SPLIT', avgComplexity: 'O(bucket size)' },
    ],
    keyInsight: 'Instead of rehashing everything, extendible hashing only splits the problematic bucket — much more efficient for large datasets.',
  },

  /* ======== UNIT 3: TREES ======== */
  'bst': {
    id: 'bst',
    title: 'Binary Search Tree',
    whatIsIt: 'A Binary Search Tree (BST) is a tree where every node\'s left subtree contains only smaller values and the right subtree contains only larger values.',
    basicRules: [
      'Left child < Parent < Right child (BST property).',
      'In-order traversal produces sorted output.',
      'Search, insert, and delete follow a path from root to leaf.',
      'Performance depends on tree height — balanced = O(log n), skewed = O(n).',
      'Duplicate handling varies by implementation.',
      'Supports traversals: in-order, pre-order, post-order, level-order.',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(log n)', worstComplexity: 'O(n)' },
      { name: 'SEARCH', avgComplexity: 'O(log n)', worstComplexity: 'O(n)' },
      { name: 'DELETE', avgComplexity: 'O(log n)', worstComplexity: 'O(n)' },
      { name: 'TRAVERSAL', avgComplexity: 'O(n)' },
    ],
    keyInsight: 'A BST is only efficient when balanced. Inserting sorted data creates a linked list with O(n) operations.',
  },

  'avl': {
    id: 'avl',
    title: 'AVL Tree',
    whatIsIt: 'An AVL Tree is a self-balancing BST where the heights of the left and right subtrees of every node differ by at most 1.',
    basicRules: [
      'Balance factor = height(left) - height(right), must be -1, 0, or +1.',
      'After every insertion or deletion, balance factors are checked.',
      'Imbalance is fixed using rotations: LL, RR, LR, RL.',
      'LL and RR require single rotations; LR and RL require double rotations.',
      'Height is always O(log n), guaranteeing logarithmic operations.',
      'More strictly balanced than Red-Black trees, but costlier to maintain.',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(log n)' },
      { name: 'SEARCH', avgComplexity: 'O(log n)' },
      { name: 'DELETE', avgComplexity: 'O(log n)' },
      { name: 'ROTATION', avgComplexity: 'O(1)' },
    ],
    keyInsight: 'AVL trees trade slightly slower insertions for faster lookups — ideal when reads vastly outnumber writes.',
  },

  'red-black': {
    id: 'red-black',
    title: 'Red-Black Tree',
    whatIsIt: 'A Red-Black Tree is a self-balancing BST where each node has a color (red or black) and must follow specific color rules to maintain approximate balance.',
    basicRules: [
      'Every node is either red or black.',
      'The root is always black.',
      'No two consecutive red nodes are allowed (red-red violation).',
      'Every path from root to a null leaf has the same number of black nodes.',
      'New insertions are always red — then fix violations.',
      'Fixing uses recoloring and rotations (fewer rotations than AVL).',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(log n)' },
      { name: 'SEARCH', avgComplexity: 'O(log n)' },
      { name: 'DELETE', avgComplexity: 'O(log n)' },
      { name: 'RECOLOR/ROTATE', avgComplexity: 'O(1)' },
    ],
    keyInsight: 'Red-Black trees are less strictly balanced than AVL but require fewer rotations — used in Java TreeMap and Linux kernel.',
  },

  'two-three-tree': {
    id: 'two-three-tree',
    title: '2-3 Tree',
    whatIsIt: 'A 2-3 Tree is a balanced multi-way search tree where every internal node has either 2 or 3 children and all leaves are at the same level.',
    basicRules: [
      '2-node: one key, two children. 3-node: two keys, three children.',
      'All leaves are at the same depth — perfectly balanced.',
      'Insertion always happens at a leaf, then splits propagate upward.',
      'When a node overflows (becomes a 4-node), it splits and promotes the middle key.',
      'Splitting may propagate up to the root, increasing tree height.',
      'Search follows the same logic as BST but checks up to 2 keys per node.',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(log n)' },
      { name: 'SEARCH', avgComplexity: 'O(log n)' },
      { name: 'DELETE', avgComplexity: 'O(log n)' },
      { name: 'SPLIT', avgComplexity: 'O(1)' },
    ],
    keyInsight: '2-3 trees grow upward — splits at the root are the only way the tree gets taller, ensuring perfect balance.',
  },

  'b-tree': {
    id: 'b-tree',
    title: 'B-Tree',
    whatIsIt: 'A B-Tree is a generalized balanced multi-way search tree designed for systems that read and write large blocks of data, like databases and file systems.',
    basicRules: [
      'Each node can hold up to m-1 keys and m children (order m).',
      'Every node except root must have at least ⌈m/2⌉ children.',
      'All leaves are at the same level.',
      'Minimizes disk I/O by storing many keys per node.',
      'Insertion splits full nodes; deletion may merge or redistribute.',
      'A 2-3 tree is a B-tree of order 3.',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(log n)' },
      { name: 'SEARCH', avgComplexity: 'O(log n)' },
      { name: 'DELETE', avgComplexity: 'O(log n)' },
    ],
    keyInsight: 'B-trees minimize the number of disk accesses — each node read brings many keys into memory at once.',
  },

  'splay-tree': {
    id: 'splay-tree',
    title: 'Splay Tree',
    whatIsIt: 'A Splay Tree is a self-adjusting BST that moves the most recently accessed node to the root through a series of rotations called splaying.',
    basicRules: [
      'Every access (search, insert, delete) splays the target node to the root.',
      'Splaying uses three operations: Zig (single), Zig-Zig (same direction), Zig-Zag (opposite direction).',
      'No balance factors or colors are stored — structure adapts dynamically.',
      'Frequently accessed elements naturally stay near the root.',
      'Amortized O(log n) per operation, but individual operations can be O(n).',
      'Excellent for workloads with temporal locality.',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(log n) amortized' },
      { name: 'SEARCH', avgComplexity: 'O(log n) amortized' },
      { name: 'SPLAY', avgComplexity: 'O(log n) amortized' },
    ],
    keyInsight: 'Splay trees are self-optimizing — access patterns shape the tree so frequently used data is always fast to reach.',
  },

  'min-heap': {
    id: 'min-heap',
    title: 'Min Heap',
    whatIsIt: 'A Min Heap is a complete binary tree where every parent node is smaller than or equal to its children, making the minimum element always the root.',
    basicRules: [
      'The root always contains the minimum element.',
      'A complete binary tree — filled level by level, left to right.',
      'Stored efficiently as an array: children of node i are at 2i+1 and 2i+2.',
      'Insert: add at the end, then bubble up (sift up) to restore heap property.',
      'Extract-min: remove root, move last element to root, then bubble down (sift down).',
      'Used in priority queues, Dijkstra\'s algorithm, and heap sort.',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(log n)' },
      { name: 'EXTRACT-MIN', avgComplexity: 'O(log n)' },
      { name: 'PEEK-MIN', avgComplexity: 'O(1)' },
      { name: 'BUILD-HEAP', avgComplexity: 'O(n)' },
    ],
    keyInsight: 'Heaps give O(1) access to the minimum and O(log n) extraction — perfect for "give me the smallest item" scenarios.',
  },

  'heap': {
    id: 'heap',
    title: 'Min Heap',
    whatIsIt: 'A Min Heap is a complete binary tree where every parent node is smaller than or equal to its children, making the minimum element always the root.',
    basicRules: [
      'The root always contains the minimum element.',
      'A complete binary tree — filled level by level, left to right.',
      'Stored efficiently as an array: children of node i are at 2i+1 and 2i+2.',
      'Insert: add at the end, then bubble up (sift up) to restore heap property.',
      'Extract-min: remove root, move last element to root, then bubble down (sift down).',
      'Used in priority queues, Dijkstra\'s algorithm, and heap sort.',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(log n)' },
      { name: 'EXTRACT-MIN', avgComplexity: 'O(log n)' },
      { name: 'PEEK-MIN', avgComplexity: 'O(1)' },
      { name: 'BUILD-HEAP', avgComplexity: 'O(n)' },
    ],
    keyInsight: 'Heaps give O(1) access to the minimum and O(log n) extraction — perfect for "give me the smallest item" scenarios.',
  },

  /* ======== UNIT 4: GRAPHS ======== */
  'graph-basics': {
    id: 'graph-basics',
    title: 'Graph Fundamentals',
    whatIsIt: 'A Graph is a collection of vertices (nodes) connected by edges. It models relationships and networks — from social connections to road maps.',
    basicRules: [
      'G = (V, E) — a set of vertices V and edges E.',
      'Edges can be directed (one-way) or undirected (two-way).',
      'Edges can have weights representing cost, distance, or capacity.',
      'Represented using adjacency matrix or adjacency list.',
      'BFS explores level by level (uses queue); DFS goes deep first (uses stack).',
      'A connected graph has a path between every pair of vertices.',
    ],
    operations: [
      { name: 'BFS', avgComplexity: 'O(V + E)' },
      { name: 'DFS', avgComplexity: 'O(V + E)' },
      { name: 'ADD VERTEX', avgComplexity: 'O(1)' },
      { name: 'ADD EDGE', avgComplexity: 'O(1)' },
    ],
    keyInsight: 'BFS finds shortest paths in unweighted graphs; DFS is better for exploring all paths and detecting cycles.',
  },

  'topological-sort': {
    id: 'topological-sort',
    title: 'Topological Sorting',
    whatIsIt: 'Topological Sorting is a linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every edge u→v, u comes before v.',
    basicRules: [
      'Only possible on Directed Acyclic Graphs (DAGs) — no cycles allowed.',
      'A DAG can have multiple valid topological orderings.',
      'Kahn\'s Algorithm: repeatedly remove vertices with in-degree 0.',
      'DFS-based: process vertices in reverse finishing order.',
      'If a cycle exists, topological sort is impossible.',
      'Used in task scheduling, build systems, and course prerequisites.',
    ],
    operations: [
      { name: 'TOPOLOGICAL SORT', avgComplexity: 'O(V + E)' },
      { name: 'CYCLE DETECTION', avgComplexity: 'O(V + E)' },
    ],
    keyInsight: 'Topological sort answers: "In what order should I complete tasks if some depend on others?"',
  },

  'dijkstra': {
    id: 'dijkstra',
    title: "Dijkstra's Algorithm",
    whatIsIt: "Dijkstra's Algorithm finds the shortest path from a source vertex to all other vertices in a weighted graph with non-negative edge weights.",
    basicRules: [
      'Maintains a set of vertices whose shortest distance is finalized.',
      'Uses a priority queue (min-heap) to always process the nearest unvisited vertex.',
      'Relaxation: if dist[u] + weight(u,v) < dist[v], update dist[v].',
      'Does NOT work with negative edge weights.',
      'Greedy approach — always expands the cheapest frontier vertex.',
      'Produces a shortest path tree from the source.',
    ],
    operations: [
      { name: 'SHORTEST PATH', avgComplexity: 'O((V + E) log V)' },
      { name: 'RELAXATION', avgComplexity: 'O(1)' },
    ],
    keyInsight: 'Dijkstra is greedy and optimal for non-negative weights. Negative edges can make it produce wrong results.',
  },

  'bellman-ford': {
    id: 'bellman-ford',
    title: 'Bellman-Ford Algorithm',
    whatIsIt: 'Bellman-Ford finds shortest paths from a source to all vertices, handling negative edge weights and detecting negative cycles.',
    basicRules: [
      'Relaxes ALL edges V-1 times (V = number of vertices).',
      'Can handle negative edge weights (unlike Dijkstra).',
      'After V-1 iterations, if any edge can still be relaxed, a negative cycle exists.',
      'Slower than Dijkstra: O(V·E) vs O((V+E) log V).',
      'Dynamic programming approach — builds shortest paths incrementally.',
      'Used in routing protocols (e.g., RIP) and currency arbitrage detection.',
    ],
    operations: [
      { name: 'SHORTEST PATH', avgComplexity: 'O(V · E)' },
      { name: 'NEGATIVE CYCLE DETECTION', avgComplexity: 'O(V · E)' },
    ],
    keyInsight: 'Bellman-Ford trades speed for generality — it handles negative weights that break Dijkstra.',
  },

  /* ======== UNIT 5: TEXT PROCESSING ======== */
  'string-operations': {
    id: 'string-operations',
    title: 'String Operations',
    whatIsIt: 'String operations are fundamental procedures for manipulating sequences of characters — the building blocks of text processing algorithms.',
    basicRules: [
      'Strings are typically stored as arrays of characters.',
      'Concatenation joins two strings end-to-end.',
      'Substring extraction retrieves a portion of a string.',
      'Comparison checks lexicographic ordering character by character.',
      'Length retrieval is O(1) in most languages (stored separately).',
      'Strings are often immutable — modifications create new strings.',
    ],
    operations: [
      { name: 'CONCATENATE', avgComplexity: 'O(n + m)' },
      { name: 'COMPARE', avgComplexity: 'O(min(n, m))' },
      { name: 'SUBSTRING', avgComplexity: 'O(k)' },
      { name: 'SEARCH', avgComplexity: 'O(n · m)' },
    ],
    keyInsight: 'String operations seem simple, but their O(n) cost compounds in loops — leading to the need for smarter pattern matching.',
  },

  'brute-force-matching': {
    id: 'brute-force-matching',
    title: 'Brute-Force Pattern Matching',
    whatIsIt: 'Brute-Force matching slides the pattern over the text one position at a time, checking every character for a match at each position.',
    basicRules: [
      'Compare pattern P against text T starting at every position.',
      'At each position, compare characters left to right.',
      'On mismatch, slide pattern forward by 1 and restart.',
      'Simple to implement and understand.',
      'Worst case: every position requires full pattern comparison.',
      'Effective for short patterns or when simplicity matters.',
    ],
    operations: [
      { name: 'PATTERN MATCH', avgComplexity: 'O(n · m)', worstComplexity: 'O(n · m)' },
    ],
    keyInsight: 'Brute-force wastes work by forgetting what it already compared — KMP and Boyer-Moore fix this.',
  },

  'boyer-moore': {
    id: 'boyer-moore',
    title: 'Boyer-Moore Algorithm',
    whatIsIt: 'Boyer-Moore is an efficient pattern matching algorithm that compares from right to left and uses the bad-character rule to skip large portions of text.',
    basicRules: [
      'Compares pattern characters from right to left (unlike brute-force).',
      'Bad-character rule: on mismatch, shift pattern to align the mismatched text character.',
      'If the mismatched character isn\'t in the pattern, skip the entire pattern length.',
      'Can also use the good-suffix rule for additional skipping.',
      'Best case is sublinear: O(n/m) — faster than reading every character.',
      'Particularly efficient for large alphabets and long patterns.',
    ],
    operations: [
      { name: 'PREPROCESSING', avgComplexity: 'O(m + |Σ|)' },
      { name: 'SEARCH', avgComplexity: 'O(n/m) best', worstComplexity: 'O(n · m)' },
    ],
    keyInsight: 'Boyer-Moore can skip entire chunks of text — it gets faster with longer patterns, which is counterintuitive.',
  },

  'kmp': {
    id: 'kmp',
    title: 'KMP Algorithm',
    whatIsIt: 'Knuth-Morris-Pratt (KMP) uses a preprocessed failure function (LPS array) to avoid re-comparing characters after a mismatch.',
    basicRules: [
      'Build an LPS (Longest Proper Prefix which is also Suffix) array from the pattern.',
      'LPS tells how far back to reset the pattern pointer on mismatch.',
      'The text pointer never moves backward — it only advances forward.',
      'After mismatch at position j, jump pattern to LPS[j-1] instead of restarting.',
      'Preprocessing takes O(m), search takes O(n).',
      'Total time: O(n + m) — linear in both text and pattern length.',
    ],
    operations: [
      { name: 'BUILD LPS', avgComplexity: 'O(m)' },
      { name: 'SEARCH', avgComplexity: 'O(n)' },
    ],
    keyInsight: 'KMP remembers partial matches — it never re-examines a text character, guaranteeing linear time.',
  },

  'standard-trie': {
    id: 'standard-trie',
    title: 'Standard Trie',
    whatIsIt: 'A Trie (prefix tree) stores strings character-by-character along tree edges, enabling fast prefix-based search and autocomplete.',
    basicRules: [
      'Each edge represents a single character.',
      'The root represents the empty string.',
      'A path from root to a marked node spells out a stored string.',
      'Common prefixes share the same path — space efficient for similar strings.',
      'Search time depends on string length, not the number of stored strings.',
      'Supports prefix queries: "find all words starting with..."',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(m)' },
      { name: 'SEARCH', avgComplexity: 'O(m)' },
      { name: 'PREFIX SEARCH', avgComplexity: 'O(m + k)' },
    ],
    keyInsight: 'Tries make prefix search O(length) regardless of how many strings are stored — the basis of autocomplete.',
  },

  'compressed-trie': {
    id: 'compressed-trie',
    title: 'Compressed Trie',
    whatIsIt: 'A Compressed Trie (Patricia Trie) merges chains of single-child nodes into one edge labeled with a substring, saving space.',
    basicRules: [
      'Single-child chains are compressed into one edge with multiple characters.',
      'Internal nodes exist only at branching points.',
      'Significantly fewer nodes than a standard trie.',
      'Same search complexity as standard trie.',
      'Edge labels are substrings rather than single characters.',
      'Used in IP routing tables and memory-constrained environments.',
    ],
    operations: [
      { name: 'INSERT', avgComplexity: 'O(m)' },
      { name: 'SEARCH', avgComplexity: 'O(m)' },
      { name: 'SPACE', avgComplexity: 'O(n) nodes' },
    ],
    keyInsight: 'Compression eliminates redundant nodes — a standard trie with 1000 nodes might become 200 nodes compressed.',
  },

  'suffix-trie': {
    id: 'suffix-trie',
    title: 'Suffix Trie',
    whatIsIt: 'A Suffix Trie stores all suffixes of a string, enabling O(m) substring search — checking if any pattern exists anywhere in the text.',
    basicRules: [
      'Contains every suffix of the text as a path from root.',
      'For text of length n, there are n suffixes.',
      'Substring search becomes a simple trie traversal: O(m).',
      'Naive construction takes O(n²) time and space.',
      'Suffix trees (compressed version) reduce space to O(n).',
      'Enables powerful operations: longest repeated substring, LCS of two strings.',
    ],
    operations: [
      { name: 'BUILD', avgComplexity: 'O(n²)' },
      { name: 'SUBSTRING SEARCH', avgComplexity: 'O(m)' },
      { name: 'LONGEST REPEAT', avgComplexity: 'O(n)' },
    ],
    keyInsight: 'Suffix tries precompute all substrings — expensive to build but make any pattern lookup instant.',
  },

  'huffman': {
    id: 'huffman',
    title: 'Huffman Coding',
    whatIsIt: 'Huffman Coding is a greedy algorithm that creates an optimal prefix-free binary code by assigning shorter codes to more frequent characters.',
    basicRules: [
      'Frequent characters get shorter bit codes; rare characters get longer codes.',
      'Build a binary tree bottom-up: always merge the two lowest-frequency nodes.',
      'Left edge = 0, right edge = 1 (or vice versa).',
      'The code is prefix-free — no code is a prefix of another.',
      'Optimal among character-level codes (provably minimum total bits).',
      'Used in ZIP, JPEG, MP3, and other compression formats.',
    ],
    operations: [
      { name: 'BUILD TREE', avgComplexity: 'O(n log n)' },
      { name: 'ENCODE', avgComplexity: 'O(n)' },
      { name: 'DECODE', avgComplexity: 'O(n)' },
    ],
    keyInsight: 'Huffman proves that giving frequent symbols short codes minimizes total message length — information theory in action.',
  },

  'lcs': {
    id: 'lcs',
    title: 'Longest Common Subsequence',
    whatIsIt: 'LCS finds the longest sequence of characters that appears in the same relative order in both strings, but not necessarily contiguously.',
    basicRules: [
      'A subsequence maintains relative order but can skip characters.',
      'Uses a 2D DP table of size (m+1) × (n+1).',
      'If characters match: LCS[i][j] = LCS[i-1][j-1] + 1.',
      'If they don\'t match: LCS[i][j] = max(LCS[i-1][j], LCS[i][j-1]).',
      'Backtrack through the table to reconstruct the actual LCS.',
      'Used in diff tools, DNA sequence alignment, and version control.',
    ],
    operations: [
      { name: 'COMPUTE LCS', avgComplexity: 'O(m · n)' },
      { name: 'BACKTRACK', avgComplexity: 'O(m + n)' },
    ],
    keyInsight: 'LCS is the algorithm behind "diff" — it figures out what two sequences have in common.',
  },

  /* ======== UNIT 6: DESIGN TECHNIQUES ======== */
  'divide-and-conquer': {
    id: 'divide-and-conquer',
    title: 'Divide and Conquer',
    whatIsIt: 'Divide and Conquer breaks a problem into smaller independent subproblems, solves them recursively, and combines the results.',
    basicRules: [
      'DIVIDE: Split the problem into smaller subproblems.',
      'CONQUER: Solve each subproblem recursively (base case: trivial to solve).',
      'COMBINE: Merge subproblem solutions into the final answer.',
      'Subproblems must be independent — no shared state.',
      'Classic examples: Merge Sort, Quick Sort, Binary Search, Strassen\'s Matrix Multiplication.',
      'Time analysis uses the Master Theorem: T(n) = aT(n/b) + O(nᵈ).',
    ],
    operations: [
      { name: 'MERGE SORT', avgComplexity: 'O(n log n)' },
      { name: 'BINARY SEARCH', avgComplexity: 'O(log n)' },
      { name: 'QUICK SORT', avgComplexity: 'O(n log n)' },
    ],
    keyInsight: 'If you can split a problem in half each time, you go from O(n) to O(log n) — the power of halving.',
  },

  'greedy': {
    id: 'greedy',
    title: 'Greedy Algorithm',
    whatIsIt: 'Greedy algorithms make the locally optimal choice at each step, hoping to find the global optimum without reconsidering past decisions.',
    basicRules: [
      'At each step, choose the option that looks best right now.',
      'Never go back and revise a previous choice.',
      'Works only when the problem has optimal substructure and the greedy choice property.',
      'Greedy choice property: a locally optimal choice leads to a globally optimal solution.',
      'Proof of correctness usually requires an exchange argument.',
      'Classic examples: Activity Selection, Huffman Coding, Dijkstra\'s, Fractional Knapsack.',
    ],
    operations: [
      { name: 'ACTIVITY SELECTION', avgComplexity: 'O(n log n)' },
      { name: 'FRACTIONAL KNAPSACK', avgComplexity: 'O(n log n)' },
    ],
    keyInsight: 'Greedy works when "best now" equals "best overall" — but many problems (like 0/1 Knapsack) fool greedy into bad solutions.',
  },

  'dynamic-programming': {
    id: 'dynamic-programming',
    title: 'Dynamic Programming',
    whatIsIt: 'Dynamic Programming (DP) solves complex problems by breaking them into overlapping subproblems and storing results to avoid redundant computation.',
    basicRules: [
      'Identify overlapping subproblems — the same computation repeats.',
      'Store (memoize) solutions to subproblems in a table.',
      'Top-down: recursive with memoization. Bottom-up: iterative tabulation.',
      'Requires optimal substructure — optimal solution contains optimal sub-solutions.',
      'Reduces exponential time to polynomial by eliminating redundant work.',
      'Classic examples: Fibonacci, LCS, 0/1 Knapsack, Matrix Chain Multiplication.',
    ],
    operations: [
      { name: '0/1 KNAPSACK', avgComplexity: 'O(n · W)' },
      { name: 'LCS', avgComplexity: 'O(m · n)' },
      { name: 'FIBONACCI', avgComplexity: 'O(n)' },
    ],
    keyInsight: 'DP = recursion + memory. If you\'re solving the same subproblem twice, you need DP.',
  },

  'branch-and-bound': {
    id: 'branch-and-bound',
    title: 'Branch and Bound',
    whatIsIt: 'Branch and Bound systematically explores a solution space by branching into subproblems and using bounds to prune unpromising branches.',
    basicRules: [
      'BRANCH: divide the problem into smaller subproblems (tree of possibilities).',
      'BOUND: compute an upper/lower bound for each subproblem.',
      'PRUNE: if a bound is worse than the best known solution, skip that branch.',
      'Uses a priority queue to explore the most promising branch first.',
      'Guarantees finding the optimal solution (unlike greedy).',
      'Classic examples: Traveling Salesman, 0/1 Knapsack, Job Assignment.',
    ],
    operations: [
      { name: 'TSP', avgComplexity: 'O(n!) worst' },
      { name: 'KNAPSACK', avgComplexity: 'O(2ⁿ) worst' },
    ],
    keyInsight: 'Bounding transforms brute-force search into smart search — most branches are pruned without being explored.',
  },

  'backtracking': {
    id: 'backtracking',
    title: 'Backtracking',
    whatIsIt: 'Backtracking explores all potential solutions by building candidates incrementally and abandoning ("backtracking") as soon as a constraint is violated.',
    basicRules: [
      'Build the solution one decision at a time.',
      'At each step, check if constraints are satisfied.',
      'If a constraint is violated, undo the last decision and try the next option.',
      'Uses depth-first search through the decision tree.',
      'Prunes branches early — avoids exploring clearly invalid paths.',
      'Classic examples: N-Queens, Sudoku, Graph Coloring, Subset Sum.',
    ],
    operations: [
      { name: 'N-QUEENS', avgComplexity: 'O(n!)' },
      { name: 'SUDOKU', avgComplexity: 'O(9^(n²))' },
    ],
    keyInsight: 'Backtracking is "try, fail, undo, try again" — it explores possibilities without committing until certain.',
  },
};

/**
 * Get theory data for a specific topic.
 * Falls back to matching by prefix for topics that share a visualizer.
 */
export function getTheoryForTopic(topicId: string): TopicTheory | null {
  if (theoryData[topicId]) return theoryData[topicId];

  // Try to match by prefix (e.g., for hash-related topics)
  for (const key of Object.keys(theoryData)) {
    if (topicId.startsWith(key)) return theoryData[key];
  }

  return null;
}
