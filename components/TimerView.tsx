import React from 'react';
import BreathingRings from './BreathingRings';
import { Task, TimerStatus } from '../types';

interface TimerViewProps {
    timerStatus: TimerStatus;
    seconds: number;
    activeTaskId: string | null;
    tasks: Task[];
    onToggleTimer: () => void;
    onMarkDone: () => void;
    onReset: () => void;
    onBack: () => void;
}

const TimerView: React.FC<TimerViewProps> = ({
    timerStatus,
    seconds,
    activeTaskId,
    tasks,
    onToggleTimer,
    onMarkDone,
    onReset,
    onBack,
}) => {
    const activeTask = tasks.find(t => t.id === activeTaskId);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const totalEstimated = activeTask?.pomodoroProfile === '90-10' ? 5400 : activeTask?.pomodoroProfile === '50-10' ? 3000 : 1500;
    const progress = Math.max(0, Math.min(1, 1 - (seconds / totalEstimated)));
    const dashOffset = 879.6 * (1 - progress);

    return (
        <div className="relative h-screen w-full flex flex-col items-center justify-center bg-[#0D0E0D] text-white font-['Inter'] overflow-hidden select-none">
            
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[700px] max-h-[700px] bg-[#22C55E]/[0.03] blur-[160px] rounded-full" />
            </div>

            {/* Top Navigation */}
            <div className="absolute top-6 left-6 z-50">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-[#22C55E]/40 text-[#909AA6] hover:text-[#22C55E] transition-all text-xs font-bold tracking-widest uppercase cursor-pointer backdrop-blur-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Dashboard
                </button>
            </div>

            {/* Main Composition */}
            <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl px-6 gap-16">
                
                {/* Timer Orb Section */}
                <div className="relative flex justify-center items-center w-full min-h-[400px]">
                    {/* Breathing Orbital Rings (Center-Aligned to Orb) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <BreathingRings />
                    </div>

                    {/* Numerals */}
                    <div className="relative w-[320px] h-[320px] flex flex-col items-center justify-center">
                        <div className="text-center z-10">
                            <h1 className="text-8xl font-bold tracking-tight text-white mb-3">
                                {formatTime(seconds)}
                            </h1>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[#909AA6] text-sm font-semibold tracking-wide max-w-[200px] truncate">
                                    {activeTask?.title || 'Focused Session'}
                                </span>
                                {activeTask?.pomodoroProfile && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-[#909AA6]/40 text-[9px] uppercase font-bold tracking-[0.2em]">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {activeTask.pomodoroProfile.split('-')[0]} MIN FOCUS
                                        </div>
                                        {activeTask.pomodorosRequired && activeTask.pomodorosRequired > 1 && (
                                            <div className="flex items-center gap-1.5 text-[#22C55E]/60 text-[9px] uppercase font-bold tracking-[0.2em]">
                                                • SET {(activeTask.pomodorosCompleted || 0) + 1} OF {activeTask.pomodorosRequired}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress & Controls Section */}
                <div className="w-full flex flex-col items-center gap-12">
                    
                    {/* Session Progress Bar */}
                    <div className="w-full max-w-md">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#909AA6]">SESSION PROGRESS</span>
                            <span className="text-[10px] font-bold text-[#22C55E] tracking-widest">{Math.round(progress * 100)}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#22C55E] transition-all duration-1000 ease-linear"
                                style={{ 
                                    width: `${progress * 100}%`,
                                    boxShadow: '0 0 10px rgba(34, 197, 94, 0.3)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-14">
                        <div className="flex flex-col items-center gap-4">
                            <button 
                                onClick={onReset}
                                className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-[#909AA6]/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                                aria-label="Reset"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#909AA6]/40">RESET</span>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <button 
                                onClick={onToggleTimer}
                                className="w-16 h-16 rounded-full bg-[#22C55E] flex items-center justify-center text-[#0D0E0D] shadow-xl shadow-[#22C55E]/10 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                                aria-label={timerStatus === 'running' ? 'Pause' : 'Start'}
                            >
                                {timerStatus === 'running' ? (
                                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                        <rect x="6" y="5" width="4" height="14" rx="1" />
                                        <rect x="14" y="5" width="4" height="14" rx="1" />
                                    </svg>
                                ) : (
                                    <svg className="w-7 h-7 translate-x-0.5 fill-current" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>
                            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#22C55E]">{timerStatus === 'running' ? 'PAUSE' : 'START'}</span>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <button 
                                onClick={onMarkDone}
                                className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-[#909AA6]/50 hover:text-[#22C55E] hover:bg-white/5 transition-all cursor-pointer"
                                aria-label="Complete"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#909AA6]/40">COMPLETE</span>
                        </div>
                    </div>
                </div>


            </main>
        </div>
    );
};

export default TimerView;
