'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/lib/store';
import { X, Moon, Sun, Palette, Eye } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { theme, setTheme } = useTheme();
    const { themeColor, setThemeColor } = useAppStore();

    if (!isOpen) return null;

    const gradients = [
        { id: 'indigo', name: 'Default Indigo', bg: 'bg-indigo-600', class: 'indigo' },
        { id: 'teal', name: 'Cool & Calm', bg: 'bg-teal-500', class: 'teal' },
        { id: 'purple', name: 'Focus', bg: 'bg-purple-600', class: 'purple' },
        { id: 'rose', name: 'Energy', bg: 'bg-rose-500', class: 'rose' }
    ];

    const handleModeChange = (mode: string) => {
        if (mode === 'eye-comfort') {
            // Eye comfort uses light theme as a base + warm tint via CSS class
            setTheme('light');
            document.documentElement.classList.add('eye-comfort');
            if (typeof window !== 'undefined') localStorage.setItem('eyeComfort', 'true');
        } else {
            document.documentElement.classList.remove('eye-comfort');
            if (typeof window !== 'undefined') localStorage.setItem('eyeComfort', 'false');
            setTheme(mode);
        }
    };

    const isEyeComfort = typeof document !== 'undefined' && document.documentElement.classList.contains('eye-comfort');
    const currentMode = isEyeComfort ? 'eye-comfort' : theme;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Settings
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* Theme Mode */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                            <Sun className="w-4 h-4" /> Mode
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => handleModeChange('light')} className={cn("p-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all", currentMode === 'light' ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary' : 'border-gray-200 dark:border-zinc-800 hover:border-primary/50')}>
                                <Sun className="w-5 h-5" /> <span className="text-xs font-medium">Light</span>
                            </button>
                            <button onClick={() => handleModeChange('dark')} className={cn("p-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all", currentMode === 'dark' ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary' : 'border-gray-200 dark:border-zinc-800 hover:border-primary/50')}>
                                <Moon className="w-5 h-5" /> <span className="text-xs font-medium">Dark</span>
                            </button>
                            <button onClick={() => handleModeChange('eye-comfort')} className={cn("p-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all", currentMode === 'eye-comfort' ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'border-gray-200 dark:border-zinc-800 hover:border-amber-300')}>
                                <Eye className="w-5 h-5" /> <span className="text-xs font-medium">Eye Comfort</span>
                            </button>
                        </div>
                        {currentMode === 'eye-comfort' && (
                            <p className="text-xs text-amber-600/80 dark:text-amber-400/80 bg-amber-50 dark:bg-amber-900/10 px-3 py-2 rounded-lg">
                                🌙 Warm sepia tint active — reduces blue light for comfortable night study.
                            </p>
                        )}
                    </section>

                    {/* Accent Color */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                            <Palette className="w-4 h-4" /> Accent Colors
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {gradients.map((g) => (
                                <button
                                    key={g.id}
                                    onClick={() => setThemeColor(g.class)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                        themeColor === g.class ? `border-primary bg-primary/10 dark:bg-primary/20` : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                                    )}
                                >
                                    <div className={cn("w-6 h-6 rounded-full shadow-inner", g.bg)} />
                                    <span className="text-sm font-medium">{g.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
