import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2, Download } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ActionMenuProps {
    onEdit: () => void;
    onDelete: () => void;
    onImport?: () => void;
    onAdd?: () => void;
    addLabel?: string;
    className?: string;
}

export default function ActionMenu({ onEdit, onDelete, onImport, onAdd, addLabel = "Add new", className }: ActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={cn("relative flex items-center justify-center", className)} ref={menuRef}>
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-800 py-1.5 z-[100] animate-in fade-in zoom-in-95 duration-100">
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); onEdit(); }}
                        className="w-full text-left px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 mb-1"
                    >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    {onAdd && (
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); onAdd(); }}
                            className="w-full text-left px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 mb-1 border-b border-gray-100 dark:border-zinc-800 pb-2"
                        >
                            <span className="flex items-center gap-2 whitespace-nowrap">
                                <span className="w-3.5 h-3.5 flex items-center justify-center text-lg leading-none mb-0.5">+</span> {addLabel}
                            </span>
                        </button>
                    )}
                    {onImport && (
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); onImport(); }}
                            className="w-full text-left px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                        >
                            <Download className="w-3.5 h-3.5" /> Import Syllabus
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); onDelete(); }}
                        className="w-full text-left px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 mt-1 pt-2 border-t border-gray-100 dark:border-zinc-800"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                </div>
            )}
        </div>
    );
}
