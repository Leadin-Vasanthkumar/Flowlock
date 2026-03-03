import React, { useState, useMemo } from 'react';
import { Task, Block } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Preset color palette ────────────────────────────────────────────
const BLOCK_COLORS = [
    '#5272c6', '#6a85cd', '#8299d5', '#9aaddd',
    '#a855f7', '#ec4899', '#f59e0b', '#10b981',
    '#ef4444', '#8b5cf6', '#06b6d4', '#f97316',
];

interface AnalysisPageProps {
    tasks: Task[];
    blocks: Block[];
    onCreateBlock: (name: string, color: string) => Promise<void>;
    onUpdateBlock: (id: string, name: string, color: string) => Promise<void>;
    onDeleteBlock: (id: string) => Promise<void>;
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

const AnalysisPage: React.FC<AnalysisPageProps> = ({
    tasks,
    blocks,
    onCreateBlock,
    onUpdateBlock,
    onDeleteBlock,
    onBack,
}) => {
    const [showManageBlocks, setShowManageBlocks] = useState(false);
    const [newBlockName, setNewBlockName] = useState('');
    const [newBlockColor, setNewBlockColor] = useState(BLOCK_COLORS[0]);
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const [editBlockName, setEditBlockName] = useState('');
    const [editBlockColor, setEditBlockColor] = useState('');
    const [creating, setCreating] = useState(false);

    // ─── Compute analysis data ─────────────────────────────────
    const analysisData = useMemo(() => {
        const totalTimeSpent = tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
        const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimatedSeconds || 0), 0);
        const completedCount = tasks.filter(t => t.completed).length;

        // Group by block
        const blockMap = new Map<string, { name: string; color: string; timeSpent: number; estimated: number; completed: number; total: number }>();

        tasks.forEach(t => {
            const key = t.blockId || '__unassigned__';
            const existing = blockMap.get(key) || {
                name: t.blockName || 'Unassigned',
                color: t.blockColor || '#4b5563',
                timeSpent: 0,
                estimated: 0,
                completed: 0,
                total: 0,
            };
            existing.timeSpent += (t.timeSpent || 0);
            existing.estimated += (t.estimatedSeconds || 0);
            existing.completed += t.completed ? 1 : 0;
            existing.total += 1;
            blockMap.set(key, existing);
        });

        // Sort by time spent descending
        const blockBreakdown = Array.from(blockMap.entries())
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.timeSpent - a.timeSpent);

