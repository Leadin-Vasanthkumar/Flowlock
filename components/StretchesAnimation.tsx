import React from 'react';
import { motion, Variants } from 'framer-motion';

interface StretchesAnimationProps {
    seconds: number;
    onSkip: () => void;
}

const steps = [
    {
        icon: (
            <svg className="w-6 h-6 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
        ),
        title: "Neck Rolls",
        description: "Slowly roll your head in a full circle. Do 3 times in each direction to release tension."
    },
    {
        icon: (
            <svg className="w-6 h-6 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
            </svg>
        ),
        title: "Shoulder Shrugs",
        description: "Pull your shoulders up to your ears, hold for a second, then let them drop completely."
    },
    {
        icon: (
            <svg className="w-6 h-6 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002" />
            </svg>
        ),
        title: "Wrist Stretch",
        description: "Extend one arm forward, palm up. Use your other hand to gently pull your fingers down and back."
    }
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const StretchesAnimation: React.FC<StretchesAnimationProps> = ({ seconds, onSkip }) => {
    // Format total remaining time
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeStr = `${minutes}:${secs.toString().padStart(2, '0')}`;
    const totalDuration = 120; // Stretches are usually a quick 2-minute break
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
                <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[140px] animate-pulse"
                    style={{ background: 'rgba(34,197,94,0.1)', animationDuration: '7s' }} />
                <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full blur-[120px] animate-pulse"
                    style={{ background: 'rgba(34,197,94,0.07)', animationDuration: '9s', animationDelay: '1s' }} />
            </div>

            {/* Header / Timer Section */}
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                    <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                    <span className="text-sm font-semibold text-[#22c55e] uppercase tracking-wider">Desk Stretches</span>
                </div>

                <div className="text-[5rem] sm:text-[6rem] font-bold tracking-tighter text-white/90 drop-shadow-[0_0_30px_rgba(34,197,94,0.15)] tabular-nums leading-none">
                    {timeStr}
                </div>

                {/* Progress bar */}
                <div className="w-48 h-1.5 rounded-full bg-white/5 overflow-hidden mt-2">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{
                            width: `${progress * 100}%`,
                            background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                        }}
                    />
                </div>
            </div>

            {/* Guidelines Cards Container */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-6"
            >
                {steps.map((step, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className="flex flex-col items-start text-left p-6 rounded-2xl group transition-all duration-300 hover:-translate-y-1"
                        style={{
                            background: 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                            backdropFilter: 'blur(12px)'
                        }}
                    >
                        {/* Number Indicator */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-center font-bold text-sm border border-[#22c55e]/20 group-hover:bg-[#22c55e]/20 group-hover:scale-110 transition-all duration-300">
                                {index + 1}
                            </div>
                            <div className="text-[#22c55e] opacity-80">
                                {step.icon}
                            </div>
                        </div>

                        {/* Content */}
                        <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                        <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Skip button */}
            <button
                onClick={onSkip}
                className="relative z-10 mt-6 text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer uppercase tracking-widest"
            >
                Skip break
            </button>
        </motion.div>
    );
};

export default StretchesAnimation;
