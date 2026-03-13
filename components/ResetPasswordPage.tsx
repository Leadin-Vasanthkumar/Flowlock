import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';


const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    // If there's no session, they probably aren't coming from a reset link
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // Not authenticated yet, they shouldn't be here
                // Note: The reset link automatically logs them in with a recovery session
                navigate('/login');
            }
        });
    }, [navigate]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);

            // Redirect to app after a short delay so they see the success message
            setTimeout(() => {
                navigate('/app');
            }, 2000);

        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0D0E0D] text-slate-100 flex flex-col font-display overflow-hidden">
            {/* ── Background Glow ── */}
            <div className="fixed inset-0 z-0 radial-glow pointer-events-none opacity-50" />


            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 md:p-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-[440px] glass-card rounded-3xl p-8 md:p-10 shadow-2xl"
                >
                    {/* Logo & Header */}
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-12 h-12 rounded-xl border border-white/10 mb-4 overflow-hidden shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                            <img src="/logo.flowlock.png" alt="Flowlock Logo" className="w-full h-full object-cover" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Set new password</h1>

                        <p className="text-slate-400 text-sm">Create a new password for your account</p>
                    </div>

                    {success ? (
                        <div className="text-center py-6 flex flex-col items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: 'rgba(34,197,94,0.15)',
                                    border: '1px solid rgba(34,197,94,0.3)',
                                }}>
                                <svg className="w-7 h-7 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>

                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-white">Password updated!</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Taking you to your dashboard...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="new-password">New Password</label>
                                <div className="relative">
                                    <input
                                        className="w-full h-14 rounded-2xl glass-input px-5 text-white placeholder:text-slate-600 focus:ring-0 focus:outline-none transition-all pr-14"
                                        id="new-password"
                                        placeholder="••••••••"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(p => !p)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="confirm-password">Confirm Password</label>
                                <input
                                    className="w-full h-14 rounded-2xl glass-input px-5 text-white placeholder:text-slate-600 focus:ring-0 focus:outline-none transition-all"
                                    id="confirm-password"
                                    placeholder="••••••••"
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                className="w-full h-14 rounded-2xl btn-primary-gradient text-white font-bold text-base shadow-lg shadow-[#22C55E]/20 mt-4 disabled:opacity-50 flex items-center justify-center cursor-pointer"

                                type="submit"
                                disabled={loading || !password || !confirmPassword}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    'Update Password'
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default ResetPasswordPage;
