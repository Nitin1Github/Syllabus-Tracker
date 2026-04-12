'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import ProgressBar from '@/components/ProgressBar';
import SyllabusTracker from '@/components/SyllabusTracker';
import { SettingsModal } from '@/components/SettingsModal';
import ActionMenu from '@/components/ActionMenu';
import { Loader2, BookOpen, Settings, PlusCircle, X, Download, CalendarCheck, Plus, BarChart3, User, TrendingUp, LayoutDashboard, Edit2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInDays, parseISO } from 'date-fns';
import { ExamData } from '@/lib/types';
import { calculateProgress } from '@/lib/utils';
import { availableExams, ExamSummary } from '@/data/syllabusLibrary';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Exam Mini Card
function ExamMiniCard({ exam, isActive, onClick, onImportSyllabus }: { exam: ExamData, isActive: boolean, onClick: () => void, onImportSyllabus: () => void }) {
    const updateExam = useAppStore(state => state.updateExam);
    const deleteExam = useAppStore(state => state.deleteExam);

    const handleEdit = () => {
        const newName = window.prompt("Enter new exam name:", exam.targetExam.name);
        if (newName && newName.trim()) {
            const rawDate = new Date(exam.targetExam.date).toISOString().split('T')[0];
            const newDate = window.prompt("Enter new target date (YYYY-MM-DD):", rawDate);
            if (newDate) {
                updateExam(exam.id, newName.trim(), new Date(newDate).toISOString());
            }
        }
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${exam.targetExam.name}"?`)) {
            deleteExam(exam.id);
        }
    };

    const daysLeft = useMemo(() => {
        try {
            const target = parseISO(exam.targetExam.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diff = differenceInDays(target, today);
            return diff > 0 ? diff : 0;
        } catch {
            return 0;
        }
    }, [exam.targetExam.date]);

    const isUrgent = daysLeft < 30;

    return (
        <div
            onClick={onClick}
            className={cn(
                "flex-shrink-0 w-[240px] rounded-2xl p-4 cursor-pointer transition-all duration-300 relative overflow-hidden group border border-transparent text-left flex flex-col justify-between min-h-[160px]",
                isActive
                    ? "shadow-xl shadow-[color:var(--theme-primary)]/30 scale-100 text-white"
                    : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-sm scale-95 opacity-80 hover:opacity-100 text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-zinc-700"
            )}
            style={isActive ? { backgroundImage: 'linear-gradient(135deg, var(--theme-primary) 0%, #3b82f6 100%)' } : {}}
        >
            {/* Top section */}
            <div className="flex justify-between items-start mb-3">
                <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider", isActive ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400")}>
                    <TrendingUp className="w-2.5 h-2.5" />
                    <span>Trending</span>
                </div>
                <div className="relative z-20 -mr-2 -mt-2">
                    <ActionMenu onEdit={handleEdit} onDelete={handleDelete} onImport={onImportSyllabus} className={isActive ? "text-white opacity-80 hover:opacity-100" : ""} />
                </div>
            </div>

            {/* Middle Section */}
            <div className="mb-3 relative z-10">
                <p className={cn("text-[9px] font-bold uppercase tracking-widest mb-1", isActive ? "text-white/80" : "text-gray-500 dark:text-gray-400")}>Upcoming Exam</p>
                <h3 className="text-lg font-bold leading-snug line-clamp-2" title={exam.targetExam.name}>
                    {exam.targetExam.name}
                </h3>
            </div>

            {/* Bottom section */}
            <div className="flex items-end justify-between mt-auto pt-2 relative z-10">
                <div>
                    <div className="text-4xl font-extrabold tracking-tight leading-none mb-1">
                        {daysLeft}
                    </div>
                    <div className={cn("text-[10px] font-medium", isActive ? "text-white/80" : "text-gray-500 dark:text-gray-400")}>
                        Days remaining
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm", isActive ? "bg-white/20 text-white backdrop-blur-sm" : "bg-[color:var(--theme-primary)]/10 text-[color:var(--theme-primary)]")}>
                        {isUrgent ? 'High Priority' : 'Standard'}
                    </div>
                </div>
            </div>

            {/* Ambient Background decoration */}
            {isActive && (
                <>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                </>
            )}
        </div>
    );
}

