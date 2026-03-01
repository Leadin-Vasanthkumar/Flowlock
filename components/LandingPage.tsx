import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Orb from './Orb';

/* ─── Reusable fade-up wrapper ─── */
const FadeUp: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/* ─── SVG Icons (inline, no emoji) ─── */
const icons = {
    compass: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
    ),
    clock: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    mapPin: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    calendar: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    target: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    ),
    fire: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0117 10c0 3-2.5 5-5 8-2.5-3-5-5-5-8a5 5 0 011.5-3.5C9.5 5.5 11 5 12 2z" />
        </svg>
    ),
    logo: (
        <svg width="28" height="28" fill="white" viewBox="0 0 48 48">
            <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd" />
        </svg>
    ),
};

/* ─── Feature data ─── */
const features = [
    {
        icon: icons.compass,
        title: 'Purpose-Driven Tasks',
        desc: 'Know exactly WHY — attach a purpose to every task. When you know the reason, avoidance becomes impossible.',
        span: 'col-span-1 md:col-span-2',
    },
    {
        icon: icons.clock,
        title: 'Time-Bound Focus',
        desc: 'Countdown timers, not stopwatches. Urgency is baked in. Parkinson\'s law works in your favor.',
        span: 'col-span-1',
    },
    {
        icon: icons.mapPin,
        title: 'Location Anchoring',
        desc: 'Define WHERE you\'ll work — remove decision friction before you even start.',
        span: 'col-span-1',
    },
    {
        icon: icons.calendar,
        title: 'Schedule Lock',
        desc: 'Set exactly WHEN you start. Auto-shifts to tomorrow if the time has passed. No excuses.',
        span: 'col-span-1 md:col-span-2',
    },
    {
        icon: icons.target,
        title: 'Goal Cascade',
        desc: 'Year → Month → Week → Day. Always see how today\'s work feeds the bigger picture.',
        span: 'col-span-1',
    },
    {
        icon: icons.fire,
        title: 'Today\'s Non-Negotiable',
        desc: 'The ONE thing you must complete today. Always front and center. No hiding from it.',
        span: 'col-span-1 md:col-span-2',
    },
];

/* ─── Steps data ─── */
const steps = [
    { num: '01', title: 'Define', desc: 'Name your task. Set the time, place, and purpose. Complete clarity in 30 seconds.', image: '/screenshot-task-form.png' },
    { num: '02', title: 'Lock In', desc: 'Hit play. Immersive countdown. Breathing rings. Zero distractions. Just you and the work.', image: '/screenshot-timer.png' },
    { num: '03', title: 'Complete', desc: 'Task auto-completes. Focus session logged. Hit "Finish the Day" for a fresh start tomorrow.', image: null },
];

/* ─── Glass frame style for screenshots ─── */
const screenshotFrame: React.CSSProperties = {
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 25px 60px -15px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.04)',
    overflow: 'hidden',
    background: 'rgba(13,8,20,0.5)',
};

