import React from 'react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { GlowingEffect } from './ui/glowing-effect';

export type BreakPhase = 'victory' | 'select' | 'active' | 'decision' | 'all-done';
export type BreakActivity = 'breathing' | 'doodling' | 'stretches';

interface GuidedBreakProps {
    phase: BreakPhase;
    taskName: string;
    breakActivity: BreakActivity | null;
    breakSeconds: number;
    remainingTasks: Task[];
    onDrinkWater: () => void;
    onSelectActivity: (activity: BreakActivity) => void;
    onSkipBreak: () => void;
    onDone: () => void;
    onContinue: (taskId: string) => void;
}

const formatBreakTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
};

const formatDuration = (totalSeconds: number): string => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
};

// ── Phase 1: Victory ──────────────────────────────────────
const VictoryPhase: React.FC<{ taskName: string; onDone: () => void }> = ({ taskName, onDone }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center text-center px-6 gap-8"
    >
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(127,25,230,0.25) 0%, transparent 70%)' }}
        />

        {/* Checkmark icon */}
        <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
            style={{
                background: 'rgba(127,25,230,0.12)',
                border: '1px solid rgba(127,25,230,0.25)',
                boxShadow: '0 0 60px rgba(127,25,230,0.2)',
            }}
        >
            <svg className="w-10 h-10 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>

        <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
                Great work man!
            </h2>
            <p className="text-lg text-white/50 font-medium">
                You finished: <span className="text-[#a855f7]">{taskName}</span>
            </p>
        </div>

        {/* Water prompt */}
        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl mt-2"
            style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(16px)',
            }}
        >
            <svg className="w-6 h-6 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 2.4-4.5 5-4.5 8.5a4.5 4.5 0 109 0C16.5 8 13.2 5.4 12 3z" />
            </svg>
            <p className="text-sm text-white/60">Time to reset. Please drink a glass of water.</p>
        </div>

        {/* Done button */}
        <button
            onClick={onDone}
            className="mt-4 px-10 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{
                background: 'linear-gradient(135deg, #7f19e6 0%, #a855f7 100%)',
                boxShadow: '0 8px 32px -4px rgba(127,25,230,0.4)',
            }}
        >
            Done
        </button>
    </motion.div>
);

// ── Phase 2: Break Selection ──────────────────────────────
const activities: { id: BreakActivity; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
        id: 'breathing',
        title: 'Box Breathing',
        subtitle: 'Calm your heart rate',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-4-4m4 4l4-4M4.5 12h15" />
                <circle cx="12" cy="12" r="9" strokeDasharray="4 2" />
            </svg>
        ),
    },
    {
        id: 'doodling',
        title: 'Doodling',
        subtitle: 'Unlock subconscious creativity',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
        ),
    },
    {
        id: 'stretches',
        title: 'Desk Stretches',
        subtitle: 'Get blood flowing to the brain',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0M12 14v3m-3-1.5h6" />
            </svg>
        ),
    },
];

