import React, { useState } from 'react';

interface AddTaskFormProps {
    onSubmit: (data: {
        title: string;
        estimatedSeconds: number;
        location?: string;
        purpose?: string;
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalSeconds = (hours * 3600) + (minutes * 60);
        if (!title.trim() || totalSeconds < 300) return; // min 5 minutes
        onSubmit({
            title: title.trim(),
            estimatedSeconds: totalSeconds,
            location: location.trim() || undefined,
            purpose: purpose.trim() || undefined,
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
