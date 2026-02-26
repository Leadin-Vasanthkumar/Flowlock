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
    const [hours, setHours] = useState<string | number>('');
    const [minutes, setMinutes] = useState<string | number>('');
    const [location, setLocation] = useState('');
    const [purpose, setPurpose] = useState('');
    const [schedHour, setSchedHour] = useState<string | number>('');
    const [schedMinute, setSchedMinute] = useState<string | number>('');
    const [schedPeriod, setSchedPeriod] = useState<'AM' | 'PM' | ''>('');
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
        if (schedHour === '' || schedMinute === '' || schedPeriod === '') return undefined;

        const now = new Date();
        const hourNum = typeof schedHour === 'string' ? parseInt(schedHour, 10) : schedHour;
        const minNum = typeof schedMinute === 'string' ? parseInt(schedMinute, 10) : schedMinute;

        let h24 = hourNum % 12;
        if (schedPeriod === 'PM') h24 += 12;

        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h24, minNum, 0);
        if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
        return d.toISOString();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const hrs = parseInt(hours.toString() || '0', 10);
        const mins = parseInt(minutes.toString() || '0', 10);
        const totalSeconds = (hrs * 3600) + (mins * 60);

        // Either 0 seconds (optional) OR at least 300 (5 mins)
        if (!title.trim() || (totalSeconds > 0 && totalSeconds < 300)) return;

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
                                onClick={() => setHours(h => {
                                    const curr = parseInt(h.toString() || '0', 10);
                                    return curr <= 0 ? 0 : curr - 1;
                                })}
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

                            <div className="flex-1 flex items-center justify-center gap-2" style={{ height: '52px' }}>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={hours.toString()}
                                    maxLength={2}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setHours(val === '' ? 0 : Math.min(24, parseInt(val, 10)));
                                    }}
                                    className="text-white font-semibold tabular-nums bg-transparent text-right focus:outline-none"
                                    style={{ width: '26px', fontSize: '18px', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em', padding: 0, margin: 0 }}
                                />
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
                                onClick={() => setHours(h => {
                                    const curr = parseInt(h.toString() || '0', 10);
                                    return Math.min(12, curr + 1);
                                })}
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
                                onClick={() => setMinutes(m => {
                                    const curr = parseInt(m.toString() || '0', 10);
                                    return curr <= 0 ? 0 : Math.max(0, curr - 5);
                                })}
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

                            <div className="flex-1 flex items-center justify-center gap-2" style={{ height: '52px' }}>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={minutes.toString()}
                                    maxLength={2}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setMinutes(val === '' ? 0 : Math.min(59, parseInt(val, 10)));
                                    }}
                                    className="text-white font-semibold tabular-nums bg-transparent text-right focus:outline-none"
                                    style={{ width: '26px', fontSize: '18px', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em', padding: 0, margin: 0 }}
                                />
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
                                onClick={() => setMinutes(m => {
                                    const curr = parseInt(m.toString() || '0', 10);
                                    return Math.min(59, curr + 5);
                                })}
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
                {(() => {
                    const hrs = parseInt(hours.toString() || '0', 10);
                    const mins = parseInt(minutes.toString() || '0', 10);
                    return (hrs * 60 + mins) > 0 && (hrs * 60 + mins) < 5 && (
                        <p className="text-red-400/70 text-xs mt-2 ml-1">If setting a timer, minimum is 5 minutes</p>
                    );
                })()}
            </div>

            {/* Scheduled Start Time */}
            <div>
                <label className="block text-slate-300 text-sm font-medium mb-3">
                    When will you start?
                </label>
                <div className="flex gap-3 items-center">
                    {/* Hour Stepper */}
                    <div className="flex-1">
                        <div className="flex items-center rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                            <button type="button" aria-label="Decrease hour" onClick={() => {
                                setSchedHour(h => {
                                    if (h === '') {
                                        const currH = new Date().getHours();
                                        return currH === 0 ? 12 : currH > 12 ? currH - 12 : currH;
                                    }
                                    const num = Number(h);
                                    return num <= 1 ? 12 : num - 1;
                                });
                                if (schedPeriod === '') setSchedPeriod(new Date().getHours() >= 12 ? 'PM' : 'AM');
                            }}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{ width: '36px', height: '48px', background: 'rgba(255,255,255,0.03)', border: 'none', borderRight: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(127,25,230,0.15)'; e.currentTarget.style.color = '#a855f7'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                            </button>
                            <div className="flex-1 flex items-center justify-center gap-1.5" style={{ height: '48px' }}>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={schedHour.toString()}
                                    maxLength={2}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        const num = val === '' ? '' : parseInt(val, 10);
                                        setSchedHour(typeof num === 'number' && num > 12 ? 12 : num);
                                        if (schedPeriod === '' && val !== '') setSchedPeriod(new Date().getHours() >= 12 ? 'PM' : 'AM');
                                    }}
                                    className="text-white font-semibold tabular-nums bg-transparent text-center focus:outline-none placeholder:text-slate-600/50"
                                    placeholder="--"
                                    style={{ width: '24px', fontSize: '17px', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em', padding: 0, margin: 0 }}
                                />
                            </div>
                            <button type="button" aria-label="Increase hour" onClick={() => {
                                setSchedHour(h => {
                                    if (h === '') {
                                        const currH = new Date().getHours();
                                        return currH === 0 ? 12 : currH > 12 ? currH - 12 : currH;
                                    }
                                    const num = Number(h);
                                    return num >= 12 ? 1 : num + 1;
                                });
                                if (schedPeriod === '') setSchedPeriod(new Date().getHours() >= 12 ? 'PM' : 'AM');
                            }}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{
                                    width: '36px',
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
                        <div className="flex items-center rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                            <button type="button" aria-label="Decrease minute" onClick={() => {
                                setSchedMinute(m => {
                                    if (m === '') {
                                        const currM = new Date().getMinutes();
                                        return Math.ceil(currM / 5) * 5 % 60;
                                    }
                                    const num = Number(m);
                                    return num <= 0 ? 55 : num - 5;
                                });
                                if (schedHour === '') {
                                    const h = new Date().getHours();
                                    setSchedHour(h === 0 ? 12 : h > 12 ? h - 12 : h);
                                }
                                if (schedPeriod === '') setSchedPeriod(new Date().getHours() >= 12 ? 'PM' : 'AM');
                            }}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{ width: '36px', height: '48px', background: 'rgba(255,255,255,0.03)', border: 'none', borderRight: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(127,25,230,0.15)'; e.currentTarget.style.color = '#a855f7'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <div className="flex-1 flex items-center justify-center gap-1.5" style={{ height: '48px' }}>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={schedMinute === '' ? '' : schedMinute.toString().padStart(2, '0')}
                                    maxLength={2}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setSchedMinute(val === '' ? '' : Math.min(59, parseInt(val, 10)));
                                        if (schedHour === '' && val !== '') {
                                            const h = new Date().getHours();
                                            setSchedHour(h === 0 ? 12 : h > 12 ? h - 12 : h);
                                        }
                                        if (schedPeriod === '' && val !== '') setSchedPeriod(new Date().getHours() >= 12 ? 'PM' : 'AM');
                                    }}
                                    className="text-white font-semibold tabular-nums bg-transparent text-center focus:outline-none placeholder:text-slate-600/50"
                                    placeholder="--"
                                    style={{ width: '24px', fontSize: '17px', fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em', padding: 0, margin: 0 }}
                                />
                            </div>
                            <button type="button" aria-label="Increase minute" onClick={() => {
                                setSchedMinute(m => {
                                    if (m === '') {
                                        const currM = new Date().getMinutes();
                                        return Math.ceil(currM / 5) * 5 % 60;
                                    }
                                    const num = Number(m);
                                    return num >= 55 ? 0 : num + 5;
                                });
                                if (schedHour === '') {
                                    const h = new Date().getHours();
                                    setSchedHour(h === 0 ? 12 : h > 12 ? h - 12 : h);
                                }
                                if (schedPeriod === '') setSchedPeriod(new Date().getHours() >= 12 ? 'PM' : 'AM');
                            }}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{
                                    width: '36px',
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
                        <button type="button" onClick={() => {
                            setSchedPeriod('AM');
                            if (schedHour === '') { const h = new Date().getHours(); setSchedHour(h === 0 ? 12 : h > 12 ? h - 12 : h); }
                            if (schedMinute === '') { const m = new Date().getMinutes(); setSchedMinute(Math.ceil(m / 5) * 5 % 60); }
                        }}
                            className="cursor-pointer flex items-center justify-center rounded-xl font-bold text-xs transition-all focus:outline-none"
                            style={{
                                width: '40px',
                                background: schedPeriod === 'AM' ? 'rgba(127,25,230,0.15)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${schedPeriod === 'AM' ? 'rgba(127,25,230,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                color: schedPeriod === 'AM' ? '#a855f7' : 'rgba(255,255,255,0.5)',
                                letterSpacing: '0.05em',
                            }}
                        >AM</button>
                        <button type="button" onClick={() => {
                            setSchedPeriod('PM');
                            if (schedHour === '') { const h = new Date().getHours(); setSchedHour(h === 0 ? 12 : h > 12 ? h - 12 : h); }
                            if (schedMinute === '') { const m = new Date().getMinutes(); setSchedMinute(Math.ceil(m / 5) * 5 % 60); }
                        }}
                            className="cursor-pointer flex items-center justify-center rounded-xl font-bold text-xs transition-all focus:outline-none"
                            style={{
                                width: '40px',
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
                    disabled={
                        loading ||
                        !title.trim() ||
                        (() => {
                            const hrs = parseInt(hours.toString() || '0', 10);
                            const mins = parseInt(minutes.toString() || '0', 10);
                            const totalMins = hrs * 60 + mins;
                            return totalMins > 0 && totalMins < 5;
                        })()
                    }
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
