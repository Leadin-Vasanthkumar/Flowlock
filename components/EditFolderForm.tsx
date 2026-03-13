import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimeBlock } from '../types';

interface EditFolderFormProps {
    folder: {
        id: string;
        name: string;
        timeBlocks?: TimeBlock[];
    };
    onSave: (data: { name: string; timeBlocks: TimeBlock[] }) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
}

const EditFolderForm: React.FC<EditFolderFormProps> = ({ folder, onSave, onCancel, loading }) => {
    const [name, setName] = useState(folder.name);
    const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(
        folder.timeBlocks && folder.timeBlocks.length > 0 ? folder.timeBlocks : [{ startTime: '', endTime: '' }]
    );

    const handleAddTimeBlock = () => {
        setTimeBlocks([...timeBlocks, { startTime: '', endTime: '' }]);
    };

    const handleRemoveTimeBlock = (index: number) => {
        const newBlocks = timeBlocks.filter((_, i) => i !== index);
        setTimeBlocks(newBlocks.length > 0 ? newBlocks : [{ startTime: '', endTime: '' }]);
    };

    const handleTimeChange = (index: number, field: keyof TimeBlock, value: string) => {
        const newBlocks = [...timeBlocks];
        newBlocks[index] = { ...newBlocks[index], [field]: value };
        setTimeBlocks(newBlocks);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        
        // Filter out incomplete blocks
        const validBlocks = timeBlocks.filter(b => b.startTime && b.endTime);
        
        await onSave({ 
            name: name.trim(), 
            timeBlocks: validBlocks
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 relative">
            {/* Folder Name Section */}
            <div className="space-y-2">
                <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">
                    Folder Name
                </label>
                <div className="relative group">
                    <input
                        autoFocus
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Deep Work"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 outline-none focus:border-[#22C55E]/50 focus:bg-white/[0.05] transition-all duration-300 text-lg font-medium"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-[#22C55E]/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none blur-xl" />
                </div>
            </div>

            {/* Time Blocks Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">
                        Work Blocks
                    </label>
                    <motion.button 
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddTimeBlock}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] font-black uppercase tracking-widest hover:bg-[#22C55E]/20 transition-all cursor-pointer"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Block
                    </motion.button>
                </div>

                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
                    <AnimatePresence initial={false}>
                        {timeBlocks.map((block, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, x: -20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, x: 20, height: 0 }}
                                transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
                                className="group relative"
                            >
                                <div className="grid grid-cols-2 gap-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-1">Start Time</label>
                                        <input
                                            type="time"
                                            value={block.startTime}
                                            onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                                            className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#22C55E]/30 transition-all [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-1">End Time</label>
                                        <div className="flex gap-3">
                                            <input
                                                type="time"
                                                value={block.endTime}
                                                onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                                                className="w-full bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#22C55E]/30 transition-all [color-scheme:dark]"
                                            />
                                            {timeBlocks.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTimeBlock(index)}
                                                    className="flex-shrink-0 p-2.5 rounded-xl border border-white/5 text-white/20 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all duration-300 cursor-pointer"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || !name.trim()}
                    className="flex-[2] bg-[#22C55E] text-[#0D0E0D] rounded-2xl py-4 font-black uppercase tracking-widest text-xs hover:bg-[#22C55E]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-[#0D0E0D]/30 border-t-[#0D0E0D] rounded-full animate-spin" />
                            <span>Updating...</span>
                        </div>
                    ) : (
                        "Keep Changes"
                    )}
                </motion.button>
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCancel}
                    className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:border-white/20 transition-all cursor-pointer"
                >
                    Discard
                </motion.button>
            </div>
        </form>
    );
};

export default EditFolderForm;
