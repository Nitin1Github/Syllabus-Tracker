export type ProgressState = 'none' | 'read' | 'practiced' | 'revised';

export interface SubTopic {
  id: string;
  title: string;
  state: ProgressState;
  subtopics?: SubTopic[];
}

export interface Topic {
  id: string;
  title: string;
  subtopics: SubTopic[];
}

export interface Subject {
  id: string;
  title: string;
  topics: Topic[];
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
}
