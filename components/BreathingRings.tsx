
import React from 'react';

interface BreathingRingsProps {
  color?: 'purple' | 'cyan';
}

const BreathingRings: React.FC<BreathingRingsProps> = ({ color = 'purple' }) => {
  const colorClass = color === 'cyan' ? 'border-cyan-500' : 'border-white';
  const glowClass = color === 'cyan' ? 'bg-cyan-600/10' : 'bg-purple-600/10';

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Outer Ring */}
      <div className={`absolute w-[600px] h-[600px] border rounded-full animate-breathe-more-delayed transition-colors duration-1000 ${color === 'cyan' ? 'border-cyan-500/10' : 'border-white/10'}`} />
      {/* Middle Ring */}
      <div className={`absolute w-[450px] h-[450px] border rounded-full animate-breathe-delayed transition-colors duration-1000 ${color === 'cyan' ? 'border-cyan-500/20' : 'border-white/20'}`} />
      {/* Inner Ring */}
      <div className={`absolute w-[300px] h-[300px] border rounded-full animate-breathe transition-colors duration-1000 ${color === 'cyan' ? 'border-cyan-500/30' : 'border-white/30'}`} />
      
      {/* Background Glow */}
      <div className={`absolute w-[400px] h-[400px] blur-[100px] rounded-full transition-colors duration-1000 ${glowClass}`} />
    </div>
  );
};

export default BreathingRings;
