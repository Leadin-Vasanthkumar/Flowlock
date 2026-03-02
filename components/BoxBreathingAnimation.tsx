import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/*
  Box Breathing Animation
  ─────────────────────────────────────────────
  4-phase cycle:  Breathe In → Hold → Breathe Out → Hold
  Each phase lasts 4 seconds → 16s total per cycle.

  Visual:
  • A circular track ring
  • A glowing orb that orbits the ring (one full revolution = one cycle)
  • Center text showing the current phase
  • A pulsing inner circle that expands on inhale, shrinks on exhale
*/

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const PHASE_DURATION = 4; // seconds per phase
const CYCLE_DURATION = PHASE_DURATION * 4; // 16 seconds per full cycle

const phaseConfig: Record<BreathPhase, { label: string; sublabel: string }> = {
    'inhale': { label: 'Breathe In', sublabel: 'Fill your lungs slowly' },
    'hold-in': { label: 'Hold', sublabel: 'Keep the air in' },
    'exhale': { label: 'Breathe Out', sublabel: 'Release slowly' },
    'hold-out': { label: 'Hold', sublabel: 'Stay empty' },
};

const phaseOrder: BreathPhase[] = ['inhale', 'hold-in', 'exhale', 'hold-out'];

interface BoxBreathingAnimationProps {
    /** Total seconds remaining for the entire break */
    seconds: number;
    onSkip: () => void;
}

