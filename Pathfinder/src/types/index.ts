export interface Document {
  id: string;
  title: string;
  description: string;
  raw_text_preview: string;
  total_characters: number;
  created_at: string;
}

export interface LearningObjective {
  id: string;
  topic_id: string;
  description: string;
  mastered: boolean;
}

export interface Topic {
  id: string;
  document_id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_minutes: number;
  order_index: number;
  prerequisites: string[];
  status: 'locked' | 'available' | 'in_progress' | 'needs_review' | 'mastered';
  source_chunk: string;
  objectives?: LearningObjective[];
  attemptsCount?: number;
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
  due_date: string;
  interval_days: number;
  status: 'pending' | 'completed';
  attempt_number: number;
  relativeLabel?: string;
  created_at: string;
}

export interface UserStats {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_mastered: number;
  total_study_minutes: number;
  total_sessions: number;
  total_topics?: number;
  mastered_topics?: number;
  progress_percent?: number;
}

export interface TodayPlanItem {
  id: string;
  time: string;
  topicId?: string;
  topicTitle: string;
  type: 'study' | 'break' | 'feynman';
  durationMinutes: number;
  status: 'locked' | 'upcoming' | 'in_progress' | 'needs_review' | 'mastered';
}

export interface DashboardData {
  stats: UserStats;
  todayPlan: TodayPlanItem[];
  topics: Topic[];
  activeDocument: Document | null;
  allDocuments?: { id: string; title: string; description: string; topicsCount: number; isActive: boolean }[];
  upcomingReviews: Revision[];
}

export interface AiSettings {
  provider: 'openai' | 'gemini' | 'openrouter' | 'custom';
  model: string;
  base_url: string;
  api_key_masked?: string;
  is_configured: boolean;
  default_session_minutes: number;
  default_break_minutes: number;
}