const SelectPhase: React.FC<{ onSelect: (a: BreakActivity) => void }> = ({ onSelect }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center px-6 gap-6"
    >
        <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                Choose your reset
            </h2>
            <p className="text-sm text-white/40">Pick an activity for a quick neural reset</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-4xl mt-4">
            {activities.map((a, i) => (
                <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                    className="flex-1 relative list-none"
                >
                    <div className="relative h-full rounded-[2rem] border-[1px] border-white/10 p-2 overflow-hidden transition-all hover:scale-[1.03] active:scale-[0.97]">
                        <GlowingEffect
                            spread={40}
                            glow={true}
                            disabled={false}
                            proximity={64}
                            inactiveZone={0.01}
                            borderWidth={3}
                        />
                        <button
                            onClick={() => onSelect(a.id)}
                            className="relative flex h-full flex-col items-center justify-center gap-2 py-12 px-6 rounded-[1.5rem] w-full cursor-pointer group min-h-[220px] transition-colors"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(20px)',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(127,25,230,0.1)';
                                e.currentTarget.style.borderColor = 'rgba(127,25,230,0.25)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                            }}
                        >
                            <div className="text-[#a855f7]/60 group-hover:text-[#a855f7] transition-colors w-12 h-12 mb-2">
                                {a.icon}
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg tracking-wide">{a.title}</p>
                                <p className="text-white/40 text-sm mt-1">{a.subtitle}</p>
                            </div>
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    </motion.div>
);

// ── Phase 3: Active Rest ──────────────────────────────────
const ActivePhase: React.FC<{
    activity: BreakActivity | null;
    seconds: number;
    onSkip: () => void;
}> = ({ activity, seconds, onSkip }) => {
    const activityInfo = activities.find(a => a.id === activity);
    const totalDuration = activity === 'stretches' ? 120 : 300;
    const progress = Math.max(0, Math.min(1, 1 - seconds / totalDuration));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center px-6 gap-6"
        >
            {/* Soothing gradient */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full blur-[140px] animate-pulse"
                    style={{ background: 'rgba(127,25,230,0.12)', animationDuration: '6s' }} />
                <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] rounded-full blur-[120px] animate-pulse"
                    style={{ background: 'rgba(168,85,247,0.08)', animationDuration: '8s', animationDelay: '2s' }} />
            </div>

            {/* Activity label */}
            <div className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: 'rgba(127,25,230,0.1)', border: '1px solid rgba(127,25,230,0.2)' }}
            >
                <div className="text-[#a855f7] w-5 h-5 flex items-center justify-center">{activityInfo?.icon}</div>
                <span className="text-xs font-semibold text-[#a855f7] uppercase tracking-wider">{activityInfo?.title}</span>
            </div>

            {/* Big countdown */}
            <h1 className="relative z-10 text-[6rem] sm:text-[8rem] md:text-[12rem] font-bold tracking-tighter text-white/90 drop-shadow-[0_0_40px_rgba(127,25,230,0.15)]">
                {formatBreakTime(seconds)}
            </h1>

            {/* Progress bar */}
            <div className="relative z-10 w-48 h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{
                        width: `${progress * 100}%`,
                        background: 'linear-gradient(90deg, #7f19e6, #a855f7)',
                    }}
                />
            </div>

            {/* Skip */}
            <button
                onClick={onSkip}
                className="relative z-10 mt-4 text-xs text-white/20 hover:text-white/50 transition-colors cursor-pointer uppercase tracking-widest"
            >
                Skip break
            </button>
        </motion.div>
    );
};

