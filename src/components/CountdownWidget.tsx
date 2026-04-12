'use client';

import { useMemo } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';

interface CountdownWidgetProps {
    targetDate: string;
    examName: string;
}

export default function CountdownWidget({ targetDate, examName }: CountdownWidgetProps) {
    const daysLeft = useMemo(() => {
        try {
            const target = parseISO(targetDate);
            const today = new Date();
            // Set to start of day to avoid partial day calculations
            today.setHours(0, 0, 0, 0);
            return differenceInDays(target, today);
        } catch {
            return 0;
        }
    }, [targetDate]);

    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            {/* Decorative background circle */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10" />
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-indigo-400 opacity-20" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                        <Clock className="w-4 h-4" />
                        <span>Target Exam</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">{examName}</h2>
                    <div className="flex items-center justify-center md:justify-start space-x-2 text-indigo-100">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                            {new Date(targetDate).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 text-center min-w-[120px] shadow-inner transform transition-transform hover:scale-105">
                    <div className="text-4xl font-extrabold text-blue-600">
                        {daysLeft > 0 ? daysLeft : 0}
                    </div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">
                        Days Left
                    </div>
                </div>
            </div>
        </div>
    );
}
