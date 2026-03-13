import React, { useState, useEffect, useRef } from 'react';
import { Task, PomodoroProfile, TimeBlock } from '../types';
import AddTaskForm from './AddTaskForm';
import EditTaskForm from './EditTaskForm';
import UserProfileMenu from './UserProfileMenu';
import { motion, AnimatePresence } from 'framer-motion';
import EditFolderForm from './EditFolderForm';

interface FolderViewProps {
    folderId: string;
    folderName: string;
    description: string;
    startTime?: string;
    endTime?: string;
    timeBlocks?: TimeBlock[];
    onUpdateDescription: (id: string, text: string) => Promise<void>;
    onUpdateFolder: (id: string, data: { name: string; startTime?: string; endTime?: string; timeBlocks?: TimeBlock[] }) => Promise<void>;
    pendingTasks: Task[];
    completedTasks: Task[];
    activeTaskId: string | null;
    editingTaskId: string | null;
    saving: boolean;
    onAddTask: (data: { title: string; pomodoroProfile: PomodoroProfile; pomodorosRequired: number }) => Promise<void>;
    onEditTask: (id: string, data: { title: string; pomodoroProfile: PomodoroProfile; pomodorosRequired: number }) => Promise<void>;
    onDeleteTask: (id: string) => void;
    onToggleComplete: (id: string) => Promise<void>;
    onPlayTask: (id: string) => void;
    setEditingTaskId: (id: string | null) => void;
    setSaving: (saving: boolean) => void;
    loading?: boolean;
    onStartBreak?: () => void;
    onBack: () => void;
}

