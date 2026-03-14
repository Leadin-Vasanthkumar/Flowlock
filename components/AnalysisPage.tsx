import React, { useState, useEffect, useMemo } from 'react';
import { Task, Folder } from '../types';
import UserProfileMenu from './UserProfileMenu';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Legend
} from 'recharts';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    isSameDay, 
    addMonths, 
    subMonths,
    parseISO
} from 'date-fns';

interface AnalysisPageProps {
    tasks: Task[];
    folders: Folder[];
    currentView?: 'dashboard' | 'analysis';
    onToggleView?: () => void;
    onBack: () => void;
}

interface CompletionRecord {
    folder_id: string;
    completed_date: string;
}

const AnalysisPage: React.FC<AnalysisPageProps> = ({ tasks, folders, currentView, onToggleView, onBack }) => {
    const [completionHistory, setCompletionHistory] = useState<CompletionRecord[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    const habitColors = [
        '#F472B6', // Pink
        '#60A5FA', // Blue
        '#34D399', // Emerald
        '#FBBF24', // Amber
        '#A78BFA', // Violet
        '#FB7185', // Rose
        '#2DD4BF', // Teal
        '#FB923C', // Orange
    ];

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('folder_completions')
                .select('folder_id, completed_date')
                .eq('user_id', user.id)
                .order('completed_date', { ascending: false })
                .limit(365); // Last year

            if (error) throw error;
            if (data) setCompletionHistory(data);
        } catch (err) {
            console.error('Error fetching completion history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Calculate flow metrics
    const totalFlowSeconds = tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
    const completedCount = tasks.filter(t => t.completed).length;
    
    const hours = Math.floor(totalFlowSeconds / 3600);
    const minutes = Math.floor((totalFlowSeconds % 3600) / 60);
    
    const flowDisplay = hours > 0
        ? `${hours}h ${minutes}m`
        : `${minutes}m`;

    const progress = Math.min(totalFlowSeconds / (4 * 3600), 1);
    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference * (1 - progress);

    // Include all 24 hours (0 to 23)
    const hours_range = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="h-full w-full overflow-hidden bg-[#0D0E0D] flex flex-col pt-0">
            {/* Header Row */}
            <div className="flex items-center justify-between px-4 sm:px-6 md:px-12 pt-6 sm:pt-10 mb-6 w-full shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl shrink-0 border border-white/10 overflow-hidden shadow-[0_0_12px_rgba(34,197,94,0.3)]">
                        <img src="/logo.flowlock.png" alt="Flowlock Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl font-bold tracking-tight text-white">Flowlock</span>
                        <span className="px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold tracking-wider uppercase">Beta</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onToggleView && (
                        <button
                            onClick={onToggleView}
                            className="group flex items-center gap-2 px-4 py-2 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/5 text-[#22C55E] text-xs font-bold uppercase tracking-widest hover:bg-[#22C55E]/10 hover:border-[#22C55E]/60 transition-all duration-300 cursor-pointer shadow-[0_0_15px_-5px_rgba(34,197,94,0.2)] hover:shadow-[0_0_20px_-2px_rgba(34,197,94,0.3)]"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <span>Folders</span>
                        </button>
                    )}
                    <UserProfileMenu />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full px-4 sm:px-6 md:px-12 pb-20 scrollbar-hide">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                    
                    {/* ---------- LEFT COLUMN (Metrics & Consistency) ---------- */}
                    <div className="xl:col-span-7 flex flex-col gap-8">
                        {/* 1. Flow Overview */}
                        <section className="bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-8 md:p-10 backdrop-blur-xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-[#22C55E]/5 blur-[80px] -mr-32 -mt-32 rounded-full transition-all group-hover:bg-[#22C55E]/10" />
                           
                           <h2 className="text-sm font-bold text-white/40 uppercase tracking-[0.2em] mb-8">Focus Integrity</h2>
                           
                           <div className="flex flex-col lg:flex-row items-center gap-10">
                                <div className="relative w-48 h-48 shrink-0">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                                        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="12" />
                                        <motion.circle 
                                            cx="100" cy="100" r="90" 
                                            fill="none" stroke="#22C55E" strokeWidth="12" 
                                            strokeLinecap="round"
                                            strokeDasharray={circumference}
                                            initial={{ strokeDashoffset: circumference }}
                                            animate={{ strokeDashoffset }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            style={{ filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.4))' }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-white tracking-tight">{flowDisplay}</span>
                                        <span className="text-[10px] text-[#22C55E] font-bold mt-1 uppercase tracking-widest">Flow Time</span>
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">Tasks Done</p>
                                        <p className="text-2xl font-black text-white">{completedCount} <span className="text-sm font-medium text-white/20">/ {tasks.length}</span></p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">Session Avg</p>
                                        <p className="text-2xl font-black text-white">
                                            {completedCount > 0 ? `${Math.round(totalFlowSeconds / completedCount / 60)}m` : '—'}
                                        </p>
                                    </div>
                                    <div className="sm:col-span-2 p-5 rounded-2xl bg-[#22C55E]/5 border border-[#22C55E]/10">
                                        <div className="flex justify-between items-end mb-2">
                                            <p className="text-[10px] text-[#22C55E] uppercase tracking-widest font-black">Daily Quota</p>
                                            <p className="text-xs font-bold text-white">{Math.round(progress * 100)}%</p>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-[#22C55E]" 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress * 100}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                           </div>
                        </section>

                        {/* 2. Analysis Metrics Row (Hit Rate & Streak) */}
                        {!loadingHistory && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-white/[0.02] border border-white/[0.05] rounded-[24px] p-6 backdrop-blur-xl">
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">Habit Hit Rate</p>
                                    <p className="text-2xl font-black text-white">
                                        {folders.filter(f => f.isCompletedToday).length} <span className="text-sm text-white/20">/ {folders.length} Done Today</span>
                                    </p>
                                    <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[#22C55E]" 
                                            style={{ width: `${(folders.filter(f => f.isCompletedToday).length / Math.max(folders.length, 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-[24px] p-6 backdrop-blur-xl flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-[#22C55E] flex-shrink-0 flex items-center justify-center text-[#0D0E0D] shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                            <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#22C55E] uppercase tracking-widest font-black">Streak</p>
                                        <p className="text-2xl font-black text-white">
                                            {(() => {
                                                const uniqueDates = Array.from(new Set(completionHistory.map(c => c.completed_date))).sort((a, b) => b.localeCompare(a));
                                                if (uniqueDates.length === 0) return "0 Days";
                                                const todayStr = new Date().toLocaleDateString('en-CA');
                                                const yesterday = new Date();
                                                yesterday.setDate(yesterday.getDate() - 1);
                                                const yesterdayStr = yesterday.toLocaleDateString('en-CA');
                                                let currentStreak = 0;
                                                let checkDate = uniqueDates.includes(todayStr) ? todayStr : uniqueDates.includes(yesterdayStr) ? yesterdayStr : null;
                                                if (!checkDate) return "0 Days";
                                                let currentDate = new Date(checkDate);
                                                while (true) {
                                                    const dateStr = currentDate.toISOString().split('T')[0];
                                                    if (uniqueDates.includes(dateStr)) {
                                                        currentStreak++;
                                                        currentDate.setDate(currentDate.getDate() - 1);
                                                    } else break;
                                                }
                                                return `${currentStreak} Day${currentStreak === 1 ? '' : 's'}`;
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Habit Consistency Grid */}
                        <section className="bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-8 md:p-10 backdrop-blur-xl">
                            <h2 className="text-sm font-bold text-white/40 uppercase tracking-[0.2em] mb-8">Consistency Grid</h2>
                            
                            {loadingHistory ? (
                                <div className="h-48 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-[#22C55E] animate-spin" />
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        const now = new Date();
                                        const year = now.getFullYear();
                                        const month = now.getMonth();
                                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                                        
                                        return Array.from({ length: daysInMonth }, (_, i) => {
                                            const day = i + 1;
                                            const d = new Date(year, month, day);
                                            const dateStr = d.toLocaleDateString('en-CA');
                                            const completionsOnDay = completionHistory.filter(c => c.completed_date === dateStr).length;
                                            const intensity = Math.min(completionsOnDay / Math.max(folders.length, 1), 1);
                                            const isToday = day === now.getDate();
                                            
                                            return (
                                                <div 
                                                    key={i}
                                                    className={`w-8 h-8 rounded-lg transition-all duration-500 hover:scale-110 cursor-help relative group/cell ${isToday ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-[#0D0E0D]' : ''}`}
                                                    style={{ 
                                                        background: intensity > 0 
                                                            ? `rgba(34, 197, 94, ${0.1 + intensity * 0.9})` 
                                                            : 'rgba(255,255,255,0.03)',
                                                        border: intensity > 0 ? 'none' : '1px solid rgba(255,255,255,0.05)'
                                                    }}
                                                >
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-white whitespace-nowrap opacity-0 group/cell:opacity-100 transition-opacity pointer-events-none z-20">
                                                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {completionsOnDay}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </section>

                        {/* 5. Monthly Multi-Habit Performance Chart */}
                        <section className="bg-white/[0.02] border border-white/[0.05] rounded-[32px] p-8 md:p-10 backdrop-blur-xl group">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h2 className="text-sm font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Consistency Flow</h2>
                                    <p className="text-[10px] text-white/20 font-bold tracking-widest uppercase">Multi-Habit Performance</p>
                                </div>

                                <div className="flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
                                    <button 
                                        onClick={() => setSelectedMonth(prev => subMonths(prev, 1))}
                                        className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <span className="text-xs font-black text-white px-4 min-w-[120px] text-center tracking-widest uppercase">
                                        {format(selectedMonth, 'MMMM yyyy')}
                                    </span>
                                    <button 
                                        onClick={() => setSelectedMonth(prev => addMonths(prev, 1))}
                                        className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="h-[300px] w-full mt-4 pr-4">
                                {(() => {
                                    const monthStart = startOfMonth(selectedMonth);
                                    const monthEnd = endOfMonth(selectedMonth);
                                    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
                                    
                                    const habitFolders = folders.filter(f => f.isHabit);
                                    
                                    const chartData = days.map(day => {
                                        const dateStr = format(day, 'yyyy-MM-dd');
                                        const dayData: any = { 
                                            name: format(day, 'd'),
                                            fullDate: format(day, 'MMM d')
                                        };
                                        
                                        habitFolders.forEach(habit => {
                                            const isDone = completionHistory.some(c => 
                                                c.folder_id === habit.id && c.completed_date === dateStr
                                            );
                                            dayData[habit.name] = isDone ? 1 : 0;
                                        });
                                        
                                        return dayData;
                                    });

                                    return (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700 }}
                                                    dy={10}
                                                />
                                                <YAxis 
                                                    axisLine={false}
                                                    tickLine={false}
                                                    ticks={[0, 1]}
                                                    tickFormatter={(val) => val === 1 ? 'DONE' : ''}
                                                    tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 8, fontWeight: 900 }}
                                                />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: 'rgba(13, 14, 13, 0.9)', 
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '16px',
                                                        backdropFilter: 'blur(10px)',
                                                        padding: '12px'
                                                    }}
                                                    itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                                    labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}
                                                    formatter={(value: number, name: string) => [value === 1 ? 'COMPLETED' : '—', name]}
                                                    labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                                                />
                                                <Legend 
                                                    verticalAlign="top" 
                                                    align="right"
                                                    iconType="circle"
                                                    content={({ payload }) => (
                                                        <div className="flex flex-wrap justify-end gap-x-4 gap-y-2 mb-6">
                                                            {payload?.map((entry: any, index: number) => (
                                                                <div key={`item-${index}`} className="flex items-center gap-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{entry.value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                />
                                                {habitFolders.map((habit, index) => (
                                                    <Line
                                                        key={habit.id}
                                                        type="monotone"
                                                        dataKey={habit.name}
                                                        stroke={habitColors[index % habitColors.length]}
                                                        strokeWidth={3}
                                                        dot={false}
                                                        activeDot={{ r: 4, strokeWidth: 0, fill: habitColors[index % habitColors.length] }}
                                                        animationDuration={1500}
                                                        connectNulls
                                                    />
                                                ))}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    );
                                })()}
                            </div>
                        </section>
                    </div>

                    {/* ---------- RIGHT COLUMN (Daily Structure) ---------- */}
                    <div className="xl:col-span-5 flex flex-col gap-8">
                        <div className="bg-white/[0.01] border border-white/[0.04] rounded-[32px] p-8 pb-12 transition-all hover:bg-white/[0.02]">
                            <h2 className="text-sm font-bold text-white/40 uppercase tracking-[0.2em] mb-8">Daily Structure</h2>
                            
                            <div className="relative pl-12 pr-2 mt-6">
                                {/* Vertical Line */}
                                <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-[#22C55E]/40 via-[#22C55E]/10 to-transparent" />
                                
                                <div className="space-y-0">
                                    {hours_range.map(hour => {
                                        const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                                        const startingFolders = folders.filter(f => {
                                            const isMatchingHour = (start: string, end?: string) => {
                                                const hStart = parseInt(start.split(':')[0]);
                                                const hEnd = end ? parseInt(end.split(':')[0]) : hStart + 1;
                                                // Occupies this hour if hour is between start and end
                                                return hour >= hStart && hour < hEnd;
                                            };

                                            const legacyMatch = f.startTime ? isMatchingHour(f.startTime, f.endTime) : false;
                                            const blockMatch = f.timeBlocks?.some(b => isMatchingHour(b.startTime, b.endTime));
                                            return legacyMatch || blockMatch;
                                        });

                                        const actuallyStartingFolders = folders.filter(f => {
                                            const isStarting = (start: string) => parseInt(start.split(':')[0]) === hour;
                                            return (f.startTime && isStarting(f.startTime)) || f.timeBlocks?.some(b => isStarting(b.startTime));
                                        });

                                        return (
                                            <div key={hour} className="relative h-20">
                                                <div className="absolute left-[-3.5rem] top-0 text-[10px] font-black text-white/20 tracking-widest tabular-nums">
                                                    {timeStr}
                                                </div>
                                                <div className={`absolute left-[-0.35rem] top-[6px] w-3 h-3 rounded-full border-2 transition-all duration-500 z-30 ${
                                                    startingFolders.length > 0 ? 'bg-[#22C55E] border-[#0D0E0D] scale-100 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-[#0D0E0D] border-white/10 scale-50'
                                                }`} />

                                                <div className="ml-6 relative h-full">
                                                    {actuallyStartingFolders.flatMap(folder => {
                                                        const blocks = folder.timeBlocks && folder.timeBlocks.length > 0 
                                                            ? folder.timeBlocks.filter(b => parseInt(b.startTime.split(':')[0]) === hour)
                                                            : (folder.startTime && parseInt(folder.startTime.split(':')[0]) === hour)
                                                                ? [{ startTime: folder.startTime, endTime: folder.endTime || '' }]
                                                                : [];
                                                        
                                                        return blocks.map((block, bIdx) => {
                                                            const mStart = parseInt(block.startTime.split(':')[1]) || 0;
                                                            const hEnd = block.endTime ? parseInt(block.endTime.split(':')[0]) : hour + 1;
                                                            const mEnd = block.endTime ? parseInt(block.endTime.split(':')[1]) || 0 : 0;
                                                            const duration = Math.max((hEnd * 60 + mEnd) - (hour * 60 + mStart), 30);
                                                            
                                                            return (
                                                                <motion.div
                                                                    key={`${folder.id}-${hour}-${bIdx}`}
                                                                    className="bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-2xl p-4 absolute left-0 right-0 z-20 group"
                                                                    style={{ 
                                                                        top: `${(mStart / 60) * 5}rem`,
                                                                        height: `${(duration / 60) * 5}rem`,
                                                                        marginTop: '6px'
                                                                    }}
                                                                >
                                                                    <div className="flex flex-col gap-1 overflow-hidden">
                                                                        <span className="text-xs font-black text-white tracking-tight uppercase truncate">{folder.name}</span>
                                                                        <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold">
                                                                            <span className="tabular-nums">{block.startTime.slice(0, 5)} - {block.endTime.slice(0, 5)}</span>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        });
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AnalysisPage;
