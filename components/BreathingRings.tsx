
import React from 'react';

interface BreathingRingsProps {
  color?: 'purple' | 'cyan';
}

const BreathingRings: React.FC<BreathingRingsProps> = ({ color = 'purple' }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Base Inner Ring */}
      <div className="absolute w-[320px] h-[320px] rounded-full border-2 border-[#22C55E]/20" />

      {/* Breathing Rings */}
      <div className="absolute w-[320px] h-[320px] rounded-full border border-[#22C55E] animate-breathe" />
      <div className="absolute w-[420px] h-[420px] rounded-full border border-[#22C55E] animate-breathe-delayed" />

      {/* Background Glow - Ambient green halo */}
      <div className="absolute w-[500px] h-[500px] blur-[180px] rounded-full bg-[#22C55E]/[0.07]" />
    </div>
  );
};

export default BreathingRings;
