import React from 'react';
import { motion, Variants } from 'framer-motion';

interface DoodlingAnimationProps {
    seconds: number;
    onSkip: () => void;
}

const steps = [
    {
        icon: (
            <svg className="w-6 h-6 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
        ),
        title: "Grab your tools",
        description: "Take a piece of paper and your favorite pen or pencil."
    },
    {
        icon: (
            <svg className="w-6 h-6 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.813-6.841m-11.96 11.96a15.99 15.99 0 004.648-4.763l6.84-3.812m-2.24 9.122a3 3 0 01-5.78-1.128 2.25 2.25 0 01-2.4-2.245 4.5 4.5 0 018.4 2.245c0 .399-.078.78-.22 1.128z" />
            </svg>
        ),
        title: "Let go of control",
        description: "Start making random patterns, squiggles, shapes, or continuous lines."
    },
    {
        icon: (
            <svg className="w-6 h-6 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
        ),
        title: "Zero expectations",
        description: "Don't try to draw something specific. Just let your hand move freely to relax your mind."
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

const DoodlingAnimation: React.FC<DoodlingAnimationProps> = ({ seconds, onSkip }) => {
    // Format total remaining time
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeStr = `${minutes}:${secs.toString().padStart(2, '0')}`;
    const totalDuration = 300;
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
                <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] animate-pulse"
                    style={{ background: 'rgba(127,25,230,0.1)', animationDuration: '7s' }} />
                <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] rounded-full blur-[120px] animate-pulse"
                    style={{ background: 'rgba(127,25,230,0.07)', animationDuration: '9s', animationDelay: '1s' }} />
            </div>

            {/* Header / Timer Section */}
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full"
                    style={{ background: 'rgba(127,25,230,0.1)', border: '1px solid rgba(127,25,230,0.2)' }}
                >
                    <svg className="w-5 h-5 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
                    </svg>
                    <span className="text-sm font-semibold text-[#a855f7] uppercase tracking-wider">Freehand Doodling</span>
                </div>

                <div className="text-[5rem] sm:text-[6rem] font-bold tracking-tighter text-white/90 drop-shadow-[0_0_30px_rgba(127,25,230,0.15)] tabular-nums leading-none">
                    {timeStr}
                </div>

                {/* Progress bar */}
                <div className="w-48 h-1.5 rounded-full bg-white/5 overflow-hidden mt-2">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{
                            width: `${progress * 100}%`,
                            background: 'linear-gradient(90deg, #7f19e6, #a855f7)',
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
                            <div className="w-8 h-8 rounded-full bg-[#a855f7]/10 text-[#a855f7] flex items-center justify-center font-bold text-sm border border-[#a855f7]/20 group-hover:bg-[#a855f7]/20 group-hover:scale-110 transition-all duration-300">
                                {index + 1}
                            </div>
                            <div className="text-[#a855f7] opacity-80">
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
                className="relative z-10 mt-6 text-xs text-white/20 hover:text-white/50 transition-colors cursor-pointer uppercase tracking-widest"
            >
                Skip break
            </button>
        </motion.div>
    );
};

export default DoodlingAnimation;
