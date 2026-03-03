import React, { useState, useMemo } from 'react';
import { Task, Block, BlockSchedule } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Preset color palette ────────────────────────────────────────────
const BLOCK_COLORS = [
    '#5272c6', '#6a85cd', '#8299d5', '#9aaddd',
    '#a855f7', '#ec4899', '#f59e0b', '#10b981',
    '#ef4444', '#8b5cf6', '#06b6d4', '#f97316',
];

const HOUR_HEIGHT = 60; // px per hour
const TIMELINE_START = 5; // 5 AM
const TIMELINE_END = 24; // midnight
const TOTAL_HOURS = TIMELINE_END - TIMELINE_START;

interface AnalysisPageProps {
    tasks: Task[];
    blocks: Block[];
    blockSchedules: BlockSchedule[];
    onCreateBlock: (name: string, color: string) => Promise<void>;
    onUpdateBlock: (id: string, name: string, color: string) => Promise<void>;
    onDeleteBlock: (id: string) => Promise<void>;
    onCreateSchedule: (blockId: string, startTime: string, endTime: string) => Promise<void>;
    onUpdateSchedule: (id: string, blockId: string, startTime: string, endTime: string) => Promise<void>;
    onDeleteSchedule: (id: string) => Promise<void>;
    onBack: () => void;
}

const formatDuration = (totalSeconds: number): string => {
    if (totalSeconds <= 0) return '0m';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
};

const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

const formatHour = (hour: number): string => {
    if (hour === 0 || hour === 24) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
};

