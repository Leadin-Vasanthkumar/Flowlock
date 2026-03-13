import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface GoalData {
    year: string;
    month: string;
    week: string;
    yearImage?: string;
    monthImage?: string;
    weekImage?: string;
}

interface GoalsPanelProps {
    goals: GoalData;
    onSaveGoal: (type: 'year' | 'month' | 'week', content: string) => Promise<void>;
    onSaveGoalImage: (type: 'year' | 'month' | 'week', imageUrl: string | null) => Promise<void>;
}

interface GoalCardProps {
    type: 'year' | 'month' | 'week';
    label: string;
    sublabel: string;
    placeholder: string;
    value: string;
    imageUrl?: string;
    onSave: (content: string) => Promise<void>;
    onImageUpload: (file: File) => Promise<void>;
    onImageRemove: () => Promise<void>;
}

const GoalCard: React.FC<GoalCardProps> = ({ label, placeholder, value, imageUrl, onSave, onImageUpload, onImageRemove }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(value);
    const [saving, setSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [uploading, setUploading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setText(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(text.length, text.length);
        }
    }, [isEditing]);

    const handleSave = async () => {
        const trimmed = text.trim();
        setIsEditing(false);
        if (trimmed === value) return;

        setSaving(true);
        await onSave(trimmed);
        setSaving(false);
        setShowSaved(true);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => setShowSaved(false), 1500);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setText(value);
            setIsEditing(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be under 2MB');
            return;
        }
        setUploading(true);
        await onImageUpload(file);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div
            className="p-4 rounded-lg bg-white/5 flex-1 group transition-all min-h-[120px]"
        >
            <div className="flex gap-3 h-full">
                <div className="flex-1 min-w-0 flex flex-col h-full" style={{ cursor: 'text' }} onClick={() => !isEditing && setIsEditing(true)}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-widest">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditing && (
                                <button
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSave();
                                    }}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all hover:opacity-90 active:scale-95 shadow-sm"
                                    style={{
                                        backgroundColor: '#22C55E',
                                        color: '#0D0E0D',
                                    }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Save
                                </button>
                            )}
                            <div
                                className="flex items-center gap-1 text-[10px] transition-opacity"
                                style={{
                                    opacity: saving ? 1 : showSaved ? 1 : 0,
                                    color: saving ? 'rgba(255,255,255,0.3)' : '#22c55e',
                                }}
                            >
                                {saving ? (
                                    <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
                                ) : showSaved ? (
                                    <>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        saved
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="flex flex-col flex-1 overflow-hidden" style={{ minHeight: '60px' }}>
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={e => setText(e.target.value)}
                                onBlur={handleSave}
                                onKeyDown={handleKeyDown}
                                placeholder={placeholder}
                                className="w-full h-full bg-transparent text-white text-[15px] outline-none resize-none placeholder-slate-600 leading-snug font-medium"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    caretColor: '#22C55E',
                                    overflowY: 'auto'
                                }}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto" style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}>
                            <p
                                className="leading-relaxed transition-colors whitespace-pre-wrap pb-2"
                                style={{
                                    color: text ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)',
                                    fontFamily: "'Inter', sans-serif",
                                    fontStyle: text ? 'normal' : 'italic',
                                    fontWeight: text ? 600 : 400,
                                    fontSize: text ? '15px' : '14px',
                                    minHeight: '32px',
                                }}
                            >
                                {text || placeholder}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 flex items-center">
                    {imageUrl ? (
                        <div
                            className="relative group/img"
                            style={{
                                width: '120px',
                                alignSelf: 'stretch',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: `1px solid rgba(255,255,255,0.1)`,
                                minHeight: '90px',
                            }}
                        >
                            <img
                                src={imageUrl}
                                alt={`${label} vision`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                            <div
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                style={{ background: 'rgba(0,0,0,0.6)' }}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onImageRemove();
                                    }}
                                    className="cursor-pointer p-1.5 rounded-lg transition-colors"
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        color: '#ef4444',
                                    }}
                                    aria-label="Remove image"
                                    title="Remove image"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                            className="cursor-pointer opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                            style={{
                                width: '100px',
                                alignSelf: 'stretch',
                                minHeight: '80px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px dashed rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.25)',
                            }}
                            aria-label="Upload image"
                            title="Add an image"
                        >
                            {uploading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white/50 rounded-full animate-spin" />
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                            )}
                        </button>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
        </div>
    );
};

const GoalsPanel: React.FC<GoalsPanelProps> = ({ goals, onSaveGoal, onSaveGoalImage }) => {
    const handleImageUpload = async (type: 'year' | 'month' | 'week', file: File) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${type}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('goal-images')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('goal-images')
                .getPublicUrl(filePath);

            await onSaveGoalImage(type, urlData.publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image.');
        }
    };

    const handleImageRemove = async (type: 'year' | 'month' | 'week') => {
        await onSaveGoalImage(type, null);
    };

    return (
        <div className="flex flex-col h-full pt-6 lg:pt-10 pb-8 sm:pb-12 px-4 sm:px-6 md:px-10 bg-transparent">
            <div className="mb-10">
                <h2 className="text-2xl font-extrabold text-white">Goals</h2>
            </div>

            <div className="space-y-4 mb-12">
                <GoalCard
                    type="year"
                    label="Year Goal"
                    sublabel="Your big-picture destination"
                    placeholder="What do you want to achieve this year?"
                    value={goals.year}
                    imageUrl={goals.yearImage}
                    onSave={(content) => onSaveGoal('year', content)}
                    onImageUpload={(file) => handleImageUpload('year', file)}
                    onImageRemove={() => handleImageRemove('year')}
                />

                <GoalCard
                    type="month"
                    label="This Month"
                    sublabel="Monthly milestone"
                    placeholder="What monthly goal drives the year goal forward?"
                    value={goals.month}
                    imageUrl={goals.monthImage}
                    onSave={(content) => onSaveGoal('month', content)}
                    onImageUpload={(file) => handleImageUpload('month', file)}
                    onImageRemove={() => handleImageRemove('month')}
                />

                <GoalCard
                    type="week"
                    label="This Week"
                    sublabel="Your weekly sprint"
                    placeholder="What's the one thing to focus on this week?"
                    value={goals.week}
                    imageUrl={goals.weekImage}
                    onSave={(content) => onSaveGoal('week', content)}
                    onImageUpload={(file) => handleImageUpload('week', file)}
                    onImageRemove={() => handleImageRemove('week')}
                />
            </div>
        </div>
    );
};

export default GoalsPanel;
