import React, { useState } from 'react';
import { Folder, TimeBlock } from '../types';
import UserProfileMenu from './UserProfileMenu';
import { motion, AnimatePresence } from 'framer-motion';
import EditFolderForm from './EditFolderForm';

interface TaskDashboardProps {
    folders: Folder[];
    onAddFolder: (name: string, startTime?: string, endTime?: string, timeBlocks?: TimeBlock[]) => Promise<void>;
    onUpdateFolder: (id: string, data: { name: string; startTime?: string; endTime?: string; timeBlocks?: TimeBlock[] }) => Promise<void>;
    onSelectFolder: (folderId: string) => void;
    onDeleteFolder: (folderId: string) => void;
    onToggleFolderCompletion: (folderId: string) => void;
    loading?: boolean;
    onStartBreak?: () => void;
    currentView?: 'dashboard' | 'analysis';
    onToggleView?: () => void;
}

const TaskDashboard: React.FC<TaskDashboardProps> = ({
    folders,
    onAddFolder,
    onSelectFolder,
    onDeleteFolder,
    onToggleFolderCompletion,
    loading,
    onStartBreak,
    currentView,
    onToggleView,
    onUpdateFolder,
}) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newStartTime, setNewStartTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');
    const [newTimeBlocks, setNewTimeBlocks] = useState<TimeBlock[]>([]);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleAddTimeBlock = () => {
        setNewTimeBlocks([...newTimeBlocks, { startTime: '', endTime: '' }]);
    };

    const handleRemoveTimeBlock = (index: number) => {
        setNewTimeBlocks(newTimeBlocks.filter((_, i) => i !== index));
    };

    const handleTimeChange = (index: number, field: keyof TimeBlock, value: string) => {
        const updated = [...newTimeBlocks];
        updated[index] = { ...updated[index], [field]: value };
        setNewTimeBlocks(updated);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        setCreating(true);
        
        const validBlocks = [...newTimeBlocks];
        if (newStartTime && newEndTime) {
            validBlocks.unshift({ startTime: newStartTime, endTime: newEndTime });
        }
        
        await onAddFolder(
            newFolderName.trim(), 
            undefined, 
            undefined,
            validBlocks
        );
        setNewFolderName('');
        setNewStartTime('');
        setNewEndTime('');
        setNewTimeBlocks([]);
        setCreating(false);
        setShowAddForm(false);
    };

    // Sort folders: incomplete habits first, then others, then completed today
    const sortedFolders = [...folders].sort((a, b) => {
        if (a.isCompletedToday === b.isCompletedToday) return 0;
        return a.isCompletedToday ? 1 : -1;
    });

    return (
        <div className="flex flex-col h-full w-full px-4 sm:px-6 md:px-10 pt-6 sm:pt-10 pb-8 sm:pb-12 overflow-y-auto">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="w-10 h-10 rounded-xl shrink-0 border border-white/10 overflow-hidden shadow-[0_0_12px_rgba(34,197,94,0.3)]">
                        <img src="/logo.flowlock.png" alt="Flowlock Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl font-bold tracking-tight text-white shadow-sm">Flowlock</span>
                        <span className="px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold tracking-wider uppercase">Beta</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                    {onToggleView && (
                        <button
                            onClick={onToggleView}
                            className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/5 text-[#22C55E] text-xs font-bold uppercase tracking-widest hover:bg-[#22C55E]/10 hover:border-[#22C55E]/60 transition-all duration-300 cursor-pointer shadow-[0_0_15px_-5px_rgba(34,197,94,0.2)] hover:shadow-[0_0_20px_-2px_rgba(34,197,94,0.3)] active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>Analysis</span>
                        </button>
                    )}
                    <UserProfileMenu />
                </div>
            </div>

            {/* Subtitle Area */}
            <div className="mb-10 flex items-end justify-between">
                <div>
                    <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Your Folders</h2>
                    <p className="text-[#909AA6] font-medium text-lg">Organize your focus sessions.</p>
                </div>
                {onStartBreak && (
                    <button
                        onClick={onStartBreak}
                        className="group flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        }}
                    >
                        <svg className="w-4 h-4 text-[#22C55E] opacity-70 group-hover:opacity-100 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Take a Break
                    </button>
                )}
            </div>

            {/* New Block Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddForm(true)}
                className="w-full py-8 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 group hover:border-[#22C55E]/50 transition-all cursor-pointer mb-12 bg-white/[0.02] hover:bg-white/[0.05]"
            >
                <div className="p-2 rounded-xl bg-white/5 group-hover:bg-[#22C55E]/10 transition-colors">
                    <svg className="w-5 h-5 text-[#909AA6] group-hover:text-[#22C55E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <span className="text-[#909AA6] font-bold group-hover:text-white transition-colors uppercase tracking-widest text-xs">Create New Block</span>
            </motion.button>

            {/* Folders List */}
            <div className="w-full max-w-4xl space-y-3 flex-1 pb-10">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-[#22C55E] animate-spin" />
                    </div>
                ) : sortedFolders.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-[#909AA6] text-sm font-medium">No folders yet. Create a block to organize your tasks.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
                        <AnimatePresence>
                            {sortedFolders.map((folder, i) => {
                                const canComplete = folder.progress === 0;
                                
                                return (
                                    <motion.div
                                        key={folder.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ 
                                            opacity: folder.isCompletedToday ? 0.6 : 1, 
                                            y: 0 
                                        }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4, delay: i * 0.05 }}
                                        onClick={() => onSelectFolder(folder.id)}
                                        className={`group p-8 rounded-[2rem] transition-all duration-500 cursor-pointer relative flex flex-col h-[280px] overflow-hidden ${
                                            folder.isCompletedToday 
                                            ? 'bg-white/[0.02] border-white/5 grayscale-[0.5]' 
                                            : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-[#22C55E]/30'
                                        } border backdrop-blur-xl shadow-2xl`}
                                    >
                                        {/* Background hover glow */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/5 blur-[60px] -mr-16 -mt-16 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                        
                                        <div className="absolute top-6 right-6 z-30 flex items-center gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onPointerDownCapture={(e) => e.stopPropagation()}
                                                onClickCapture={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setEditingFolderId(folder.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-2.5 text-[#909AA6] hover:text-[#22C55E] transition-all cursor-pointer rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 relative z-30 pointer-events-auto"
                                                title="Edit folder"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onPointerDownCapture={(e) => e.stopPropagation()}
                                                onClickCapture={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setDeletingFolderId(folder.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-2.5 text-[#909AA6] hover:text-red-400 transition-all cursor-pointer rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 relative z-30 pointer-events-auto"
                                                title="Delete folder"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </motion.button>
                                        </div>

                                        <div className="flex flex-col h-full relative z-10 w-full">
                                            <div className="flex items-center gap-4 mb-6">
                                                {/* Circular Checklist Button */}
                                                <div className="pointer-events-auto">
                                                    <motion.button
                                                        whileHover={canComplete || folder.isCompletedToday ? { scale: 1.1 } : {}}
                                                        whileTap={canComplete || folder.isCompletedToday ? { scale: 0.9 } : {}}
                                                        onPointerDownCapture={(e) => e.stopPropagation()}
                                                        onClickCapture={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            if (canComplete || folder.isCompletedToday) {
                                                                onToggleFolderCompletion(folder.id);
                                                            }
                                                        }}
                                                        disabled={!canComplete && !folder.isCompletedToday}
                                                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative shrink-0 ${
                                                            folder.isCompletedToday
                                                            ? 'bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                                            : canComplete
                                                            ? 'bg-white/5 border-white/20 hover:border-[#22C55E] hover:bg-[#22C55E]/10 group/check'
                                                            : 'bg-white/[0.02] border-white/5 text-transparent cursor-not-allowed opacity-20'
                                                        }`}
                                                    >
                                                        <svg 
                                                            className={`w-5 h-5 transition-all duration-500 ${
                                                                folder.isCompletedToday ? 'opacity-100 scale-110' : 'opacity-0 scale-75 group-hover/check:opacity-100 group-hover/check:scale-100'
                                                            }`} 
                                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </motion.button>
                                                </div>

                                                <div className="flex flex-col min-w-0">
                                                    <h3 className={`text-2xl font-black tracking-tight transition-colors truncate ${
                                                        folder.isCompletedToday ? 'text-[#22C55E]' : 'text-white'
                                                    }`}>
                                                        {folder.name}
                                                    </h3>
                                                    {folder.isCompletedToday && (
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#22C55E]/60 -mt-0.5">COMPLETED TODAY</span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 mb-6">
                                                {folder.description ? (
                                                    <p className={`text-sm leading-relaxed line-clamp-3 min-h-[4.2rem] whitespace-pre-wrap transition-colors duration-500 ${
                                                        folder.isCompletedToday ? 'text-white/20' : 'text-white/50 group-hover:text-white/70'
                                                    }`}>
                                                        {folder.description}
                                                    </p>
                                                ) : (
                                                    <p className="text-white/10 text-xs italic min-h-[4.2rem] flex items-center">
                                                        No session intent defined yet.
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="flex flex-col gap-2">
                                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-500 ${
                                                                folder.isCompletedToday 
                                                                ? 'bg-white/5 text-white/40' 
                                                                : 'bg-[#22C55E]/5 text-[#22C55E] border border-[#22C55E]/10'
                                                            }`}>
                                                                {!folder.isCompletedToday && (
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                                                                )}
                                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                                    {folder.isCompletedToday ? 'SESSION CLOSED' : 'IN PROGRESS'}
                                                                </span>
                                                                <span className="w-px h-2.5 bg-current/20 mx-1" />
                                                                <span className="text-[10px] font-black">{folder.progress} TASKS LEFT</span>
                                                            </div>
                                                            
                                                            {((folder.timeBlocks && folder.timeBlocks.length > 0) || folder.startTime) && (
                                                                <div className="flex flex-col gap-1.5 ml-1">
                                                                    {(folder.timeBlocks && folder.timeBlocks.length > 0) ? (
                                                                        folder.timeBlocks.map((block, idx) => (
                                                                            <div key={idx} className="flex items-center gap-1.5 text-white/30">
                                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                                <span className="text-[10px] font-black tracking-tighter uppercase tabular-nums">
                                                                                    {block.startTime.slice(0, 5)} - {block.endTime.slice(0, 5)}
                                                                                </span>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="flex items-center gap-1.5 text-white/30">
                                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                            <span className="text-[10px] font-black tracking-tighter uppercase tabular-nums">
                                                                                {folder.startTime?.slice(0, 5)} - {folder.endTime?.slice(0, 5)}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Completion overlay effect */}
                                        {folder.isCompletedToday && (
                                            <div className="absolute inset-0 rounded-2xl border-2 border-[#22C55E]/10 pointer-events-none" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
            {/* Pop-ups / Modals */}
            <AnimatePresence>
                {/* Create Modal */}
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0D0E0D]/80 backdrop-blur-xl"
                        onClick={() => setShowAddForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#22C55E]/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
                            
                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/20">
                                        <svg className="w-6 h-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">Create New Block</h2>
                                        <p className="text-white/30 text-xs font-bold uppercase tracking-widest mt-1">Organize your focus session</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowAddForm(false)}
                                    className="p-2 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleAdd} className="space-y-8 relative z-10">
                                {/* Folder Name Input */}
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Block Name</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="What are we focusing on?"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white placeholder:text-white/20 outline-none focus:border-[#22C55E]/40 focus:bg-white/[0.05] transition-all duration-300 text-lg font-medium"
                                    />
                                </div>

                                {/* Work Blocks Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Execution Times</label>
                                        <motion.button 
                                            type="button"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleAddTimeBlock}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] font-black uppercase tracking-widest hover:bg-[#22C55E]/20 transition-all cursor-pointer"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                            Add Time Slot
                                        </motion.button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-1 text-center block">Start</label>
                                                <input
                                                    type="time"
                                                    value={newStartTime}
                                                    onChange={(e) => setNewStartTime(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-white outline-none focus:border-[#22C55E]/30 transition-all [color-scheme:dark] text-center font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-1 text-center block">End</label>
                                                <input
                                                    type="time"
                                                    value={newEndTime}
                                                    onChange={(e) => setNewEndTime(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-white outline-none focus:border-[#22C55E]/30 transition-all [color-scheme:dark] text-center font-bold"
                                                />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {newTimeBlocks.map((block, index) => (
                                                <motion.div 
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="grid grid-cols-[1fr,1fr,auto] gap-3 items-end"
                                                >
                                                    <div className="space-y-2">
                                                        <input
                                                            type="time"
                                                            value={block.startTime}
                                                            onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#22C55E]/30 transition-all [color-scheme:dark] text-center font-bold"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <input
                                                            type="time"
                                                            value={block.endTime}
                                                            onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                                                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#22C55E]/30 transition-all [color-scheme:dark] text-center font-bold"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTimeBlock(index)}
                                                        className="p-3 rounded-xl border border-white/5 text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={creating || !newFolderName.trim()}
                                        className="flex-[2] bg-[#22C55E] text-[#0D0E0D] rounded-2xl py-5 font-black uppercase tracking-widest text-xs hover:bg-[#22C55E]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_20px_40px_-10px_rgba(34,197,94,0.3)]"
                                    >
                                        {creating ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-[#0D0E0D]/30 border-t-[#0D0E0D] rounded-full animate-spin" />
                                                <span>Building...</span>
                                            </div>
                                        ) : 'Launch Block'}
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1 px-8 py-5 rounded-2xl border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:border-white/20 transition-all cursor-pointer"
                                    >
                                        Skip
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* Edit Modal */}
                {editingFolderId && (() => {
                    const folder = folders.find(f => f.id === editingFolderId);
                    if (!folder) return null;
                    return (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0D0E0D]/80 backdrop-blur-xl"
                            onClick={() => setEditingFolderId(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#22C55E]/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
                                
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <h2 className="text-2xl font-black text-white tracking-tight">Edit Work Block</h2>
                                    <button 
                                        onClick={() => setEditingFolderId(null)}
                                        className="p-2 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-all"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <EditFolderForm
                                    folder={folder}
                                    loading={isUpdating}
                                    onCancel={() => setEditingFolderId(null)}
                                    onSave={async (data) => {
                                        setIsUpdating(true);
                                        await onUpdateFolder(folder.id, data);
                                        setIsUpdating(false);
                                        setEditingFolderId(null);
                                    }}
                                />
                            </motion.div>
                        </motion.div>
                    );
                })()}

                {/* Delete Confirmation Modal */}
                {deletingFolderId && (() => {
                    const folder = folders.find(f => f.id === deletingFolderId);
                    if (!folder) return null;
                    return (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0D0E0D]/90 backdrop-blur-2xl"
                            onClick={() => setDeletingFolderId(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md bg-[#1A1A1A] border border-white/5 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden text-center"
                            >
                                <div className="w-20 h-20 rounded-3xl bg-red-400/10 flex items-center justify-center text-red-400 mx-auto mb-6 border border-red-400/20">
                                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                
                                <h2 className="text-2xl font-black text-white tracking-tight mb-3">Delete "{folder.name}"?</h2>
                                <p className="text-white/40 text-sm leading-relaxed mb-10">
                                    This action cannot be undone. All tasks inside this folder will also be permanently deleted.
                                </p>

                                <div className="flex flex-col gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            onDeleteFolder(folder.id);
                                            setDeletingFolderId(null);
                                        }}
                                        className="w-full bg-red-500 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                    >
                                        Yes, Delete Folder
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setDeletingFolderId(null)}
                                        className="w-full bg-white/5 text-white/40 rounded-2xl py-4 font-black uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
};

export default TaskDashboard;
