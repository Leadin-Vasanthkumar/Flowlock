import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Extend Window to include YT API types
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: (() => void) | undefined;
    }
}

interface NSDRAnimationProps {
    seconds: number;
    onSkip: () => void;
}

const NSDRAnimation: React.FC<NSDRAnimationProps> = ({ seconds, onSkip }) => {
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const onSkipRef = useRef(onSkip);
    const [hasStarted, setHasStarted] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    // Keep onSkip ref up to date so the YT callback always calls the latest version
    useEffect(() => {
        onSkipRef.current = onSkip;
    }, [onSkip]);

    const handlePlayClick = () => {
        if (playerRef.current && playerRef.current.playVideo && isPlayerReady) {
            playerRef.current.playVideo();
            setHasStarted(true);
        }
    };

    const initPlayer = useCallback(() => {
        if (!playerContainerRef.current || playerRef.current) return;

        playerRef.current = new window.YT.Player(playerContainerRef.current, {
            videoId: 'KHIbgSN2qAU',
            playerVars: {
                rel: 0,
                modestbranding: 1,
            },
            events: {
                onReady: () => setIsPlayerReady(true),
                onStateChange: (event: any) => {
                    // YT.PlayerState.ENDED === 0
                    if (event.data === 0) {
                        onSkipRef.current();
                    }
                    // YT.PlayerState.PLAYING === 1
                    if (event.data === 1) {
                        setHasStarted(true);
                    }
                },
            },
        });
    }, []);

    useEffect(() => {
        // If YT API is already loaded, init immediately
        if (window.YT && window.YT.Player) {
            initPlayer();
            return;
        }

        // Otherwise load the API script
        const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
        if (!existingScript) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
        }

        // YouTube API calls this global function when ready
        window.onYouTubeIframeAPIReady = () => {
            initPlayer();
        };

        return () => {
            // Cleanup: destroy the player on unmount
            if (playerRef.current && playerRef.current.destroy) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [initPlayer]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl mx-auto gap-6 my-auto"
        >
            {/* Ambient background glow */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[160px] animate-pulse"
                    style={{ background: 'rgba(34,197,94,0.1)', animationDuration: '8s' }} />
                <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full blur-[140px] animate-pulse"
                    style={{ background: 'rgba(34,197,94,0.07)', animationDuration: '10s', animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px]"
                    style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)' }} />
            </div>

            {/* Label badge */}
            <div className="relative z-10 flex items-center gap-3 px-6 py-3 rounded-full"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
                <svg className="w-5 h-5 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
                <span className="text-sm font-semibold text-[#22c55e] uppercase tracking-wider">Non-Sleep Deep Rest</span>
            </div>

            {/* YouTube Video Embed via IFrame Player API */}
            <div className="relative z-10 w-full mt-2">
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-[#0a0a0a]"
                    style={{
                        aspectRatio: '16 / 9',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 16px 64px rgba(0,0,0,0.5), 0 0 80px rgba(34,197,94,0.08)',
                    }}
                >
                    <div ref={playerContainerRef} className="absolute inset-0 w-full h-full" />

                    <AnimatePresence>
                        {!hasStarted && (
                            <motion.div 
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0d0d0d]"
                            >
                                <button
                                    onClick={handlePlayClick}
                                    disabled={!isPlayerReady}
                                    className={`relative group flex items-center justify-center w-16 h-16 rounded-full bg-[#22c55e] transition-all duration-300 ${isPlayerReady ? 'hover:bg-[#16a34a] hover:scale-105 cursor-pointer shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.5)]' : 'opacity-40 cursor-wait'}`}
                                >
                                    <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'scale(1.08)' }}>
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </button>
                                {!isPlayerReady && (
                                    <span className="absolute mt-36 text-[10px] text-white/30 tracking-widest uppercase">Loading player</span>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Skip button */}
            <button
                onClick={onSkip}
                className="relative z-10 mt-4 text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer uppercase tracking-widest"
            >
                Skip break
            </button>
        </motion.div>
    );
};

export default NSDRAnimation;
