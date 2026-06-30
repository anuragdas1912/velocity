import React from 'react';

export const AmbientBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden select-none pointer-events-none"
      style={{ 
        backgroundColor: '#020205',
        zIndex: -1 
      }}
    >
      {/* Deep Royal Purple Glow (Increased opacity for rich visual feedback) */}
      <div 
        className="absolute rounded-full filter blur-[120px]"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.22) 0%, rgba(0, 0, 0, 0) 70%)',
          left: '-20%',
          top: '-15%',
          animation: 'ambient-pulse 15s ease-in-out infinite',
        }}
      />

      {/* Deep Emerald Forest Glow */}
      <div 
        className="absolute rounded-full filter blur-[120px]"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(0, 0, 0, 0) 75%)',
          right: '-20%',
          bottom: '-10%',
          animation: 'ambient-pulse 20s ease-in-out infinite alternate',
        }}
      />

      {/* Third Violet Glow blob for center-right depth */}
      <div 
        className="absolute rounded-full filter blur-[100px]"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
          right: '10%',
          top: '25%',
          animation: 'ambient-pulse 12s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* Floating 4D Bubble Particles - slowly drifting upwards and fading */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="bubble bubble-1" />
        <div className="bubble bubble-2" />
        <div className="bubble bubble-3" />
        <div className="bubble bubble-4" />
        <div className="bubble bubble-5" />
      </div>

      {/* Grid Lines Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />
    </div>
  );
};