export default function Home() {
    const data = useAppStore(state => state.data);
    const activeExamId = useAppStore(state => state.activeExamId);
    const loading = useAppStore(state => state.loading);
    const userName = useAppStore(state => state.userName);
    const setUserName = useAppStore(state => state.setUserName);
    const fetchData = useAppStore(state => state.fetchData);
    const setActiveExam = useAppStore(state => state.setActiveExam);
    const addExams = useAppStore(state => state.addExams);
    const importSyllabus = useAppStore(state => state.importSyllabus);
    const importSyllabusToExam = useAppStore(state => state.importSyllabusToExam);

    const activeExam = useMemo(() => {
        if (!data || !activeExamId) return null;
        return data.exams.find(e => e.id === activeExamId) || null;
    }, [data, activeExamId]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
    const [importTargetExamId, setImportTargetExamId] = useState<string | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');
    const [isListView, setIsListView] = useState(false);

    const setData = useAppStore(state => state.setData);

    // Hydration-Safe State Initialization & Load Data on Mount
    useEffect(() => {
        fetchData(); // Fetch global config (theme, etc)
        
        const localData = localStorage.getItem('syllabusTrackerData');
        if (localData) {
            try {
                setData(JSON.parse(localData));
            } catch (e) {
                console.error("Failed to parse local data", e);
                setData({ exams: [], activeExamId: null });
            }
        } else {
            setData({ exams: [], activeExamId: null });
        }
    }, [fetchData, setData]);

    // Save Data on Change
    useEffect(() => {
        if (data && !loading) {
            localStorage.setItem('syllabusTrackerData', JSON.stringify(data));
        }
    }, [data, loading]);

    if (loading || !data) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 pb-24 font-sans transition-colors duration-300">
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg text-white shadow-sm" style={{ backgroundColor: 'var(--theme-primary)' }}>
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-bold bg-clip-text text-transparent pb-0.5" style={{ backgroundImage: `linear-gradient(to right, var(--theme-primary), #4f46e5)` }}>
                            ExamTracker
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-full transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 rounded-full border-2 border-orange-200 dark:border-orange-900/50 bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                            <User className="w-4 h-4 text-orange-400" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 relative z-10">

                {/* Master Dashboard / Hero Carousel section */}
                <section>
                    <div className="mb-4 group inline-flex items-center gap-2">
                        {isEditingName ? (
                            <input
                                autoFocus
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onBlur={() => {
                                    if (tempName.trim()) setUserName(tempName.trim());
                                    setIsEditingName(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (tempName.trim()) setUserName(tempName.trim());
                                        setIsEditingName(false);
                                    }
                                }}
                                className="text-2xl font-extrabold tracking-tight bg-transparent border-b-2 border-primary focus:outline-none w-48 text-gray-900 dark:text-gray-100"
                            />
                        ) : (
                            <>
                                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                                    Hi, {userName} <span className="text-2xl">👋</span>
                                </h2>
                                <button
                                    onClick={() => { setTempName(userName); setIsEditingName(true); }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-primary transition-all rounded-full hover:bg-white dark:hover:bg-zinc-800 focus:outline-none"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex items-center justify-between mb-3 mt-1">
                        <h2 className="text-lg font-bold">My Exams</h2>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <button
                                onClick={() => { setImportTargetExamId(null); setIsLibraryModalOpen(true); }}
                                className="flex items-center gap-1.5 text-xs font-medium text-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
                                style={{ backgroundColor: 'var(--theme-primary)' }}
                            >
                                <Download className="w-3.5 h-3.5" /> Import Official Syllabus
                            </button>
                            <button
                                onClick={() => setIsExamModalOpen(true)}
                                className="flex items-center gap-1.5 text-xs font-medium text-gray-800 dark:text-gray-200 border-2 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md"
                            >
                                <PlusCircle className="w-3.5 h-3.5" /> Add Exams
                            </button>
                        </div>
                    </div>

                    {isListView ? (
                        <div className="flex flex-col gap-3 pb-4">
                            {data.exams.map(exam => {
                                const daysLeft = Math.max(0, differenceInDays(parseISO(exam.targetExam.date), new Date().setHours(0,0,0,0)));
                                const isActive = data.activeExamId === exam.id;
                                return (
                                    <div 
                                        key={exam.id}
                                        onClick={() => setActiveExam(exam.id)}
                                        className={cn(
                                            "w-full rounded-2xl p-4 cursor-pointer transition-all duration-300 relative overflow-hidden group border flex items-center justify-between",
                                            isActive
                                                ? "border-transparent text-white shadow-lg shadow-[color:var(--theme-primary)]/20"
                                                : "bg-white/40 dark:bg-zinc-900/40 border-gray-200 dark:border-zinc-800 shadow-sm text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-zinc-700 hover:bg-white/60 dark:hover:bg-zinc-900/60"
                                        )}
                                        style={isActive ? { backgroundImage: 'linear-gradient(135deg, var(--theme-primary) 0%, #3b82f6 100%)' } : {}}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center bg-black/10 dark:bg-white/10 backdrop-blur-sm shadow-inner">
                                                <span className="text-lg font-black leading-none">{daysLeft}</span>
                                                <span className="text-[8px] font-bold uppercase tracking-wider opacity-80">Days</span>
                                            </div>
                                            <div>
                                                <p className={cn("text-[9px] font-bold uppercase tracking-widest mb-0.5", isActive ? "text-white/80" : "text-gray-500 dark:text-gray-400")}>Target Exam</p>
                                                <h3 className="text-base font-bold leading-snug line-clamp-1">{exam.targetExam.name}</h3>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-black/5 dark:bg-white/5 backdrop-blur-sm">
                                                {daysLeft < 30 ? 'High Priority' : 'Standard'}
                                            </div>
                                            <div className="relative z-20">
                                                <ActionMenu 
                                                    onEdit={() => {}} 
                                                    onDelete={() => {}} 
                                                    onImport={() => {
                                                        setImportTargetExamId(exam.id);
                                                        setIsLibraryModalOpen(true);
                                                    }} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
                            {data.exams.map(exam => (
                                <div key={exam.id} className="snap-start py-1">
                                    <ExamMiniCard
                                        exam={exam}
                                        isActive={data.activeExamId === exam.id}
                                        onClick={() => setActiveExam(exam.id)}
                                        onImportSyllabus={() => {
                                            setImportTargetExamId(exam.id);
                                            setIsLibraryModalOpen(true);
                                        }}
                                    />
                                </div>
                            ))}

                            {data.exams.length === 0 && (
                                <div className="flex items-center justify-center w-full py-8 text-gray-500 bg-white/50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800">
                                    No exams configured. Add an exam to get started!
                                </div>
                            )}
                        </div>
                    )}
                
                    {/* View All Added Exams / List View Button */}
                    {data.exams.length > 0 && (
                        <div className="flex justify-end mt-1 mb-6">
                            <button 
                                onClick={() => setIsListView(!isListView)}
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors group"
                            >
                                <BookOpen className="w-4 h-4" />
                                <span>{isListView ? 'View as cards' : 'View all added exams'}</span>
                            </button>
                        </div>
                    )}
                </section>

                {!isListView && (
                    activeExam ? (
                        <>
                            <ProgressBar exams={data.exams} activeExamId={activeExamId} />
                            <SyllabusTracker syllabus={activeExam.syllabus} />
                        </>
                    ) : data.exams.length > 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-white/50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800">
                            Select an exam card above to view its syllabus.
                        </div>
                    ) : null
                )}
            </main>

            {/* Bottom Mobile Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 z-50 flex justify-around items-center px-2 py-3 sm:hidden pb-safe">
                <button className="flex flex-col items-center gap-1" style={{ color: 'var(--theme-primary)' }}>
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Dashboard</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <CalendarCheck className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Upcoming</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Insights</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Profile</span>
                </button>
            </nav>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            {isLibraryModalOpen && (
                <SyllabusLibraryModal
                    onClose={() => { setIsLibraryModalOpen(false); setImportTargetExamId(null); }}
                    onImport={async (examSummary) => {
                        try {
                            // Dynamically load the full JSON file
                            const module = await import(`@/data/syllabusLibrary/${examSummary.id}.json`);
                            const fullExam = module.default || module;
                            if (importTargetExamId) {
                                importSyllabusToExam(importTargetExamId, fullExam);
                            } else {
                                importSyllabus(fullExam);
                            }
                            setIsLibraryModalOpen(false);
                            setImportTargetExamId(null);
                        } catch (err) {
                            console.error("Failed to load syllabus data", err);
                            alert("Failed to load syllabus data.");
                        }
                    }}
                />
            )}

            {isExamModalOpen && (
                <BulkExamModal
                    onClose={() => setIsExamModalOpen(false)}
                    onSave={(exams) => {
                        addExams(exams);
                        setIsExamModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}

function BulkExamModal({ onClose, onSave }: { onClose: () => void, onSave: (exams: { name: string, date: string }[]) => void }) {
    const [rows, setRows] = useState([{ id: Date.now(), name: '', date: '' }]);

    const addRow = () => {
        setRows([...rows, { id: Date.now(), name: '', date: '' }]);
    };

    const updateRow = (id: number, field: 'name' | 'date', value: string) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const removeRow = (id: number) => {
        if (rows.length > 1) {
            setRows(rows.filter(r => r.id !== id));
        }
    };

    const handleSave = () => {
        const validExams = rows.filter(r => r.name.trim() && r.date);
        if (validExams.length > 0) {
            onSave(validExams.map(r => ({ name: r.name.trim(), date: new Date(r.date).toISOString() })));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-6 animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Bulk Add Exams</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pb-4">
                    {rows.map((row, index) => (
                        <div key={row.id} className="flex gap-3 items-end relative group">
                            <div className="flex-1 space-y-1">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam Name</label>
                                <input
                                    type="text"
                                    autoFocus={index === rows.length - 1}
                                    placeholder="e.g. UPSC Prelims"
                                    className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800/50 focus:bg-white focus:ring-0 focus:border-primary outline-none transition-colors"
                                    value={row.name}
                                    onChange={e => updateRow(row.id, 'name', e.target.value)}
                                />
                            </div>
                            <div className="w-1/3 space-y-1">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Date</label>
                                <input
                                    type="date"
                                    className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800/50 focus:bg-white focus:ring-0 focus:border-primary outline-none transition-colors"
                                    value={row.date}
                                    onChange={e => updateRow(row.id, 'date', e.target.value)}
                                />
                            </div>
                            {rows.length > 1 && (
                                <button
                                    onClick={() => removeRow(row.id)}
                                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={addRow}
                        className="flex items-center gap-2 text-sm font-semibold hover:underline pt-4 w-full justify-center transition-opacity hover:opacity-80"
                        style={{ color: 'var(--theme-primary)' }}
                    >
                        <Plus className="w-4 h-4" /> Add Another Exam Row
                    </button>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleSave}
                        className="w-full py-3.5 text-white rounded-xl font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ backgroundColor: 'var(--theme-primary)', boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)' }}
                    >
                        Save & Add Exams
                    </button>
                </div>
            </div>
        </div>
    )
}

function SyllabusLibraryModal({ onClose, onImport }: { onClose: () => void, onImport: (exam: ExamSummary) => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden p-6 animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Official Syllabus Library</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 pb-4">
                    {availableExams.map((exam) => {
                        const totalSubjects = exam.totalSubjects;
                        const totalTopics = exam.totalTopics;

                        return (
                            <div key={exam.id} className="border-2 border-gray-100 dark:border-zinc-800 rounded-xl p-4 hover:border-[color:var(--theme-primary)]/50 transition-colors bg-gray-50/50 dark:bg-zinc-800/30 flex flex-col justify-between h-full">
                                <div>
                                    <h4 className="font-bold text-lg mb-1">{exam.targetExam.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Includes {totalSubjects} Subjects and {totalTopics} Topics
                                    </p>
                                </div>
                                <button
                                    onClick={() => onImport(exam)}
                                    className="w-full py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-[color:var(--theme-primary)] hover:text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Import to Dashboard
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
