'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

const themeColors: Record<string, string> = {
    indigo: '238 82% 66%',
    teal: '167 71% 42%',
    purple: '271 81% 56%',
    rose: '346 87% 53%'
};

export function ThemeEngine() {
    const themeColor = useAppStore(state => state.themeColor);
    const themeImage = useAppStore(state => state.themeImage);

    useEffect(() => {
        const colorHsl = themeColors[themeColor] || themeColors['indigo'];
        document.documentElement.style.setProperty('--theme-primary', `hsl(${colorHsl})`);
    }, [themeColor]);

    useEffect(() => {
        if (themeImage) {
            document.documentElement.style.setProperty('background-image', `url(${themeImage})`);
            document.documentElement.style.setProperty('background-size', 'cover');
            document.documentElement.style.setProperty('background-position', 'center');
            document.documentElement.style.setProperty('background-attachment', 'fixed');
            // Adding a dark underlay globally forces the dark mode colors to look good over the image
            document.documentElement.style.setProperty('background-color', '#000000');
        } else {
            document.documentElement.style.removeProperty('background-image');
            document.documentElement.style.removeProperty('background-size');
            document.documentElement.style.removeProperty('background-position');
            document.documentElement.style.removeProperty('background-attachment');
            document.documentElement.style.removeProperty('background-color');
        }
    }, [themeImage]);

    if (!themeImage) return null;

    // Fixed overlay background to maintain contrast over the image globally in the app
    return (
        <div className="fixed inset-0 bg-white/60 dark:bg-black/80 z-[-1] pointer-events-none transition-colors duration-300 backdrop-blur-[2px]" />
    );
}
