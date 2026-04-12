'use client';

import { useMemo } from 'react';
import { ExamData } from '@/lib/types';
import { calculateProgress } from '@/lib/utils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProgressBarProps {
    exams: ExamData[];
    activeExamId: string | null;
}

export default function ProgressBar({ exams, activeExamId }: ProgressBarProps) {
    const activeExam = useMemo(() => exams.find(e => e.id === activeExamId), [exams, activeExamId]);

    const masterProgress = useMemo(() => {
        const allSyllabus = exams.flatMap(e => e.syllabus);
        return calculateProgress(allSyllabus);
    }, [exams]);

    const activeProgress = useMemo(() => {
        if (!activeExam) return { total: 0, completed: 0, percentage: 0 };
        return calculateProgress(activeExam.syllabus);
    }, [activeExam]);

    if (exams.length === 0) return null;

    const itemsLeft = activeProgress.total - activeProgress.completed;

    return (
        <div 
            className="rounded-2xl p-5 shadow-sm border border-[color:var(--theme-primary)]/10 dark:border-[color:var(--theme-primary)]/20 transition-colors duration-300 relative overflow-hidden"
            style={{
                backgroundImage: 'linear-gradient(135deg, rgba(var(--theme-primary-rgb), 0.05) 0%, rgba(var(--theme-primary-rgb), 0.01) 100%)'
            }}
        >
            <div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-[2px] z-0" />
            <div className="relative z-10">
            {/* Master Progress */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-[13px]">
                        Master Overall Progress
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-extrabold text-[#7c3aed]">
                            {masterProgress.percentage}%
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:inline-block pt-1">
                            Target: 95%
                        </span>
                    </div>
                </div>

                <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                            width: `${masterProgress.percentage}%`,
                            backgroundImage: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)'
                        }}
                    />
                </div>
            </div>

            {/* Active Exam Progress */}
            {activeExam && (
                <div>
                    <div className="flex items-center justify-between mb-2.5">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-[13px]">
                            Active Exam Progress
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold text-[#10b981]">
                                {activeProgress.percentage}%
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:inline-block pt-1">
                                {itemsLeft} Items Left
                            </span>
                        </div>
                    </div>

                    <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: `${activeProgress.percentage}%`,
                                backgroundImage: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                            }}
                        />
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