/* ═══════════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════════ */
const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    /* shared glass styles */
    const glassCard: React.CSSProperties = {
        background: 'rgba(26, 17, 34, 0.45)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 25px 50px -12px rgba(0,0,0,0.5)',
    };

    const glassSubtle: React.CSSProperties = {
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.07)',
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0d0814] text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ░░░ 1  NAVBAR ░░░ */}
            <nav
                className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-500"
                style={{
                    ...glassSubtle,
                    ...(scrolled ? {
                        background: 'rgba(13,8,20,0.85)',
                        backdropFilter: 'blur(24px) saturate(200%)',
                        boxShadow: '0 8px 32px -8px rgba(0,0,0,0.6)',
                        borderColor: 'rgba(255,255,255,0.1)',
                    } : {}),
                }}
            >
                {/* Logo */}
                <button onClick={() => scrollTo('hero')} className="flex items-center gap-2.5 cursor-pointer" aria-label="Back to top">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7f19e6, #a855f7)' }}>
                        <svg width="18" height="18" fill="white" viewBox="0 0 48 48"><path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd" /></svg>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-base font-bold tracking-tight text-white">Flowlock</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest text-[#a855f7] uppercase" style={{ background: 'rgba(127,25,230,0.15)', border: '1px solid rgba(127,25,230,0.3)' }}>Beta</span>
                    </div>
                </button>

                {/* Links */}
                <div className="hidden md:flex items-center gap-8">
                    <button onClick={() => scrollTo('features')} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">Features</button>
                    <button onClick={() => scrollTo('how-it-works')} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">How It Works</button>
                    <button onClick={() => scrollTo('story')} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">About</button>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/login')} className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer hidden sm:block">Sign In</button>
                    <button
                        onClick={() => navigate('/signup')}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #7f19e6, #a855f7)', boxShadow: '0 4px 16px -2px rgba(127,25,230,0.4)' }}
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* ░░░ 2  HERO ░░░ */}
            <section id="hero" className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
                {/* Orb BG */}
                <div className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: 0.7 }}>
                    <Orb hue={260} hoverIntensity={0.2} rotateOnHover={false} forceHoverState backgroundColor="#0d0814" />
                </div>

                {/* Radial glow overlay */}
                <div className="absolute inset-0 z-[1]" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(127,25,230,0.12) 0%, transparent 60%)' }} />

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8" style={{ ...glassSubtle, borderColor: 'rgba(127,25,230,0.25)' }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse" />
                            <span className="text-xs font-medium text-slate-300 tracking-wide">Built from Atomic Habits principles</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mb-6">
                            Stop Procrastinating.
                            <br />
                            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #7f19e6 40%, #6366f1 100%)' }}>
                                Start Knowing.
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
                            Flowlock gives you complete clarity on every task —&nbsp;
                            <span className="text-white font-medium">what, when, where, why,</span> and <span className="text-white font-medium">how long.</span>
                            <br className="hidden md:block" />
                            When you know exactly why you're doing something, you can't avoid it.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-[1.04] active:scale-[0.97] cursor-pointer"
                            style={{
                                background: 'linear-gradient(135deg, #7f19e6, #a855f7)',
                                boxShadow: '0 12px 36px -6px rgba(127,25,230,0.45)',
                            }}
                        >
                            Start for Free
                        </button>
                        <button
                            onClick={() => scrollTo('how-it-works')}
                            className="px-8 py-4 rounded-2xl text-base font-medium text-slate-300 hover:text-white transition-all hover:scale-[1.02] cursor-pointer"
                            style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}
                        >
                            See How It Works
                        </button>
                    </motion.div>

                    {/* ── Hero Dashboard Screenshot ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="mt-16 relative mx-auto max-w-5xl w-full"
                    >
                        {/* Glow behind screenshot */}
                        <div className="absolute -inset-4 rounded-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(127,25,230,0.15) 0%, transparent 70%)' }} />
                        <div
                            className="relative"
                            style={{
                                ...screenshotFrame,
                                borderRadius: '20px',
                                transform: 'perspective(2000px) rotateX(4deg)',
                            }}
                        >
                            <img
                                src="/screenshot-dashboard.png"
                                alt="Flowlock dashboard showing tasks, goals, and the non-negotiable system"
                                className="w-full h-auto block"
                                loading="eager"
                                style={{ borderRadius: '19px' }}
                            />
                            {/* Top reflection shimmer */}
                            <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: '19px', background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 30%)' }} />
                        </div>
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.8 }}
                        className="mt-12 flex flex-col items-center gap-2"
                    >
                        <span className="text-[10px] text-slate-600 uppercase tracking-[0.3em]">Scroll</span>
                        <div className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-1.5">
                            <motion.div
                                className="w-1 h-1.5 rounded-full bg-[#a855f7]"
                                animate={{ y: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ░░░ 3  PROBLEM STATEMENT ░░░ */}
            <section className="relative py-28 px-6">
                <div className="max-w-5xl mx-auto">
                    <FadeUp>
                        <p className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center leading-snug max-w-3xl mx-auto">
                            Other productivity apps give you a{' '}
                            <span className="text-slate-500">checkbox.</span>
                            <br />
                            Flowlock gives you a{' '}
                            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
                                reason.
                            </span>
                        </p>
                    </FadeUp>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
                        {[
                            { bad: true, title: 'Normal Apps', desc: 'Just a title and a checkbox. No context, no motivation.' },
                            { bad: true, title: 'Normal Apps', desc: 'No idea why you\'re doing it. Easily skipped, endlessly postponed.' },
                            { bad: false, title: 'Flowlock', desc: 'Every task has a purpose, a place, a time, and a deadline. Procrastination has nowhere to hide.' },
                        ].map((card, i) => (
                            <FadeUp key={i} delay={i * 0.15}>
                                <div
                                    className="rounded-2xl p-6 h-full flex flex-col"
                                    style={{
                                        ...(card.bad ? glassSubtle : glassCard),
                                        ...(card.bad ? {} : { borderColor: 'rgba(127,25,230,0.3)' }),
                                    }}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 ${card.bad ? 'bg-red-500/10' : 'bg-[#7f19e6]/15'}`}>
                                        {card.bad ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </div>
                                    <h4 className={`text-sm font-bold uppercase tracking-wider mb-2 ${card.bad ? 'text-slate-500' : 'text-[#a855f7]'}`}>
                                        {card.title}
                                    </h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ░░░ 4  FEATURES — Bento Grid ░░░ */}
            <section id="features" className="relative py-28 px-6">
                {/* BG glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(127,25,230,0.08) 0%, transparent 70%)' }} />

                <div className="max-w-5xl mx-auto relative z-10">
                    <FadeUp>
                        <p className="text-xs font-bold text-[#a855f7] uppercase tracking-[0.25em] mb-3 text-center">Features</p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
                            Everything That Makes You<br />Procrastination-Proof
                        </h2>
                        <p className="text-slate-500 text-center max-w-xl mx-auto mb-14 text-sm">
                            Every feature is clinically designed to remove ambiguity — the root cause of procrastination.
                        </p>
                    </FadeUp>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {features.map((f, i) => (
                            <FadeUp key={i} delay={i * 0.08} className={f.span}>
                                <div
                                    className="group rounded-2xl p-6 h-full transition-all duration-300 hover:border-[rgba(127,25,230,0.3)] relative overflow-hidden"
                                    style={glassSubtle}
                                >
                                    {/* accent line */}
                                    <div className="absolute top-0 left-6 right-6 h-[2px] rounded-b opacity-0 group-hover:opacity-60 transition-opacity duration-500" style={{ background: 'linear-gradient(90deg, transparent, #a855f7, transparent)' }} />

                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(127,25,230,0.1)', border: '1px solid rgba(127,25,230,0.2)' }}>
                                        {f.icon}
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ░░░ 5  HOW IT WORKS ░░░ */}
            <section id="how-it-works" className="relative py-28 px-6">
                <div className="max-w-4xl mx-auto">
                    <FadeUp>
                        <p className="text-xs font-bold text-[#a855f7] uppercase tracking-[0.25em] mb-3 text-center">How It Works</p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-16">
                            Three Steps to Unshakeable Focus
                        </h2>
                    </FadeUp>

                    <div className="relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-[2px]" style={{ background: 'linear-gradient(90deg, rgba(127,25,230,0.0), rgba(127,25,230,0.3), rgba(127,25,230,0.3), rgba(127,25,230,0.0))' }} />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
                            {steps.map((s, i) => (
                                <FadeUp key={i} delay={i * 0.2}>
                                    <div className="flex flex-col items-center text-center">
                                        {/* Step number badge */}
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-lg font-extrabold relative z-10"
                                            style={{
                                                background: 'rgba(127,25,230,0.08)',
                                                border: '1px solid rgba(127,25,230,0.2)',
                                                color: '#a855f7',
                                            }}
                                        >
                                            {s.num}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-5">{s.desc}</p>

                                        {/* Screenshot for this step */}
                                        {s.image && (
                                            <div className="w-full mt-2" style={screenshotFrame}>
                                                <img
                                                    src={s.image}
                                                    alt={`Flowlock ${s.title} step`}
                                                    className="w-full h-auto block"
                                                    loading="lazy"
                                                    style={{ borderRadius: '15px' }}
                                                />
                                            </div>
                                        )}

                                        {/* Icon for step 3 (no screenshot) */}
                                        {!s.image && (
                                            <div className="w-full mt-2 rounded-2xl p-10 flex flex-col items-center justify-center gap-4" style={{ background: 'rgba(127,25,230,0.05)', border: '1px solid rgba(127,25,230,0.12)', minHeight: '200px' }}>
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                    <polyline points="22 4 12 14.01 9 11.01" />
                                                </svg>
                                                <p className="text-sm text-slate-500 font-medium">Focus logged. Fresh start.</p>
                                            </div>
                                        )}
                                    </div>
                                </FadeUp>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ░░░ 6  FOUNDER STORY ░░░ */}
            <section id="story" className="relative py-28 px-6">
                <div className="max-w-3xl mx-auto">
                    <FadeUp>
                        <div className="rounded-3xl p-8 md:p-12 relative overflow-hidden" style={glassCard}>
                            {/* Accent border */}
                            <div className="absolute top-0 left-8 right-8 h-[2px] rounded-b" style={{ background: 'linear-gradient(90deg, transparent, #a855f7, transparent)', opacity: 0.6 }} />

                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(127,25,230,0.12)', border: '1px solid rgba(127,25,230,0.25)' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
                                        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                                    </svg>
                                </div>

                                <blockquote className="text-lg md:text-xl text-slate-200 leading-relaxed font-medium italic mb-8 max-w-2xl">
                                    "I built Flowlock because I was drowning in procrastination. Every productivity app gave me a checkbox &mdash; none gave me a reason. This app is built from real research, from Atomic Habits principles, and from my own personal battle with avoidance. It's not another to-do list. It's a clarity engine."
                                </blockquote>

                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: 'linear-gradient(135deg, #7f19e6 0%, #a855f7 100%)' }}>
                                        <span className="text-xs font-bold text-white">F</span>
                                    </div>
                                    <p className="text-sm font-semibold text-white">The Founder</p>
                                    <p className="text-xs text-slate-500">Built from real experience, not theory</p>
                                </div>
                            </div>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* ░░░ 7  FINAL CTA + FOOTER ░░░ */}
            <section className="relative py-28 px-6">
                {/* BG glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(127,25,230,0.1) 0%, transparent 70%)' }} />

                <div className="max-w-3xl mx-auto relative z-10 text-center">
                    <FadeUp>
                        <p className="text-xs font-bold text-[#a855f7] uppercase tracking-[0.25em] mb-3">Ready?</p>
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                            Make Procrastination<br />
                            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
                                Impossible.
                            </span>
                        </h2>
                        <p className="text-slate-400 text-base md:text-lg max-w-lg mx-auto mb-10">
                            Join the people who stopped managing tasks and started <span className="text-white font-medium">knowing</span> them. Free to start.
                        </p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-10 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-[1.04] active:scale-[0.97] cursor-pointer"
                            style={{
                                background: 'linear-gradient(135deg, #7f19e6, #a855f7)',
                                boxShadow: '0 12px 36px -6px rgba(127,25,230,0.45)',
                            }}
                        >
                            Get Started Free
                        </button>
                    </FadeUp>
                </div>
            </section>

            {/* ░░░ FOOTER ░░░ */}
            <footer className="border-t py-10 px-6" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7f19e6, #a855f7)' }}>
                            <svg width="12" height="12" fill="white" viewBox="0 0 48 48"><path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd" /></svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-500">Flowlock</span>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-slate-600">
                        <button className="hover:text-slate-300 transition-colors cursor-pointer">Privacy</button>
                        <button className="hover:text-slate-300 transition-colors cursor-pointer">Terms</button>
                        <button className="hover:text-slate-300 transition-colors cursor-pointer">Contact</button>
                    </div>

                    <p className="text-xs text-slate-700">&copy; 2026 Flowlock. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