const AnalysisPage: React.FC<AnalysisPageProps> = ({
    tasks,
    blocks,
    blockSchedules,
    onCreateBlock,
    onUpdateBlock,
    onDeleteBlock,
    onCreateSchedule,
    onUpdateSchedule,
    onDeleteSchedule,
    onBack,
}) => {
    // ─── Block Management State ───────────────────────────
    const [showManageBlocks, setShowManageBlocks] = useState(false);
    const [newBlockName, setNewBlockName] = useState('');
    const [newBlockColor, setNewBlockColor] = useState(BLOCK_COLORS[0]);
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [editBlockName, setEditBlockName] = useState('');
    const [editBlockColor, setEditBlockColor] = useState('');
    const [creating, setCreating] = useState(false);

    // ─── Schedule Modal State ─────────────────────────────
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleBlockId, setScheduleBlockId] = useState('');
    const [scheduleStart, setScheduleStart] = useState('09:00');
    const [scheduleEnd, setScheduleEnd] = useState('10:00');
    const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
    const [savingSchedule, setSavingSchedule] = useState(false);

    // ─── Compute analytics ─────────────────────────────────
    const analysisData = useMemo(() => {
        const totalTimeSpent = tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
        const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimatedSeconds || 0), 0);
        const completedCount = tasks.filter(t => t.completed).length;

        const blockMap = new Map<string, { name: string; color: string; timeSpent: number; estimated: number; completed: number; total: number }>();
        tasks.forEach(t => {
            const key = t.blockId || '__unassigned__';
            const existing = blockMap.get(key) || {
                name: t.blockName || 'Unassigned',
                color: t.blockColor || '#4b5563',
                timeSpent: 0, estimated: 0, completed: 0, total: 0,
            };
            existing.timeSpent += (t.timeSpent || 0);
            existing.estimated += (t.estimatedSeconds || 0);
            existing.completed += t.completed ? 1 : 0;
            existing.total += 1;
            blockMap.set(key, existing);
        });

        const blockBreakdown = Array.from(blockMap.entries())
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.timeSpent - a.timeSpent);

        return { totalTimeSpent, totalEstimated, completedCount, totalTasks: tasks.length, blockBreakdown };
    }, [tasks]);

    const maxBlockTime = Math.max(...analysisData.blockBreakdown.map(b => b.timeSpent), 1);

    // ─── Block Handlers ───────────────────────────────────
    const handleCreate = async () => {
        if (!newBlockName.trim() || creating) return;
        setCreating(true);
        await onCreateBlock(newBlockName.trim(), newBlockColor);
        setNewBlockName('');
        setNewBlockColor(BLOCK_COLORS[0]);
        setCreating(false);
    };

    const handleStartEdit = (block: Block) => {
        setEditingBlockId(block.id);
        setEditBlockName(block.name);
        setEditBlockColor(block.color);
    };

    const handleSaveEdit = async () => {
        if (!editingBlockId || !editBlockName.trim()) return;
        await onUpdateBlock(editingBlockId, editBlockName.trim(), editBlockColor);
        setEditingBlockId(null);
    };

    // ─── Schedule Handlers ────────────────────────────────
    const openCreateSchedule = () => {
        setEditingScheduleId(null);
        setScheduleBlockId(blocks[0]?.id || '');
        setScheduleStart('09:00');
        setScheduleEnd('10:00');
        setShowScheduleModal(true);
    };

    const openEditSchedule = (schedule: BlockSchedule) => {
        setEditingScheduleId(schedule.id);
        setScheduleBlockId(schedule.blockId);
        setScheduleStart(schedule.startTime);
        setScheduleEnd(schedule.endTime);
        setShowScheduleModal(true);
    };

    const handleSaveSchedule = async () => {
        if (!scheduleBlockId || !scheduleStart || !scheduleEnd) return;
        setSavingSchedule(true);
        if (editingScheduleId) {
            await onUpdateSchedule(editingScheduleId, scheduleBlockId, scheduleStart, scheduleEnd);
        } else {
            await onCreateSchedule(scheduleBlockId, scheduleStart, scheduleEnd);
        }
        setSavingSchedule(false);
        setShowScheduleModal(false);
    };

    const handleDeleteScheduleItem = async (id: string) => {
        await onDeleteSchedule(id);
        setShowScheduleModal(false);
    };

    // ─── Get block info helper ────────────────────────────
    const getBlock = (id: string) => blocks.find(b => b.id === id);

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Compute current time indicator position
    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    const nowOffset = ((nowMinutes - TIMELINE_START * 60) / 60) * HOUR_HEIGHT;
    const showNowLine = nowMinutes >= TIMELINE_START * 60 && nowMinutes <= TIMELINE_END * 60;

    return (
        <div className="h-full w-full overflow-hidden flex flex-col lg:flex-row">

            {/* ═══════════════════════════════════════════════════════
                LEFT PANEL — Analytics
               ═══════════════════════════════════════════════════════ */}
            <div className="lg:w-[45%] xl:w-[40%] h-full overflow-y-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 flex-shrink-0" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5272c6, #8299d5)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                    </div>
                    <span className="text-sm font-bold tracking-tight text-white">Analysis</span>
                </div>

                <p className="text-slate-500 text-xs font-medium mb-1">{dateStr}</p>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-6">Today's Focus</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-2.5 mb-8">
                    {[
                        { label: 'Time Worked', value: formatDuration(analysisData.totalTimeSpent), color: '#5272c6' },
                        { label: 'Planned', value: formatDuration(analysisData.totalEstimated), color: '#8299d5' },
                        { label: 'Completed', value: `${analysisData.completedCount}`, color: '#10b981' },
                        { label: 'Total Tasks', value: `${analysisData.totalTasks}`, color: '#a855f7' },
                    ].map(card => (
                        <div key={card.label} className="rounded-xl p-3.5"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{card.label}</p>
                            <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Block Breakdown */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white">Block Breakdown</h2>
                        <button onClick={() => setShowManageBlocks(prev => !prev)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer"
                            style={{
                                background: showManageBlocks ? 'rgba(82,114,198,0.2)' : 'rgba(255,255,255,0.06)',
                                border: showManageBlocks ? '1px solid rgba(82,114,198,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                color: showManageBlocks ? '#9aaddd' : 'rgba(255,255,255,0.5)',
                            }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24" />
                            </svg>
                            {showManageBlocks ? 'Close' : 'Manage'}
                        </button>
                    </div>

                    {analysisData.blockBreakdown.length === 0 ? (
                        <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p className="text-slate-500 text-xs">No tasks yet. Create some tasks and assign them to blocks!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {analysisData.blockBreakdown.map(block => {
                                const percentage = analysisData.totalTimeSpent > 0 ? Math.round((block.timeSpent / analysisData.totalTimeSpent) * 100) : 0;
                                const barWidth = maxBlockTime > 0 ? (block.timeSpent / maxBlockTime) * 100 : 0;
                                return (
                                    <motion.div key={block.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                        className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: block.color }} />
                                                <span className="text-xs font-semibold text-white">{block.name}</span>
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${block.color}15`, color: block.color }}>
                                                    {block.completed}/{block.total}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {block.timeSpent > 0 && <span className="text-[10px] font-bold" style={{ color: block.color }}>{percentage}%</span>}
                                                <span className="text-xs font-bold text-white tabular-nums">{formatDuration(block.timeSpent)}</span>
                                            </div>
                                        </div>
                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${barWidth}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${block.color}, ${block.color}aa)` }} />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Manage Blocks Panel */}
                <AnimatePresence>
                    {showManageBlocks && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <h3 className="text-xs font-bold text-white mb-3">Manage Blocks</h3>
                                <div className="flex flex-col gap-2.5 mb-4">
                                    <input type="text" value={newBlockName} onChange={e => setNewBlockName(e.target.value)}
                                        placeholder="New block name..." className="px-3 py-2 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                                        onKeyDown={e => e.key === 'Enter' && handleCreate()} />
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {BLOCK_COLORS.map(c => (
                                            <button key={c} type="button" onClick={() => setNewBlockColor(c)}
                                                className="w-5 h-5 rounded-full transition-all cursor-pointer flex-shrink-0"
                                                style={{ background: c, boxShadow: newBlockColor === c ? `0 0 0 2px #0d0814, 0 0 0 3px ${c}` : 'none', opacity: newBlockColor === c ? 1 : 0.5 }} />
                                        ))}
                                        <button onClick={handleCreate} disabled={!newBlockName.trim() || creating}
                                            className="ml-auto px-4 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-40 cursor-pointer"
                                            style={{ background: 'linear-gradient(135deg, #5272c6, #8299d5)' }}>
                                            {creating ? '...' : 'Create'}
                                        </button>
                                    </div>
                                </div>
                                {blocks.length === 0 ? (
                                    <p className="text-slate-500 text-xs text-center py-3">No blocks yet.</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {blocks.map(block => (
                                            <div key={block.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg group transition-all"
                                                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                {editingBlockId === block.id ? (
                                                    <>
                                                        <input type="text" value={editBlockName} onChange={e => setEditBlockName(e.target.value)}
                                                            className="flex-1 px-2 py-1 rounded text-white text-xs bg-transparent focus:outline-none"
                                                            style={{ border: '1px solid rgba(255,255,255,0.15)' }} autoFocus
                                                            onKeyDown={e => e.key === 'Enter' && handleSaveEdit()} />
                                                        {BLOCK_COLORS.slice(0, 6).map(c => (
                                                            <button key={c} type="button" onClick={() => setEditBlockColor(c)}
                                                                className="w-4 h-4 rounded-full cursor-pointer" style={{ background: c, opacity: editBlockColor === c ? 1 : 0.3 }} />
                                                        ))}
                                                        <button onClick={handleSaveEdit} className="text-green-400 hover:text-green-300 cursor-pointer" aria-label="Save">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                        </button>
                                                        <button onClick={() => setEditingBlockId(null)} className="text-slate-500 hover:text-white cursor-pointer" aria-label="Cancel">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: block.color }} />
                                                        <span className="flex-1 text-xs font-medium text-white">{block.name}</span>
                                                        <button onClick={() => handleStartEdit(block)}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-[#9aaddd] transition-all cursor-pointer" aria-label="Edit">
                                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
                                                        </button>
                                                        <button onClick={() => onDeleteBlock(block.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all cursor-pointer" aria-label="Delete">
                                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


            {/* ═══════════════════════════════════════════════════════
                RIGHT PANEL — Daily Timeline
               ═══════════════════════════════════════════════════════ */}
            <div className="flex-1 h-full overflow-y-auto px-4 sm:px-6 pt-14 pb-8">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-bold text-white">Daily Timeline</h2>
                    <button onClick={openCreateSchedule} disabled={blocks.length === 0}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all disabled:opacity-30"
                        style={{ background: 'rgba(82,114,198,0.15)', border: '1px solid rgba(82,114,198,0.3)', color: '#9aaddd' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Block
                    </button>
                </div>

                {/* Timeline Canvas */}
                <div className="relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
                    {/* Hour Lines & Labels */}
                    {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
                        const hour = TIMELINE_START + i;
                        return (
                            <div key={hour} className="absolute left-0 right-0 flex items-start" style={{ top: i * HOUR_HEIGHT }}>
                                <span className="text-[10px] font-medium w-12 flex-shrink-0 -mt-1.5 tabular-nums" style={{ color: 'rgba(255,255,255,0.25)' }}>
                                    {formatHour(hour)}
                                </span>
                                <div className="flex-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                            </div>
                        );
                    })}

                    {/* Current Time Indicator */}
                    {showNowLine && (
                        <div className="absolute left-12 right-0 flex items-center z-20" style={{ top: nowOffset }}>
                            <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                            <div className="flex-1 border-t border-red-500/60" />
                        </div>
                    )}

                    {/* Rendered Block Schedules */}
                    {blockSchedules.map(schedule => {
                        const block = getBlock(schedule.blockId);
                        if (!block) return null;
                        const startMin = timeToMinutes(schedule.startTime);
                        const endMin = timeToMinutes(schedule.endTime);
                        const topPx = ((startMin - TIMELINE_START * 60) / 60) * HOUR_HEIGHT;
                        const heightPx = ((endMin - startMin) / 60) * HOUR_HEIGHT;

                        // Tasks assigned to this block
                        const blockTasks = tasks.filter(t => t.blockId === schedule.blockId);

                        return (
                            <motion.div
                                key={schedule.id}
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute left-12 right-0 rounded-xl cursor-pointer transition-all hover:brightness-110 group"
                                style={{
                                    top: topPx,
                                    height: Math.max(heightPx, 28),
                                    background: `${block.color}20`,
                                    border: `1px solid ${block.color}40`,
                                    zIndex: 10,
                                }}
                                onClick={() => openEditSchedule(schedule)}
                            >
                                <div className="px-3 py-2 h-full overflow-hidden">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: block.color }} />
                                        <span className="text-xs font-bold truncate" style={{ color: block.color }}>{block.name}</span>
                                        <span className="text-[10px] ml-auto flex-shrink-0" style={{ color: `${block.color}99` }}>
                                            {schedule.startTime} – {schedule.endTime}
                                        </span>
                                    </div>
                                    {/* Tasks inside this block */}
                                    {heightPx >= 50 && blockTasks.length > 0 && (
                                        <div className="space-y-0.5 mt-1">
                                            {blockTasks.slice(0, Math.floor((heightPx - 32) / 20)).map(task => (
                                                <div key={task.id} className="flex items-center gap-1.5 text-[10px]"
                                                    style={{ color: task.completed ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)' }}>
                                                    <span className="flex-shrink-0">{task.completed ? '✓' : '○'}</span>
                                                    <span className={`truncate ${task.completed ? 'line-through' : ''}`}>{task.title}</span>
                                                    <span className="ml-auto flex-shrink-0 tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>{formatDuration(task.estimatedSeconds)}</span>
                                                </div>
                                            ))}
                                            {blockTasks.length > Math.floor((heightPx - 32) / 20) && (
                                                <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                                    +{blockTasks.length - Math.floor((heightPx - 32) / 20)} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>


            {/* ═══════════════════════════════════════════════════════
                SCHEDULE MODAL
               ═══════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {showScheduleModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setShowScheduleModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="w-full max-w-sm rounded-2xl p-6"
                            style={{ background: '#151020', border: '1px solid rgba(255,255,255,0.1)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-base font-bold text-white mb-5">
                                {editingScheduleId ? 'Edit Schedule' : 'Add Schedule'}
                            </h3>

                            {/* Block Selector */}
                            <label className="block text-xs font-medium text-slate-400 mb-2">Block</label>
                            <div className="flex flex-wrap gap-1.5 mb-5">
                                {blocks.map(b => {
                                    const selected = scheduleBlockId === b.id;
                                    return (
                                        <button key={b.id} type="button" onClick={() => setScheduleBlockId(b.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                                            style={{
                                                background: selected ? `${b.color}25` : 'rgba(255,255,255,0.04)',
                                                border: selected ? `1px solid ${b.color}60` : '1px solid rgba(255,255,255,0.08)',
                                                color: selected ? b.color : 'rgba(255,255,255,0.5)',
                                            }}>
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color, opacity: selected ? 1 : 0.4 }} />
                                            {b.name}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Time Pickers */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Start Time</label>
                                    <input type="time" value={scheduleStart} onChange={e => setScheduleStart(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">End Time</label>
                                    <input type="time" value={scheduleEnd} onChange={e => setScheduleEnd(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {editingScheduleId && (
                                    <button onClick={() => handleDeleteScheduleItem(editingScheduleId)}
                                        className="px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                                        style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                                        Delete
                                    </button>
                                )}
                                <div className="flex-1" />
                                <button onClick={() => setShowScheduleModal(false)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-all cursor-pointer">
                                    Cancel
                                </button>
                                <button onClick={handleSaveSchedule} disabled={savingSchedule || !scheduleBlockId}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer"
                                    style={{ background: 'linear-gradient(135deg, #5272c6, #8299d5)' }}>
                                    {savingSchedule ? '...' : editingScheduleId ? 'Save' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnalysisPage;
