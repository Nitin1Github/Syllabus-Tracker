'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { useAppStore } from '@/lib/store';
import { X, Moon, Sun, Monitor, Palette, Image as ImageIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { theme, setTheme } = useTheme();
    const { themeColor, setThemeColor, themeImage, setThemeImage } = useAppStore();

    if (!isOpen) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setThemeImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const gradients = [
        { id: 'indigo', name: 'Default Indigo', bg: 'bg-indigo-600', class: 'indigo' },
        { id: 'teal', name: 'Cool & Calm', bg: 'bg-teal-500', class: 'teal' },
        { id: 'purple', name: 'Focus', bg: 'bg-purple-600', class: 'purple' },
        { id: 'rose', name: 'Energy', bg: 'bg-rose-500', class: 'rose' }
    ];

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
                            <button onClick={() => setTheme('light')} className={cn("p-2 border rounded-xl flex flex-col items-center gap-1 transition-all", theme === 'light' ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary' : 'border-gray-200 dark:border-zinc-800 hover:border-primary/50')}>
                                <Sun className="w-5 h-5" /> <span className="text-xs">Light</span>
                            </button>
                            <button onClick={() => setTheme('dark')} className={cn("p-2 border rounded-xl flex flex-col items-center gap-1 transition-all", theme === 'dark' ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary' : 'border-gray-200 dark:border-zinc-800 hover:border-primary/50')}>
                                <Moon className="w-5 h-5" /> <span className="text-xs">Dark</span>
                            </button>
                            <button onClick={() => setTheme('system')} className={cn("p-2 border rounded-xl flex flex-col items-center gap-1 transition-all", theme === 'system' ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary' : 'border-gray-200 dark:border-zinc-800 hover:border-primary/50')}>
                                <Monitor className="w-5 h-5" /> <span className="text-xs">System</span>
                            </button>
                        </div>
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

                    {/* Custom Background */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                            <ImageIcon className="w-4 h-4" /> Background
                        </div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setThemeImage(`/bg-${num}.jpg`)}
                                        className={cn(
                                            "aspect-video rounded-xl border-2 overflow-hidden transition-all bg-gray-100 dark:bg-zinc-800",
                                            themeImage === `/bg-${num}.jpg` ? 'border-primary' : 'border-transparent hover:border-gray-300'
                                        )}
                                    >
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Gallery {num}</div>
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setThemeImage('')}
                                    className="px-4 py-2 text-sm border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Clear Image
                                </button>
                                <label className="flex-1 text-center px-4 py-2 text-sm bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors font-medium">
                                    Upload Custom
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
