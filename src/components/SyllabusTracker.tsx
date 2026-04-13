'use client';

import { useState } from 'react';
import { Subject, Topic, SubTopic, ProgressState } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import ActionMenu from '@/components/ActionMenu';
import { ChevronDown, ChevronRight, CheckCircle2, Plus, Globe, X, Star } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SyllabusTrackerProps {
    syllabus: Subject[];
}

export default function SyllabusTracker({ syllabus }: SyllabusTrackerProps) {
    const { addSubject } = useAppStore();
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [newSubjectTitle, setNewSubjectTitle] = useState('');

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubjectTitle.trim()) {
            addSubject(newSubjectTitle.trim());
            setNewSubjectTitle('');
            setIsAddingMode(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Study Roadmap
                </h3>
            </div>

            <div className="space-y-4">
                {syllabus.map((subject) => (
                    <SubjectNode key={subject.id} subject={subject} />
                ))}

                {isAddingMode ? (
                    <form onSubmit={handleAddSubmit} className="mt-4 p-4 border border-primary/20 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm">
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Mathematics"
                            className="w-full bg-transparent border-b-2 border-primary/30 py-2 focus:outline-none focus:border-primary font-medium text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            value={newSubjectTitle}
                            onChange={(e) => setNewSubjectTitle(e.target.value)}
                            onBlur={() => !newSubjectTitle.trim() && setIsAddingMode(false)}
                        />
                    </form>
                ) : (
                    <div className="flex gap-3 mt-5 px-1">
                        <button
                            onClick={() => setIsAddingMode(true)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:opacity-90 active:scale-[0.98] shadow-md shadow-[color:var(--theme-primary)]/20"
                            style={{ backgroundColor: 'var(--theme-primary)' }}
                        >
                            <Plus className="w-4 h-4" /> Manual Topic
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function SubjectNode({ subject }: { subject: Subject }) {
    const { addTopic, updateSubject, deleteSubject, toggleSubjectExpansion } = useAppStore();
    const isOpen = subject.isExpanded ?? true;
    const [isAddingTopic, setIsAddingTopic] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');

    const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

    // Calculate progress
    const getProgress = () => {
        let total = 0;
        let completed = 0;

        const countSubtopics = (subs: SubTopic[]) => {
            subs.forEach(sub => {
                total++;
                if (sub.state === 'revised') completed++;
                if (sub.subtopics) countSubtopics(sub.subtopics);
            });
        };

        subject.topics.forEach(topic => {
            if (topic.subtopics) countSubtopics(topic.subtopics);
        });

        return total === 0 ? 0 : Math.round((completed / total) * 100);
    };

    const progressPercentage = getProgress();
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTopicTitle.trim()) {
            addTopic(subject.id, newTopicTitle.trim());
            setNewTopicTitle('');
            setIsAddingTopic(false);
        }
    };

    const handleEdit = () => {
        setIsEditingModalOpen(true);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete subject "${subject.title}"?`)) deleteSubject(subject.id);
    };

    return (
        <div className="border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm transition-all group mb-3">
            <div className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 transition-colors">
                <button
                    onClick={() => toggleSubjectExpansion(subject.id)}
                    className="flex-1 flex items-center gap-3 text-left pr-3 focus:outline-none"
                >
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-500 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-gray-800 dark:text-gray-100">{subject.title}</span>
                </button>
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="flex items-center gap-1.5" title={`${progressPercentage}% completed`}>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{progressPercentage}%</span>
                        <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r={radius} fill="none" className="stroke-gray-100 dark:stroke-zinc-800" strokeWidth="3" />
                                <circle 
                                    cx="18" 
                                    cy="18" 
                                    r={radius} 
                                    fill="none" 
                                    className="stroke-emerald-500 transition-all duration-500 ease-out" 
                                    strokeWidth="3" 
                                    strokeDasharray={circumference} 
                                    strokeDashoffset={strokeDashoffset} 
                                    strokeLinecap="round" 
                                />
                            </svg>
                        </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <ActionMenu 
                            onEdit={handleEdit} 
                            onDelete={handleDelete} 
                            onAdd={() => {
                                if (!isOpen) toggleSubjectExpansion(subject.id);
                                setIsAddingTopic(true);
                            }}
                            addLabel="Add new topic"
                        />
                    </div>
                    <button onClick={() => toggleSubjectExpansion(subject.id)} className="focus:outline-none ml-1">
                        {isOpen ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="p-4 pt-2 space-y-4">
                    {subject.topics.map((topic) => (
                        <TopicNode
                            key={topic.id}
                            topic={topic}
                            subjectId={subject.id}
                        />
                    ))}

                    {isAddingTopic ? (
                        <form onSubmit={handleAddSubmit} className="ml-2 sm:ml-4 border-l-2 border-primary/20 dark:border-zinc-700 pl-4 py-2">
                            <input
                                autoFocus
                                type="text"
                                placeholder="New Topic..."
                                className="w-full text-sm bg-transparent border-b border-gray-300 dark:border-zinc-700 py-1 focus:outline-none focus:border-primary text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                value={newTopicTitle}
                                onChange={(e) => setNewTopicTitle(e.target.value)}
                                onBlur={() => !newTopicTitle.trim() && setIsAddingTopic(false)}
                            />
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAddingTopic(true)}
                            className="flex items-center gap-1.5 ml-2 sm:ml-4 text-sm font-medium text-gray-400 hover:text-primary transition-colors py-2 focus:outline-none"
                        >
                            <Plus className="w-4 h-4" /> Add Topic
                        </button>
                    )}
                </div>
            )}
            
            {isEditingModalOpen && (
                <RenameModal 
                    title="Edit Subject" 
                    initialValue={subject.title} 
                    onClose={() => setIsEditingModalOpen(false)} 
                    onSave={(val) => { updateSubject(subject.id, val); setIsEditingModalOpen(false); }} 
                />
            )}
        </div>
    );
}

function TopicNode({ topic, subjectId }: { topic: Topic, subjectId: string }) {
    const { addSubtopic, updateTopic, deleteTopic, toggleTopicExpansion } = useAppStore();
    const isOpen = topic.isExpanded ?? true;
    const [isAddingSubtopic, setIsAddingSubtopic] = useState(false);
    const [newSubtopicTitle, setNewSubtopicTitle] = useState('');

    const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubtopicTitle.trim()) {
            addSubtopic(subjectId, topic.id, newSubtopicTitle.trim());
            setNewSubtopicTitle('');
            setIsAddingSubtopic(false);
        }
    };

    const handleEdit = () => {
        setIsEditingModalOpen(true);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete topic "${topic.title}"?`)) deleteTopic(subjectId, topic.id);
    };

    const isCompleted = topic.subtopics.length > 0 && topic.subtopics.every((st) => st.state === 'revised');

    const sortedSubtopics = [...topic.subtopics].sort((a, b) => {
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
        return 0;
    });

    return (
        <div className="ml-2 sm:ml-4 mb-3 group/topic">
            <div className={cn(
                "flex items-center justify-between mb-1.5 p-2 rounded-xl transition-all duration-300",
                isCompleted 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40" 
                    : "hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:border-gray-200 dark:hover:border-zinc-700 border border-transparent"
            )}>
                <button
                    onClick={() => toggleTopicExpansion(subjectId, topic.id)}
                    className="flex-1 flex items-center gap-3 text-base font-medium hover:text-primary transition-colors text-left focus:outline-none py-1"
                >
                    {isCompleted ? (
                        <div className="flex items-center justify-center w-[24px] h-[24px] rounded-md bg-emerald-500 text-white shadow-sm shadow-emerald-500/40 animate-in zoom-in duration-300">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    ) : (
                        <div className="w-[24px] h-[24px] flex items-center justify-center text-gray-400">
                            <ChevronRight className={cn("w-5 h-5 transition-transform duration-200", isOpen && "rotate-90")} />
                        </div>
                    )}
                    <span className={cn(
                        "transition-colors duration-300 font-bold",
                        isCompleted ? "text-emerald-700 dark:text-emerald-400" : "text-gray-800 dark:text-gray-200"
                    )}>
                        {topic.title}
                    </span>
                </button>
                <div className="opacity-0 group-hover/topic:opacity-100 transition-opacity">
                    <ActionMenu 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                        onAdd={() => {
                            if (!isOpen) toggleTopicExpansion(subjectId, topic.id);
                            setIsAddingSubtopic(true);
                        }}
                        addLabel="Add new topic"
                    />
                </div>
            </div>

            {isOpen && (
                <div className="ml-2 pl-4 border-l-2 border-dashed border-gray-200 dark:border-zinc-800 space-y-4 mt-3">
                    {sortedSubtopics.map((subtopic) => (
                        <SubTopicItem
                            key={subtopic.id}
                            subtopic={subtopic}
                            subjectId={subjectId}
                            topicId={topic.id}
                        />
                    ))}

                    {isAddingSubtopic ? (
                        <form onSubmit={handleAddSubmit} className="pt-2">
                            <input
                                autoFocus
                                type="text"
                                placeholder="New Subtopic..."
                                className="w-full text-base bg-transparent border-b border-gray-300 dark:border-zinc-700 py-2 focus:outline-none focus:border-primary text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                value={newSubtopicTitle}
                                onChange={(e) => setNewSubtopicTitle(e.target.value)}
                                onBlur={() => !newSubtopicTitle.trim() && setIsAddingSubtopic(false)}
                            />
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAddingSubtopic(true)}
                            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-primary transition-colors pt-3 pb-2 focus:outline-none"
                        >
                            <Plus className="w-4 h-4" /> Add Subtopic
                        </button>
                    )}
                </div>
            )}

            {isEditingModalOpen && (
                <RenameModal 
                    title="Edit Topic" 
                    initialValue={topic.title} 
                    onClose={() => setIsEditingModalOpen(false)} 
                    onSave={(val) => { updateTopic(subjectId, topic.id, val); setIsEditingModalOpen(false); }} 
                />
            )}
        </div>
    );
}

