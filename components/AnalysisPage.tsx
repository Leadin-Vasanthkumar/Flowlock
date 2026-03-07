import React from 'react';
import { Task } from '../types';

interface AnalysisPageProps {
    tasks: Task[];
    onBack: () => void;
}

const AnalysisPage: React.FC<AnalysisPageProps> = ({ tasks }) => {

    // Calculate flow metrics
    const totalFlowSeconds = tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
    const completedCount = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;

    const hours = Math.floor(totalFlowSeconds / 3600);
    const minutes = Math.floor((totalFlowSeconds % 3600) / 60);
    const seconds = totalFlowSeconds % 60;

    // Format display
    const flowDisplay = hours > 0
        ? `${hours}h ${minutes}m`
        : minutes > 0
            ? `${minutes}m ${seconds}s`
            : `${seconds}s`;

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Progress ring calculations
    const dailyGoalSeconds = 4 * 3600; // 4 hour daily goal
    const progress = Math.min(totalFlowSeconds / dailyGoalSeconds, 1);
    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <div className="h-full w-full overflow-y-auto pt-0">
            <div className="max-w-2xl mx-auto px-6 pt-24 pb-12 sm:pt-28 lg:pt-32">

                {/* Date */}
                <p className="text-slate-500 text-xs font-medium mb-1">{dateStr}</p>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-10">Today's Focus</h1>

                {/* Flow Time — Hero Ring */}
                <div className="flex flex-col items-center mb-12">
                    <div className="relative w-56 h-56 mb-6">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                            {/* Background ring */}
                            <circle cx="100" cy="100" r="90"
                                fill="none" stroke="rgba(127,25,230,0.1)" strokeWidth="8" />
                            {/* Progress ring */}
                            <circle cx="100" cy="100" r="90"
                                fill="none" stroke="url(#flowGradient)" strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                            />
                            <defs>
                                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#7f19e6" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                        </svg>
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-white tracking-tight">{flowDisplay}</span>
                            <span className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">In Flow</span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                        {Math.round(progress * 100)}% of 4h daily goal
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3 mb-10">
                    <div className="rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 cursor-default"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Tasks Completed</p>
                        <p className="text-2xl font-bold" style={{ color: '#a855f7' }}>{completedCount} <span className="text-sm font-medium text-slate-500">/ {totalTasks}</span></p>
                    </div>
                    <div className="rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 cursor-default"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Avg per Task</p>
                        <p className="text-2xl font-bold" style={{ color: '#a855f7' }}>
                            {completedCount > 0
                                ? `${Math.round(totalFlowSeconds / completedCount / 60)}m`
                                : '—'}
                        </p>
                    </div>
                </div>

                {/* Task Breakdown */}
                {tasks.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-white mb-3">Task Breakdown</h2>
                        <div className="space-y-2">
                            {tasks.map(task => {
                                const taskMins = Math.floor((task.timeSpent || 0) / 60);
                                const taskSecs = (task.timeSpent || 0) % 60;
                                const taskTime = taskMins > 0 ? `${taskMins}m ${taskSecs}s` : `${taskSecs}s`;
                                const taskProgress = totalFlowSeconds > 0 ? (task.timeSpent || 0) / totalFlowSeconds : 0;

                                return (
                                    <div key={task.id} className="rounded-lg p-3"
                                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                {task.completed && (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                                <span className={`text-sm font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                                                    {task.title}
                                                </span>
                                            </div>
                                            <span className="text-xs font-semibold" style={{ color: '#a855f7' }}>{taskTime}</span>
                                        </div>
                                        {/* Mini progress bar */}
                                        <div className="w-full h-1 rounded-full" style={{ background: 'rgba(127,25,230,0.1)' }}>
                                            <div className="h-full rounded-full" style={{
                                                width: `${Math.round(taskProgress * 100)}%`,
                                                background: 'linear-gradient(90deg, #7f19e6, #a855f7)',
                                                transition: 'width 0.5s ease',
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalysisPage;