        return { totalTimeSpent, totalEstimated, completedCount, totalTasks: tasks.length, blockBreakdown };
    }, [tasks]);

    const maxBlockTime = Math.max(...analysisData.blockBreakdown.map(b => b.timeSpent), 1);

    // ─── Create block handler ─────────────────────────────────
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

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="h-full w-full overflow-y-auto px-4 sm:px-6 md:px-12 pt-6 sm:pt-8 pb-8 sm:pb-12">
            {/* Header */}
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5272c6, #8299d5)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                    </div>
                    <span className="text-base font-bold tracking-tight text-white">Analysis</span>
                </div>

                <div className="mb-10">
                    <p className="text-slate-500 text-sm font-medium mb-1">{dateStr}</p>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Today's Focus</h1>
                </div>

                {/* ─── Summary Cards ─────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                    {[
                        { label: 'Time Worked', value: formatDuration(analysisData.totalTimeSpent), color: '#5272c6' },
                        { label: 'Planned', value: formatDuration(analysisData.totalEstimated), color: '#8299d5' },
                        { label: 'Completed', value: `${analysisData.completedCount}`, color: '#10b981' },
                        { label: 'Total Tasks', value: `${analysisData.totalTasks}`, color: '#a855f7' },
                    ].map(card => (
                        <div
                            key={card.label}
                            className="rounded-2xl p-4 sm:p-5 transition-all"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <p className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{card.label}</p>
                            <p className="text-2xl sm:text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* ─── Block Breakdown ──────────────────────────── */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-white">Block Breakdown</h2>
                        <button
                            onClick={() => setShowManageBlocks(prev => !prev)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
                            style={{
                                background: showManageBlocks ? 'rgba(82, 114, 198, 0.2)' : 'rgba(255,255,255,0.06)',
                                border: showManageBlocks ? '1px solid rgba(82, 114, 198, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                                color: showManageBlocks ? '#9aaddd' : 'rgba(255,255,255,0.5)',
                            }}
                            aria-label="Manage blocks"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24" />
                            </svg>
                            {showManageBlocks ? 'Close' : 'Manage'}
                        </button>
                    </div>

                    {analysisData.blockBreakdown.length === 0 ? (
                        <div
                            className="rounded-2xl p-10 text-center"
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                            }}
                        >
                            <p className="text-slate-500 text-sm">No tasks yet today. Create some tasks and assign them to blocks!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {analysisData.blockBreakdown.map(block => {
                                const percentage = analysisData.totalTimeSpent > 0
                                    ? Math.round((block.timeSpent / analysisData.totalTimeSpent) * 100)
                                    : 0;
                                const barWidth = maxBlockTime > 0 ? (block.timeSpent / maxBlockTime) * 100 : 0;

                                return (
                                    <motion.div
                                        key={block.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-2xl p-4 sm:p-5 transition-all"
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <span
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ background: block.color }}
                                                />
                                                <span className="text-sm font-semibold text-white">{block.name}</span>
                                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{
                                                    background: `${block.color}15`,
                                                    color: block.color,
                                                }}>
                                                    {block.completed}/{block.total} tasks
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {block.timeSpent > 0 && (
                                                    <span className="text-xs font-bold" style={{ color: block.color }}>
                                                        {percentage}%
                                                    </span>
                                                )}
                                                <span className="text-sm font-bold text-white tabular-nums">
                                                    {formatDuration(block.timeSpent)}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${barWidth}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className="h-full rounded-full"
                                                style={{
                                                    background: `linear-gradient(90deg, ${block.color}, ${block.color}aa)`,
                                                }}
                                            />
                                        </div>
                                        {/* Estimated time context */}
                                        {block.estimated > 0 && (
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[11px] text-slate-600">
                                                    {formatDuration(block.timeSpent)} of {formatDuration(block.estimated)} planned
                                                </span>
                                                <span className="text-[11px] font-semibold" style={{
                                                    color: block.timeSpent >= block.estimated ? '#10b981' : 'rgba(255,255,255,0.3)',
                                                }}>
                                                    {block.estimated > 0 ? Math.min(100, Math.round((block.timeSpent / block.estimated) * 100)) : 0}%
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* ─── Donut Visualization ───────────────────── */}
                    {analysisData.totalTimeSpent > 0 && analysisData.blockBreakdown.filter(b => b.timeSpent > 0).length > 1 && (
                        <div className="mt-6 flex justify-center">
                            <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                    {(() => {
                                        let cumulativeAngle = 0;
                                        return analysisData.blockBreakdown
                                            .filter(b => b.timeSpent > 0)
                                            .map((block) => {
                                                const fraction = block.timeSpent / analysisData.totalTimeSpent;
                                                const angle = fraction * 360;
                                                const startAngle = cumulativeAngle;
                                                cumulativeAngle += angle;

                                                // SVG arc calculation
                                                const radius = 38;
                                                const cx = 50, cy = 50;
                                                const startRad = (startAngle * Math.PI) / 180;
                                                const endRad = ((startAngle + angle) * Math.PI) / 180;
                                                const x1 = cx + radius * Math.cos(startRad);
                                                const y1 = cy + radius * Math.sin(startRad);
                                                const x2 = cx + radius * Math.cos(endRad);
                                                const y2 = cy + radius * Math.sin(endRad);
                                                const largeArc = angle > 180 ? 1 : 0;

                                                return (
                                                    <path
                                                        key={block.id}
                                                        d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                                        fill={block.color}
                                                        opacity={0.85}
                                                        stroke="#0d0814"
                                                        strokeWidth="0.5"
                                                    />
                                                );
                                            });
                                    })()}
                                    {/* Center cutout for donut effect */}
                                    <circle cx="50" cy="50" r="24" fill="#0d0814" />
                                </svg>
                                {/* Center label */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-lg sm:text-xl font-bold text-white">{formatDuration(analysisData.totalTimeSpent)}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Total</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Manage Blocks Panel ──────────────────────── */}
                <AnimatePresence>
                    {showManageBlocks && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-10"
                        >
                            <div
                                className="rounded-2xl p-5 sm:p-6"
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                <h3 className="text-sm font-bold text-white mb-4">Manage Blocks</h3>

                                {/* Create New Block */}
                                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                                    <input
                                        type="text"
                                        value={newBlockName}
                                        onChange={e => setNewBlockName(e.target.value)}
                                        placeholder="New block name..."
                                        className="flex-1 px-4 py-3 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none transition-all"
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                        }}
                                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                    />
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {BLOCK_COLORS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setNewBlockColor(color)}
                                                className="w-6 h-6 rounded-full transition-all cursor-pointer flex-shrink-0"
                                                style={{
                                                    background: color,
                                                    boxShadow: newBlockColor === color ? `0 0 0 2px #0d0814, 0 0 0 3.5px ${color}` : 'none',
                                                    opacity: newBlockColor === color ? 1 : 0.5,
                                                }}
                                                aria-label={`Select color ${color}`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleCreate}
                                        disabled={!newBlockName.trim() || creating}
                                        className="px-5 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer flex-shrink-0"
                                        style={{
                                            background: 'linear-gradient(135deg, #5272c6 0%, #8299d5 100%)',
                                        }}
                                    >
                                        {creating ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : 'Create'}
                                    </button>
                                </div>

                                {/* Existing Blocks */}
                                {blocks.length === 0 ? (
                                    <p className="text-slate-500 text-sm text-center py-4">No blocks created yet. Create your first one above!</p>
                                ) : (
                                    <div className="space-y-2">
                                        {blocks.map(block => (
                                            <div
                                                key={block.id}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl group transition-all"
                                                style={{
                                                    background: 'rgba(255,255,255,0.02)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                }}
                                            >
                                                {editingBlockId === block.id ? (
                                                    <>
                                                        <input
                                                            type="text"
                                                            value={editBlockName}
                                                            onChange={e => setEditBlockName(e.target.value)}
                                                            className="flex-1 px-3 py-1.5 rounded-lg text-white text-sm bg-transparent focus:outline-none"
                                                            style={{ border: '1px solid rgba(255,255,255,0.15)' }}
                                                            autoFocus
                                                            onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                                                        />
                                                        <div className="flex items-center gap-1 flex-wrap">
                                                            {BLOCK_COLORS.slice(0, 6).map(color => (
                                                                <button
                                                                    key={color}
                                                                    type="button"
                                                                    onClick={() => setEditBlockColor(color)}
                                                                    className="w-5 h-5 rounded-full transition-all cursor-pointer"
                                                                    style={{
                                                                        background: color,
                                                                        boxShadow: editBlockColor === color ? `0 0 0 2px #0d0814, 0 0 0 3px ${color}` : 'none',
                                                                        opacity: editBlockColor === color ? 1 : 0.4,
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={handleSaveEdit}
                                                            className="p-1.5 text-green-400 hover:text-green-300 transition-colors cursor-pointer"
                                                            aria-label="Save changes"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingBlockId(null)}
                                                            className="p-1.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
                                                            aria-label="Cancel editing"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                            </svg>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: block.color }} />
                                                        <span className="flex-1 text-sm font-medium text-white">{block.name}</span>
                                                        <button
                                                            onClick={() => handleStartEdit(block)}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-[#9aaddd] transition-all cursor-pointer"
                                                            aria-label="Edit block"
                                                        >
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => onDeleteBlock(block.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                                                            aria-label="Delete block"
                                                        >
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
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
        </div>
    );
};

export default AnalysisPage;
