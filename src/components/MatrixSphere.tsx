import React, { useEffect, useRef, useState } from 'react';

export interface MatrixSphereProps {
  proximityToTarget?: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  color: string;
}

export const MatrixSphere: React.FC<MatrixSphereProps> = ({
  proximityToTarget = 0.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Inertia and Rotation States (iOS Physics simulation)
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const spinVelocity = useRef({ x: 0.012, y: 0.008 }); // Spin velocity vector
  const lastTouchTime = useRef(0);
  const lastTouchPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = 240);
    let height = (canvas.height = 240);

    const particleCount = 180; // High-density premium node cloud
    const particles: Particle[] = [];
    const radius = 70;

    // Generate coordinates uniformly distributed on a 3D sphere shell
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.acos(Math.random() * 2 - 1);
      const phi = Math.random() * Math.PI * 2;

      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      // Neon cyan and emerald hues
      const isRedAlert = proximityToTarget > 0.85;
      const alpha = 0.35 + Math.random() * 0.5;
      const color = isRedAlert
        ? `rgba(255, 56, 92, ${alpha})` // Red alert glow
        : `rgba(0, 242, 254, ${alpha})`; // Luxury cyan glow

      particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        color,
      });
    }

    const focalLength = 320;
    const centerX = width / 2;
    const centerY = height / 2;

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Apply spinning velocity
      let rotX = spinVelocity.current.y;
      let rotY = spinVelocity.current.x;

      // Friction simulation (decelerates spun speed back to baseline velocity)
      if (!isDragging) {
        const baselineX = 0.006 * (1 + proximityToTarget * 1.5);
        const baselineY = 0.004 * (1 + proximityToTarget * 1.5);
        
        spinVelocity.current.x += (baselineX - spinVelocity.current.x) * 0.05;
        spinVelocity.current.y += (baselineY - spinVelocity.current.y) * 0.05;
      }

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Proximity-based deformation noise amplitude
      const morphFactor = proximityToTarget > 0.85
        ? 0.28 + Math.sin(time * 0.006) * 0.12 // Spiky alert state
        : 0.06 + Math.sin(time * 0.0018) * 0.04; // Smooth luxury breathing state

      const projected: { x: number; y: number; z: number; size: number; color: string }[] = [];

      particles.forEach((p) => {
        // Rotations
        let y1 = p.y * cosX - p.z * sinX;
        let z1 = p.z * cosX + p.y * sinX;

        let x2 = p.x * cosY - z1 * sinY;
        let z2 = z1 * cosY + p.x * sinY;

        p.x = x2;
        p.y = y1;
        p.z = z2;

        // Radial mathematical morphing wave (4D Temporal Dimension)
        const dist = Math.sqrt(x2 * x2 + y1 * y1 + z2 * z2) || 1;
        const wave = Math.sin(dist * 0.1 - time * 0.002) * morphFactor;
        const disp = 1 + wave;

        const mx = x2 * disp;
        const my = y1 * disp;
        const mz = z2 * disp;

        // Projection
        const scale = focalLength / (focalLength + mz);
        const projX = centerX + mx * scale;
        const projY = centerY + my * scale;

        const size = Math.max(0.8, scale * 2.2);

        projected.push({
          x: projX,
          y: projY,
          z: mz,
          size,
          color: p.color,
        });
      });

      // Painter's algorithm depth sorting
      projected.sort((a, b) => b.z - a.z);

      // Draw connection mesh paths
      ctx.lineWidth = 0.4;
      const connectionDist = 42;

      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDist) {
            const avgZ = (p1.z + p2.z) / 2;
            const depthFade = focalLength / (focalLength + avgZ);
            
            // Transparency based on distance and depth coordinates
            const alpha = (1 - distance / connectionDist) * 0.18 * depthFade;
            
            const isRedAlert = proximityToTarget > 0.85;
            ctx.strokeStyle = isRedAlert
              ? `rgba(255, 56, 92, ${alpha})`
              : `rgba(0, 242, 254, ${alpha})`;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      projected.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Glowing white core reflections for front-most nodes
        if (p.z < -45 && Math.random() > 0.96) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [proximityToTarget, isDragging]);

  // Drag physics implementation
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { x: clientX, y: clientY };
    lastTouchPos.current = { x: clientX, y: clientY };
    lastTouchTime.current = performance.now();
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const time = performance.now();
    const timeDelta = time - lastTouchTime.current;
    
    // Drag offsets
    const dx = clientX - lastTouchPos.current.x;
    const dy = clientY - lastTouchPos.current.y;
    
    if (timeDelta > 0) {
      // Set velocity vectors based on drag speed
      spinVelocity.current.x = (dx / timeDelta) * 0.45;
      spinVelocity.current.y = (dy / timeDelta) * 0.45;
    }
    
    lastTouchPos.current = { x: clientX, y: clientY };
    lastTouchTime.current = time;
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const glowColor = proximityToTarget > 0.85 ? 'rgba(255, 56, 92, 0.45)' : 'rgba(0, 242, 254, 0.2)';
  const pulseStyle = proximityToTarget > 0.85 ? 'rgba(255, 56, 92, 0.05)' : 'rgba(255, 255, 255, 0.02)';

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center items-center select-none overflow-hidden touch-none"
      style={{ width: '100%', height: '240px' }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => {
        if (e.touches.length === 0) return;
        const t = e.touches[0];
        handleStart(t.clientX, t.clientY);
      }}
      onTouchMove={(e) => {
        if (e.touches.length === 0) return;
        const t = e.touches[0];
        handleMove(t.clientX, t.clientY);
      }}
      onTouchEnd={handleEnd}
    >
      <div 
        className="flex justify-center items-center relative"
        style={{
          transform: 'perspective(800px) rotateX(15deg) rotateY(-5deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Outer Halo Orbit Rings */}
        <div
          className="absolute border border-dashed rounded-full animate-spin-cw pointer-events-none"
          style={{
            width: '200px',
            height: '200px',
            borderColor: glowColor,
            opacity: 0.35,
          }}
        />
        <div
          className="absolute border border-dashed rounded-full animate-spin-ccw pointer-events-none"
          style={{
            width: '235px',
            height: '235px',
            borderColor: glowColor,
            opacity: 0.15,
            transform: 'scale(1.15) rotate(45deg)',
          }}
        />

        {/* Central Beveled Glass Sphere Container */}
        <div
          className="absolute rounded-full flex justify-center items-center pointer-events-none"
          style={{
            width: '180px',
            height: '180px',
            backgroundColor: pulseStyle,
            boxShadow: `inset 0 1px 2px rgba(255,255,255,0.1), 0 0 45px -10px ${glowColor}`,
            border: `1px solid ${glowColor}`,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* Canvas Node Sphere */}
          <canvas ref={canvasRef} style={{ width: '240px', height: '240px', pointerEvents: 'none', zIndex: 1 }} />
        </div>
      </div>
    </div>
  );
};
