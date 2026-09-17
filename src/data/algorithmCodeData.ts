/* ============================================
   Algorithm Code Data — Short exam-focused
   algorithm logic for synchronized code panels
   in Java, Python, and C++.
   ============================================ */

import type { AlgorithmCodeData } from '../components/visualization/AlgorithmCodePanel';

// ============================================
// 1. Min Heap Code Data (Exact match to reference screenshot)
// ============================================
export const minHeapCodeData: AlgorithmCodeData = {
  code: {
    java: `void insert(int value) {
    heap.add(value);
    siftUp(heap.size() - 1);
}

int extractMin() {
    int min = heap.get(0);
    heap.set(0, heap.remove(heap.size() - 1));
    if (!heap.isEmpty()) siftDown(0);
    return min;
}

void siftUp(int i) {
    while (i > 0 && heap.get(parent(i)) > heap.get(i)) {
        swap(i, parent(i));
        i = parent(i);
    }
}

void siftDown(int i) {
    while (hasChildren(i)) {
        int smallest = argMin(i, leftChild(i), rightChild(i));
        if (smallest == i) return;
        swap(i, smallest);
        i = smallest;
    }
}`,
    python: `def insert(self, value):
    self.heap.append(value)
    self.sift_up(len(self.heap) - 1)

def extract_min(self):
    val = self.heap[0]
    self.heap[0] = self.heap.pop()
    if self.heap:
        self.sift_down(0)
    return val

def sift_up(self, i):
    while i > 0 and self.heap[parent(i)] > self.heap[i]:
        self.swap(i, parent(i))
        i = parent(i)

def sift_down(self, i):
    while self.has_children(i):
        smallest = self.arg_min(i, left(i), right(i))
        if smallest == i:
            return
        self.swap(i, smallest)
        i = smallest`,
    cpp: `void insert(int value) {
    heap.push_back(value);
    siftUp(heap.size() - 1);
}

int extractMin() {
    int min = heap[0];
    heap[0] = heap.back();
    heap.pop_back();
    if (!heap.empty()) siftDown(0);
    return min;
}

void siftUp(int i) {
    while (i > 0 && heap[parent(i)] > heap[i]) {
        swap(heap[i], heap[parent(i)]);
        i = parent(i);
    }
}

void siftDown(int i) {
    while (hasChildren(i)) {
        int smallest = argMin(i, leftChild(i), rightChild(i));
        if (smallest == i) return;
        swap(heap[i], heap[smallest]);
        i = smallest;
    }
}`,
  },
  stepMap: {
    'INSERT_ADD': [1],
    'INSERT_SIFT_UP': [2, 13],
    'SWAP_SIFT_UP': [14, 15],
    'EXTRACT_MIN_START': [6],
    'EXTRACT_MIN_SWAP_LAST': [7],
    'EXTRACT_MIN_SIFT_DOWN': [8, 20],
    'COMPARE_CHILDREN': [21],
    'SWAP_SIFT_DOWN': [23, 24],
  },
  lineMap: {
    0: 0,
    1: 1,
    2: 2,
    3: 13,
    4: 14,
    5: 6,
    6: 7,
    7: 8,
    8: 20,
    9: 21,
    10: 23,
  },
};

