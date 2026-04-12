'use client';

import { useState } from 'react';
import { Subject, Topic, SubTopic, ProgressState } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import ActionMenu from '@/components/ActionMenu';
import { ChevronDown, ChevronRight, CheckCircle2, Plus, Globe } from 'lucide-react';
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
                            className="w-full bg-transparent border-b-2 border-primary/30 py-2 focus:outline-none focus:border-primary font-medium text-base"
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
    const [isOpen, setIsOpen] = useState(true);
    const { addTopic, updateSubject, deleteSubject } = useAppStore();
    const [isAddingTopic, setIsAddingTopic] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTopicTitle.trim()) {
            addTopic(subject.id, newTopicTitle.trim());
            setNewTopicTitle('');
            setIsAddingTopic(false);
        }
    };

    const handleEdit = () => {
        const newTitle = window.prompt("Edit Subject:", subject.title);
        if (newTitle && newTitle.trim()) updateSubject(subject.id, newTitle.trim());
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete subject "${subject.title}"?`)) deleteSubject(subject.id);
    };

    return (
        <div className="border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm transition-all group mb-3">
            <div className="w-full flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 transition-colors">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex-1 flex items-center gap-3 text-left pr-3 focus:outline-none"
                >
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-500 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-base text-gray-800 dark:text-gray-100">{subject.title}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-400">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ActionMenu 
                            onEdit={handleEdit} 
                            onDelete={handleDelete} 
                            onAdd={() => {
                                setIsOpen(true);
                                setIsAddingTopic(true);
                            }}
                            addLabel="Add new topic"
                        />
                    </div>
                    <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
                        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
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
                                className="w-full text-sm bg-transparent border-b border-gray-300 dark:border-zinc-700 py-1 focus:outline-none focus:border-primary"
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
        </div>
    );
}

function TopicNode({ topic, subjectId }: { topic: Topic, subjectId: string }) {
    const [isOpen, setIsOpen] = useState(true);
    const { addSubtopic, updateTopic, deleteTopic } = useAppStore();
    const [isAddingSubtopic, setIsAddingSubtopic] = useState(false);
    const [newSubtopicTitle, setNewSubtopicTitle] = useState('');

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubtopicTitle.trim()) {
            addSubtopic(subjectId, topic.id, newSubtopicTitle.trim());
            setNewSubtopicTitle('');
            setIsAddingSubtopic(false);
        }
    };

    const handleEdit = () => {
        const newTitle = window.prompt("Edit Topic:", topic.title);
        if (newTitle && newTitle.trim()) updateTopic(subjectId, topic.id, newTitle.trim());
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete topic "${topic.title}"?`)) deleteTopic(subjectId, topic.id);
    };

    const isCompleted = topic.subtopics.length > 0 && topic.subtopics.every((st) => st.state === 'revised');

    return (
        <div className="ml-2 sm:ml-4 mb-3 group/topic">
            <div className={cn(
                "flex items-center justify-between mb-1.5 p-2 rounded-xl transition-all duration-300",
                isCompleted 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40" 
                    : "hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:border-gray-200 dark:hover:border-zinc-700 border border-transparent"
            )}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex-1 flex items-center gap-2.5 text-sm font-medium hover:text-primary transition-colors text-left focus:outline-none"
                >
                    {isCompleted ? (
                        <div className="flex items-center justify-center w-[22px] h-[22px] rounded-md bg-emerald-500 text-white shadow-sm shadow-emerald-500/40 animate-in zoom-in duration-300">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    ) : (
                        <div className="w-[22px] h-[22px] flex items-center justify-center text-gray-400">
                            <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-90")} />
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
                            setIsOpen(true);
                            setIsAddingSubtopic(true);
                        }}
                        addLabel="Add new topic"
                    />
                </div>
            </div>

            {isOpen && (
                <div className="ml-2 pl-4 border-l-2 border-dashed border-gray-200 dark:border-zinc-800 space-y-4 mt-3">
                    {topic.subtopics.map((subtopic) => (
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
                                className="w-full text-sm bg-transparent border-b border-gray-300 dark:border-zinc-700 py-1 focus:outline-none focus:border-primary"
                                value={newSubtopicTitle}
                                onChange={(e) => setNewSubtopicTitle(e.target.value)}
                                onBlur={() => !newSubtopicTitle.trim() && setIsAddingSubtopic(false)}
                            />
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAddingSubtopic(true)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-primary transition-colors pt-2 pb-1 focus:outline-none"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Subtopic
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function SubTopicItem({ subtopic, subjectId, topicId, level = 0 }: { subtopic: SubTopic, subjectId: string, topicId: string, level?: number }) {
    const { updateSubtopicState, updateSubtopic, deleteSubtopic, addSubtopic } = useAppStore();
    const states: ProgressState[] = ['read', 'practiced', 'revised'];
    const stateOrder: ProgressState[] = ['none', 'read', 'practiced', 'revised'];
    const currentIdx = stateOrder.indexOf(subtopic.state);

    const [isAddingChild, setIsAddingChild] = useState(false);
    const [newChildTitle, setNewChildTitle] = useState('');

    const handleAddChildSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newChildTitle.trim()) {
            addSubtopic(subjectId, topicId, newChildTitle.trim(), subtopic.id);
            setNewChildTitle('');
            setIsAddingChild(false);
        }
    };

    const handleEdit = () => {
        const newTitle = window.prompt("Edit Subtopic:", subtopic.title);
        if (newTitle && newTitle.trim()) updateSubtopic(subjectId, topicId, subtopic.id, newTitle.trim());
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete subtopic "${subtopic.title}"?`)) deleteSubtopic(subjectId, topicId, subtopic.id);
    };

    return (
        <div className="flex flex-col mb-1 group/subtopic w-full">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between py-1 gap-2 xl:gap-4 w-full">
            <div className="flex items-center gap-2 flex-grow">
                {subtopic.state === 'revised' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                    <div className="w-4 h-4 rounded-md border border-gray-300 dark:border-zinc-700 flex-shrink-0" />
                )}
                <span className={cn(
                    "text-xs transition-colors",
                    subtopic.state === 'revised' ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-200 font-medium'
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
                                    "px-3 py-1 rounded-full text-[10px] font-bold transition-all border whitespace-nowrap",
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
            {(subtopic.subtopics && subtopic.subtopics.length > 0 || isAddingChild) && (
                <div className="ml-6 pl-4 border-l-2 border-dashed border-gray-200 dark:border-zinc-700 space-y-1 mt-1 mb-2 w-full">
                    {subtopic.subtopics?.map((childSub) => (
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
                                className="w-full text-sm bg-transparent border-b border-gray-300 dark:border-zinc-700 py-1 focus:outline-none focus:border-primary"
                                value={newChildTitle}
                                onChange={(e) => setNewChildTitle(e.target.value)}
                                onBlur={() => !newChildTitle.trim() && setIsAddingChild(false)}
                            />
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
