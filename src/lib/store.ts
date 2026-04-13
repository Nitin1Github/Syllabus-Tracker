import { create } from 'zustand';
import { AppData, ProgressState, Subject, Topic, SubTopic, ExamData, AppEvent, MockTest } from '@/lib/types';

interface AppState {
    data: AppData | null;
    activeExamId: string | null;
    loading: boolean;
    themeColor: string;
    themeImage: string;
    userName: string;
    userTargetExam: string;
    userContact: string;
    events: AppEvent[];
    mockTests: MockTest[];

    addEvent: (event: Omit<AppEvent, 'id'>) => void;
    deleteEvent: (eventId: string) => void;
    toggleEventReminder: (eventId: string, enabled: boolean, scheduledId?: number) => void;

    addMockTest: (test: Omit<MockTest, 'id'>) => void;

    setThemeColor: (color: string) => void;
    setThemeImage: (image: string) => void;
    setUserName: (name: string) => void;
    setProfileData: (name: string, targetExam: string, contact: string) => void;
    setData: (data: AppData) => void;
    fetchData: () => Promise<void>;

    // Multiple Exams
    getActiveExam: () => ExamData | null;
    setActiveExam: (examId: string) => void;
    addExams: (exams: { name: string, date: string }[]) => void;
    importSyllabus: (examTemplate: ExamData) => void;
    importSyllabusToExam: (examId: string, examTemplate: ExamData) => void;
    updateExam: (examId: string, name: string, date: string) => void;
    deleteExam: (examId: string) => void;

    // Syllabus modifications
    updateSubtopicState: (subjectId: string, topicId: string, subTopicId: string, newState: ProgressState) => void;
    toggleSubtopicStar: (subjectId: string, topicId: string, subTopicId: string) => void;

    addSubject: (title: string) => void;
    updateSubject: (subjectId: string, title: string) => void;
    deleteSubject: (subjectId: string) => void;

    addTopic: (subjectId: string, title: string) => void;
    updateTopic: (subjectId: string, topicId: string, title: string) => void;
    deleteTopic: (subjectId: string, topicId: string) => void;