// ============================================
// 2. Binary Search Tree (BST)
// ============================================
export const bstCodeData: AlgorithmCodeData = {
  code: {
    java: `Node insert(Node root, int value) {
    if (root == null)
        return new Node(value);
    if (value < root.value)
        root.left = insert(root.left, value);
    else if (value > root.value)
        root.right = insert(root.right, value);
    return root;
}

boolean search(Node root, int value) {
    if (root == null) return false;
    if (value == root.value) return true;
    if (value < root.value)
        return search(root.left, value);
    return search(root.right, value);
}

Node delete(Node root, int value) {
    if (root == null) return null;
    if (value < root.value) root.left = delete(root.left, value);
    else if (value > root.value) root.right = delete(root.right, value);
    else {
        if (root.left == null) return root.right;
        if (root.right == null) return root.left;
        Node successor = findMin(root.right);
        root.value = successor.value;
        root.right = delete(root.right, successor.value);
    }
    return root;
}`,
    python: `def insert(root, value):
    if not root:
        return Node(value)
    if value < root.value:
        root.left = insert(root.left, value)
    elif value > root.value:
        root.right = insert(root.right, value)
    return root

def search(root, value):
    if not root:
        return False
    if value == root.value:
        return True
    return search(root.left if value < root.value else root.right, value)

def delete(root, value):
    if not root:
        return None
    if value < root.value:
        root.left = delete(root.left, value)
    elif value > root.value:
        root.right = delete(root.right, value)
    else:
        if not root.left: return root.right
        if not root.right: return root.left
        succ = find_min(root.right)
        root.value = succ.value
        root.right = delete(root.right, succ.value)
    return root`,
    cpp: `Node* insert(Node* root, int value) {
    if (!root) return new Node(value);
    if (value < root->value)
        root->left = insert(root->left, value);
    else if (value > root->value)
        root->right = insert(root->right, value);
    return root;
}

bool search(Node* root, int value) {
    if (!root) return false;
    if (value == root->value) return true;
    return search(value < root->value ? root->left : root->right, value);
}

Node* remove(Node* root, int value) {
    if (!root) return nullptr;
    if (value < root->value) root->left = remove(root->left, value);
    else if (value > root->value) root->right = remove(root->right, value);
    else {
        if (!root->left) return root->right;
        if (!root->right) return root->left;
        Node* succ = findMin(root->right);
        root->value = succ->value;
        root->right = remove(root->right, succ->value);
    }
    return root;
}`,
  },
  lineMap: {
    0: 2,   // root is null -> create node
    1: 0,   // start insert
    2: 3,   // compare left
    3: 4,   // go left
    4: 5,   // compare right
    5: 6,   // go right
    6: 12,  // start search
    7: 13,  // check null
    8: 14,  // found!
    9: 15,  // search left
    10: 16, // search right
    11: 19, // start delete
    12: 24, // leaf delete
    13: 25, // one child
    14: 26, // two children find min
  },
};

// ============================================
// 3. AVL Tree (Self-Balancing with Rotations)
// ============================================
export const avlCodeData: AlgorithmCodeData = {
  code: {
    java: `Node insert(Node node, int key) {
    if (node == null) return new Node(key);
    if (key < node.key) node.left = insert(node.left, key);
    else if (key > node.key) node.right = insert(node.right, key);
    else return node;

    updateHeight(node);
    int balance = getBalance(node);

    // LL Rotation
    if (balance > 1 && key < node.left.key)
        return rightRotate(node);
    // RR Rotation
    if (balance < -1 && key > node.right.key)
        return leftRotate(node);
    // LR Rotation
    if (balance > 1 && key > node.left.key) {
        node.left = leftRotate(node.left);
        return rightRotate(node);
    }
    // RL Rotation
    if (balance < -1 && key < node.right.key) {
        node.right = rightRotate(node.right);
        return leftRotate(node);
    }
    return node;
}`,
    python: `def insert(node, key):
    if not node:
        return Node(key)
    if key < node.key:
        node.left = insert(node.left, key)
    elif key > node.key:
        node.right = insert(node.right, key)
    else:
        return node

    node.height = 1 + max(h(node.left), h(node.right))
    balance = get_balance(node)

    # LL Case
    if balance > 1 and key < node.left.key:
        return right_rotate(node)
    # RR Case
    if balance < -1 and key > node.right.key:
        return left_rotate(node)
    # LR Case
    if balance > 1 and key > node.left.key:
        node.left = left_rotate(node.left)
        return right_rotate(node)
    # RL Case
    if balance < -1 and key < node.right.key:
        node.right = right_rotate(node.right)
        return left_rotate(node)
    return node`,
    cpp: `Node* insert(Node* node, int key) {
    if (!node) return new Node(key);
    if (key < node->key) node->left = insert(node->left, key);
    else if (key > node->key) node->right = insert(node->right, key);
    else return node;

    updateHeight(node);
    int balance = getBalance(node);

    if (balance > 1 && key < node->left->key) return rightRotate(node);
    if (balance < -1 && key > node->right->key) return leftRotate(node);
    if (balance > 1 && key > node->left->key) {
        node->left = leftRotate(node->left);
        return rightRotate(node);
    }
    if (balance < -1 && key < node->right->key) {
        node->right = rightRotate(node->right);
        return leftRotate(node);
    }
    return node;
}`,
  },
  lineMap: {
    0: 0,   // insert start
    1: 1,   // null check
    2: 2,   // traverse left
    3: 3,   // traverse right
    4: 6,   // update height
    5: 7,   // get balance
    6: 10,  // LL rotation
    7: 13,  // RR rotation
    8: 16,  // LR rotation
    9: 21,  // RL rotation
  },
};