const FolderView: React.FC<FolderViewProps> = ({
    folderId,
    folderName,
    description,
    startTime,
    endTime,
    timeBlocks,
    onUpdateDescription,
    onUpdateFolder,
    pendingTasks,
    completedTasks,
    activeTaskId,
    editingTaskId,
    saving,
    onPlayTask,
    onAddTask,
    onEditTask,
    onDeleteTask,
    onToggleComplete,
    setEditingTaskId,
    setSaving,
    loading,
    onStartBreak,
    onBack,
}) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [localDescription, setLocalDescription] = useState(description);
    const [isSavingDescription, setIsSavingDescription] = useState(false);
    const [isEditingFolder, setIsEditingFolder] = useState(false);
    const [isUpdatingFolder, setIsUpdatingFolder] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync with props if they change externally
    useEffect(() => {
        setLocalDescription(description);
    }, [description]);

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        const lines = val.split('\n');
        const words = val.trim().split(/\s+/).filter(Boolean);
        
        // Limit to 3 lines OR 30 words
        if (lines.length > 3 || words.length > 30) {
            return;
        }

        setLocalDescription(val);
        
        // Auto-save debouncing
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(async () => {
            setIsSavingDescription(true);
            await onUpdateDescription(folderId, val);
            setIsSavingDescription(false);
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            const lines = localDescription.split('\n');
            if (lines.length >= 3) {
                e.preventDefault();
            }
        }
    };

    const handleAdd = async (data: { title: string; pomodoroProfile: PomodoroProfile; pomodorosRequired: number }) => {
        setCreating(true);
        await onAddTask(data);
        setCreating(false);
        setShowAddForm(false);
    };

    return (
        <div className="flex flex-col h-full w-full px-4 sm:px-6 md:px-10 pt-6 sm:pt-10 pb-8 sm:pb-12 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                {/* Back Button and Folder Title */}
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button 
                        onClick={onBack}
                        className="p-2 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors cursor-pointer"
                        aria-label="Back to Folders"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black tracking-tight text-white">{folderName}</h2>
                            <button
                                onClick={() => setIsEditingFolder(true)}
                                className="p-1.5 text-[#909AA6] hover:text-[#22C55E] transition-all cursor-pointer rounded-lg hover:bg-white/5 group/edit"
                                title="Edit folder details"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                            </button>
                        </div>
                        {((timeBlocks && timeBlocks.length > 0) || startTime) && (
                            <div className="flex flex-col mt-1 gap-1">
                                {timeBlocks && timeBlocks.length > 0 ? (
                                    timeBlocks.map((block, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 text-[#22C55E]/60">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-[11px] font-bold tracking-widest uppercase">
                                                {block.startTime.slice(0, 5)} - {block.endTime.slice(0, 5)} Block
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center gap-1.5 text-[#22C55E]/60">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-[11px] font-bold tracking-widest uppercase">
                                            {startTime?.slice(0, 5)} - {endTime?.slice(0, 5)} Block
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {isEditingFolder && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/10 blur-[50px] -mr-16 -mt-16 rounded-full" />
                                
                                <h3 className="text-xl font-bold text-white mb-6 relative z-10">Edit Folder</h3>
                                
                                <EditFolderForm
                                    folder={{ id: folderId, name: folderName, timeBlocks }}
                                    loading={isUpdatingFolder}
                                    onCancel={() => setIsEditingFolder(false)}
                                    onSave={async (data) => {
                                        setIsUpdatingFolder(true);
                                        await onUpdateFolder(folderId, data);
                                        setIsUpdatingFolder(false);
                                        setIsEditingFolder(false);
                                    }}
                                />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-2 pointer-events-auto">
                    <UserProfileMenu />
                </div>
            </div>

            {/* Editable Description Section */}
            <div className="mb-8 group">
                <textarea
                    value={localDescription}
                    onChange={handleDescriptionChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Briefly state the goal for this folder (e.g., studying for exams, finishing work project)..."
                    className="w-full bg-transparent text-[#909AA6] font-medium text-lg leading-relaxed placeholder:text-[#909AA6]/30 resize-none outline-none border-none focus:ring-0 px-0 min-h-[40px] max-h-[120px]"
                    style={{ height: 'auto', overflow: 'hidden' }}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                    }}
                />
                <div className="flex items-center justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                        {isSavingDescription ? (
                            <span className="text-[10px] text-[#22C55E]/60 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full border border-t-transparent border-[#22C55E] animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            <span className="text-[10px] text-[#909AA6]/40">Changes saved automatically</span>
                        )}
                    </div>
                    <span className={`text-[10px] font-bold ${
                        localDescription.trim().split(/\s+/).filter(Boolean).length >= 30 ? 'text-red-400' : 'text-[#909AA6]/40'
                    }`}>
                        {localDescription.trim().split(/\s+/).filter(Boolean).length}/30 Words
                    </span>
                </div>
            </div>

            {/* Add Task Button / Form */}
            <AnimatePresence mode="wait">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider opacity-60">Tasks</h3>
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

                {showAddForm ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-2xl mb-8 rounded-3xl p-6 md:p-8"
                        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <h3 className="text-lg font-semibold text-white mb-5">New Task in {folderName}</h3>
                        <AddTaskForm onSubmit={handleAdd} onCancel={() => setShowAddForm(false)} loading={creating} />
                    </motion.div>
                ) : (
                    <motion.button
                        key="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddForm(true)}
                        className="w-full py-8 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 group hover:border-[#22C55E]/50 transition-colors cursor-pointer mb-8 bg-transparent"
                    >
                        <svg className="w-5 h-5 text-[#909AA6] group-hover:text-[#22C55E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-[#909AA6] font-medium group-hover:text-[#22C55E] transition-colors">Add task to {folderName}</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Tasks List */}
            <div className="w-full max-w-2xl space-y-3 flex-1 pb-10">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-[#7f19e6] animate-spin" />
                    </div>
                ) : pendingTasks.length === 0 && !showAddForm ? (
                    <div className="text-center py-20">
                        <p className="text-[#909AA6] text-sm font-medium">No tasks in this folder yet.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {pendingTasks.map((task, i) => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2, delay: i * 0.03 }}
                                className="group p-5 rounded-xl flex items-center justify-between transition-all bg-[#1A1A1A]/40 hover:bg-[#1A1A1A]/60"
                            >
                                {editingTaskId === task.id ? (
                                    <div className="flex-1 min-w-0">
                                        <EditTaskForm
                                            task={task}
                                            saving={saving}
                                            onSave={async (data) => {
                                                setSaving(true);
                                                await onEditTask(task.id, data);
                                                setSaving(false);
                                                setEditingTaskId(null);
                                            }}
                                            onCancel={() => setEditingTaskId(null)}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => onToggleComplete(task.id)}
                                            className="w-6 h-6 rounded-full border-2 border-white/15 hover:border-[#22C55E] flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-[#22C55E]/10 transition-all group/check mr-3"
                                        >
                                            <svg className="w-3 h-3 text-transparent group-hover/check:text-[#22C55E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>

                                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-white font-bold text-lg leading-snug truncate">{task.title}</h3>
                                                <span className="px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] text-xs font-medium shrink-0">
                                                    {task.pomodoroProfile ? `${task.pomodoroProfile.split('-')[0]}M` : '25M'}
                                                </span>
                                            </div>
                                            <p className="text-[#909AA6] text-sm truncate mt-1">{task.description}</p>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                                            <button
                                                onClick={() => setEditingTaskId(task.id)}
                                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-[#909AA6] hover:text-[#22C55E] transition-all cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => onDeleteTask(task.id)}
                                                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-[#909AA6] hover:text-red-400 transition-all cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => onPlayTask(task.id)}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-[#22C55E] text-[#0D0E0D] rounded-full font-bold text-sm hover:opacity-90 transition-opacity ml-2 shrink-0 border border-[#22C55E]"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                                Start Focus
                                            </button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {/* Completed Tasks */}
                {completedTasks.length > 0 && (
                    <div className="pt-6 mt-4">
                        <div className="flex items-center gap-2 text-[#909AA6] pb-4 border-b border-transparent">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                            <span className="font-bold text-sm uppercase tracking-wider">Completed · {completedTasks.length}</span>
                        </div>

                        <div className="space-y-2">
                            {completedTasks.map(task => (
                                <div key={task.id} className="group rounded-xl px-5 py-3.5 flex items-center gap-4 transition-all bg-transparent">
                                    <button
                                        onClick={() => onToggleComplete(task.id)}
                                        className="w-6 h-6 rounded-full border border-[#22C55E]/50 flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-[#22C55E]/10 transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                    <span className="text-sm text-[#909AA6] line-through flex-1 font-medium">{task.title}</span>
                                    <button
                                        onClick={() => onDeleteTask(task.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-[#909AA6] hover:text-red-400 transition-all cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FolderView;
