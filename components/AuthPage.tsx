
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import Orb from './Orb';

const AuthPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert('An unexpected error occurred during Google login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLinkLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });
            if (error) throw error;
            setIsSent(true);
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert('An unexpected error occurred during email login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0d0814] text-slate-100 flex flex-col font-display overflow-hidden">
            {/* ── Orb background ── */}
            <div className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.85 }}>
                <Orb hue={260} hoverIntensity={0.3} rotateOnHover backgroundColor="#0d0814" />
            </div>

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
                        <div className="w-12 h-12 bg-[#7f19e6] rounded-xl flex items-center justify-center shadow-lg shadow-[#7f19e6]/20 mb-4">
                            <svg className="w-7 h-7" fill="white" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Welcome back</h1>
                        <p className="text-slate-400 text-sm">Elevate your workflow with Deep Flow</p>
                    </div>

                    {isSent ? (
                        <div className="text-center py-6 flex flex-col items-center gap-5">
                            {/* Icon — no emoji */}
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
                                    We sent a sign in link to
                                </p>
                                <p className="text-sm text-slate-200 font-medium">{email}</p>
                            </div>

                            <div className="w-full border-t border-white/[0.06]" />

                            <button
                                onClick={() => setIsSent(false)}
                                className="text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Use a different email
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Social Logins */}
                            <div className="grid gap-3 mb-8 grid-cols-1">
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="social-btn flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-white disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                                    </svg>
                                    Google
                                </button>
                            </div>

                            <div className="relative flex items-center justify-center mb-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <span className="relative bg-[#1a1122] px-4 text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em]">or email login</span>
                            </div>

                            {/* Login Form */}
                            <form onSubmit={handleMagicLinkLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="email">Email Address</label>
                                    <input
                                        className="w-full h-14 rounded-2xl glass-input px-5 text-white placeholder:text-slate-600 focus:ring-0 focus:outline-none transition-all"
                                        id="email"
                                        placeholder="name@company.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    className="w-full h-14 rounded-2xl btn-primary-gradient text-white font-bold text-base shadow-lg shadow-[#7f19e6]/20 mt-2 disabled:opacity-50 flex items-center justify-center"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-400">
                            Don't have an account?
                            <button onClick={() => navigate('/signup')} className="text-white font-semibold hover:text-[#7f19e6] transition-colors ml-1">Sign Up</button>
                        </p>
                    </div>
                </motion.div>

                {/* Footer Links */}
                <footer className="mt-8 flex gap-6 text-xs text-slate-500 font-medium">
                    <button className="hover:text-slate-300 transition-colors">Privacy Policy</button>
                    <button className="hover:text-slate-300 transition-colors">Terms of Service</button>
                    <button className="hover:text-slate-300 transition-colors">Help Center</button>
                </footer>
            </main>

            {/* Visual Accents */}
            <div className="fixed top-20 right-20 w-32 h-32 opacity-20 hidden lg:block">
                <div className="absolute inset-0 glass-card rounded-3xl rotate-12 border-[#7f19e6]/20"></div>
            </div>
            <div className="fixed bottom-20 left-20 w-24 h-24 opacity-10 hidden lg:block">
                <div className="absolute inset-0 glass-card rounded-2xl -rotate-6 border-[#7f19e6]/20"></div>
            </div>
        </div>
    );
};

export default AuthPage;