const BoxBreathingAnimation: React.FC<BoxBreathingAnimationProps> = ({ seconds, onSkip }) => {
    const [elapsed, setElapsed] = useState(0);
    const animRef = useRef<number | null>(null);
    const startRef = useRef<number>(Date.now());

    // Tick the animation timer
    useEffect(() => {
        startRef.current = Date.now();
        const tick = () => {
            const now = Date.now();
            setElapsed((now - startRef.current) / 1000);
            animRef.current = requestAnimationFrame(tick);
        };
        animRef.current = requestAnimationFrame(tick);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    // Determine current phase
    const cycleProgress = (elapsed % CYCLE_DURATION) / CYCLE_DURATION; // 0..1
    const phaseIndex = Math.floor((elapsed % CYCLE_DURATION) / PHASE_DURATION);
    const currentPhase = phaseOrder[phaseIndex] || 'inhale';
    const phaseElapsed = (elapsed % CYCLE_DURATION) - phaseIndex * PHASE_DURATION;
    const phaseProgress = phaseElapsed / PHASE_DURATION; // 0..1 within current phase

    // Ring dimensions
    const SIZE = 380;
    const CENTER = SIZE / 2;
    const RADIUS = 160;
    const STROKE_WIDTH = 2;

    // Orb position on the ring (full circle = one cycle)
    const angle = cycleProgress * Math.PI * 2 - Math.PI / 2; // Start at top
    const orbX = CENTER + RADIUS * Math.cos(angle);
    const orbY = CENTER + RADIUS * Math.sin(angle);

    // Inner pulsing circle scale
    let innerScale = 1;
    if (currentPhase === 'inhale') {
        innerScale = 0.6; // stay small during inhale
    } else if (currentPhase === 'hold-in') {
        innerScale = 1.0; // expand during hold
    } else if (currentPhase === 'exhale') {
        innerScale = 0.6; // stay small during exhale
    } else {
        innerScale = 1.0; // expand during hold
    }

    // Countdown per-phase
    const phaseCountdown = Math.ceil(PHASE_DURATION - phaseElapsed);

    // Format total remaining time
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeStr = `${minutes}:${secs.toString().padStart(2, '0')}`;

    // Cycle counter
    const cycleCount = Math.floor(elapsed / CYCLE_DURATION) + 1;

    const { label, sublabel } = phaseConfig[currentPhase];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center px-6 gap-4"
        >
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
                    style={{
                        width: `${300 + innerScale * 100}px`,
                        height: `${300 + innerScale * 100}px`,
                        background: `radial-gradient(circle, rgba(127,25,230,${0.15 + innerScale * 0.1}) 0%, transparent 70%)`,
                        transition: 'all 0.5s ease-out',
                    }}
                />
            </div>

            {/* Activity label */}
            <div className="relative z-10 flex items-center gap-3 px-6 py-3 rounded-full mb-4"
                style={{ background: 'rgba(127,25,230,0.1)', border: '1px solid rgba(127,25,230,0.2)' }}
            >
                <svg className="w-5 h-5 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-4-4m4 4l4-4M4.5 12h15" />
                    <circle cx="12" cy="12" r="9" strokeDasharray="4 2" />
                </svg>
                <span className="text-sm font-semibold text-[#a855f7] uppercase tracking-wider">Box Breathing</span>
            </div>

            {/* Main animation area */}
            <div className="relative z-10" style={{ width: SIZE, height: SIZE }}>
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                    {/* Track ring */}
                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RADIUS}
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth={STROKE_WIDTH}
                    />

                    {/* Progress arc — shows how far into the cycle */}
                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RADIUS}
                        fill="none"
                        stroke="url(#orbGradient)"
                        strokeWidth={STROKE_WIDTH + 1}
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * RADIUS}
                        strokeDashoffset={2 * Math.PI * RADIUS * (1 - cycleProgress)}
                        style={{
                            transform: 'rotate(-90deg)',
                            transformOrigin: 'center',
                        }}
                    />

                    {/* Gradient definition */}
                    <defs>
                        <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="orbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#7f19e6" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                    </defs>

                    {/* Orb glow (larger, dimmer) */}
                    <circle
                        cx={orbX}
                        cy={orbY}
                        r={24}
                        fill="url(#orbGlow)"
                    />

                    {/* Orb */}
                    <circle
                        cx={orbX}
                        cy={orbY}
                        r={10}
                        fill="#a855f7"
                        style={{
                            filter: 'drop-shadow(0 0 14px rgba(168,85,247,0.9)) drop-shadow(0 0 28px rgba(168,85,247,0.5))',
                        }}
                    />
                </svg>

                {/* Inner pulsing circle */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 200,
                        height: 200,
                        top: '50%',
                        left: '50%',
                        marginTop: -100,
                        marginLeft: -100,
                        transform: `scale(${innerScale})`,
                        background: 'radial-gradient(circle, rgba(127,25,230,0.15) 0%, rgba(127,25,230,0.05) 60%, transparent 100%)',
                        border: '1px solid rgba(127,25,230,0.2)',
                        transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                />

                {/* Center text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPhase}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center"
                        >
                            <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                                {label}
                            </span>
                            <span className="text-sm text-white/30 mt-1">
                                {sublabel}
                            </span>
                        </motion.div>
                    </AnimatePresence>
                    <span className="text-5xl font-bold text-[#a855f7]/60 mt-3 tabular-nums">
                        {phaseCountdown}
                    </span>
                </div>
            </div>

            {/* Cycle counter + remaining time */}
            <div className="relative z-10 flex items-center gap-6 mt-2">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-white/20 uppercase tracking-widest">Cycle</span>
                    <span className="text-sm font-bold text-white/50 tabular-nums">{cycleCount}</span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-white/20 uppercase tracking-widest">Remaining</span>
                    <span className="text-sm font-bold text-white/50 tabular-nums">{timeStr}</span>
                </div>
            </div>

            {/* Phase dots indicator */}
            <div className="relative z-10 flex items-center gap-2 mt-2">
                {phaseOrder.map((p, i) => (
                    <div
                        key={p}
                        className="rounded-full transition-all duration-300"
                        style={{
                            width: phaseIndex === i ? 24 : 6,
                            height: 6,
                            background: phaseIndex === i
                                ? 'linear-gradient(90deg, #7f19e6, #a855f7)'
                                : 'rgba(255,255,255,0.1)',
                        }}
                    />
                ))}
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

export default BoxBreathingAnimation;
