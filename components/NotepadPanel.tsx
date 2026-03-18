import React, { useState, useEffect, useRef } from 'react';

interface NotepadPanelProps {
    folderId: string;
    folderName: string;
}

const NotepadPanel: React.FC<NotepadPanelProps> = ({ folderId, folderName }) => {
    const [text, setText] = useState('');
    const [saving, setSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFirstLoadRef = useRef(true);

    // Initial load
    useEffect(() => {
        isFirstLoadRef.current = true;
        const savedNotes = localStorage.getItem(`flowlock_notes_${folderId}`);
        if (savedNotes) {
            setText(savedNotes);
        } else {
            setText('');
        }
        
        // Wait a tick before allowing auto-save to trigger from the setText above
        setTimeout(() => {
            isFirstLoadRef.current = false;
        }, 100);
    }, [folderId]);

    // Auto-save logic
    useEffect(() => {
        if (isFirstLoadRef.current) return;

        setSaving(true);
        const timer = setTimeout(() => {
            localStorage.setItem(`flowlock_notes_${folderId}`, text);
            setSaving(false);
            setShowSaved(true);
            
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(() => setShowSaved(false), 1500);
        }, 700);

        return () => clearTimeout(timer);
    }, [text, folderId]);

    return (
        <div className="flex flex-col h-full pt-6 lg:pt-10 pb-8 sm:pb-12 px-4 sm:px-6 md:px-10 bg-transparent overflow-hidden">
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-extrabold text-white truncate max-w-[200px] sm:max-w-full" title={`${folderName} Notes`}>
                        {folderName} Notes
                    </h2>
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">Brain dump</p>
                </div>
                <div
                    className="flex items-center gap-1.5 text-[10px] transition-opacity font-bold tracking-widest uppercase"
                    style={{
                        opacity: saving ? 1 : showSaved ? 1 : 0,
                        color: saving ? 'rgba(255,255,255,0.3)' : '#22c55e',
                    }}
                >
                    {saving ? (
                        <>
                            <div className="w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                            Saving
                        </>
                    ) : showSaved ? (
                        <>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Saved
                        </>
                    ) : null}
                </div>
            </div>

            <div className="flex-1 bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl border border-white/5 flex flex-col p-1 transition-all focus-within:border-white/15 focus-within:bg-white/[0.08] focus-within:hover:bg-white/[0.08] overflow-hidden">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`Start your brain dump...`}
                    className="flex-1 w-full bg-transparent text-white text-[15px] p-5 outline-none resize-none leading-relaxed placeholder-slate-600"
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        caretColor: '#22C55E'
                    }}
                />
            </div>
        </div>
    );
};

export default NotepadPanel;
