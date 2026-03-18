import React, { useState } from 'react';
import { Task, PomodoroProfile, RecurrenceType } from '../types';

interface EditTaskFormProps {
    task: Task;
    onSave: (data: {
        title: string;
        pomodoroProfile: PomodoroProfile;
        pomodorosRequired: number;
        recurrenceType: RecurrenceType;
        recurrenceDays?: number[];
    }) => void;
    onCancel: () => void;
    saving?: boolean;
}

const EditTaskForm: React.FC<EditTaskFormProps> = ({ task, onSave, onCancel, saving }) => {
    const [title, setTitle] = useState(task.title);
    const [pomodoroProfile, setPomodoroProfile] = useState<PomodoroProfile>(task.pomodoroProfile || '25-5');
    const [pomodorosRequired, setPomodorosRequired] = useState(task.pomodorosRequired || 1);
    const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(task.recurrenceType || 'none');
    const [recurrenceDays, setRecurrenceDays] = useState<number[]>(task.recurrenceDays || []);

    const handleProfileSelect = (profile: PomodoroProfile) => {
        setPomodoroProfile(profile);
    };

    const handleSetsChange = (change: number) => {
        setPomodorosRequired(prev => Math.max(1, Math.min(5, prev + change)));
    };

    const toggleDay = (day: number) => {
        setRecurrenceDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSave({
            title: title.trim(),
            pomodoroProfile: pomodoroProfile,
            pomodorosRequired: pomodorosRequired,
            recurrenceType,
            recurrenceDays: recurrenceType === 'weekly' ? recurrenceDays : undefined
        });
    };

    const inputStyle: React.CSSProperties = {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
    };

    const focusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
        e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
    };

    const blurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
    };

    const profiles: { value: PomodoroProfile; label: string; subLabel: string }[] = [
        { value: '25-5', label: '25', subLabel: 'MINS' },
        { value: '50-10', label: '50', subLabel: 'MINS' },
        { value: '90-10', label: '90', subLabel: 'MINS' },
        { value: 'no-timer', label: '—', subLabel: 'NO TIMER' },
    ];

    const weekDays = [
        { id: 1, label: 'M' },
        { id: 2, label: 'T' },
        { id: 3, label: 'W' },
        { id: 4, label: 'T' },
        { id: 5, label: 'F' },
        { id: 6, label: 'S' },
        { id: 0, label: 'S' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Title */}
            <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Task Name</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Write project proposal"
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-white placeholder-slate-600 focus:outline-none transition-all text-sm"
                    style={inputStyle}
                    onFocus={focusHandler}
                    onBlur={blurHandler}
                    autoFocus
                />
            </div>

            {/* Recurrence Selection */}
            <div>
                <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">
                    Repeat frequency
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {[
                        { id: 'none', label: 'One-time' },
                        { id: 'daily', label: 'Every Day' },
                        { id: 'weekly', label: 'Specific Days' }
                    ].map(type => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => setRecurrenceType(type.id as RecurrenceType)}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all duration-300 cursor-pointer ${
                                recurrenceType === type.id
                                ? 'bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]'
                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>

                {recurrenceType === 'weekly' && (
                    <div className="flex gap-1 animate-in fade-in slide-in-from-top-1 duration-300">
                        {weekDays.map(day => (
                            <button
                                key={day.id}
                                type="button"
                                onClick={() => toggleDay(day.id)}
                                className={`w-8 h-8 rounded-lg border text-[10px] font-bold transition-all duration-200 cursor-pointer flex items-center justify-center ${
                                    recurrenceDays.includes(day.id)
                                    ? 'bg-[#22C55E] border-[#22C55E] text-[#0D0E0D]'
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                                }`}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Pomodoro Range & Sets */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className={pomodoroProfile === 'no-timer' ? 'sm:col-span-4' : 'sm:col-span-3'}>
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Pomodoro range</label>
                    <div className={`grid gap-2 ${pomodoroProfile === 'no-timer' ? 'grid-cols-4' : 'grid-cols-3'}`}>
                        {profiles.map((p) => {
                            const isSelected = pomodoroProfile === p.value;
                            return (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => handleProfileSelect(p.value)}
                                    className={`flex flex-col items-center justify-center h-[62px] rounded-xl border transition-all duration-300 cursor-pointer ${isSelected
                                        ? 'border-[#22C55E] bg-[#22C55E]/15 scale-[1.02]'
                                        : 'border-white/5 bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <span className={`text-lg font-bold tracking-tight mb-0.5 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                        {p.label}
                                    </span>
                                    <span className={`text-[8px] tracking-widest font-bold ${isSelected ? 'text-[#22C55E]' : 'text-slate-600'}`}>
                                        {p.subLabel}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {pomodoroProfile !== 'no-timer' && (
                <div className="sm:col-span-1">
                    <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Sets</label>
                    <div className="flex items-center justify-between px-2 h-[62px] rounded-xl border border-white/5 bg-white/5">
                        <button
                            type="button"
                            onClick={() => handleSetsChange(-1)}
                            disabled={pomodorosRequired <= 1}
                            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                            </svg>
                        </button>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-white leading-none">{pomodorosRequired}</span>
                            <span className="text-[7px] font-bold text-slate-600 uppercase tracking-tighter mt-1">SETS</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleSetsChange(1)}
                            disabled={pomodorosRequired >= 5}
                            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>
                )}
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
                    disabled={saving || !title.trim()}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#0D0E0D] transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer bg-[#22C55E]"
                    style={{
                        boxShadow: '0 6px 20px -4px rgba(34,197,94,0.3)',
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