// ── Phase 4: Decision Bridge ──────────────────────────────
const DecisionPhase: React.FC<{
    remainingTasks: Task[];
    onDone: () => void;
    onContinue: (id: string) => void;
}> = ({ remainingTasks, onDone, onContinue }) => {
    const [showTasks, setShowTasks] = React.useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center text-center px-6 gap-6"
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(127,25,230,0.15) 0%, transparent 70%)' }}
            />

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight relative z-10">
                Ready for the next sprint?
            </h2>

            <AnimatePresence mode="wait">
                {!showTasks ? (
                    <motion.div
                        key="buttons"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col sm:flex-row gap-3 mt-4 relative z-10"
                    >
                        <button
                            onClick={onDone}
                            className="px-8 py-3.5 rounded-2xl text-base font-medium text-white/60 hover:text-white transition-all cursor-pointer"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            I'm done for now
                        </button>
                        <button
                            onClick={() => {
                                if (remainingTasks.length > 0) {
                                    setShowTasks(true);
                                } else {
                                    onDone();
                                }
                            }}
                            className="px-8 py-3.5 rounded-2xl text-base font-bold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            style={{
                                background: 'linear-gradient(135deg, #7f19e6 0%, #a855f7 100%)',
                                boxShadow: '0 8px 32px -4px rgba(127,25,230,0.4)',
                            }}
                        >
                            Let's keep going
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="tasklist"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md mt-2 space-y-2 relative z-10"
                    >
                        <p className="text-xs text-white/30 uppercase tracking-widest font-bold mb-3">
                            Pick your next task
                        </p>
                        {remainingTasks.map(task => (
                            <button
                                key={task.id}
                                onClick={() => onContinue(task.id)}
                                className="w-full flex items-center justify-between gap-4 px-5 py-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(127,25,230,0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(127,25,230,0.2)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                }}
                            >
                                <div className="min-w-0">
                                    <p className="text-white font-semibold text-sm truncate">{task.title}</p>
                                    <p className="text-white/30 text-xs mt-0.5">{formatDuration(task.estimatedSeconds)}</p>
                                </div>
                                <svg className="w-5 h-5 text-[#a855f7]/40 group-hover:text-[#a855f7] transition-colors shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </button>
                        ))}
                        <button
                            onClick={onDone}
                            className="mt-4 text-xs text-white/20 hover:text-white/50 transition-colors cursor-pointer uppercase tracking-widest"
                        >
                            ← Back to dashboard
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ── Phase 4b: All Done Celebration ────────────────────────
const AllDonePhase: React.FC<{ onDone: () => void }> = ({ onDone }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="flex flex-col items-center justify-center text-center px-6 gap-8"
    >
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(127,25,230,0.3) 0%, transparent 70%)' }}
        />

        {/* Big Star/Trophy icon */}
        <div className="relative w-32 h-32 rounded-full flex items-center justify-center animate-bounce"
            style={{
                background: 'rgba(127,25,230,0.15)',
                border: '2px solid rgba(127,25,230,0.4)',
                boxShadow: '0 0 80px rgba(127,25,230,0.3)',
                animationDuration: '3s'
            }}
        >
            <svg className="w-16 h-16 text-[#a855f7]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.446l-7.416 3.967 1.48-8.279-6.064-5.828 8.332-1.151z" />
            </svg>
        </div>

        <div className="max-w-xl">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                All tasks are completed man!
            </h2>
            <p className="text-xl text-white/60 font-medium">
                Well done, you should be proud of yourself.
            </p>
        </div>

        {/* Done button */}
        <button
            onClick={onDone}
            className="mt-6 px-12 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{
                background: 'linear-gradient(135deg, #7f19e6 0%, #a855f7 100%)',
                boxShadow: '0 8px 32px -4px rgba(127,25,230,0.4)',
            }}
        >
            Return to Dashboard
        </button>
    </motion.div>
);

// ── Main Component ────────────────────────────────────────
const GuidedBreak: React.FC<GuidedBreakProps> = ({
    phase,
    taskName,
    breakActivity,
    breakSeconds,
    remainingTasks,
    onDrinkWater,
    onSelectActivity,
    onSkipBreak,
    onDone,
    onContinue,
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
            style={{ background: '#0d0814' }}
        >
            <AnimatePresence mode="wait">
                {phase === 'victory' && (
                    <VictoryPhase key="victory" taskName={taskName} onDone={onDrinkWater} />
                )}
                {phase === 'select' && (
                    <SelectPhase key="select" onSelect={onSelectActivity} />
                )}
                {phase === 'active' && (
                    <ActivePhase key="active" activity={breakActivity} seconds={breakSeconds} onSkip={onSkipBreak} />
                )}
                {phase === 'decision' && (
                    <DecisionPhase key="decision" remainingTasks={remainingTasks} onDone={onDone} onContinue={onContinue} />
                )}
                {phase === 'all-done' && (
                    <AllDonePhase key="all-done" onDone={onDone} />
                )}
            </AnimatePresence>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-white/5 uppercase tracking-[0.8em] pointer-events-none">
                FLOWLOCK BREAK
            </div>
        </div>
    );
};

export default GuidedBreak;
