import React from 'react';

export interface TargetTorusProps {
  progress: number; // 0 to 1
  color?: string;
}

export const TargetTorus: React.FC<TargetTorusProps> = ({ progress, color = '#00f2fe' }) => {
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const strokeDashoffset = circumference * (1 - clampedProgress);
  const percentage = Math.round(clampedProgress * 100);

  // Trigonometric coordinates to find the exact tip of the progress arc
  // Starts at top center (-90 degrees, i.e., -Math.PI / 2)
  const angle = clampedProgress * 2 * Math.PI - Math.PI / 2;
  const tipX = 80 + radius * Math.cos(angle);
  const tipY = 80 + radius * Math.sin(angle);

  return (
    <div className="relative flex justify-center items-center select-none" style={{ width: '170px', height: '170px' }}>
      {/* 3D background shadow ring */}
      <div 
        className="absolute rounded-full" 
        style={{
          width: '138px',
          height: '138px',
          boxShadow: 'inset 0 0 15px rgba(0,0,0,0.9), 0 10px 25px rgba(0,0,0,0.7)',
          border: '1px solid rgba(255, 255, 255, 0.02)',
          zIndex: 0
        }}
      />
      
      <svg 
        width={170} 
        height={170} 
        viewBox="0 0 170 170"
        className="relative z-10 overflow-visible"
      >
        <defs>
          <linearGradient id="torusGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer dotted tracking orbit */}
        <circle
          cx="85"
          cy="85"
          r={radius + 12}
          fill="none"
          stroke="rgba(255, 255, 255, 0.02)"
          strokeWidth={1}
          strokeDasharray="4 6"
          className="animate-spin-cw"
          style={{ transformOrigin: '85px 85px' }}
        />

        {/* Background Track Circle */}
        <circle
          cx="85"
          cy="85"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth={strokeWidth}
        />
        
        {/* Foreground Progress Circle */}
        <circle
          cx="85"
          cy="85"
          r={radius}
          fill="none"
          stroke="url(#torusGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 85 85)"
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
            filter: 'drop-shadow(0 0 4px rgba(0, 242, 254, 0.25))',
          }}
        />

        {/* Dynamic glowing tip dot positioned via trig */}
        {clampedProgress > 0 && (
          <g style={{ transition: 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)' }}>
            <circle
              cx={tipX + 5} // offset correction for viewBox center (85 instead of 80)
              cy={tipY + 5}
              r={7}
              fill={color}
              opacity={0.3}
              filter="url(#glow)"
            />
            <circle
              cx={tipX + 5}
              cy={tipY + 5}
              r={3}
              fill="#ffffff"
              style={{ filter: 'drop-shadow(0 0 2px #fff)' }}
            />
          </g>
        )}
      </svg>
      
      {/* Center Percentage Display */}
      <div className="absolute flex flex-col justify-center items-center z-20">
        <span className="text-3xl font-black text-white tracking-tighter font-outfit select-none">
          {percentage}%
        </span>
        <span className="text-[7px] font-extrabold text-zinc-500 tracking-widest uppercase select-none mt-0.5">
          Funded
        </span>
      </div>
    </div>
  );
};
