import React from 'react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { GlowingEffect } from './ui/glowing-effect';
import BoxBreathingAnimation from './BoxBreathingAnimation';
import DoodlingAnimation from './DoodlingAnimation';
import StretchesAnimation from './StretchesAnimation';
import NSDRAnimation from './NSDRAnimation';
import WalkingResetAnimation from './WalkingResetAnimation';

export type BreakPhase = 'victory' | 'select' | 'active' | 'decision' | 'all-done';
export type BreakActivity = 'breathing' | 'doodling' | 'stretches' | 'nsdr' | 'walking';

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
    onBack: () => void;
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
    {
        id: 'nsdr',
        title: 'NSDR',
        subtitle: 'Deep rest without sleeping',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
        ),
    },
    {
        id: 'walking',
        title: 'Walking Reset',
        subtitle: 'Bilateral stimulation on the move',
        icon: (
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
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

        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-7xl mt-4 px-4 sm:px-8">
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
    // For breathing, use the dedicated animation component
    if (activity === 'breathing') {
        return <BoxBreathingAnimation seconds={seconds} onSkip={onSkip} />;
    }

    // For doodling, use the dedicated guide component
    if (activity === 'doodling') {
        return <DoodlingAnimation seconds={seconds} onSkip={onSkip} />;
    }

    // For stretches, use the dedicated guide component
    if (activity === 'stretches') {
        return <StretchesAnimation seconds={seconds} onSkip={onSkip} />;
    }

    // For NSDR, use the YouTube embed component
    if (activity === 'nsdr') {
        return <NSDRAnimation seconds={seconds} onSkip={onSkip} />;
    }

    // For walking, use the bilateral stimulation Walking Reset component
    if (activity === 'walking') {
        return <WalkingResetAnimation seconds={seconds} onSkip={onSkip} />;
    }

    return null; // Fallback should never hit if activities are properly defined
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

        {/* Celebration Animation Container */}
        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Pulsing sonar rings */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={`ring-${i}`}
                    className="absolute inset-0 rounded-full"
                    style={{
                        border: '1.5px solid rgba(168,85,247,0.3)',
                    }}
                    initial={{ scale: 0.5, opacity: 0.6 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 1,
                        ease: 'easeOut',
                    }}
                />
            ))}

            {/* Orbiting dots */}
            {[
                { size: 8, radius: 80, duration: 6, color: '#a855f7' },
                { size: 6, radius: 90, duration: 8, color: '#c084fc' },
                { size: 5, radius: 70, duration: 5, color: '#7c3aed' },
                { size: 4, radius: 95, duration: 10, color: '#e9d5ff' },
            ].map((dot, i) => (
                <motion.div
                    key={`orbit-${i}`}
                    className="absolute rounded-full"
                    style={{
                        width: dot.size,
                        height: dot.size,
                        background: dot.color,
                        boxShadow: `0 0 ${dot.size * 3}px ${dot.color}`,
                        top: '50%',
                        left: '50%',
                        marginTop: -dot.size / 2,
                        marginLeft: -dot.size / 2,
                    }}
                    animate={{
                        x: [
                            Math.cos(0) * dot.radius,
                            Math.cos(Math.PI * 0.5) * dot.radius,
                            Math.cos(Math.PI) * dot.radius,
                            Math.cos(Math.PI * 1.5) * dot.radius,
                            Math.cos(Math.PI * 2) * dot.radius,
                        ],
                        y: [
                            Math.sin(0) * dot.radius,
                            Math.sin(Math.PI * 0.5) * dot.radius,
                            Math.sin(Math.PI) * dot.radius,
                            Math.sin(Math.PI * 1.5) * dot.radius,
                            Math.sin(Math.PI * 2) * dot.radius,
                        ],
                    }}
                    transition={{
                        duration: dot.duration,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}

            {/* Floating sparkle particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={`sparkle-${i}`}
                    className="absolute"
                    style={{
                        width: 3,
                        height: 3,
                        borderRadius: '50%',
                        background: '#c084fc',
                        left: `${20 + Math.random() * 60}%`,
                        bottom: '10%',
                    }}
                    animate={{
                        y: [-10, -120 - Math.random() * 60],
                        x: [0, (Math.random() - 0.5) * 40],
                        opacity: [0, 1, 0],
                        scale: [0, 1.2, 0],
                    }}
                    transition={{
                        duration: 2.5 + Math.random() * 1.5,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: 'easeOut',
                    }}
                />
            ))}

            {/* Star icon — slow rotation */}
            <motion.div
                className="relative w-28 h-28 rounded-full flex items-center justify-center z-10"
                style={{
                    background: 'rgba(127,25,230,0.15)',
                    border: '2px solid rgba(127,25,230,0.4)',
                    boxShadow: '0 0 80px rgba(127,25,230,0.3)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
                <motion.svg
                    className="w-14 h-14 text-[#a855f7]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.446l-7.416 3.967 1.48-8.279-6.064-5.828 8.332-1.151z" />
                </motion.svg>
            </motion.div>
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
    onBack,
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
            style={{ background: '#0d0814' }}
        >
            {/* Back to Dashboard - Top Left (matching TimerView) */}
            {phase !== 'active' && (
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-10 md:left-12 z-[110]">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-all text-xs uppercase tracking-widest text-white/40 hover:text-white cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Dashboard</span>
                    </button>
                </div>
            )}

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
