import React, { useRef, useEffect } from 'react';
import BreathingRings from './BreathingRings';
import TaskList from './TaskList';
import { Task, TimerStatus, TimerMode, PomodoroState } from '../types';

interface TimerViewProps {
    timerMode: TimerMode;
    timerStatus: TimerStatus;
    pomodoroState: PomodoroState;
    seconds: number;
    activeTaskId: string | null;
    tasks: Task[];
    onToggleTimer: () => void;
    onMarkDone: () => void;
    onSelectTask: (id: string) => void;
    onAddTask: (title: string) => void;
    onDeleteTask: (id: string) => void;
    onToggleComplete: (id: string) => void;
    onModeChange: (mode: TimerMode) => void;
    onReset: () => void;
}

const TimerView: React.FC<TimerViewProps> = ({
    timerMode,
    timerStatus,
    pomodoroState,
    seconds,
    activeTaskId,
    tasks,
    onToggleTimer,
    onMarkDone,
    onSelectTask,
    onAddTask,
    onDeleteTask,
    onToggleComplete,
    onModeChange,
    onReset,
}) => {
    const [showModeDropdown, setShowModeDropdown] = React.useState(false);

    const activeTask = tasks.find(t => t.id === activeTaskId);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative h-full w-full flex flex-col items-center justify-center">

            {/* Background Breathing Rings */}
            <BreathingRings color={timerMode === 'pomodoro' && pomodoroState === 'break' ? 'cyan' : 'purple'} />

            {/* Mode Dropdown - Top Left */}
            <div className="absolute top-10 left-12 z-50">
                <div className="relative">
                    <button
                        onClick={() => setShowModeDropdown(!showModeDropdown)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel hover:bg-white/5 border-white/10 transition-all text-xs uppercase tracking-widest text-white/60 hover:text-white"
                    >
                        <span>{timerMode === 'flow' ? 'Flow Lock' : 'Pomodoro'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${showModeDropdown ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {showModeDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-48 rounded-2xl glass-panel border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl">
                            <button
                                onClick={() => { onModeChange('flow'); setShowModeDropdown(false); }}
                                className={`w-full px-6 py-4 text-left text-xs uppercase tracking-widest transition-colors border-b border-white/5 ${timerMode === 'flow' ? 'text-purple-400 bg-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                Flow Lock
                            </button>
                            <button
                                onClick={() => { onModeChange('pomodoro'); setShowModeDropdown(false); }}
                                className={`w-full px-6 py-4 text-left text-xs uppercase tracking-widest transition-colors ${timerMode === 'pomodoro' ? 'text-cyan-400 bg-white/5' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                Pomodoro
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Timer Display */}
            <div className="relative z-20 flex flex-col items-center justify-center text-center">
                <h1 className="text-[12rem] md:text-[18rem] font-bold tracking-tighter drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-all duration-700">
                    {formatTime(seconds)}
                </h1>
                <div className="flex flex-col items-center transition-all duration-500 mt-[-2rem]">
                    {timerMode === 'pomodoro' && (
                        <p className={`text-xs uppercase tracking-[0.5em] mb-2 font-bold ${pomodoroState === 'work' ? 'text-purple-400' : 'text-cyan-400 animate-pulse'}`}>
                            {pomodoroState === 'work' ? 'Work Session' : 'Break Time'}
                        </p>
                    )}
                    {activeTask && (
                        <div className={`transition-opacity duration-500 ${timerStatus === 'running' ? 'opacity-40' : 'opacity-20'}`}>
                            <p className="text-xl font-medium tracking-wide italic">{activeTask.title}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Horizontal Layout (Task Box + Controls) */}
            <div className="absolute bottom-16 left-12 right-12 flex items-end justify-start gap-12 z-40">

                {/* Task Section on Left */}
                <div className="w-80 transition-all duration-500">
                    <TaskList
                        tasks={tasks}
                        activeTaskId={activeTaskId}
                        onSelectTask={onSelectTask}
                        onAddTask={onAddTask}
                        onDeleteTask={onDeleteTask}
                        onToggleComplete={onToggleComplete}
                        showAddInput={false}
                        limit={3}
                    />
                </div>

                {/* Control Buttons Group */}
                <div className="flex items-center gap-6 mb-1">
                    <button
                        onClick={onReset}
                        className="w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 opacity-40 hover:opacity-100 border-white/20 hover:bg-white/5 active:scale-90"
                        title="Reset Timer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>

                    <button
                        onClick={onToggleTimer}
                        disabled={!activeTaskId && timerMode === 'flow'}
                        className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 ${(!activeTaskId && timerMode === 'flow')
                            ? 'opacity-10 border-white/10 cursor-not-allowed'
                            : 'opacity-40 hover:opacity-100 border-white/20 hover:bg-white/5 active:scale-90'
                            }`}
                    >
                        {timerStatus === 'running' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                <path d="M10 9v6m4-6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 translate-x-0.5 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={onMarkDone}
                        disabled={!activeTaskId}
                        className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 ${!activeTaskId
                            ? 'opacity-10 border-white/10 cursor-not-allowed'
                            : 'opacity-40 hover:opacity-100 border-white/20 hover:bg-white/5 active:scale-90'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-white/5 uppercase tracking-[0.8em] pointer-events-none">
                DEEP FLOW STATE TIMER V1.0
            </div>

        </div>
    );
};

export default TimerView;
