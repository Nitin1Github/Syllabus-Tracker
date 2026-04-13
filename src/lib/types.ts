export type ProgressState = 'none' | 'read' | 'practiced' | 'revised';

export interface SubTopic {
  id: string;
  title: string;
  state: ProgressState;
  isStarred?: boolean;
  isExpanded?: boolean;
  subtopics?: SubTopic[];
}

export interface Topic {
  id: string;
  title: string;
  isExpanded?: boolean;
  subtopics: SubTopic[];
}

export interface Subject {
  id: string;
  title: string;
  isExpanded?: boolean;
  topics: Topic[];
}

export interface MockTestCategory {
  name: string;
  maxMarks: number;
  targetScore: number;
}

export interface TargetExam {
  name: string;
  date: string;
}

export interface ExamData {
  id: string;
  targetExam: TargetExam;
  syllabus: Subject[];
}

export interface AppData {
  exams: ExamData[];
  activeExamId: string | null;
  events?: AppEvent[];
}

export interface AppEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  reminderEnabled: boolean;
  notificationId?: number;
}

export interface MockTest {
  id: string;
  testName: string;
  score: number;
  totalMarks: number;
  date: string;
  examCategory?: string;
}
