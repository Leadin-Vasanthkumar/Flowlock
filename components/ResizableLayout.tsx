import React, { useState, useCallback, useEffect } from 'react';

interface ResizableLayoutProps {
    children: React.ReactNode;
    sidebarContent: React.ReactNode;
    mobileFAB: React.ReactNode;
    mobileOverlay: React.ReactNode;
}

const ResizableLayout: React.FC<ResizableLayoutProps> = ({ children, sidebarContent, mobileFAB, mobileOverlay }) => {
    const [sidebarWidth, setSidebarWidth] = useState(400); // initial width in pixels
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = useCallback(() => {
        setIsResizing(true);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    }, []);

    const resize = useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            const newWidth = window.innerWidth - mouseMoveEvent.clientX;
            // Min 250px, Max 50% of screen
            if (newWidth > 250 && newWidth < window.innerWidth * 0.5) {
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    return (
        <div className="flex h-full w-full overflow-hidden bg-[#0D0E0D]">
            {/* Main Content */}
            <div className="flex-1 overflow-hidden relative">
                {children}
            </div>

            {/* Resizer bar (desktop only) */}
            <div
                className="hidden lg:flex w-1 hover:w-1.5 bg-white/5 hover:bg-[#22C55E]/50 cursor-col-resize transition-all items-center justify-center z-50 group active:w-1.5 active:bg-[#22C55E]"
                onMouseDown={startResizing}
            >
                <div className="w-0.5 h-12 rounded-full bg-white/10 group-hover:bg-[#22C55E]/50 transition-colors" />
            </div>

            {/* Sidebar (desktop only) */}
            <div 
                className="hidden lg:block overflow-y-auto bg-white/[0.02]"
                style={{ width: `${sidebarWidth}px`, minWidth: '250px' }}
            >
                {sidebarContent}
            </div>

            {/* Mobile elements */}
            <div className="lg:hidden">
                {mobileFAB}
                {mobileOverlay}
            </div>
        </div>
    );
};

export default ResizableLayout;