function SubTopicItem({ subtopic, subjectId, topicId, level = 0 }: { subtopic: SubTopic, subjectId: string, topicId: string, level?: number }) {
    const { updateSubtopicState, updateSubtopic, deleteSubtopic, addSubtopic, toggleSubtopicStar, toggleSubtopicExpansion } = useAppStore();
    const states: ProgressState[] = ['read', 'practiced', 'revised'];
    const stateOrder: ProgressState[] = ['none', 'read', 'practiced', 'revised'];
    const currentIdx = stateOrder.indexOf(subtopic.state);

    const [isAddingChild, setIsAddingChild] = useState(false);
    const [newChildTitle, setNewChildTitle] = useState('');

    const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

    const handleAddChildSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newChildTitle.trim()) {
            addSubtopic(subjectId, topicId, newChildTitle.trim(), subtopic.id);
            setNewChildTitle('');
            setIsAddingChild(false);
        }
    };

    const handleEdit = () => {
        setIsEditingModalOpen(true);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete subtopic "${subtopic.title}"?`)) deleteSubtopic(subjectId, topicId, subtopic.id);
    };

    return (
        <div className="flex flex-col mb-1.5 group/subtopic w-full">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between py-2.5 gap-3 xl:gap-4 w-full rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/30 px-2 transition-colors">
            <div className="flex items-center gap-3 flex-grow">
                <button onClick={() => toggleSubtopicStar(subjectId, topicId, subtopic.id)} className="focus:outline-none focus:ring-2 focus:ring-primary/20 rounded mt-0.5" title="Star to pin to top">
                    <Star className={cn("w-5 h-5 transition-colors", subtopic.isStarred ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-zinc-600 hover:text-amber-300")} />
                </button>
                {subtopic.state === 'revised' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : (
                    <div className="w-5 h-5 rounded-md border-2 border-gray-300 dark:border-zinc-600 flex-shrink-0" />
                )}
                <span className={cn(
                    "text-base leading-relaxed transition-colors",
                    subtopic.state === 'revised' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-100 font-medium'
                )}>
                    {subtopic.title}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                    {states.map((stateVariant) => {
                        const variantIdx = stateOrder.indexOf(stateVariant);
                        const isActive = currentIdx >= variantIdx;

                        return (
                            <button
                                key={stateVariant}
                                onClick={() => {
                                    let nextState: ProgressState;
                                    if (currentIdx >= variantIdx) {
                                        // Uncheck down to the state *before* the clicked one
                                        nextState = stateOrder[variantIdx - 1];
                                    } else {
                                        // Check up to the clicked state
                                        nextState = stateVariant;
                                    }
                                    updateSubtopicState(subjectId, topicId, subtopic.id, nextState);
                                }}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap",
                                    isActive
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-400 dark:bg-emerald-400/10 dark:text-emerald-400"
                                        : "border-gray-200 bg-transparent text-gray-400 hover:border-gray-300 dark:border-zinc-700 dark:text-gray-500 dark:hover:border-zinc-600"
                                )}
                            >
                                {stateVariant.charAt(0).toUpperCase() + stateVariant.slice(1)}
                            </button>
                        );
                    })}
                </div>

                <div className="opacity-0 group-hover/subtopic:opacity-100 transition-opacity flex-shrink-0">
                    <ActionMenu 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                        onAdd={() => setIsAddingChild(true)}
                        addLabel="Add new topic"
                    />
                </div>
            </div>
            </div>

            {/* Child elements */}
            {(subtopic.subtopics && subtopic.subtopics.length > 0) && (
                <div className="flex items-center gap-2 mb-2 ml-7">
                    <button 
                        onClick={() => toggleSubtopicExpansion(subjectId, topicId, subtopic.id)}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-primary transition-colors"
                    >
                        {subtopic.isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        {subtopic.isExpanded ? 'Hide' : 'Show'} Sub-topics ({subtopic.subtopics.length})
                    </button>
                </div>
            )}
            
            {(subtopic.isExpanded || isAddingChild) && (subtopic.subtopics && subtopic.subtopics.length > 0 || isAddingChild) && (
                <div className="ml-7 pl-5 border-l-2 border-dashed border-gray-200 dark:border-zinc-700 space-y-2 mt-2 mb-3 w-full">
                    {[...(subtopic.subtopics || [])].sort((a, b) => {
                        if (a.isStarred && !b.isStarred) return -1;
                        if (!a.isStarred && b.isStarred) return 1;
                        return 0;
                    }).map((childSub) => (
                        <SubTopicItem
                            key={childSub.id}
                            subtopic={childSub}
                            subjectId={subjectId}
                            topicId={topicId}
                            level={level + 1}
                        />
                    ))}

                    {isAddingChild && (
                        <form onSubmit={handleAddChildSubmit} className="pt-1">
                            <input
                                autoFocus
                                type="text"
                                placeholder="New Subtopic..."
                                className="w-full text-base bg-transparent border-b border-gray-300 dark:border-zinc-700 py-2 focus:outline-none focus:border-primary text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                value={newChildTitle}
                                onChange={(e) => setNewChildTitle(e.target.value)}
                                onBlur={() => !newChildTitle.trim() && setIsAddingChild(false)}
                            />
                        </form>
                    )}
                </div>
            )}

            {isEditingModalOpen && (
                <RenameModal 
                    title="Edit Subtopic" 
                    initialValue={subtopic.title} 
                    onClose={() => setIsEditingModalOpen(false)} 
                    onSave={(val) => { updateSubtopic(subjectId, topicId, subtopic.id, val); setIsEditingModalOpen(false); }} 
                />
            )}
        </div>
    );
}

function RenameModal({ title, initialValue, onClose, onSave }: { title: string, initialValue: string, onClose: () => void, onSave: (val: string) => void }) {
    const [val, setVal] = useState(initialValue);
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6 animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="space-y-4">
                    <input
                        type="text"
                        autoFocus
                        className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:ring-0 focus:border-primary outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        value={val}
                        onChange={e => setVal(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && val.trim()) {
                                onSave(val.trim());
                            } else if (e.key === 'Escape') {
                                onClose();
                            }
                        }}
                    />
                </div>
                <div className="mt-8">
                    <button
                        onClick={() => val.trim() && onSave(val.trim())}
                        className="w-full py-3.5 text-white rounded-xl font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ backgroundColor: 'var(--theme-primary)', boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)' }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}
