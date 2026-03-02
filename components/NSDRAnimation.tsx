import React from 'react';
import { motion } from 'framer-motion';

interface NSDRAnimationProps {
    seconds: number;
    onSkip: () => void;
}

const NSDRAnimation: React.FC<NSDRAnimationProps> = ({ seconds, onSkip }) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeStr = `${minutes}:${secs.toString().padStart(2, '0')}`;
    const totalDuration = 600; // 10 minutes
    const progress = Math.max(0, Math.min(1, 1 - seconds / totalDuration));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl mx-auto gap-6 my-auto"
        >
            {/* Ambient background glow */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[160px] animate-pulse"
                    style={{ background: 'rgba(20,184,166,0.1)', animationDuration: '8s' }} />
                <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full blur-[140px] animate-pulse"
                    style={{ background: 'rgba(56,189,248,0.07)', animationDuration: '10s', animationDelay: '2s' }} />
            </div>

            {/* Header / Timer Section */}
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 px-6 py-3 rounded-full"
                    style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)' }}
                >
                    <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                    <span className="text-sm font-semibold text-teal-400 uppercase tracking-wider">Non-Sleep Deep Rest</span>
                </div>

                <div className="text-[5rem] sm:text-[6rem] font-bold tracking-tighter text-white/90 drop-shadow-[0_0_30px_rgba(20,184,166,0.15)] tabular-nums leading-none">
                    {timeStr}
                </div>

                {/* Progress bar */}
                <div className="w-48 h-1.5 rounded-full bg-white/5 overflow-hidden mt-2">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{
                            width: `${progress * 100}%`,
                            background: 'linear-gradient(90deg, #14b8a6, #38bdf8)',
                        }}
                    />
                </div>
            </div>

            {/* YouTube Video Embed */}
            <div className="relative z-10 w-full mt-2">
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                        aspectRatio: '16 / 9',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 16px 64px rgba(0,0,0,0.5), 0 0 80px rgba(20,184,166,0.08)',
                    }}
                >
                    <iframe
                        src="https://www.youtube.com/embed/KHIbgSN2qAU?rel=0&modestbranding=1"
                        title="NSDR - Non-Sleep Deep Rest by Andrew Huberman"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                        style={{ border: 'none' }}
                    />
                </div>
            </div>

            {/* Skip button */}
            <button
                onClick={onSkip}
                className="relative z-10 mt-4 text-xs text-white/20 hover:text-white/50 transition-colors cursor-pointer uppercase tracking-widest"
            >
                Skip break
            </button>
        </motion.div>
    );
};

export default NSDRAnimation;
