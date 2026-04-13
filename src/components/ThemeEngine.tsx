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

    useEffect(() => {
        const colorHsl = themeColors[themeColor] || themeColors['indigo'];
        document.documentElement.style.setProperty('--theme-primary', `hsl(${colorHsl})`);
    }, [themeColor]);

    // Restore eye comfort mode from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const eyeComfort = localStorage.getItem('eyeComfort');
            if (eyeComfort === 'true') {
                document.documentElement.classList.add('eye-comfort');
            }
        }
    }, []);

    return null;
}
