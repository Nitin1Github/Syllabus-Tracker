'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import ProgressBar from '@/components/ProgressBar';
import SyllabusTracker from '@/components/SyllabusTracker';
import { SettingsModal } from '@/components/SettingsModal';
import ActionMenu from '@/components/ActionMenu';
import { Loader2, BookOpen, Settings, PlusCircle, X, Download, CalendarCheck, Plus, BarChart3, User, TrendingUp, LayoutDashboard, Edit2, Timer, PieChart, Trash2, Play, Pause, RotateCcw, Check, Bell, ClipboardList } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { LocalNotifications } from '@capacitor/local-notifications';
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
function ExamMiniCard({ exam, isActive, onClick, onImportSyllabus, onEditOpen }: { exam: ExamData, isActive: boolean, onClick: () => void, onImportSyllabus: () => void, onEditOpen: () => void }) {
    const deleteExam = useAppStore(state => state.deleteExam);

    const handleEdit = () => {
        onEditOpen();
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
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [editingExamId, setEditingExamId] = useState<string | null>(null);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
    const [importTargetExamId, setImportTargetExamId] = useState<string | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');
    const [isListView, setIsListView] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard'|'upcoming'|'focus'|'insights'>('dashboard');

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
                        <div onClick={() => setIsProfileModalOpen(true)} className="w-8 h-8 rounded-full border-2 border-orange-200 dark:border-orange-900/50 bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                            <User className="w-4 h-4 text-orange-400" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 relative z-10">
                {activeTab === 'dashboard' && (
                    <>
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
                                                    onEdit={() => setEditingExamId(exam.id)} 
                                                    onDelete={() => {
                                                        if (window.confirm(`Are you sure you want to delete "${exam.targetExam.name}"?`)) {
                                                            useAppStore.getState().deleteExam(exam.id);
                                                        }
                                                    }} 
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
                                        onEditOpen={() => setEditingExamId(exam.id)}
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
                    </>
                )}

                {activeTab === 'upcoming' && <UpcomingView />}
                {activeTab === 'focus' && <FocusView />}
                {activeTab === 'insights' && <InsightsView />}

            </main>

            {/* Bottom Mobile Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 z-50 flex justify-around items-center px-2 py-3 sm:hidden pb-safe">
                <button onClick={() => setActiveTab('dashboard')} className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'dashboard' ? "text-[color:var(--theme-primary)]" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300")}>
                    <LayoutDashboard className="w-6 h-6" />
                    <span className={cn("text-[10px]", activeTab === 'dashboard' ? "font-bold" : "font-medium")}>Dashboard</span>
                </button>
                <button onClick={() => setActiveTab('upcoming')} className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'upcoming' ? "text-[color:var(--theme-primary)]" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300")}>
                    <CalendarCheck className="w-6 h-6" />
                    <span className={cn("text-[10px]", activeTab === 'upcoming' ? "font-bold" : "font-medium")}>Upcoming</span>
                </button>
                <button onClick={() => setActiveTab('focus')} className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'focus' ? "text-[color:var(--theme-primary)]" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300")}>
                    <Timer className="w-6 h-6" />
                    <span className={cn("text-[10px]", activeTab === 'focus' ? "font-bold" : "font-medium")}>Focus</span>
                </button>
                <button onClick={() => setActiveTab('insights')} className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'insights' ? "text-[color:var(--theme-primary)]" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300")}>
                    <PieChart className="w-6 h-6" />
                    <span className={cn("text-[10px]", activeTab === 'insights' ? "font-bold" : "font-medium")}>Insights</span>
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

            {isProfileModalOpen && <ProfileModal onClose={() => setIsProfileModalOpen(false)} />}
            {editingExamId && (
                <EditExamModal 
                    exam={data.exams.find(e => e.id === editingExamId)!} 
                    onClose={() => setEditingExamId(null)} 
                    onSave={(name, date) => {
                        useAppStore.getState().updateExam(editingExamId, name, date);
                        setEditingExamId(null);
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
                                    className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:ring-0 focus:border-primary outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                    value={row.name}
                                    onChange={e => updateRow(row.id, 'name', e.target.value)}
                                />
                            </div>
                            <div className="w-1/3 space-y-1">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Date</label>
                                <input
                                    type="date"
                                    className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:ring-0 focus:border-primary outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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

function EditExamModal({ exam, onClose, onSave }: { exam: ExamData, onClose: () => void, onSave: (name: string, date: string) => void }) {
    const [name, setName] = useState(exam.targetExam.name);
    const [date, setDate] = useState(new Date(exam.targetExam.date).toISOString().split('T')[0]);

    const handleSave = () => {
        if (name.trim() && date) {
            onSave(name.trim(), new Date(date).toISOString());
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6 animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Edit Exam</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam Name</label>
                        <input
                            type="text"
                            autoFocus
                            placeholder="e.g. UPSC Prelims"
                            className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:ring-0 focus:border-primary outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Date</label>
                        <input
                            type="date"
                            className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:ring-0 focus:border-primary outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                </div>
                <div className="mt-8">
                    <button
                        onClick={handleSave}
                        className="w-full py-3.5 text-white rounded-xl font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ backgroundColor: 'var(--theme-primary)', boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)' }}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}

function ProfileModal({ onClose }: { onClose: () => void }) {
    const userName = useAppStore(state => state.userName);
    const userTargetExam = useAppStore(state => state.userTargetExam);
    const userContact = useAppStore(state => state.userContact);
    const setProfileData = useAppStore(state => state.setProfileData);

    const [name, setName] = useState(userName === 'Aspirant' ? '' : userName);
    const [target, setTarget] = useState(userTargetExam);
    const [contact, setContact] = useState(userContact);

    const handleSave = () => {
        setProfileData(name.trim(), target.trim(), contact.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6 animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">My Profile</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</label>
                        <input
                            type="text"
                            placeholder="Your Name"
                            className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:ring-0 focus:border-primary outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Exam</label>
                        <input
                            type="text"
                            placeholder="e.g. UPSC CSE"
                            className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:ring-0 focus:border-primary outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            value={target}
                            onChange={e => setTarget(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone / Email</label>
                        <input
                            type="text"
                            placeholder="Contact Info"
                            className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:ring-0 focus:border-primary outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            value={contact}
                            onChange={e => setContact(e.target.value)}
                        />
                    </div>
                </div>
                <div className="mt-8">
                    <button
                        onClick={handleSave}
                        className="w-full py-3.5 text-white rounded-xl font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ backgroundColor: 'var(--theme-primary)', boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)' }}
                    >
                        Save Profile
                    </button>
                </div>
            </div>
        </div>
    )
}

function UpcomingView() {
    const events = useAppStore(state => state.events || []);
    const deleteEvent = useAppStore(state => state.deleteEvent);
    const toggleEventReminder = useAppStore(state => state.toggleEventReminder);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleToggle = async (eventId: string, currentState: boolean) => {
        if (!currentState) {
            // Turning ON Reminder
            try {
                let perm = await LocalNotifications.checkPermissions();
                if (perm.display !== 'granted') {
                    perm = await LocalNotifications.requestPermissions();
                }
                if (perm.display !== 'granted') {
                    alert("Permissions needed to set reminders.");
                    return;
                }

                const event = events.find(e => e.id === eventId);
                if (event) {
                    const scheduledId = Math.floor(Math.random() * 100000);
                    const eventDate = new Date(`${event.date}T${event.time}`);
                    if (eventDate > new Date()) {
                        await LocalNotifications.schedule({
                            notifications: [{
                                id: scheduledId,
                                title: "Upcoming Event Reminder",
                                body: `It's almost time for: ${event.title}`,
                                schedule: { at: eventDate }
                            }]
                        });
                        toggleEventReminder(eventId, true, scheduledId);
                    } else {
                        alert("Cannot set a reminder for a past time.");
                    }
                }
            } catch (e) {
                console.error("Local notifications failed", e);
                // Fallback for web without capacitor
                toggleEventReminder(eventId, true, Date.now());
            }
        } else {
            // Turning OFF Reminder
            try {
                const event = events.find(e => e.id === eventId);
                if (event && event.notificationId) {
                    await LocalNotifications.cancel({ notifications: [{ id: event.notificationId }] });
                }
            } catch (e) { console.error(e) }
            toggleEventReminder(eventId, false, undefined);
        }
    };

    return (
        <section className="animate-in fade-in duration-300 space-y-6">
            <div className="flex items-center justify-between mb-3 mt-1">
                <h2 className="text-2xl font-extrabold tracking-tight">Upcoming Events</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-1.5 text-sm font-medium text-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                    <Plus className="w-4 h-4" /> Add Event
                </button>
            </div>
            {events.length === 0 ? (
                <div className="text-center py-10 bg-white/50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
                    <CalendarCheck className="w-12 h-12 mx-auto text-gray-300 dark:text-zinc-600 mb-3" />
                    <p className="text-gray-500">No upcoming events found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {events.map((evt) => (
                        <div key={evt.id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm flex justify-between items-center border border-gray-100 dark:border-zinc-800">
                            <div>
                                <h4 className="font-bold text-lg">{evt.title}</h4>
                                <p className="text-sm text-gray-500">{new Date(evt.date).toDateString()} at {evt.time}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleToggle(evt.id, evt.reminderEnabled)} className={cn("p-2 rounded-full transition-colors", evt.reminderEnabled ? "bg-[color:var(--theme-primary)]/10 text-[color:var(--theme-primary)]" : "bg-gray-100 dark:bg-zinc-800 text-gray-400")}>
                                    <Bell className="w-5 h-5" />
                                </button>
                                <button onClick={() => deleteEvent(evt.id)} className="text-red-400 hover:text-red-500 p-2">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {isAddModalOpen && <AddEventModal onClose={() => setIsAddModalOpen(false)} />}
        </section>
    );
}

function AddEventModal({ onClose }: { onClose: () => void }) {
    const addEvent = useAppStore(state => state.addEvent);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reminderEnabled, setReminderEnabled] = useState(false);

    const handleSave = () => {
        if (title.trim() && date && time) {
            addEvent({ title: title.trim(), date, time, reminderEnabled });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6 animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">New Event</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase">Title</label>
                        <input type="text" autoFocus className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase">Date</label>
                            <input type="date" className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase">Time</label>
                            <input type="time" className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white" value={time} onChange={e => setTime(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-semibold">Enable Reminder</span>
                        <input type="checkbox" checked={reminderEnabled} onChange={e => setReminderEnabled(e.target.checked)} className="w-5 h-5 accent-[color:var(--theme-primary)]" />
                    </div>
                </div>
                <div className="mt-8">
                    <button onClick={handleSave} className="w-full py-3.5 text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]" style={{ backgroundColor: 'var(--theme-primary)' }}>Save Event</button>
                </div>
            </div>
        </div>
    );
}

function FocusView() {
    const data = useAppStore(state => state.data);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [totalTime, setTotalTime] = useState(25 * 60);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isEditingTime, setIsEditingTime] = useState(false);
    const [inputHours, setInputHours] = useState('0');
    const [inputMinutes, setInputMinutes] = useState('25');

    const allTopics = useMemo(() => {
        if (!data) return [];
        const res: { label: string, value: string }[] = [];
        data.exams.forEach(e => {
            e.syllabus.forEach(s => {
                s.topics.forEach(t => {
                    res.push({ label: `${e.targetExam.name} - ${t.title}`, value: t.id });
                });
            });
        });
        return res;
    }, [data]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            setIsRunning(false);
            if (typeof window !== 'undefined') {
                new Audio('/alarm.mp3').play().catch(() => {});
                alert("Pomodoro Complete! Take a break.");
            }
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const handleStart = () => {
        if (!isRunning && timeLeft === 0 && totalTime > 0) {
            setTimeLeft(totalTime);
        }
        setIsRunning(true);
    };
    
    const handlePause = () => {
        setIsRunning(false);
    };

    const handleReset = () => { setIsRunning(false); setTimeLeft(totalTime); };

    const applyCustomTime = () => {
        const h = parseInt(inputHours) || 0;
        const m = parseInt(inputMinutes) || 0;
        const totalSecs = (h * 3600) + (m * 60);
        if (totalSecs > 0) {
            setTotalTime(totalSecs);
            setTimeLeft(totalSecs);
            setIsRunning(false);
            setIsEditingTime(false);
        }
    };

    const applyPreset = (minutes: number) => {
        const totalSecs = minutes * 60;
        setTotalTime(totalSecs);
        setTimeLeft(totalSecs);
        setIsRunning(false);
        setInputHours(Math.floor(minutes / 60).toString());
        setInputMinutes((minutes % 60).toString());
        setIsEditingTime(false);
    };

    const formatTime = (sec: number) => {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        const mStr = h > 0 ? m.toString().padStart(2, '0') : m.toString();
        return `${h > 0 ? h + ':' : ''}${mStr}:${s.toString().padStart(2, '0')}`;
    };

    const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <section className="animate-in fade-in duration-300 space-y-6 flex flex-col items-center">
            <h2 className="text-2xl font-extrabold tracking-tight self-start">Focus Timer</h2>
            
            <div className="w-full max-w-sm space-y-2 mt-4">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-widest pl-1">I am focusing on</label>
                <select 
                    value={selectedTopic} 
                    onChange={e => setSelectedTopic(e.target.value)}
                    className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-xl p-3 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:border-[color:var(--theme-primary)] text-gray-900 dark:text-white"
                >
                    <option value="" disabled>Select a topic...</option>
                    {allTopics.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </div>

            <div className="relative flex items-center justify-center my-6">
                <svg width="280" height="280" className="transform -rotate-90">
                    <circle cx="140" cy="140" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-zinc-800" />
                    <circle cx="140" cy="140" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-linear" style={{ color: 'var(--theme-primary)' }} strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center w-full h-full">
                    {isEditingTime ? (
                        <div className="flex flex-col items-center bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-lg border border-gray-100 dark:border-zinc-800 animate-in zoom-in duration-200">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex flex-col items-center">
                                    <input type="number" min="0" max="99" value={inputHours} onChange={e => setInputHours(e.target.value)} className="w-16 h-12 text-center text-2xl font-bold bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-[color:var(--theme-primary)] text-gray-900 dark:text-white" />
                                    <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Hrs</span>
                                </div>
                                <span className="text-2xl font-bold pb-4">:</span>
                                <div className="flex flex-col items-center">
                                    <input type="number" min="0" max="59" value={inputMinutes} onChange={e => setInputMinutes(e.target.value)} className="w-16 h-12 text-center text-2xl font-bold bg-gray-50 dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-[color:var(--theme-primary)] text-gray-900 dark:text-white" />
                                    <span className="text-[10px] text-gray-500 font-bold uppercase mt-1">Min</span>
                                </div>
                            </div>
                            <button onClick={applyCustomTime} className="w-full py-2 bg-[color:var(--theme-primary)] text-white text-sm font-bold rounded-lg hover:opacity-90 transition-opacity">
                                Set Time
                            </button>
                        </div>
                    ) : (
                        <>
                            <span className="text-5xl font-black tabular-nums tracking-tight">{formatTime(timeLeft)}</span>
                            <span onClick={() => setIsEditingTime(true)} className="text-sm font-semibold text-gray-400 tracking-widest uppercase mt-1 flex items-center gap-1 cursor-pointer hover:text-gray-500 dark:hover:text-gray-300 transition-colors p-2 -m-2">
                                Remaining <Edit2 className="w-3.5 h-3.5" />
                            </span>
                        </>
                    )}
                </div>
            </div>

            {!isEditingTime && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                    <button onClick={() => applyPreset(15)} className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer">15m</button>
                    <button onClick={() => applyPreset(25)} className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer">25m</button>
                    <button onClick={() => applyPreset(60)} className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer">1h</button>
                    <button onClick={() => applyPreset(120)} className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer">2h</button>
                </div>
            )}

            <div className="flex items-center gap-4">
                <button onClick={handleReset} className="p-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:opacity-80 transition-opacity">
                    <RotateCcw className="w-6 h-6" />
                </button>
                {isRunning ? (
                    <button onClick={handlePause} className="px-10 py-4 rounded-2xl text-white font-bold text-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all flex items-center gap-2 active:scale-95 bg-orange-500">
                        <Pause className="w-6 h-6"/> Pause
                    </button>
                ) : (
                    <button onClick={handleStart} className="px-10 py-4 rounded-2xl text-white font-bold text-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all flex items-center gap-2 active:scale-95" style={{ backgroundColor: 'var(--theme-primary)' }}>
                        <Play className="w-6 h-6 fill-current"/> Start
                    </button>
                )}
            </div>
        </section>
    );
}

function InsightsView() {
    const mockTests = useAppStore(state => state.mockTests);
    const addMockTest = useAppStore(state => state.addMockTest);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

    const chartData = useMemo(() => {
        return [...mockTests]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(t => ({
                name: t.testName.length > 12 ? t.testName.slice(0, 12) + '…' : t.testName,
                fullName: t.testName,
                percentage: Math.round((t.score / t.totalMarks) * 100),
                score: t.score,
                totalMarks: t.totalMarks,
                date: t.date,
            }));
    }, [mockTests]);

    const averagePercentage = useMemo(() => {
        if (chartData.length === 0) return 0;
        const sum = chartData.reduce((acc, d) => acc + d.percentage, 0);
        return Math.round(sum / chartData.length);
    }, [chartData]);

    const bestScore = useMemo(() => {
        if (chartData.length === 0) return 0;
        return Math.max(...chartData.map(d => d.percentage));
    }, [chartData]);

    const latestTrend = useMemo(() => {
        if (chartData.length < 2) return 0;
        return chartData[chartData.length - 1].percentage - chartData[chartData.length - 2].percentage;
    }, [chartData]);

    const handleDeleteMockTest = (id: string) => {
        if (window.confirm('Delete this mock test log?')) {
            const updated = mockTests.filter(t => t.id !== id);
            useAppStore.setState({ mockTests: updated });
            if (typeof window !== 'undefined') localStorage.setItem('mockTests', JSON.stringify(updated));
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-3 shadow-xl text-sm">
                    <p className="font-bold text-gray-900 dark:text-white mb-1">{d.fullName}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="font-black text-lg" style={{ color: 'var(--theme-primary)' }}>{d.percentage}%</p>
                    <p className="text-xs text-gray-400">{d.score}/{d.totalMarks} marks</p>
                </div>
            );
        }
        return null;
    };

    return (
        <section className="animate-in fade-in duration-300 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold tracking-tight">Score Trends</h2>
                <button
                    onClick={() => setIsLogModalOpen(true)}
                    className="flex items-center gap-1.5 text-sm font-medium text-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                    <Plus className="w-4 h-4" /> Log Test
                </button>
            </div>

            {/* Summary Stats Cards */}
            {mockTests.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Average</p>
                        <p className="text-2xl font-black" style={{ color: 'var(--theme-primary)' }}>{averagePercentage}%</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Best</p>
                        <p className="text-2xl font-black text-emerald-500">{bestScore}%</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Trend</p>
                        <p className={cn("text-2xl font-black", latestTrend >= 0 ? "text-emerald-500" : "text-red-500")}>
                            {latestTrend >= 0 ? '+' : ''}{latestTrend}%
                        </p>
                    </div>
                </div>
            )}

            {/* Line Chart */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
                <h3 className="font-bold text-lg mb-1">Mock Test Score Trend</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">Track your improvement over time</p>
                {chartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                            <ClipboardList className="w-8 h-8 text-gray-300 dark:text-zinc-600" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No mock tests logged yet.</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Tap "Log Test" to record your first score.</p>
                    </div>
                ) : (
                    <div className="w-full h-[260px] sm:h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--theme-primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--theme-primary)" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={5}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v: number) => `${v}%`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="percentage"
                                    stroke="var(--theme-primary)"
                                    strokeWidth={3}
                                    fill="url(#scoreGradient)"
                                    dot={{ r: 5, fill: 'var(--theme-primary)', stroke: '#fff', strokeWidth: 2 }}
                                    activeDot={{ r: 7, fill: 'var(--theme-primary)', stroke: '#fff', strokeWidth: 3 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Recent Test Logs */}
            {mockTests.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-bold text-lg px-1">Recent Test Logs</h3>
                    {[...mockTests].reverse().map((test) => {
                        const pct = Math.round((test.score / test.totalMarks) * 100);
                        return (
                            <div key={test.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-4 group">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="relative w-12 h-12 flex-shrink-0">
                                        <svg className="w-12 h-12 -rotate-90 transform" viewBox="0 0 44 44">
                                            <circle cx="22" cy="22" r="18" fill="none" className="stroke-gray-100 dark:stroke-zinc-800" strokeWidth="4" />
                                            <circle
                                                cx="22" cy="22" r="18" fill="none"
                                                strokeWidth="4"
                                                strokeDasharray={2 * Math.PI * 18}
                                                strokeDashoffset={2 * Math.PI * 18 - (pct / 100) * 2 * Math.PI * 18}
                                                strokeLinecap="round"
                                                className="transition-all duration-500"
                                                style={{ stroke: pct >= 70 ? '#10b981' : pct >= 40 ? 'var(--theme-primary)' : '#ef4444' }}
                                            />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black">{pct}%</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-sm truncate">{test.testName}</h4>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                            {new Date(test.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            <span className="ml-2 text-gray-300 dark:text-zinc-600">•</span>
                                            <span className="ml-2">{test.score}/{test.totalMarks}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteMockTest(test.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {isLogModalOpen && (
                <LogMockTestModal
                    onClose={() => setIsLogModalOpen(false)}
                    onSave={(test) => {
                        addMockTest(test);
                        setIsLogModalOpen(false);
                    }}
                />
            )}
        </section>
    );
}

function LogMockTestModal({ onClose, onSave }: { onClose: () => void, onSave: (test: { testName: string, score: number, totalMarks: number, date: string }) => void }) {
    const [testName, setTestName] = useState('');
    const [score, setScore] = useState('');
    const [totalMarks, setTotalMarks] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSave = () => {
        const s = parseFloat(score);
        const t = parseFloat(totalMarks);
        if (testName.trim() && !isNaN(s) && !isNaN(t) && t > 0 && s >= 0 && s <= t && date) {
            onSave({ testName: testName.trim(), score: s, totalMarks: t, date });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6 animate-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Log Mock Test</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Name</label>
                        <input
                            type="text"
                            autoFocus
                            placeholder="e.g. UP SI Full Test 1"
                            className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:ring-0 focus:border-primary outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            value={testName}
                            onChange={e => setTestName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</label>
                            <input
                                type="number"
                                min="0"
                                placeholder="85"
                                className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:ring-0 focus:border-primary outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                value={score}
                                onChange={e => setScore(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Marks</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="200"
                                className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:ring-0 focus:border-primary outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                value={totalMarks}
                                onChange={e => setTotalMarks(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</label>
                        <input
                            type="date"
                            className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 focus:ring-0 focus:border-primary outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleSave}
                        className="w-full py-3.5 text-white rounded-xl font-bold shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                        style={{ backgroundColor: 'var(--theme-primary)', boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)' }}
                    >
                        Save Mock Test
                    </button>
                </div>
            </div>
        </div>
    );
}