    addSubtopic: (subjectId: string, topicId: string, title: string, parentSubtopicId?: string) => void;
    updateSubtopic: (subjectId: string, topicId: string, subTopicId: string, title: string) => void;
    deleteSubtopic: (subjectId: string, topicId: string, subTopicId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    data: null,
    activeExamId: null,
    loading: true,
    themeColor: 'indigo',
    themeImage: '',
    userName: 'Aspirant',
    userTargetExam: '',
    userContact: '',
    events: [],
    mockTests: [],

    setThemeColor: (color) => {
        set({ themeColor: color });
        if (typeof window !== 'undefined') localStorage.setItem('themeColor', color);
    },

    setThemeImage: (image) => {
        set({ themeImage: image });
        if (typeof window !== 'undefined') localStorage.setItem('themeImage', image);
    },

    setUserName: (name: string) => {
        set({ userName: name });
        if (typeof window !== 'undefined') localStorage.setItem('userName', name);
    },

    setProfileData: (name: string, targetExam: string, contact: string) => {
        set({ userName: name || 'Aspirant', userTargetExam: targetExam, userContact: contact });
        if (typeof window !== 'undefined') {
            localStorage.setItem('userName', name || 'Aspirant');
            localStorage.setItem('userTargetExam', targetExam);
            localStorage.setItem('userContact', contact);
        }
    },

    setData: (newData: AppData) => {
        set({ data: newData, activeExamId: newData.activeExamId || null, loading: false });
    },

    fetchData: async () => {
        set({ loading: true });
        if (typeof window !== 'undefined') {
            const savedColor = localStorage.getItem('themeColor');
            const savedImage = localStorage.getItem('themeImage');
            const savedName = localStorage.getItem('userName');
            const savedTarget = localStorage.getItem('userTargetExam');
            const savedContact = localStorage.getItem('userContact');
            const savedEvents = localStorage.getItem('events');
            const savedMockTests = localStorage.getItem('mockTests');
            set({
                themeColor: savedColor || 'indigo',
                themeImage: savedImage || '',
                userName: savedName || 'Aspirant',
                userTargetExam: savedTarget || '',
                userContact: savedContact || '',
                events: savedEvents ? JSON.parse(savedEvents) : [],
                mockTests: savedMockTests ? JSON.parse(savedMockTests) : []
            });
            // Note: data loading is shifted to page.tsx using useEffect
        } else {
            set({ loading: false });
        }
    },

    getActiveExam: () => {
        const { data, activeExamId } = get();
        if (!data || !activeExamId) return null;
        return data.exams.find(e => e.id === activeExamId) || null;
    },

    setActiveExam: (examId) => {
        const { data } = get();
        set({ activeExamId: examId });
        if (!data) return;
        const newData = { ...data, activeExamId: examId };
        set({ data: newData });
    },

    addExams: (exams) => {
        const { data, activeExamId } = get();
        let newData: AppData;

        const newExams: ExamData[] = exams.map(e => ({
            id: `exam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            targetExam: { name: e.name, date: e.date },
            syllabus: []
        }));

        if (!data) {
            const newActiveId = newExams[0]?.id || null;
            newData = { exams: newExams, activeExamId: newActiveId };
            set({ data: newData, activeExamId: newActiveId });
        } else {
            newData = { ...data, exams: [...data.exams, ...newExams] };
            if (!activeExamId && newExams.length > 0) {
                newData.activeExamId = newExams[0].id;
                set({ activeExamId: newData.activeExamId });
            }
            set({ data: newData });
        }
    },

    importSyllabus: (examTemplate) => {
        const { data } = get();
        let newData: AppData;

        const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const newExam: ExamData = {
            id: generateId('exam'),
            targetExam: { ...examTemplate.targetExam },
            syllabus: examTemplate.syllabus.map(subject => ({
                id: generateId('subj'),
                title: subject.title,
                topics: subject.topics.map(topic => ({
                    id: generateId('top'),
                    title: topic.title,
                    subtopics: topic.subtopics.map(sub => ({
                        id: generateId('sub'),
                        title: sub.title,
                        state: sub.state || 'none'
                    }))
                }))
            }))
        };

        if (!data) {
            newData = { exams: [newExam], activeExamId: newExam.id };
        } else {
            newData = { ...data, exams: [...data.exams, newExam], activeExamId: newExam.id };
        }

        set({ data: newData, activeExamId: newExam.id });
    },

    importSyllabusToExam: (examId, examTemplate) => {
        const { data } = get();
        if (!data) return;

        const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const newSyllabus = examTemplate.syllabus.map(subject => ({
            id: generateId('subj'),
            title: subject.title,
            topics: subject.topics.map(topic => ({
                id: generateId('top'),
                title: topic.title,
                subtopics: topic.subtopics.map(sub => ({
                    id: generateId('sub'),
                    title: sub.title,
                    state: sub.state || 'none'
                }))
            }))
        }));

        const updatedExams = data.exams.map(exam => {
            if (exam.id !== examId) return exam;
            return {
                ...exam,
                syllabus: [...exam.syllabus, ...newSyllabus]
            };
        });

        const newData = { ...data, exams: updatedExams };
        set({ data: newData });
    },

    updateExam: async (examId, name, date) => {
        const { data } = get();
        if (!data) return;

        const updatedExams = data.exams.map(exam => {
            if (exam.id !== examId) return exam;
            return { ...exam, targetExam: { name, date } };
        });

        const newData = { ...data, exams: updatedExams };
        set({ data: newData });
    },

    deleteExam: async (examId) => {
        const { data, activeExamId } = get();
        if (!data) return;

        const updatedExams = data.exams.filter(exam => exam.id !== examId);
        const newData = { ...data, exams: updatedExams };

        let newActiveId = activeExamId;
        if (activeExamId === examId) {
            newActiveId = updatedExams.length > 0 ? updatedExams[0].id : null;
            set({ activeExamId: newActiveId });
            newData.activeExamId = newActiveId;
        }

        set({ data: newData });
    },

    addSubject: async (title) => {
        const { data, activeExamId } = get();
        if (!data || !activeExamId) return;

        const newSubject: Subject = { id: `subj-${Date.now()}`, title, topics: [] };
        const updatedExams = data.exams.map(exam => {
            if (exam.id !== activeExamId) return exam;
            return { ...exam, syllabus: [...exam.syllabus, newSubject] };
        });

        const newData = { ...data, exams: updatedExams };
        set({ data: newData });
    },

    updateSubject: async (subjectId, title) => {
        const { data, activeExamId } = get();
        if (!data || !activeExamId) return;

        const updatedExams = data.exams.map(exam => {
            if (exam.id !== activeExamId) return exam;
            return { ...exam, syllabus: exam.syllabus.map(s => s.id === subjectId ? { ...s, title } : s) };
        });

        const newData = { ...data, exams: updatedExams };
        set({ data: newData });
    },

    deleteSubject: async (subjectId) => {
        const { data, activeExamId } = get();
        if (!data || !activeExamId) return;

        const updatedExams = data.exams.map(exam => {
            if (exam.id !== activeExamId) return exam;
            return { ...exam, syllabus: exam.syllabus.filter(s => s.id !== subjectId) };
        });

        const newData = { ...data, exams: updatedExams };
        set({ data: newData });
    },

    addTopic: async (subjectId, title) => {
        const { data, activeExamId } = get();
        if (!data || !activeExamId) return;

        const newTopic: Topic = { id: `top-${Date.now()}`, title, subtopics: [] };
        const updatedExams = data.exams.map(exam => {
            if (exam.id !== activeExamId) return exam;
            return {
                ...exam,
                syllabus: exam.syllabus.map(s => s.id === subjectId ? { ...s, topics: [...s.topics, newTopic] } : s)
            };
        });

        const newData = { ...data, exams: updatedExams };
        set({ data: newData });
    },

    updateTopic: async (subjectId, topicId, title) => {
        const { data, activeExamId } = get();
        if (!data || !activeExamId) return;

        const updatedExams = data.exams.map(exam => {
            if (exam.id !== activeExamId) return exam;
            return {
                ...exam,
                syllabus: exam.syllabus.map(s => {
                    if (s.id !== subjectId) return s;
                    return { ...s, topics: s.topics.map(t => t.id === topicId ? { ...t, title } : t) };
                })
            };
        });

        const newData = { ...data, exams: updatedExams };
        set({ data: newData });
    },

    deleteTopic: async (subjectId, topicId) => {
        const { data, activeExamId } = get();
        if (!data || !activeExamId) return;

        const updatedExams = data.exams.map(exam => {
            if (exam.id !== activeExamId) return exam;
            return {
                ...exam,
                syllabus: exam.syllabus.map(s => {
                    if (s.id !== subjectId) return s;
                    return { ...s, topics: s.topics.filter(t => t.id !== topicId) };
                })
            };
        });

        const newData = { ...data, exams: updatedExams };
        set({ data: newData });
    },

    addSubtopic: async (subjectId, topicId, title, parentSubtopicId) => {
        const { data, activeExamId } = get();
        if (!data || !activeExamId) return;

        const newSubtopic: SubTopic = { id: `sub-${Date.now()}`, title, state: 'none' };
        const updatedExams = data.exams.map(exam => {
            if (exam.id !== activeExamId) return exam;
            return {
                ...exam,
                syllabus: exam.syllabus.map(s => {
                    if (s.id !== subjectId) return s;
                    return {
                        ...s,
                        topics: s.topics.map(t => {
                            if (t.id !== topicId) return t;
                            if (parentSubtopicId) {
                                const mapRecursive = (subs: SubTopic[]): SubTopic[] => subs.map(sub => {
                                    if (sub.id === parentSubtopicId) return { ...sub, subtopics: [...(sub.subtopics || []), newSubtopic] };
                                    if (sub.subtopics) return { ...sub, subtopics: mapRecursive(sub.subtopics) };
                                    return sub;
                                });
                                return { ...t, subtopics: mapRecursive(t.subtopics) };
                            }
                            return { ...t, subtopics: [...t.subtopics, newSubtopic] };
                        })
                    };
                })
            };
        });

        const newData = { ...data, exams: updatedExams };
        set({ data: newData });
    },

    updateSubtopic: async (subjectId, topicId, subTopicId, title) => {
        const { data, activeExamId } = get();
        if (!data || !activeExamId) return;

        const updatedExams = data.exams.map(exam => {
            if (exam.id !== activeExamId) return exam;
            return {
                ...exam,
                syllabus: exam.syllabus.map(subject => {
                    if (subject.id !== subjectId) return subject;
                    return {
                        ...subject,
                        topics: subject.topics.map(topic => {
                            if (topic.id !== topicId) return topic;
                            const mapRecursive = (subs: SubTopic[]): SubTopic[] => subs.map(sub => {
                                if (sub.id === subTopicId) return { ...sub, title };
                                if (sub.subtopics) return { ...sub, subtopics: mapRecursive(sub.subtopics) };
                                return sub;
                            });
                            return { ...topic, subtopics: mapRecursive(topic.subtopics) };
                        })
                    };
                })
            };
        });

        const newData = { ...data, exams: updatedExams };
        set({ data: newData });
    },

    deleteSubtopic: async (subjectId, topicId, subTopicId) => {
        const { data, activeExamId } = get();
        if (!data || !activeExamId) return;

        const updatedExams = data.exams.map(exam => {
            if (exam.id !== activeExamId) return exam;
            return {
                ...exam,
                syllabus: exam.syllabus.map(subject => {
                    if (subject.id !== subjectId) return subject;
                    return {
                        ...subject,
                        topics: subject.topics.map(topic => {
                            if (topic.id !== topicId) return topic;
                            const filterRecursive = (subs: SubTopic[]): SubTopic[] => subs.filter(s => s.id !== subTopicId).map(sub => {
                                if (sub.subtopics) return { ...sub, subtopics: filterRecursive(sub.subtopics) };
                                return sub;
                            });
                            return { ...topic, subtopics: filterRecursive(topic.subtopics) };
                        })
                    };
                })
            };
        });

        const newData = { ...data, exams: updatedExams };
        set({ data: newData });
    },

    updateSubtopicState: async (subjectId, topicId, subTopicId, newState) => {
        const { data, activeExamId } = get();
        if (!data || !activeExamId) return;

        const updatedExams = data.exams.map(exam => {
            if (exam.id !== activeExamId) return exam;
            return {
                ...exam,
                syllabus: exam.syllabus.map(subject => {
                    if (subject.id !== subjectId) return subject;
                    return {
                        ...subject,
                        topics: subject.topics.map(topic => {
                            if (topic.id !== topicId) return topic;
                            const mapRecursive = (subs: SubTopic[]): SubTopic[] => subs.map(sub => {
                                if (sub.id === subTopicId) return { ...sub, state: newState };
                                if (sub.subtopics) return { ...sub, subtopics: mapRecursive(sub.subtopics) };
                                return sub;
                            });
                            return { ...topic, subtopics: mapRecursive(topic.subtopics) };
                        })
                    };
                })
            };
        });

        const newData = { ...data, exams: updatedExams };
        set({ data: newData });
    },

    toggleSubtopicStar: async (subjectId, topicId, subTopicId) => {
        const { data, activeExamId } = get();
        if (!data || !activeExamId) return;

        const updatedExams = data.exams.map(exam => {
            if (exam.id !== activeExamId) return exam;
            return {
                ...exam,
                syllabus: exam.syllabus.map(subject => {
                    if (subject.id !== subjectId) return subject;
                    return {
                        ...subject,
                        topics: subject.topics.map(topic => {
                            if (topic.id !== topicId) return topic;
                            const mapRecursive = (subs: SubTopic[]): SubTopic[] => subs.map(sub => {
                                if (sub.id === subTopicId) return { ...sub, isStarred: !sub.isStarred };
                                if (sub.subtopics) return { ...sub, subtopics: mapRecursive(sub.subtopics) };
                                return sub;
                            });
                            return { ...topic, subtopics: mapRecursive(topic.subtopics) };
                        })
                    };
                })
            };
        });

        const newData = { ...data, exams: updatedExams };
        set({ data: newData });
    },

    addEvent: (eventData) => {
        const newEvent = { ...eventData, id: `evt-${Date.now()}` };
        const newEvents = [...get().events, newEvent];
        set({ events: newEvents });
        if (typeof window !== 'undefined') localStorage.setItem('events', JSON.stringify(newEvents));
    },

    deleteEvent: (eventId) => {
        const newEvents = get().events.filter(e => e.id !== eventId);
        set({ events: newEvents });
        if (typeof window !== 'undefined') localStorage.setItem('events', JSON.stringify(newEvents));
    },

    toggleEventReminder: (eventId, enabled, scheduledId) => {
        const newEvents = get().events.map(e => e.id === eventId ? { ...e, reminderEnabled: enabled, notificationId: scheduledId } : e);
        set({ events: newEvents });
        if (typeof window !== 'undefined') localStorage.setItem('events', JSON.stringify(newEvents));
    },

    addMockTest: (testData) => {
        const newTest = { ...testData, id: `mock-${Date.now()}` };
        const newMockTests = [...get().mockTests, newTest];
        set({ mockTests: newMockTests });
        if (typeof window !== 'undefined') localStorage.setItem('mockTests', JSON.stringify(newMockTests));
    }
}));
