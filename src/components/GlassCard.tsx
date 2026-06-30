import React, { useState, useRef } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  enableTilt?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  style = {},
  enableTilt = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Relative position inside the card (from -0.5 to 0.5)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Max rotation is 12 degrees
    const maxRotate = 12;
    setTilt({
      x: -y * maxRotate, // Up/down mouse tilts X axis
      y: x * maxRotate,  // Left/right mouse tilts Y axis
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current || e.touches.length === 0) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const touch = e.touches[0];
    
    const x = (touch.clientX - rect.left) / rect.width - 0.5;
    const y = (touch.clientY - rect.top) / rect.height - 0.5;
    
    // Check if touch is within bounds
    if (x >= -0.5 && x <= 0.5 && y >= -0.5 && y <= 0.5) {
      const maxRotate = 15; // Slightly higher tilt for touch
      setTilt({
        x: -y * maxRotate,
        y: x * maxRotate,
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 }); // Spring reset
  };

  const cardStyle: React.CSSProperties = {
    ...style,
    transform: enableTilt && isHovered
      ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: isHovered 
      ? 'transform 0.05s linear, border-color 0.3s ease, box-shadow 0.3s ease'
      : 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.3s ease, box-shadow 0.3s ease',
  };

  return (
    <div
      ref={cardRef}
      className={`glass-panel shimmer-bg ${className}`}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
    >
      <div className="tilt-card-inner" style={{ transformStyle: 'preserve-3d', height: '100%', width: '100%' }}>
        {children}
      </div>
    </div>
  );
};
