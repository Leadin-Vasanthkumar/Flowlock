import React, { useState } from 'react';
import { Task } from '../types';

interface EditTaskFormProps {
    task: Task;
    onSave: (data: {
        title: string;
        estimatedSeconds: number;
        location?: string;
        purpose?: string;
        scheduledAt?: string;
    }) => void;
    onCancel: () => void;
    saving?: boolean;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({ task, onSave, onCancel, saving }) => {
    const [title, setTitle] = useState(task.title);
    const [hours, setHours] = useState(Math.floor(task.estimatedSeconds / 3600));
    const [minutes, setMinutes] = useState(Math.floor((task.estimatedSeconds % 3600) / 60));
    const [location, setLocation] = useState(task.location || '');
    const [purpose, setPurpose] = useState(task.purpose || '');

    // Initialize schedule from existing task
    const existingDate = task.scheduledAt ? new Date(task.scheduledAt) : null;
    const [schedHour, setSchedHour] = useState(() => {
        if (existingDate) {
            const h = existingDate.getHours();
            return h === 0 ? 12 : h > 12 ? h - 12 : h;
        }
        const h = new Date().getHours();
        return h === 0 ? 12 : h > 12 ? h - 12 : h;
    });
    const [schedMinute, setSchedMinute] = useState(() => {
        if (existingDate) return existingDate.getMinutes();
        const m = new Date().getMinutes();
        return Math.ceil(m / 5) * 5 % 60;
    });
    const [schedPeriod, setSchedPeriod] = useState<'AM' | 'PM'>(() => {
        if (existingDate) return existingDate.getHours() >= 12 ? 'PM' : 'AM';
        return new Date().getHours() >= 12 ? 'PM' : 'AM';
    });

    const getScheduledISO = (): string | undefined => {
        const now = new Date();
        let h24 = schedHour % 12;
        if (schedPeriod === 'PM') h24 += 12;
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h24, schedMinute, 0);
        if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
        return d.toISOString();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalSeconds = (hours * 3600) + (minutes * 60);
        if (!title.trim() || totalSeconds < 300) return;
        onSave({
            title: title.trim(),
            estimatedSeconds: totalSeconds,
            location: location.trim() || undefined,
            purpose: purpose.trim() || undefined,
            scheduledAt: getScheduledISO(),
        });
    };

    const inputStyle: React.CSSProperties = {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
    };

