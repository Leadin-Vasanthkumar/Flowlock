import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface UserInfo {
    name: string;
    email: string;
    avatarUrl: string | null;
}

const UserProfileMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo>({
        name: '',
        email: '',
        avatarUrl: null,
    });
    const menuRef = useRef<HTMLDivElement>(null);

    // Fetch user info on mount
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserInfo({
                    name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
                    email: user.email || '',
                    avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                });
            }
        };
        fetchUser();
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKey);
        }
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    // Get initials for fallback avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(w => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div ref={menuRef} className="relative" style={{ zIndex: 50 }}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                aria-label="User profile menu"
                aria-expanded={isOpen}
                aria-haspopup="true"
                className="cursor-pointer focus:outline-none"
                style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '0',
                    background: 'rgba(255, 255, 255, 0.03)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: isOpen ? '0 0 0 3px rgba(34, 197, 94, 0.2), 0 8px 16px -4px rgba(0, 0, 0, 0.4)' : 'none',
                    transform: isOpen ? 'scale(0.95)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.4)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.boxShadow = 'none';
                    }
                }}
            >
                {userInfo.avatarUrl ? (
                    <img
                        src={userInfo.avatarUrl}
                        alt={`${userInfo.name}'s profile`}
                        referrerPolicy="no-referrer"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <span
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
                            color: '#000',
                            fontSize: '15px',
                            fontWeight: 800,
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {getInitials(userInfo.name || 'U')}
                    </span>
                )}
            </button>

            {/* Glassmorphic Dropdown Menu */}
            <div
                role="menu"
                aria-label="Profile options"
                style={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    right: '0',
                    minWidth: '240px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.95)',
                    pointerEvents: isOpen ? 'auto' : 'none',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    background: 'rgba(13, 14, 13, 0.7)',
                    backdropFilter: 'blur(32px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(32px) saturate(200%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: `
                        0 24px 48px -12px rgba(0, 0, 0, 0.6), 
                        inset 0 0 0 1px rgba(255, 255, 255, 0.02),
                        0 0 40px -10px rgba(34, 197, 94, 0.1)
                    `,
                }}
            >
                {/* User Info Section */}
                <div
                    style={{
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.05) 0%, transparent 100%)',
                    }}
                >
                    {/* Small Avatar - matching folder card head header look */}
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        }}
                    >
                        {userInfo.avatarUrl ? (
                            <img
                                src={userInfo.avatarUrl}
                                alt=""
                                referrerPolicy="no-referrer"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'linear-gradient(135deg, #166534 0%, #22c55e 100%)',
                                    color: '#000',
                                    fontSize: '14px',
                                    fontWeight: 800,
                                }}
                            >
                                {getInitials(userInfo.name || 'U')}
                            </div>
                        )}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div
                            style={{
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: 700,
                                fontFamily: "'Inter', sans-serif",
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {userInfo.name}
                        </div>
                        <div
                            style={{
                                color: 'rgba(255, 255, 255, 0.45)',
                                fontSize: '12px',
                                fontWeight: 400,
                                fontFamily: "'Inter', sans-serif",
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginTop: '1px',
                            }}
                        >
                            {userInfo.email}
                        </div>
                    </div>
                </div>

                {/* Menu Items Section */}
                <div style={{ padding: '8px' }}>
                    <button
                        role="menuitem"
                        onClick={handleSignOut}
                        className="cursor-pointer group"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            borderRadius: '14px',
                            border: 'none',
                            background: 'transparent',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '14px',
                            fontWeight: 600,
                            fontFamily: "'Inter', sans-serif",
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            textAlign: 'left',
                            gap: '12px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
                            e.currentTarget.style.color = '#22c55e';
                            e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Sign Out Icon */}
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span>Sign out</span>
                        </div>
                        
                        <svg 
                            className="opacity-0 group-hover:opacity-100 transition-opacity" 
                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>
                
                {/* Subtle Brand Footer */}
                <div style={{ 
                    padding: '12px 20px', 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    display: 'flex', 
                    justifyContent: 'center' 
                }}>
                    <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 800, 
                        color: 'rgba(34, 197, 94, 0.3)', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.1em' 
                    }}>
                        Flowlock Beta
                    </span>
                </div>
            </div>
        </div>
    );
};

export default UserProfileMenu;
