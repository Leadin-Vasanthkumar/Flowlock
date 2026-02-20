
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import Orb from './Orb';

const SignUpPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [done, setDone] = useState(false);
    const navigate = useNavigate();

    const handleGoogleSignUp = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: { access_type: 'offline', prompt: 'consent' },
                },
            });
            if (error) throw error;
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Google sign-up failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: window.location.origin },
            });
            if (error) throw error;
            setDone(true);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Sign-up failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0d0814] text-slate-100 flex flex-col overflow-hidden">

            {/* ── Orb background ── */}
            <div className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.85 }}>
                <Orb hue={260} hoverIntensity={0.3} rotateOnHover backgroundColor="#0d0814" />
            </div>

            {/* ── Minimal nav ── */}
            <nav className="fixed top-0 left-0 right-0 px-8 py-6 flex justify-between items-center z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#7f19e6] rounded-lg flex items-center justify-center shadow-lg shadow-[#7f19e6]/30">
                        <svg className="w-5 h-5" fill="white" viewBox="0 0 48 48">
                            <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight">Flowlock</span>
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <span className="text-slate-400 text-sm">Already have an account?</span>
                    <button
                        onClick={() => navigate('/login')}
                        className="text-white font-semibold text-sm hover:text-[#7f19e6] transition-colors underline underline-offset-4"
                    >
                        Log in
                    </button>
                </div>
            </nav>

            {/* ── Main card ── */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-8 pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(40px)',
                        WebkitBackdropFilter: 'blur(40px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.8)',
                    }}
                >
                    {/* ─── Form panel (full width, centered) ─── */}
                    <div className="w-full p-8 md:p-12 bg-white/5 backdrop-blur-md">
                        <div className="max-w-md mx-auto h-full flex flex-col justify-center">

                            {done ? (
                                <div className="text-center py-6 flex flex-col items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                        style={{
                                            background: 'rgba(127,25,230,0.15)',
                                            border: '1px solid rgba(127,25,230,0.3)',
                                        }}>
                                        <svg className="w-7 h-7 text-[#a78bfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold text-white">Check your inbox</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            We sent a confirmation link to
                                        </p>
                                        <p className="text-sm text-slate-200 font-medium">{email}</p>
                                    </div>

                                    <div className="w-full border-t border-white/[0.06]" />

                                    <button
                                        onClick={() => navigate('/login')}
                                        className="text-sm text-slate-400 hover:text-white transition-colors"
                                    >
                                        Back to login
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8">
                                        <h2 className="text-slate-100 text-2xl font-bold mb-1">Create your account</h2>
                                        <p className="text-slate-500 text-sm">Start your journey into deep focus.</p>
                                    </div>

                                    {/* Google button — large */}
                                    <button
                                        onClick={handleGoogleSignUp}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-3 py-4 rounded-3xl font-semibold text-base text-white mb-8 transition-all duration-200 disabled:opacity-50 hover:-translate-y-0.5"
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backdropFilter: 'blur(8px)',
                                        }}
                                    >
                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Continue with Google
                                    </button>

                                    {/* Divider */}
                                    <div className="relative flex items-center mb-8">
                                        <div className="flex-grow border-t border-white/10" />
                                        <span className="mx-4 text-slate-600 text-[10px] uppercase tracking-widest font-bold">Or sign up with email</span>
                                        <div className="flex-grow border-t border-white/10" />
                                    </div>

                                    {/* Email/password form */}
                                    <form onSubmit={handleEmailSignUp} className="space-y-5">
                                        <div>
                                            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="signup-email">Work Email</label>
                                            <input
                                                id="signup-email"
                                                type="email"
                                                placeholder="name@company.com"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                required
                                                className="w-full px-5 py-4 rounded-3xl text-white placeholder-slate-500 focus:outline-none transition-all"
                                                style={{
                                                    background: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    backdropFilter: 'blur(12px)',
                                                }}
                                                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(127,25,230,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                                                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="signup-password">Choose Password</label>
                                            <div className="relative">
                                                <input
                                                    id="signup-password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    required
                                                    minLength={6}
                                                    className="w-full px-5 py-4 rounded-3xl text-white placeholder-slate-500 focus:outline-none transition-all pr-14"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.04)',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        backdropFilter: 'blur(12px)',
                                                    }}
                                                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(127,25,230,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                                                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
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

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full text-white font-bold py-4 rounded-3xl shadow-lg text-base transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
                                                style={{
                                                    background: 'linear-gradient(135deg, #7f19e6 0%, #a855f7 100%)',
                                                    boxShadow: '0 8px 24px -4px rgba(127,25,230,0.35)',
                                                }}
                                            >
                                                {loading ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : 'Create Account'}
                                            </button>
                                        </div>
                                    </form>

                                    <p className="mt-6 text-center text-xs text-slate-600 leading-relaxed">
                                        By signing up, you agree to our{' '}
                                        <button className="text-slate-400 hover:underline">Terms of Service</button>{' '}and{' '}
                                        <button className="text-slate-400 hover:underline">Privacy Policy</button>.
                                        Your data is encrypted and secure.
                                    </p>
                                </>
                            )}

                            {/* Mobile login link */}
                            <div className="md:hidden mt-8 text-center">
                                <span className="text-slate-500 text-sm">Already have an account? </span>
                                <button onClick={() => navigate('/login')} className="text-white font-semibold text-sm hover:text-[#7f19e6] transition-colors underline underline-offset-4">Log in</button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default SignUpPage;
