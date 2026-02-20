import React, { useState } from 'react';
import { Task } from '../types';
import AddTaskForm from './AddTaskForm';
import EditTaskForm from './EditTaskForm';
import GoalsPanel, { GoalData } from './GoalsPanel';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskDashboardProps {
    tasks: Task[];
    activeTaskId: string | null;
    onPlayTask: (id: string) => void;
    onAddTask: (data: { title: string; estimatedSeconds: number; location?: string; purpose?: string }) => Promise<void>;
    onEditTask: (id: string, data: { title: string; estimatedSeconds: number; location?: string; purpose?: string }) => Promise<void>;
    onDeleteTask: (id: string) => void;
    onToggleComplete: (id: string) => void;
    loading?: boolean;
    goals: GoalData;
    onSaveGoal: (type: 'year' | 'month' | 'week', content: string) => Promise<void>;
    onSaveGoalImage: (type: 'year' | 'month' | 'week', imageUrl: string | null) => Promise<void>;
    onFinishDay: () => Promise<void>;
}

const formatDuration = (totalSeconds: number): string => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
};

const TaskDashboard: React.FC<TaskDashboardProps> = ({
    tasks,
    activeTaskId,
    onPlayTask,
    onAddTask,
    onEditTask,
    onDeleteTask,
    onToggleComplete,
    loading,
    goals,
    onSaveGoal,
    onSaveGoalImage,
    onFinishDay,
}) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const pendingTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    const handleAdd = async (data: { title: string; estimatedSeconds: number; location?: string; purpose?: string }) => {
        setCreating(true);
        await onAddTask(data);
        setCreating(false);
        setShowAddForm(false);
    };

    const today = new Date();
    const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="relative h-full w-full grid grid-cols-1 lg:grid-cols-2 overflow-hidden">

            {/* Left Column: Tasks */}
            <div className="flex flex-col px-6 md:px-12 pt-8 pb-12 overflow-y-auto">

                {/* Header */}
                <div className="mb-10">
                    <p className="text-slate-500 text-sm font-medium mb-1">{dateStr}</p>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{greeting}</h1>
                </div>

                {/* Add Task Button / Form */}
                <AnimatePresence mode="wait">
                    {showAddForm ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-2xl mb-8 rounded-3xl p-6 md:p-8"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            <h3 className="text-lg font-semibold text-white mb-5">New Task</h3>
                            <AddTaskForm onSubmit={handleAdd} onCancel={() => setShowAddForm(false)} loading={creating} />
                        </motion.div>
                    ) : (
                        <motion.button
                            key="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddForm(true)}
                            className="group w-full max-w-2xl mb-8 py-4 px-6 rounded-2xl flex items-center gap-3 text-sm font-medium text-slate-500 hover:text-white transition-all"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <svg className="w-5 h-5 text-slate-600 group-hover:text-[#7f19e6] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Add a task
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Pending Tasks */}
                <div className="w-full max-w-2xl space-y-3 flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-[#7f19e6] animate-spin" />
                        </div>
                    ) : pendingTasks.length === 0 && !showAddForm ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                                style={{ background: 'rgba(127,25,230,0.1)', border: '1px solid rgba(127,25,230,0.2)' }}>
                                <svg className="w-8 h-8 text-[#7f19e6]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <p className="text-slate-500 text-sm">No tasks yet. Add one to get started.</p>
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
                                    className={`group rounded-2xl p-5 flex items-start gap-4 transition-all ${activeTaskId === task.id
                                        ? 'ring-1 ring-[#7f19e6]/40'
                                        : ''
                                        }`}
                                    style={{
                                        background: activeTaskId === task.id ? 'rgba(127,25,230,0.08)' : 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => onToggleComplete(task.id)}
                                        className="mt-0.5 w-5 h-5 rounded-md border border-white/15 hover:border-[#7f19e6]/50 flex-shrink-0 flex items-center justify-center transition-colors hover:bg-[#7f19e6]/10"
                                    />

                                    {/* Content */}
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
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-semibold text-sm leading-snug mb-1.5">{task.title}</h4>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    {/* Duration tag */}
                                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatDuration(task.estimatedSeconds)}
                                                    </span>
                                                    {/* Location tag */}
                                                    {task.location && (
                                                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                                            </svg>
                                                            {task.location}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Purpose */}
                                                {task.purpose && (
                                                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{task.purpose}</p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                {/* Edit */}
                                                <button
                                                    onClick={() => setEditingTaskId(task.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-[#a855f7] transition-all cursor-pointer"
                                                    title="Edit task"
                                                    aria-label="Edit task"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    onClick={() => onDeleteTask(task.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 transition-all cursor-pointer"
                                                    title="Delete task"
                                                    aria-label="Delete task"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                                {/* Play */}
                                                <button
                                                    onClick={() => onPlayTask(task.id)}
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #7f19e6 0%, #a855f7 100%)',
                                                        boxShadow: '0 4px 16px -2px rgba(127,25,230,0.35)',
                                                    }}
                                                    title="Start timer"
                                                    aria-label="Start timer"
                                                >
                                                    <svg className="w-4 h-4 text-white translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
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
                        <div className="mt-10">
                            <p className="text-xs text-slate-600 uppercase tracking-widest font-bold mb-3 ml-1">
                                Completed · {completedTasks.length}
                            </p>
                            <div className="space-y-2">
                                {completedTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="group rounded-2xl px-5 py-3.5 flex items-center gap-4 transition-all"
                                        style={{
                                            background: 'rgba(255,255,255,0.015)',
                                            border: '1px solid rgba(255,255,255,0.04)',
                                        }}
                                    >
                                        <button
                                            onClick={() => onToggleComplete(task.id)}
                                            className="w-5 h-5 rounded-md bg-[#7f19e6]/20 border border-[#7f19e6]/30 flex-shrink-0 flex items-center justify-center"
                                        >
                                            <svg className="w-3 h-3 text-[#7f19e6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                        <span className="text-sm text-slate-600 line-through flex-1">{task.title}</span>
                                        <span className="text-xs text-slate-700">{formatDuration(task.estimatedSeconds)}</span>
                                        <button
                                            onClick={() => onDeleteTask(task.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-700 hover:text-red-400 transition-all"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Finish the Day Button */}
                {tasks.length > 0 && (
                    <div className="mt-6 mb-4 flex justify-center">
                        <button
                            onClick={async () => {
                                if (window.confirm('Finish the day? This will clear all your tasks so you can start fresh tomorrow.')) {
                                    await onFinishDay();
                                }
                            }}
                            className="py-3 px-6 rounded-xl flex items-center gap-2.5 transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
                            style={{
                                background: 'rgba(127,25,230,0.1)',
                                border: '1px solid rgba(127,25,230,0.2)',
                            }}
                            aria-label="Finish the day"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                <circle cx="12" cy="12" r="4" />
                            </svg>
                            <span className="text-sm font-medium" style={{ color: '#a855f7' }}>
                                Finish the Day
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* Right Column: Goals */}
            <div className="hidden lg:block border-l overflow-y-auto" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <GoalsPanel goals={goals} onSaveGoal={onSaveGoal} onSaveGoalImage={onSaveGoalImage} />
            </div>
        </div>
    );
};

export default TaskDashboard;