// ============================================
// 4. Graph Algorithms (BFS, Dijkstra, Topo Sort)
// ============================================
export const graphBFSCodeData: AlgorithmCodeData = {
  code: {
    java: `void bfs(int start, List<List<Integer>> adj) {
    Queue<Integer> q = new LinkedList<>();
    boolean[] visited = new boolean[V];

    visited[start] = true;
    q.add(start);

    while (!q.isEmpty()) {
        int u = q.poll();
        process(u);

        for (int v : adj.get(u)) {
            if (!visited[v]) {
                visited[v] = true;
                q.add(v);
            }
        }
    }
}`,
    python: `def bfs(start, adj):
    visited = {start}
    queue = deque([start])

    while queue:
        u = queue.popleft()
        process(u)

        for v in adj[u]:
            if v not in visited:
                visited.add(v)
                queue.append(v)`,
    cpp: `void bfs(int start, const vector<vector<int>>& adj) {
    vector<bool> visited(adj.size(), false);
    queue<int> q;

    visited[start] = true;
    q.push(start);

    while (!q.empty()) {
        int u = q.front(); q.pop();
        process(u);

        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}`,
  },
  lineMap: {
    0: 4,   // enqueue start
    1: 5,
    2: 7,   // while queue not empty
    3: 8,   // dequeue
    4: 11,  // examine neighbor
    5: 12,  // if not visited
    6: 13,  // mark visited & enqueue
  },
};

