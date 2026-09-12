import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Document {
  id: string;
  title: string;
  description: string;
  raw_text_preview: string;
  total_characters: number;
  created_at: string;
}

export interface Topic {
  id: string;
  document_id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_minutes: number;
  order_index: number;
  prerequisites: string[]; // Topic IDs
  status: 'locked' | 'available' | 'in_progress' | 'needs_review' | 'mastered';
  source_chunk: string;
}

export interface LearningObjective {
  id: string;
  topic_id: string;
  description: string;
  mastered: boolean;
}

export interface StudySession {
  id: string;
  topic_id: string;
  started_at: string;
  completed_at?: string;
  duration_minutes: number;
  notes?: string;
}

export interface FeynmanAttempt {
  id: string;
  topic_id: string;
  student_explanation: string;
  score: number;
  passed: boolean;
  strengths: string[];
  missing_concepts: string[];
  incorrect_concepts: string[];
  feedback: string;
  retry_prompt?: string;
  created_at: string;
}

export interface Revision {
  id: string;
  topic_id: string;
  topic_title: string;
  due_date: string; // YYYY-MM-DD
  interval_days: number;
  status: 'pending' | 'completed';
  attempt_number: number;
  created_at: string;
}

export interface UserStats {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_mastered: number;
  total_study_minutes: number;
  total_sessions: number;
}

export interface AiConfig {
  provider: 'openai' | 'gemini' | 'openrouter' | 'custom';
  model: string;
  base_url: string;
  api_key: string;
  default_session_minutes: number;
  default_break_minutes: number;
}

export interface DatabaseSchema {
  active_document_id?: string;
  documents: Document[];
  topics: Topic[];
  learning_objectives: LearningObjective[];
  study_sessions: StudySession[];
  feynman_attempts: FeynmanAttempt[];
  revisions: Revision[];
  user_stats: UserStats;
  ai_config: AiConfig;
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'learnloop.json');

