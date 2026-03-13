import React, { useState } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';

interface WalkingResetAnimationProps {
    seconds: number;
    onSkip: () => void;
    onTimerReset?: () => void;
}

const guidelines = [
    {
        icon: (
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
            </svg>
        ),
        title: 'The Pace',
        description: 'Maintain a steady, rhythmic pace. Feel the left-right connection of your feet hitting the ground.',
    },
    {
        icon: (
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        title: 'The Gaze',
        description: "Scan the horizon. Don't look at your phone. Let your eyes drift across the room or outside.",
    },
    {
        icon: (
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
        ),
        title: 'The Arms',
        description: 'Let your arms swing naturally. This enhances the bilateral neural flow between hemispheres.',
    },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// ── Pre-Flight Guidelines Screen ──────────────────────────
const PreFlightScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center text-center px-4 w-full max-w-3xl mx-auto gap-6 my-auto"
    >
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div
                className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[140px] animate-pulse"
                style={{ background: 'rgba(34,197,94,0.1)', animationDuration: '7s' }}
            />
            <div
                className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full blur-[120px] animate-pulse"
                style={{ background: 'rgba(34,197,94,0.07)', animationDuration: '9s', animationDelay: '1s' }}
            />
        </div>

        {/* Label badge */}
        <div
            className="relative z-10 flex items-center gap-3 px-6 py-3 rounded-full"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
        >
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            </svg>
            <span className="text-sm font-semibold text-green-400 uppercase tracking-wider">Walking Reset</span>
        </div>

        {/* Header */}
        <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Before you walk</h2>
            <p className="text-sm text-white/40">Read these 3 cues, then hit start</p>
        </div>

        {/* Guideline Cards */}
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-2"
        >
            {guidelines.map((step, index) => (
                <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex flex-col items-start text-left p-6 rounded-2xl group transition-all duration-300 hover:-translate-y-1"
                    style={{
                        background: 'rgba(15, 23, 42, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-green-400/10 text-green-400 flex items-center justify-center font-bold text-sm border border-green-400/20 group-hover:bg-green-400/20 group-hover:scale-110 transition-all duration-300">
                            {index + 1}
                        </div>
                        <div className="text-green-400 opacity-80">{step.icon}</div>
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
                </motion.div>
            ))}
        </motion.div>

        {/* Start Walking Button */}
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={onStart}
            className="relative z-10 mt-4 px-10 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                boxShadow: '0 8px 32px -4px rgba(34,197,94,0.4)',
            }}
        >
            Ready? Start Walking →
        </motion.button>
    </motion.div>
);

// ── Active Timer Screen ───────────────────────────────────
const ActiveTimerScreen: React.FC<{ seconds: number; onSkip: () => void }> = ({ seconds, onSkip }) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeStr = `${minutes}:${secs.toString().padStart(2, '0')}`;
    const totalDuration = 600;
    const progress = Math.max(0, Math.min(1, 1 - seconds / totalDuration));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center px-4 w-full max-w-2xl mx-auto gap-8 my-auto"
        >
            {/* Ambient background glow */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                    className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[140px] animate-pulse"
                    style={{ background: 'rgba(34,197,94,0.1)', animationDuration: '7s' }}
                />
                <div
                    className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full blur-[120px] animate-pulse"
                    style={{ background: 'rgba(34,197,94,0.07)', animationDuration: '9s', animationDelay: '1s' }}
                />
            </div>

            {/* Header / Timer Section */}
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div
                    className="flex items-center gap-3 px-6 py-3 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    </svg>
                    <span className="text-sm font-semibold text-green-400 uppercase tracking-wider">Walking Reset</span>
                </div>

                <div className="text-[8rem] sm:text-[10rem] font-bold tracking-tighter text-white/90 drop-shadow-[0_0_40px_rgba(34,197,94,0.2)] tabular-nums leading-none">
                    {timeStr}
                </div>

                {/* Progress bar */}
                <div className="w-64 h-1.5 rounded-full bg-white/5 overflow-hidden mt-4">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{
                            width: `${progress * 100}%`,
                            background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                        }}
                    />
                </div>
            </div>

            {/* Skip button */}
            <button
                onClick={onSkip}
                className="relative z-10 mt-2 text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer uppercase tracking-widest"
            >
                Skip break
            </button>
        </motion.div>
    );
};

// ── Main Component ────────────────────────────────────────
const WalkingResetAnimation: React.FC<WalkingResetAnimationProps> = ({ seconds, onSkip, onTimerReset }) => {
    const [started, setStarted] = useState(false);

    const handleStart = () => {
        if (onTimerReset) onTimerReset();
        setStarted(true);
    };

    return (
        <AnimatePresence mode="wait">
            {!started ? (
                <PreFlightScreen key="preflight" onStart={handleStart} />
            ) : (
                <ActiveTimerScreen key="active" seconds={seconds} onSkip={onSkip} />
            )}
        </AnimatePresence>
    );
};

export default WalkingResetAnimation;
