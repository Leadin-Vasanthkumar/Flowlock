import React, { useState } from 'react';

interface AddTaskFormProps {
    onSubmit: (data: {
        title: string;
        estimatedSeconds: number;
        location?: string;
        purpose?: string;
        scheduledAt?: string;
        repeatType: 'none' | 'daily' | 'weekly';
        repeatDayOfWeek?: number;
    }) => void;
    onCancel: () => void;
    loading?: boolean;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onSubmit, onCancel, loading }) => {
    const [title, setTitle] = useState('');
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(25);
    const [location, setLocation] = useState('');
    const [purpose, setPurpose] = useState('');
    const [schedHour, setSchedHour] = useState(() => {
        const h = new Date().getHours();
        return h === 0 ? 12 : h > 12 ? h - 12 : h;
    });
    const [schedMinute, setSchedMinute] = useState(() => {
        const m = new Date().getMinutes();
        return Math.ceil(m / 5) * 5 % 60;
    });
    const [schedPeriod, setSchedPeriod] = useState<'AM' | 'PM'>(() => new Date().getHours() >= 12 ? 'PM' : 'AM');
    const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly'>('none');
    const [showRepeatDropdown, setShowRepeatDropdown] = useState(false);

    const repeatOptions: { value: 'none' | 'daily' | 'weekly'; label: string; icon: React.ReactNode }[] = [
        {
            value: 'none',
            label: 'Task for today',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
        },
        {
            value: 'daily',
            label: 'Habit (repeats every day)',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            ),
        },
        {
            value: 'weekly',
            label: `Repeats every ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}`,
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
    ];

    const getScheduledISO = (): string | undefined => {
        const now = new Date();
        let h24 = schedHour % 12;
        if (schedPeriod === 'PM') h24 += 12;
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h24, schedMinute, 0);
        // If the chosen time is already past today, set it for tomorrow
        if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
        return d.toISOString();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalSeconds = (hours * 3600) + (minutes * 60);
        if (!title.trim() || totalSeconds < 300) return; // min 5 minutes
        onSubmit({
            title: title.trim(),
            estimatedSeconds: totalSeconds,
            location: location.trim() || undefined,
            purpose: purpose.trim() || undefined,
            scheduledAt: getScheduledISO(),
            repeatType: repeatType,
            repeatDayOfWeek: repeatType === 'weekly' ? new Date().getDay() : undefined,
        });
    };

    const inputStyle: React.CSSProperties = {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
    };

    const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = 'rgba(127,25,230,0.5)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
    };

    const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Task Title */}
            <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                    What are you working on?
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Write project proposal"
                    required
                    className="w-full px-5 py-4 rounded-2xl text-white placeholder-slate-600 focus:outline-none transition-all text-sm"
                    style={inputStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                    autoFocus
                />
            </div>

            {/* Estimated Time */}
            <div>
                <label className="block text-slate-300 text-sm font-medium mb-3">
                    How long will it take?
                </label>
                <div className="flex gap-4">
                    {/* Hours Stepper */}
                    <div className="flex-1">
                        <div
                            className="flex items-center rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            {/* Decrement */}
                            <button
                                type="button"
                                aria-label="Decrease hours"
                                onClick={() => setHours(h => Math.max(0, h - 1))}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{
                                    width: '48px',
                                    height: '52px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: 'none',
                                    borderRight: '1px solid rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.45)',
                                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(127,25,230,0.15)';
                                    e.currentTarget.style.color = '#a855f7';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>

                            {/* Value Display */}
                            <div className="flex-1 flex items-center justify-center gap-2" style={{ height: '52px' }}>
                                <span
                                    className="text-white font-semibold tabular-nums"
                                    style={{ fontSize: '18px', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
                                >
                                    {hours}
                                </span>
                                <span
                                    className="font-medium"
                                    style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                >
                                    hrs
                                </span>
                            </div>

                            {/* Increment */}
                            <button
                                type="button"
                                aria-label="Increase hours"
                                onClick={() => setHours(h => Math.min(12, h + 1))}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{
                                    width: '48px',
                                    height: '52px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: 'none',
                                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.45)',
                                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(127,25,230,0.15)';
                                    e.currentTarget.style.color = '#a855f7';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="flex items-center">
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '20px', fontWeight: 300 }}>:</span>
                    </div>

                    {/* Minutes Stepper */}
                    <div className="flex-1">
                        <div
                            className="flex items-center rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            {/* Decrement */}
                            <button
                                type="button"
                                aria-label="Decrease minutes"
                                onClick={() => setMinutes(m => Math.max(0, m - 5))}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{
                                    width: '48px',
                                    height: '52px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: 'none',
                                    borderRight: '1px solid rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.45)',
                                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(127,25,230,0.15)';
                                    e.currentTarget.style.color = '#a855f7';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>

                            {/* Value Display */}
                            <div className="flex-1 flex items-center justify-center gap-2" style={{ height: '52px' }}>
                                <span
                                    className="text-white font-semibold tabular-nums"
                                    style={{ fontSize: '18px', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}
                                >
                                    {minutes}
                                </span>
                                <span
                                    className="font-medium"
                                    style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                >
                                    min
                                </span>
                            </div>

                            {/* Increment */}
                            <button
                                type="button"
                                aria-label="Increase minutes"
                                onClick={() => setMinutes(m => Math.min(59, m + 5))}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{
                                    width: '48px',
                                    height: '52px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: 'none',
                                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.45)',
                                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(127,25,230,0.15)';
                                    e.currentTarget.style.color = '#a855f7';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                {(hours * 60 + minutes) < 5 && (hours > 0 || minutes > 0) && (
                    <p className="text-red-400/70 text-xs mt-2 ml-1">Minimum 5 minutes</p>
                )}
            </div>

            {/* Scheduled Start Time */}
            <div>
                <label className="block text-slate-300 text-sm font-medium mb-3">
                    When will you start?
                </label>
                <div className="flex gap-3 items-center">
                    {/* Hour Stepper */}
                    <div className="flex-1">
                        <div
                            className="flex items-center rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            <button
                                type="button"
                                aria-label="Decrease hour"
                                onClick={() => setSchedHour(h => h <= 1 ? 12 : h - 1)}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{
                                    width: '44px',
                                    height: '48px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: 'none',
                                    borderRight: '1px solid rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.45)',
                                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(127,25,230,0.15)';
                                    e.currentTarget.style.color = '#a855f7';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <div className="flex-1 flex items-center justify-center gap-1.5" style={{ height: '48px' }}>
                                <span className="text-white font-semibold tabular-nums" style={{ fontSize: '17px', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>
                                    {schedHour}
                                </span>
                            </div>
                            <button
                                type="button"
                                aria-label="Increase hour"
                                onClick={() => setSchedHour(h => h >= 12 ? 1 : h + 1)}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{
                                    width: '44px',
                                    height: '48px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: 'none',
                                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.45)',
                                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(127,25,230,0.15)';
                                    e.currentTarget.style.color = '#a855f7';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="flex items-center">
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '18px', fontWeight: 300 }}>:</span>
                    </div>

                    {/* Minute Stepper */}
                    <div className="flex-1">
                        <div
                            className="flex items-center rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            <button
                                type="button"
                                aria-label="Decrease minute"
                                onClick={() => setSchedMinute(m => m <= 0 ? 55 : m - 5)}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{
                                    width: '44px',
                                    height: '48px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: 'none',
                                    borderRight: '1px solid rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.45)',
                                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(127,25,230,0.15)';
                                    e.currentTarget.style.color = '#a855f7';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <div className="flex-1 flex items-center justify-center gap-1.5" style={{ height: '48px' }}>
                                <span className="text-white font-semibold tabular-nums" style={{ fontSize: '17px', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>
                                    {schedMinute.toString().padStart(2, '0')}
                                </span>
                            </div>
                            <button
                                type="button"
                                aria-label="Increase minute"
                                onClick={() => setSchedMinute(m => m >= 55 ? 0 : m + 5)}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{
                                    width: '44px',
                                    height: '48px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: 'none',
                                    borderLeft: '1px solid rgba(255,255,255,0.06)',
                                    color: 'rgba(255,255,255,0.45)',
                                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(127,25,230,0.15)';
                                    e.currentTarget.style.color = '#a855f7';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* AM/PM Selection */}
                    <div className="flex gap-1.5" style={{ height: '48px' }}>
                        <button
                            type="button"
                            onClick={() => setSchedPeriod('AM')}
                            className="cursor-pointer flex items-center justify-center rounded-2xl font-bold text-sm transition-all focus:outline-none"
                            style={{
                                width: '44px',
                                background: schedPeriod === 'AM' ? 'rgba(127,25,230,0.15)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${schedPeriod === 'AM' ? 'rgba(127,25,230,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                color: schedPeriod === 'AM' ? '#a855f7' : 'rgba(255,255,255,0.5)',
                                letterSpacing: '0.05em',
                            }}
                        >
                            AM
                        </button>
                        <button
                            type="button"
                            onClick={() => setSchedPeriod('PM')}
                            className="cursor-pointer flex items-center justify-center rounded-2xl font-bold text-sm transition-all focus:outline-none"
                            style={{
                                width: '44px',
                                background: schedPeriod === 'PM' ? 'rgba(127,25,230,0.15)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${schedPeriod === 'PM' ? 'rgba(127,25,230,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                color: schedPeriod === 'PM' ? '#a855f7' : 'rgba(255,255,255,0.5)',
                                letterSpacing: '0.05em',
                            }}
                        >
                            PM
                        </button>
                    </div>
                </div>
            </div>

            {/* Repeat / Habit */}
            <div className="relative">
                <label className="block text-slate-300 text-sm font-medium mb-2">
                    Repeat?
                </label>
                {/* Custom Trigger */}
                <button
                    type="button"
                    onClick={() => setShowRepeatDropdown(prev => !prev)}
                    className="w-full px-5 py-4 rounded-2xl text-sm text-left cursor-pointer flex items-center gap-3 transition-all focus:outline-none"
                    style={{
                        background: showRepeatDropdown ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                        border: showRepeatDropdown ? '1px solid rgba(127,25,230,0.5)' : '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: repeatType !== 'none' ? 'rgba(127,25,230,0.2)' : 'rgba(255,255,255,0.06)' }}>
                        <span style={{ color: repeatType !== 'none' ? '#a855f7' : 'rgba(255,255,255,0.4)' }}>
                            {repeatOptions.find(o => o.value === repeatType)?.icon}
                        </span>
                    </span>
                    <span className="flex-1 text-white">
                        {repeatOptions.find(o => o.value === repeatType)?.label}
                    </span>
                    <svg
                        className="w-4 h-4 transition-transform"
                        style={{ color: 'rgba(255,255,255,0.4)', transform: showRepeatDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Glassmorphic Dropdown Panel */}
                {showRepeatDropdown && (
                    <>
                        {/* Invisible backdrop to close */}
                        <div className="fixed inset-0 z-30" onClick={() => setShowRepeatDropdown(false)} />
                        <div
                            className="absolute left-0 right-0 z-40 mt-2 rounded-2xl overflow-hidden"
                            style={{
                                background: 'rgba(22, 14, 40, 0.85)',
                                backdropFilter: 'blur(32px)',
                                WebkitBackdropFilter: 'blur(32px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 16px 48px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(127,25,230,0.15)',
                            }}
                        >
                            {repeatOptions.map((option) => {
                                const isActive = repeatType === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            setRepeatType(option.value);
                                            setShowRepeatDropdown(false);
                                        }}
                                        className="w-full px-4 py-3.5 flex items-center gap-3 text-sm text-left transition-all cursor-pointer"
                                        style={{
                                            background: isActive ? 'rgba(127,25,230,0.15)' : 'transparent',
                                            borderLeft: isActive ? '3px solid #a855f7' : '3px solid transparent',
                                        }}
                                        onMouseEnter={e => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                            }
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = isActive ? 'rgba(127,25,230,0.15)' : 'transparent';
                                        }}
                                    >
                                        <span
                                            className="flex items-center justify-center w-7 h-7 rounded-lg"
                                            style={{
                                                background: isActive ? 'rgba(127,25,230,0.25)' : 'rgba(255,255,255,0.06)',
                                            }}
                                        >
                                            <span style={{ color: isActive ? '#a855f7' : 'rgba(255,255,255,0.4)' }}>
                                                {option.icon}
                                            </span>
                                        </span>
                                        <span style={{ color: isActive ? '#c084fc' : 'rgba(255,255,255,0.8)' }} className="font-medium">
                                            {option.label}
                                        </span>
                                        {isActive && (
                                            <svg className="w-4 h-4 ml-auto" style={{ color: '#a855f7' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Location */}
            <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                    Where will you work?
                    <span className="text-slate-600 font-normal ml-1.5">optional</span>
                </label>
                <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Home office, Library, Café"
                    className="w-full px-5 py-4 rounded-2xl text-white placeholder-slate-600 focus:outline-none transition-all text-sm"
                    style={inputStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                />
            </div>

            {/* Purpose */}
            <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                    Why does this matter?
                    <span className="text-slate-600 font-normal ml-1.5">optional</span>
                </label>
                <input
                    type="text"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    placeholder="e.g. Close the deal, Ship the feature"
                    className="w-full px-5 py-4 rounded-2xl text-white placeholder-slate-600 focus:outline-none transition-all text-sm"
                    style={inputStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-slate-400 transition-all hover:text-white"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading || !title.trim() || (hours * 60 + minutes) < 5}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, #7f19e6 0%, #a855f7 100%)',
                        boxShadow: '0 8px 24px -4px rgba(127,25,230,0.3)',
                    }}
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Create Task'}
                </button>
            </div>
        </form>
    );
};

export default AddTaskForm;
