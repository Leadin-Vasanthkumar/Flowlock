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
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.12)',
                    padding: '0',
                    background: 'transparent',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: isOpen ? '0 0 0 3px rgba(127, 25, 230, 0.35)' : 'none',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(127, 25, 230, 0.6)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(127, 25, 230, 0.2)';
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
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
                            borderRadius: '50%',
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
                            background: 'linear-gradient(135deg, #7f19e6 0%, #a855f7 100%)',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: 700,
                            fontFamily: "'Inter', sans-serif",
                            borderRadius: '50%',
                        }}
                    >
                        {getInitials(userInfo.name || 'U')}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            <div
                role="menu"
                aria-label="Profile options"
                style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: '0',
                    minWidth: '220px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.95)',
                    pointerEvents: isOpen ? 'auto' : 'none',
                    transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'rgba(22, 14, 36, 0.85)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.04)',
                }}
            >
                {/* User Info Section */}
                <div
                    style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
                    }}
                >
                    {/* Small Avatar */}
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            flexShrink: 0,
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
                                    background: 'linear-gradient(135deg, #7f19e6 0%, #a855f7 100%)',
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: 700,
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
                                fontSize: '13px',
                                fontWeight: 600,
                                fontFamily: "'Inter', sans-serif",
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {userInfo.name}
                        </div>
                        <div
                            style={{
                                color: 'rgba(255, 255, 255, 0.4)',
                                fontSize: '11px',
                                fontFamily: "'Inter', sans-serif",
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginTop: '2px',
                            }}
                        >
                            {userInfo.email}
                        </div>
                    </div>
                </div>

                {/* Sign Out Button */}
                <div style={{ padding: '6px' }}>
                    <button
                        role="menuitem"
                        onClick={handleSignOut}
                        className="cursor-pointer"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'transparent',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '13px',
                            fontWeight: 500,
                            fontFamily: "'Inter', sans-serif",
                            transition: 'all 0.15s ease',
                            textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                            e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                        }}
                    >
                        {/* Sign Out Icon */}
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfileMenu;
