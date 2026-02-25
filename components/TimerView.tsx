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
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate progress for visual feedback
    const totalEstimated = activeTask?.estimatedSeconds || 1;
    const progress = Math.max(0, Math.min(1, 1 - (seconds / totalEstimated)));

    return (
        <div className="relative h-full w-full flex flex-col items-center justify-center">

            {/* Background Breathing Rings */}
            <BreathingRings color="purple" />

            {/* Back to Dashboard - Top Left */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-10 md:left-12 z-50">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-all text-xs uppercase tracking-widest text-white/40 hover:text-white"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Dashboard</span>
                </button>
            </div>

            {/* Main Timer Display */}
            <div className="relative z-20 flex flex-col items-center justify-center text-center">
                <h1 className="text-[4rem] sm:text-[6rem] md:text-[10rem] lg:text-[16rem] font-bold tracking-tighter drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-all duration-700">
                    {formatTime(seconds)}
                </h1>
                <div className="flex flex-col items-center transition-all duration-500 mt-[-0.5rem] sm:mt-[-1rem] md:mt-[-2rem]">
                    {activeTask && (
                        <div className={`transition-opacity duration-500 ${timerStatus === 'running' ? 'opacity-40' : 'opacity-60'}`}>
                            <p className="text-base sm:text-lg md:text-xl font-medium tracking-wide">{activeTask.title}</p>
                            {activeTask.location && (
                                <p className="text-sm text-slate-500 mt-1 flex items-center justify-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                    {activeTask.location}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div className="w-48 h-1 rounded-full bg-white/5 mt-6 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{
                            width: `${progress * 100}%`,
                            background: 'linear-gradient(90deg, #7f19e6, #a855f7)',
                        }}
                    />
                </div>

                {/* Control Buttons — compact */}
                <div className="flex items-center gap-4 mt-5 z-40">
                    {/* Reset */}
                    <button
                        onClick={onReset}
                        className="w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 opacity-30 hover:opacity-100 border-white/20 hover:bg-white/5 active:scale-90"
                        title="Reset Timer"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>

                    {/* Play/Pause */}
                    <button
                        onClick={onToggleTimer}
                        disabled={!activeTaskId}
                        className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${!activeTaskId
                            ? 'opacity-10 border-white/10 cursor-not-allowed'
                            : 'opacity-60 hover:opacity-100 border-white/20 hover:bg-white/5 active:scale-90'
                            }`}
                    >
                        {timerStatus === 'running' ? (
                            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                <path d="M10 9v6m4-6v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5 translate-x-0.5 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    {/* Mark Done */}
                    <button
                        onClick={onMarkDone}
                        disabled={!activeTaskId}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${!activeTaskId
                            ? 'opacity-10 border-white/10 cursor-not-allowed'
                            : 'opacity-30 hover:opacity-100 border-white/20 hover:bg-white/5 active:scale-90'
                            }`}
                        title="Mark as Done"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-white/5 uppercase tracking-[0.8em] pointer-events-none">
                FLOWLOCK TIMER
            </div>
        </div>
    );
};

export default TimerView;