export const graphDijkstraCodeData: AlgorithmCodeData = {
  code: {
    java: `int[] dijkstra(int start, List<List<Edge>> graph, int V) {
    int[] dist = new int[V];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[start] = 0;

    PriorityQueue<Node> pq = new PriorityQueue<>(Comparator.comparingInt(n -> n.dist));
    pq.add(new Node(start, 0));

    while (!pq.isEmpty()) {
        Node curr = pq.poll();
        int u = curr.id;

        if (curr.dist > dist[u]) continue;

        for (Edge e : graph.get(u)) {
            int v = e.target;
            int newDist = dist[u] + e.weight;
            if (newDist < dist[v]) {
                dist[v] = newDist;
                pq.add(new Node(v, newDist));
            }
        }
    }
    return dist;
}`,
    python: `def dijkstra(start, graph):
    dist = {u: float('inf') for u in graph}
    dist[start] = 0
    pq = [(0, start)]

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue

        for v, weight in graph[u]:
            new_dist = dist[u] + weight
            if new_dist < dist[v]:
                dist[v] = new_dist
                heapq.heappush(pq, (new_dist, v))
    return dist`,
    cpp: `vector<int> dijkstra(int start, const vector<vector<pair<int,int>>>& adj) {
    vector<int> dist(adj.size(), INT_MAX);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;

        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
  },
  lineMap: {
    0: 3,   // init distances
    1: 6,   // pq insert
    2: 9,   // poll min
    3: 14,  // examine edge
    4: 16,  // relax edge
    5: 17,  // update distance
  },
};

// ============================================
// 5. Red-Black Tree Code Data
// ============================================
export const redBlackCodeData: AlgorithmCodeData = {
  code: {
    java: `void insert(int key) {
    Node node = new Node(key, RED);
    bstInsert(node);

    while (node != root && node.parent.color == RED) {
        Node uncle = getUncle(node);
        if (uncle != null && uncle.color == RED) {
            // Case 1: Uncle is RED -> Recolor
            node.parent.color = BLACK;
            uncle.color = BLACK;
            node.parent.parent.color = RED;
            node = node.parent.parent;
        } else {
            // Case 2 & 3: Uncle is BLACK -> Rotate
            if (isLeftChild(node) != isLeftChild(node.parent)) {
                node = node.parent;
                rotate(node);
            }
            node.parent.color = BLACK;
            node.parent.parent.color = RED;
            rotate(node.parent.parent);
        }
    }
    root.color = BLACK;
}`,
    python: `def insert(self, key):
    node = Node(key, color=RED)
    self.bst_insert(node)

    while node != self.root and node.parent.color == RED:
        uncle = self.get_uncle(node)
        if uncle and uncle.color == RED:
            # Case 1: Recolor
            node.parent.color = BLACK
            uncle.color = BLACK
            node.parent.parent.color = RED
            node = node.parent.parent
        else:
            # Case 2/3: Rotate
            if is_left(node) != is_left(node.parent):
                node = node.parent
                self.rotate(node)
            node.parent.color = BLACK
            node.parent.parent.color = RED
            self.rotate(node.parent.parent)
    self.root.color = BLACK`,
    cpp: `void insert(int key) {
    Node* node = new Node(key, RED);
    bstInsert(node);

    while (node != root && node->parent->color == RED) {
        Node* uncle = getUncle(node);
        if (uncle && uncle->color == RED) {
            node->parent->color = BLACK;
            uncle->color = BLACK;
            node->parent->parent->color = RED;
            node = node->parent->parent;
        } else {
            if (isLeftChild(node) != isLeftChild(node->parent)) {
                node = node->parent;
                rotate(node);
            }
            node->parent->color = BLACK;
            node->parent->parent->color = RED;
            rotate(node->parent->parent);
        }
    }
    root->color = BLACK;
}`,
  },
  lineMap: {
    0: 1,   // new RED node
    1: 4,   // check parent RED
    2: 7,   // case 1 recolor
    3: 13,  // case 2/3 rotation
    4: 21,  // root recolored to BLACK
  },
};

// ============================================
// 6. B-Tree Code Data
// ============================================
export const bTreeCodeData: AlgorithmCodeData = {
  code: {
    java: `void insert(int key) {
    Node r = root;
    if (r.keys.size() == 2 * T - 1) {
        Node s = new Node(false); // new root
        root = s;
        s.children.add(r);
        splitChild(s, 0, r);
        insertNonFull(s, key);
    } else {
        insertNonFull(r, key);
    }
}

void splitChild(Node parent, int i, Node y) {
    Node z = new Node(y.isLeaf);
    int mid = y.keys.get(T - 1);
    // Move upper half of keys & children to z
    for (int j = 0; j < T - 1; j++) z.keys.add(y.keys.remove(T));
    parent.keys.add(i, mid);
    parent.children.add(i + 1, z);
}`,
    python: `def insert(self, key):
    r = self.root
    if len(r.keys) == 2 * self.T - 1:
        s = Node(is_leaf=False)
        self.root = s
        s.children.append(r)
        self.split_child(s, 0, r)
        self.insert_non_full(s, key)
    else:
        self.insert_non_full(r, key)

def split_child(self, parent, i, y):
    z = Node(is_leaf=y.is_leaf)
    mid = y.keys[self.T - 1]
    z.keys = y.keys[self.T:]
    y.keys = y.keys[:self.T - 1]
    parent.keys.insert(i, mid)
    parent.children.insert(i + 1, z)`,
    cpp: `void insert(int key) {
    if (root->keys.size() == 2 * T - 1) {
        Node* s = new Node(false);
        s->children.push_back(root);
        root = s;
        splitChild(s, 0, s->children[0]);
        insertNonFull(s, key);
    } else {
        insertNonFull(root, key);
    }
}

void splitChild(Node* parent, int i, Node* y) {
    Node* z = new Node(y->isLeaf);
    int mid = y->keys[T - 1];
    parent->keys.insert(parent->keys.begin() + i, mid);
    parent->children.insert(parent->children.begin() + i + 1, z);
}`,
  },
  lineMap: {
    0: 1,  // check root full
    1: 4,  // split child
    2: 9,  // insert non-full
    3: 13, // splitChild function
    4: 17, // promote median key to parent
  },
};

// ============================================
// 7. Unit 2 — Hashing: Separate Chaining
// ============================================
export const hashSeparateChainingCodeData: AlgorithmCodeData = {
  code: {
    java: `void insert(int key, String value) {
    int index = hash(key); // key % capacity
    Node head = buckets[index];

    // Search if key already exists in chain
    while (head != null) {
        if (head.key == key) {
            head.value = value;
            return;
        }
        head = head.next;
    }

    // Insert new node at head of chain
    Node node = new Node(key, value);
    node.next = buckets[index];
    buckets[index] = node;
    size++;
}`,
    python: `def insert(self, key, value):
    index = self.hash(key)
    chain = self.buckets[index]

    for entry in chain:
        if entry.key == key:
            entry.value = value
            return

    # Add to chain for this bucket
    chain.append(Entry(key, value))
    self.size += 1`,
    cpp: `void insert(int key, string value) {
    int index = hash(key);
    for (auto& entry : buckets[index]) {
        if (entry.key == key) {
            entry.value = value;
            return;
        }
    }
    buckets[index].push_back({key, value});
    size++;
}`,
  },
  lineMap: {
    0: 1,  // hash calculation
    2: 5,  // collision search chain
    3: 15, // insert into bucket chain
  },
};

// ============================================
// 8. Unit 2 — Hashing: Linear Probing
// ============================================
export const hashLinearProbingCodeData: AlgorithmCodeData = {
  code: {
    java: `void insert(int key, String value) {
    int index = hash(key); // h(k) = key % capacity
    int i = 0;

    // Linear probing: (index + i) % capacity
    while (table[(index + i) % capacity] != null) {
        if (table[(index + i) % capacity].key == key) {
            table[(index + i) % capacity].value = value;
            return;
        }
        i++; // step size = 1
    }

    table[(index + i) % capacity] = new Entry(key, value);
    size++;
}`,
    python: `def insert(self, key, value):
    index = self.hash(key)
    i = 0

    while self.table[(index + i) % self.capacity] is not None:
        if self.table[(index + i) % self.capacity].key == key:
            self.table[(index + i) % self.capacity].value = value
            return
        i += 1  # linear probe

    self.table[(index + i) % self.capacity] = Entry(key, value)
    self.size += 1`,
    cpp: `void insert(int key, string value) {
    int index = hash(key);
    int i = 0;

    while (table[(index + i) % capacity].occupied) {
        if (table[(index + i) % capacity].key == key) {
            table[(index + i) % capacity].value = value;
            return;
        }
        i++; // linear probe
    }

    table[(index + i) % capacity] = {key, value, true};
    size++;
}`,
  },
  lineMap: {
    0: 1,  // hash
    2: 5,  // duplicate
    4: 9,  // probe step
    7: 12, // insert into open slot
  },
};

// ============================================
// 9. Unit 2 — Hashing: Quadratic Probing
// ============================================
export const hashQuadraticProbingCodeData: AlgorithmCodeData = {
  code: {
    java: `void insert(int key, String value) {
    int index = hash(key); // h(k) = key % capacity
    int i = 0;

    // Quadratic probing: (index + i²) % capacity
    while (table[(index + i * i) % capacity] != null) {
        i++;
        if (i >= capacity) return; // Table full
    }

    table[(index + i * i) % capacity] = new Entry(key, value);
    size++;
}`,
    python: `def insert(self, key, value):
    index = self.hash(key)
    i = 0

    while self.table[(index + i * i) % self.capacity] is not None:
        i += 1
        if i >= self.capacity:
            return  # full

    self.table[(index + i * i) % self.capacity] = Entry(key, value)
    self.size += 1`,
    cpp: `void insert(int key, string value) {
    int index = hash(key);
    int i = 0;

    while (table[(index + i * i) % capacity].occupied) {
        i++;
        if (i >= capacity) return;
    }

    table[(index + i * i) % capacity] = {key, value, true};
    size++;
}`,
  },
  lineMap: {
    0: 1,  // hash
    3: 5,  // probe i²
    5: 6,  // table full
    6: 9,  // insert
  },
};

// ============================================
// 10. Unit 2 — Hashing: Double Hashing
// ============================================
export const hashDoubleHashingCodeData: AlgorithmCodeData = {
  code: {
    java: `void insert(int key, String value) {
    int h1 = key % capacity;
    int h2 = 1 + (key % (capacity - 1)); // Second hash
    int i = 0;

    // Double hashing: (h1 + i * h2) % capacity
    while (table[(h1 + i * h2) % capacity] != null) {
        i++;
        if (i >= capacity) return; // Table full
    }

    table[(h1 + i * h2) % capacity] = new Entry(key, value);
    size++;
}`,
    python: `def insert(self, key, value):
    h1 = key % self.capacity
    h2 = 1 + (key % (self.capacity - 1))
    i = 0

    while self.table[(h1 + i * h2) % self.capacity] is not None:
        i += 1
        if i >= self.capacity:
            return

    self.table[(h1 + i * h2) % self.capacity] = Entry(key, value)
    self.size += 1`,
    cpp: `void insert(int key, string value) {
    int h1 = key % capacity;
    int h2 = 1 + (key % (capacity - 1));
    int i = 0;

    while (table[(h1 + i * h2) % capacity].occupied) {
        i++;
        if (i >= capacity) return;
    }

    table[(h1 + i * h2) % capacity] = {key, value, true};
    size++;
}`,
  },
  lineMap: {
    0: 1,  // h1 & h2
    3: 6,  // probe step h1 + i*h2
    5: 7,  // full
    6: 10, // insert
  },
};