const INITIAL_DEMO_DATA: DatabaseSchema = {
  active_document_id: 'doc-demo-ds',
  documents: [
    {
      id: 'doc-demo-ds',
      title: 'Introduction to Data Structures',
      description: 'Foundational computer science data structures: Arrays, Linked Lists, Stacks, Queues, and Binary Search Trees.',
      raw_text_preview: 'A data structure is a specialized format for organizing, processing, retrieving, and storing data...',
      total_characters: 5400,
      created_at: new Date().toISOString(),
    },
  ],
  topics: [
    {
      id: 'topic-arrays',
      document_id: 'doc-demo-ds',
      title: 'Arrays & Contiguous Memory',
      description: 'Sequential contiguous memory blocks providing O(1) random access by index.',
      difficulty: 'beginner',
      estimated_minutes: 25,
      order_index: 0,
      prerequisites: [],
      status: 'available',
      source_chunk: 'An array is a collection of elements identified by index or key, stored in contiguous memory locations. Because memory addresses are contiguous, accessing any element given its index takes O(1) constant time: Address = BaseAddress + (Index * ElementSize). However, static arrays have a fixed capacity allocated upfront. Inserting or deleting elements at arbitrary positions requires shifting subsequent elements, incurring an O(n) linear time penalty. Dynamic arrays mitigate fixed capacity by allocating a new larger buffer (typically 2x) and copying elements over when full, achieving amortized O(1) insertions.',
    },
    {
      id: 'topic-linked-lists',
      document_id: 'doc-demo-ds',
      title: 'Linked Lists & Node Pointers',
      description: 'Linear data structure where elements (nodes) hold a value and a reference pointer to the next node.',
      difficulty: 'beginner',
      estimated_minutes: 25,
      order_index: 1,
      prerequisites: ['topic-arrays'],
      status: 'locked',
      source_chunk: "A linked list is a linear collection of data elements whose order is not given by their physical placement in memory. Instead, each element is represented as a 'Node' containing two primary components: the data payload, and a pointer (or reference) to the next node in sequence. In a singly linked list, traversal begins at the Head pointer and follows next pointers until reaching null, requiring O(n) time. Unlike arrays, nodes can be allocated anywhere in heap memory without requiring contiguous space. Inserting or deleting an element given a reference to the preceding node takes O(1) time simply by reassigning pointer references, but random access is not supported because jumping directly to the k-th index requires sequential traversal from the head.",
    },
    {
      id: 'topic-stacks',
      document_id: 'doc-demo-ds',
      title: 'Stacks & LIFO Architecture',
      description: 'Abstract data type adhering to the Last-In, First-Out (LIFO) order with push and pop operations.',
      difficulty: 'intermediate',
      estimated_minutes: 20,
      order_index: 2,
      prerequisites: ['topic-linked-lists'],
      status: 'locked',
      source_chunk: "A stack is a linear data structure that follows the Last-In, First-Out (LIFO) principle: the last element added is the first one to be removed. Key operations include 'push' (add item to top), 'pop' (remove and return item from top), and 'peek' (inspect top item without removal). All three primary operations run in O(1) constant time. Stacks can be implemented using either dynamic arrays or linked lists. Stacks are fundamental in computer science: execution call stacks manage function invocations and local variables in runtime environments, syntax parsers validate matching parentheses, and web browsers use stacks to manage forward/back page navigation and undo histories.",
    },
    {
      id: 'topic-queues',
      document_id: 'doc-demo-ds',
      title: 'Queues & FIFO Scheduling',
      description: 'First-In, First-Out (FIFO) sequential structure with enqueue at rear and dequeue at front.',
      difficulty: 'intermediate',
      estimated_minutes: 20,
      order_index: 3,
      prerequisites: ['topic-stacks'],
      status: 'locked',
      source_chunk: "A queue is an abstract data structure that operates under the First-In, First-Out (FIFO) discipline: the first element inserted is the first element extracted. Elements enter the queue at the 'rear' via an 'enqueue' operation and exit at the 'front' via a 'dequeue' operation. Both enqueue and dequeue take O(1) time when implemented with a linked list with head and tail pointers, or with a circular array buffer. Queues model real-world waiting lines and are ubiquitous in asynchronous processing: print job queues, operating system task scheduling, message brokers (like RabbitMQ/Kafka), and graph traversal algorithms like Breadth-First Search (BFS).",
    },
    {
      id: 'topic-trees',
      document_id: 'doc-demo-ds',
      title: 'Trees & Binary Search Trees',
      description: 'Hierarchical non-linear structure with a root, parent-child nodes, and sorted subtrees.',
      difficulty: 'advanced',
      estimated_minutes: 30,
      order_index: 4,
      prerequisites: ['topic-queues'],
      status: 'locked',
      source_chunk: "A tree is a non-linear hierarchical data structure consisting of nodes connected by directed edges. The topmost node is called the Root. Nodes with no children are known as Leaves. A Binary Tree restricts each node to having at most two children: left and right. A Binary Search Tree (BST) enforces the binary search invariant: for every node N, all values in its left subtree are strictly less than N's value, and all values in its right subtree are strictly greater than N's value. Under balanced conditions (like AVL or Red-Black trees), searching, insertion, and deletion run in O(log n) time. Tree traversals visit nodes in specified sequences: In-order traversal (Left, Root, Right) produces sorted order in a BST; Pre-order (Root, Left, Right) is useful for cloning or serialization; Post-order (Left, Right, Root) is used for bottom-up deletions and dependency evaluations.",
    },
  ],
  learning_objectives: [
    // Arrays
    { id: 'obj-arr-1', topic_id: 'topic-arrays', description: 'Explain how elements are stored in contiguous memory addresses', mastered: false },
    { id: 'obj-arr-2', topic_id: 'topic-arrays', description: 'Explain why index lookup is O(1) constant time using memory arithmetic', mastered: false },
    { id: 'obj-arr-3', topic_id: 'topic-arrays', description: 'Describe why insertions/deletions take O(n) time due to element shifting', mastered: false },

    // Linked Lists
    { id: 'obj-ll-1', topic_id: 'topic-linked-lists', description: 'Explain what a node is (data payload and next pointer reference)', mastered: false },
    { id: 'obj-ll-2', topic_id: 'topic-linked-lists', description: 'Explain how traversal works from head to null', mastered: false },
    { id: 'obj-ll-3', topic_id: 'topic-linked-lists', description: 'Contrast insertion/deletion efficiency vs arrays (pointer swap vs shifting)', mastered: false },
    { id: 'obj-ll-4', topic_id: 'topic-linked-lists', description: 'Explain why linked lists lack O(1) random index access', mastered: false },

    // Stacks
    { id: 'obj-stk-1', topic_id: 'topic-stacks', description: 'Explain the LIFO (Last-In First-Out) principle clearly', mastered: false },
    { id: 'obj-stk-2', topic_id: 'topic-stacks', description: 'Explain push, pop, and peek operations and their O(1) time complexity', mastered: false },
    { id: 'obj-stk-3', topic_id: 'topic-stacks', description: 'Describe practical applications like call stacks, undo history, and balanced parentheses', mastered: false },

    // Queues
    { id: 'obj-q-1', topic_id: 'topic-queues', description: 'Explain the FIFO (First-In First-Out) principle clearly', mastered: false },
    { id: 'obj-q-2', topic_id: 'topic-queues', description: 'Explain enqueue at rear and dequeue at front with O(1) complexity', mastered: false },
    { id: 'obj-q-3', topic_id: 'topic-queues', description: 'Describe real-world use cases like task scheduling and Breadth-First Search (BFS)', mastered: false },

    // Trees
    { id: 'obj-tr-1', topic_id: 'topic-trees', description: 'Explain tree terminology: Root, Parent, Child, Leaf, and Height', mastered: false },
    { id: 'obj-tr-2', topic_id: 'topic-trees', description: 'Explain the BST ordering invariant (left < root < right)', mastered: false },
    { id: 'obj-tr-3', topic_id: 'topic-trees', description: 'Contrast In-order, Pre-order, and Post-order traversals and search complexity', mastered: false },
  ],
  study_sessions: [],
  feynman_attempts: [],
  revisions: [
    {
      id: 'rev-sample-1',
      topic_id: 'topic-arrays',
      topic_title: 'Arrays & Contiguous Memory',
      due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      interval_days: 1,
      status: 'pending',
      attempt_number: 1,
      created_at: new Date().toISOString(),
    },
  ],
  user_stats: {
    current_streak: 3,
    longest_streak: 5,
    last_active_date: new Date().toISOString().split('T')[0],
    total_mastered: 0,
    total_study_minutes: 45,
    total_sessions: 2,
  },
  ai_config: {
    provider: (process.env.AI_PROVIDER as any) || 'openai',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    base_url: process.env.AI_BASE_URL || '',
    api_key: process.env.AI_API_KEY || '',
    default_session_minutes: 25,
    default_break_minutes: 5,
  },
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadData();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge with defaults in case of new schema keys
        return {
          ...INITIAL_DEMO_DATA,
          ...parsed,
          ai_config: {
            ...INITIAL_DEMO_DATA.ai_config,
            ...(parsed.ai_config || {}),
            // Ensure env takes priority if provided
            api_key: process.env.AI_API_KEY || parsed.ai_config?.api_key || '',
            provider: (process.env.AI_PROVIDER as any) || parsed.ai_config?.provider || 'openai',
            model: process.env.AI_MODEL || parsed.ai_config?.model || 'gpt-4o-mini',
            base_url: process.env.AI_BASE_URL || parsed.ai_config?.base_url || '',
          },
        };
      }
    } catch (err) {
      console.warn('Failed to load existing db, initializing defaults:', err);
    }

    this.saveData(INITIAL_DEMO_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
  }

  public saveData(customData?: DatabaseSchema): void {
    try {
      const dataToSave = customData || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  public resetToDemo(): DatabaseSchema {
    this.data = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
    this.data.active_document_id = 'doc-demo-ds';
    this.saveData();
    return this.data;
  }

  public wipeLearningProgress(): void {
    // Keep document and topics structure, but reset topic statuses, objectives, sessions, feynman attempts, and revisions
    const activeTopics = this.getTopics();
    activeTopics.forEach((topic, idx) => {
      topic.status = idx === 0 ? 'available' : 'locked';
    });
    this.data.learning_objectives.forEach((obj) => {
      obj.mastered = false;
    });
    this.data.study_sessions = [];
    this.data.feynman_attempts = [];
    this.data.revisions = [];
    this.data.user_stats = {
      current_streak: 1,
      longest_streak: Math.max(1, this.data.user_stats.longest_streak),
      last_active_date: new Date().toISOString().split('T')[0],
      total_mastered: 0,
      total_study_minutes: 0,
      total_sessions: 0,
    };
    this.saveData();
  }

  // Getters
  public getActiveDocumentId(): string {
    if (this.data.active_document_id) {
      return this.data.active_document_id;
    }
    if (this.data.documents.length > 0) {
      return this.data.documents[this.data.documents.length - 1].id;
    }
    return 'doc-demo-ds';
  }

  public setActiveDocumentId(id: string): void {
    this.data.active_document_id = id;
    const docTopics = this.data.topics.filter((t) => t.document_id === id);
    if (docTopics.length > 0 && docTopics.every((t) => t.status === 'locked')) {
      docTopics[0].status = 'available';
    }
    this.saveData();
  }

  public getActiveDocument(): Document | undefined {
    const activeId = this.getActiveDocumentId();
    return this.data.documents.find((d) => d.id === activeId) || this.data.documents[0];
  }

  public getDocuments(): Document[] {
    return this.data.documents;
  }

  public getDocument(id: string): Document | undefined {
    return this.data.documents.find((d) => d.id === id);
  }

  public getTopics(documentId?: string): Topic[] {
    const targetDocId = documentId || this.getActiveDocumentId();
    if (targetDocId) {
      const filtered = this.data.topics.filter((t) => t.document_id === targetDocId);
      if (filtered.length > 0) {
        return filtered;
      }
    }
    return this.data.topics;
  }

  public getTopic(id: string): Topic | undefined {
    return this.data.topics.find((t) => t.id === id);
  }

  public getObjectivesForTopic(topicId: string): LearningObjective[] {
    return this.data.learning_objectives.filter((o) => o.topic_id === topicId);
  }

  public getFeynmanAttempts(topicId?: string): FeynmanAttempt[] {
    if (topicId) {
      return this.data.feynman_attempts.filter((a) => a.topic_id === topicId);
    }
    return this.data.feynman_attempts;
  }

  public getStudySessions(topicId?: string): StudySession[] {
    if (topicId) {
      return this.data.study_sessions.filter((s) => s.topic_id === topicId);
    }
    return this.data.study_sessions;
  }

  public getRevisions(status?: 'pending' | 'completed'): Revision[] {
    if (status) {
      return this.data.revisions.filter((r) => r.status === status);
    }
    return this.data.revisions;
  }

  public getUserStats(): UserStats {
    return this.data.user_stats;
  }

  public getAiConfig(): AiConfig {
    return this.data.ai_config;
  }

  // Setters / Mutators
  public updateAiConfig(config: Partial<AiConfig>): AiConfig {
    this.data.ai_config = {
      ...this.data.ai_config,
      ...config,
    };
    this.saveData();
    return this.data.ai_config;
  }

  public addDocument(doc: Document, topics: Topic[], objectives: LearningObjective[]): void {
    this.data.documents.push(doc);
    this.data.topics.push(...topics);
    this.data.learning_objectives.push(...objectives);
    this.data.active_document_id = doc.id;
    this.saveData();
  }

  public recordStudySession(session: StudySession): void {
    this.data.study_sessions.push(session);
    this.data.user_stats.total_sessions += 1;
    this.data.user_stats.total_study_minutes += session.duration_minutes;
    this.updateStreak();
    this.saveData();
  }

  public recordFeynmanAttempt(attempt: FeynmanAttempt): void {
    this.data.feynman_attempts.push(attempt);
    const topic = this.getTopic(attempt.topic_id);

    if (attempt.passed && topic) {
      topic.status = 'mastered';
      // Mark topic objectives as mastered
      this.data.learning_objectives
        .filter((o) => o.topic_id === attempt.topic_id)
        .forEach((o) => (o.mastered = true));

      // Count total mastered
      this.data.user_stats.total_mastered = this.data.topics.filter(
        (t) => t.status === 'mastered'
      ).length;

      // Unlock subsequent topics whose prerequisites are now satisfied
      this.unlockEligibleTopics();

      // Schedule adaptive spaced repetition
      this.scheduleAdaptiveRevision(topic, attempt.score, true);

      // Meaningful learning action -> update streak!
      this.updateStreak();
    } else if (topic && topic.status !== 'mastered') {
      topic.status = 'needs_review';
      // Schedule early revision for struggle
      this.scheduleAdaptiveRevision(topic, attempt.score, false);
      this.updateStreak();
    }

    this.saveData();
  }

  private unlockEligibleTopics(): void {
    const masteredIds = new Set(
      this.data.topics.filter((t) => t.status === 'mastered').map((t) => t.id)
    );

    this.data.topics.forEach((topic) => {
      if (topic.status === 'locked') {
        const allPrereqsMet = topic.prerequisites.every((pid) => masteredIds.has(pid));
        if (allPrereqsMet) {
          topic.status = 'available';
        }
      }
    });
  }

  private scheduleAdaptiveRevision(topic: Topic, score: number, passed: boolean): void {
    const today = new Date();
    const intervals = passed && score >= 80 ? [3, 7] : [1, 3, 7];

    intervals.forEach((days, idx) => {
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + days);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      // Don't duplicate pending revision for same topic on same day
      const existing = this.data.revisions.find(
        (r) => r.topic_id === topic.id && r.due_date === dueDateStr && r.status === 'pending'
      );

      if (!existing) {
        this.data.revisions.push({
          id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          topic_id: topic.id,
          topic_title: topic.title,
          due_date: dueDateStr,
          interval_days: days,
          status: 'pending',
          attempt_number: idx + 1,
          created_at: new Date().toISOString(),
        });
      }
    });
  }

  public completeRevision(revisionId: string): void {
    const rev = this.data.revisions.find((r) => r.id === revisionId);
    if (rev) {
      rev.status = 'completed';
      this.updateStreak();
      this.saveData();
    }
  }

  private updateStreak(): void {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = this.data.user_stats.last_active_date;

    if (!lastActive) {
      this.data.user_stats.current_streak = 1;
      this.data.user_stats.longest_streak = 1;
      this.data.user_stats.last_active_date = today;
      return;
    }

    if (lastActive === today) {
      // Already active today, maintain current streak
      return;
    }

    const lastDate = new Date(lastActive);
    const currentDate = new Date(today);
    const diffDays = Math.round(
      (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)
    );

    if (diffDays === 1) {
      // Active yesterday, increment streak
      this.data.user_stats.current_streak += 1;
      if (this.data.user_stats.current_streak > this.data.user_stats.longest_streak) {
        this.data.user_stats.longest_streak = this.data.user_stats.current_streak;
      }
    } else if (diffDays > 1) {
      // Streak broken, reset to 1
      this.data.user_stats.current_streak = 1;
    }

    this.data.user_stats.last_active_date = today;
  }
}

export const db = new Database();