    const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.currentTarget.style.borderColor = 'rgba(127,25,230,0.5)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
    };

    const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Title */}
            <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5">Task</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Write project proposal"
                    required
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 focus:outline-none transition-all text-sm"
                    style={inputStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                    autoFocus
                />
            </div>

            {/* Estimated Time */}
            <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5">Estimated time</label>
                <div className="flex gap-3">
                    {/* Hours Stepper */}
                    <div className="flex-1">
                        <div
                            className="flex items-center rounded-xl overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            <button
                                type="button"
                                aria-label="Decrease hours"
                                onClick={() => setHours(h => Math.max(0, h - 1))}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{
                                    width: '40px',
                                    height: '44px',
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
                            <div className="flex-1 flex items-center justify-center gap-1.5" style={{ height: '44px' }}>
                                <span className="text-white font-semibold tabular-nums" style={{ fontSize: '16px', fontFamily: "'Inter', sans-serif" }}>{hours}</span>
                                <span className="font-medium" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>hrs</span>
                            </div>
                            <button
                                type="button"
                                aria-label="Increase hours"
                                onClick={() => setHours(h => Math.min(12, h + 1))}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{
                                    width: '40px',
                                    height: '44px',
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

                    {/* Minutes Stepper */}
                    <div className="flex-1">
                        <div
                            className="flex items-center rounded-xl overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(12px)',
                            }}
                        >
                            <button
                                type="button"
                                aria-label="Decrease minutes"
                                onClick={() => setMinutes(m => Math.max(0, m - 5))}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{
                                    width: '40px',
                                    height: '44px',
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
                            <div className="flex-1 flex items-center justify-center gap-1.5" style={{ height: '44px' }}>
                                <span className="text-white font-semibold tabular-nums" style={{ fontSize: '16px', fontFamily: "'Inter', sans-serif" }}>{minutes}</span>
                                <span className="font-medium" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>min</span>
                            </div>
                            <button
                                type="button"
                                aria-label="Increase minutes"
                                onClick={() => setMinutes(m => Math.min(59, m + 5))}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{
                                    width: '40px',
                                    height: '44px',
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
                </div>
                {(hours * 60 + minutes) < 5 && (hours > 0 || minutes > 0) && (
                    <p className="text-red-400/70 text-xs mt-1.5 ml-1">Minimum 5 minutes</p>
                )}
            </div>

            {/* Scheduled Start Time */}
            <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5">Start time</label>
                <div className="flex gap-2 items-center">
                    {/* Hour */}
                    <div className="flex-1">
                        <div className="flex items-center rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                            <button type="button" aria-label="Decrease hour" onClick={() => setSchedHour(h => h <= 1 ? 12 : h - 1)}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{ width: '36px', height: '40px', background: 'rgba(255,255,255,0.03)', border: 'none', borderRight: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(127,25,230,0.15)'; e.currentTarget.style.color = '#a855f7'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                            </button>
                            <div className="flex-1 flex items-center justify-center" style={{ height: '40px' }}>
                                <span className="text-white font-semibold tabular-nums" style={{ fontSize: '15px', fontFamily: "'Inter', sans-serif" }}>{schedHour}</span>
                            </div>
                            <button type="button" aria-label="Increase hour" onClick={() => setSchedHour(h => h >= 12 ? 1 : h + 1)}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{ width: '36px', height: '40px', background: 'rgba(255,255,255,0.03)', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(127,25,230,0.15)'; e.currentTarget.style.color = '#a855f7'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        </div>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '16px', fontWeight: 300 }}>:</span>
                    {/* Minute */}
                    <div className="flex-1">
                        <div className="flex items-center rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                            <button type="button" aria-label="Decrease minute" onClick={() => setSchedMinute(m => m <= 0 ? 55 : m - 5)}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{ width: '36px', height: '40px', background: 'rgba(255,255,255,0.03)', border: 'none', borderRight: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(127,25,230,0.15)'; e.currentTarget.style.color = '#a855f7'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                            </button>
                            <div className="flex-1 flex items-center justify-center" style={{ height: '40px' }}>
                                <span className="text-white font-semibold tabular-nums" style={{ fontSize: '15px', fontFamily: "'Inter', sans-serif" }}>{schedMinute.toString().padStart(2, '0')}</span>
                            </div>
                            <button type="button" aria-label="Increase minute" onClick={() => setSchedMinute(m => m >= 55 ? 0 : m + 5)}
                                className="cursor-pointer flex items-center justify-center shrink-0 focus:outline-none"
                                style={{ width: '36px', height: '40px', background: 'rgba(255,255,255,0.03)', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(127,25,230,0.15)'; e.currentTarget.style.color = '#a855f7'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        </div>
                    </div>
                    {/* AM/PM Selection */}
                    <div className="flex gap-1.5" style={{ height: '40px' }}>
                        <button type="button" onClick={() => setSchedPeriod('AM')}
                            className="cursor-pointer flex items-center justify-center rounded-xl font-bold text-xs transition-all focus:outline-none"
                            style={{
                                width: '40px',
                                background: schedPeriod === 'AM' ? 'rgba(127,25,230,0.15)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${schedPeriod === 'AM' ? 'rgba(127,25,230,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                color: schedPeriod === 'AM' ? '#a855f7' : 'rgba(255,255,255,0.5)',
                                letterSpacing: '0.05em',
                            }}
                        >AM</button>
                        <button type="button" onClick={() => setSchedPeriod('PM')}
                            className="cursor-pointer flex items-center justify-center rounded-xl font-bold text-xs transition-all focus:outline-none"
                            style={{
                                width: '40px',
                                background: schedPeriod === 'PM' ? 'rgba(127,25,230,0.15)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${schedPeriod === 'PM' ? 'rgba(127,25,230,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                color: schedPeriod === 'PM' ? '#a855f7' : 'rgba(255,255,255,0.5)',
                                letterSpacing: '0.05em',
                            }}
                        >PM</button>
                    </div>
                </div>
            </div>

            {/* Location */}
            <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5">
                    Location <span className="text-slate-600 font-normal">optional</span>
                </label>
                <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Home office, Library, Café"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 focus:outline-none transition-all text-sm"
                    style={inputStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                />
            </div>

            {/* Purpose */}
            <div>
                <label className="block text-slate-300 text-xs font-medium mb-1.5">
                    Purpose <span className="text-slate-600 font-normal">optional</span>
                </label>
                <input
                    type="text"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    placeholder="e.g. Close the deal, Ship the feature"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 focus:outline-none transition-all text-sm"
                    style={inputStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium text-slate-400 transition-all hover:text-white cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving || !title.trim() || (hours * 60 + minutes) < 5}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{
                        background: 'linear-gradient(135deg, #7f19e6 0%, #a855f7 100%)',
                        boxShadow: '0 6px 20px -4px rgba(127,25,230,0.3)',
                    }}
                >
                    {saving ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default EditTaskForm;
