import React, { useState } from 'react';
import { GlassCard } from './GlassCard';

export interface QuantumChartProps {
  data: Array<{ day: string; amount: number; frequency: number; surcharge: number }>;
}

export const QuantumChart: React.FC<QuantumChartProps> = ({ data }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  
  const paddingX = 25;
  const paddingY = 30;
  const viewWidth = 400;
  const viewHeight = 180;

  const maxAmount = Math.max(...data.map(d => d.amount), 1);
  
  // Coordinates mapping
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * (viewWidth - paddingX * 2);
    const y = viewHeight - paddingY - (d.amount / maxAmount) * (viewHeight - paddingY * 2);
    return { x, y, amount: d.amount, day: d.day, frequency: d.frequency };
  });

  // Construct SVG Bezier spline path
  let pathStr = "";
  let areaPathStr = "";

  if (points.length > 0) {
    pathStr = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i+1];
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      pathStr += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    
    areaPathStr = `${pathStr} L ${points[points.length-1].x} ${viewHeight - paddingY} L ${points[0].x} ${viewHeight - paddingY} Z`;
  }

  const activePoint = activeIdx !== null ? points[activeIdx] : null;

  return (
    <GlassCard className="p-4 mb-4" enableTilt={false}>
      <div className="flex justify-between items-center mb-4 select-none">
        <div>
          <span className="text-[8px] font-bold text-zinc-500 tracking-widest block uppercase font-outfit">Quantum Outflow Ledger</span>
          {activePoint ? (
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm font-extrabold text-white font-outfit uppercase">
                {activePoint.day}
              </span>
              <span className="text-xs font-bold text-teal-400 font-outfit">
                ₹{activePoint.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm font-extrabold text-white font-outfit">
                PEAK FLOW
              </span>
              <span className="text-xs font-bold text-zinc-400 font-outfit">
                ₹{Math.max(...data.map(d => d.amount)).toLocaleString()}
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          <span className="text-[7px] font-extrabold text-zinc-500 tracking-wider block uppercase">DENSITY INDEX</span>
          <span className="text-[10px] font-black text-indigo-400 font-outfit">
            {activePoint ? `${activePoint.frequency} Transactions` : 'Active Feed'}
          </span>
        </div>
      </div>

      {/* Responsive interactive chart workspace */}
      <div className="relative w-full flex items-center justify-center overflow-visible">
        <svg 
          viewBox={`0 0 ${viewWidth} ${viewHeight}`} 
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Split Glow gradient */}
            <linearGradient id="chartGlowArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.0" />
            </linearGradient>
            {/* Guide line gradient */}
            <linearGradient id="guideGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0, 242, 254, 0.4)" />
              <stop offset="100%" stopColor="rgba(0, 242, 254, 0.02)" />
            </linearGradient>
          </defs>

          {/* Grid Baseline */}
          <line 
            x1={paddingX} 
            y1={viewHeight - paddingY} 
            x2={viewWidth - paddingX} 
            y2={viewHeight - paddingY} 
            stroke="rgba(255, 255, 255, 0.04)" 
            strokeWidth={1.5} 
          />

          {/* Guide grid line */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={paddingY - 10}
              x2={activePoint.x}
              y2={viewHeight - paddingY}
              stroke="url(#guideGlow)"
              strokeWidth={1.5}
            />
          )}

          {/* Area spline fill */}
          {areaPathStr && (
            <path 
              d={areaPathStr} 
              fill="url(#chartGlowArea)" 
              className="transition-all duration-300"
            />
          )}

          {/* Spline Curve stroke */}
          {pathStr && (
            <path 
              d={pathStr} 
              fill="none" 
              stroke="#00f2fe" 
              strokeWidth={2.5} 
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{ filter: 'drop-shadow(0 3px 6px rgba(0, 242, 254, 0.35))' }}
            />
          )}

          {/* Node intersections */}
          {points.map((p, idx) => {
            const isActive = activeIdx === idx;
            return (
              <g key={idx}>
                {/* Large touch targets */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={18}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseLeave={() => setActiveIdx(null)}
                  onTouchStart={() => setActiveIdx(idx)}
                />
                
                {/* Outer pulsing ring on active */}
                {isActive && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={9}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={1.2}
                    opacity={0.6}
                    className="pointer-events-none animate-ping"
                  />
                )}

                {/* Main node dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 5 : 3}
                  fill={isActive ? "#ffffff" : "#00f2fe"}
                  className="transition-all duration-200 pointer-events-none"
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 5px #ffffff)' : 'drop-shadow(0 0 3px rgba(0, 242, 254, 0.55))'
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Horizontal grid days */}
      <div className="flex justify-between mt-2 px-1 select-none">
        {data.map((d, index) => (
          <span 
            key={index} 
            className={`text-[8px] font-black tracking-widest w-8 text-center transition-colors duration-300 uppercase font-outfit ${
              activeIdx === index ? 'text-teal-400' : 'text-zinc-500'
            }`}
          >
            {d.day.substring(0, 3)}
          </span>
        ))}
      </div>
    </GlassCard>
  );
};
