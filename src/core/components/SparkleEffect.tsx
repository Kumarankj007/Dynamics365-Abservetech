"use client"
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
  rotation?: number;
  rotationSpeed?: number;
  color?: string;
  pulsePhase?: number;
}

type SparkleVariant = 
  | 'classic' 
  | 'floating-orbs' 
  | 'twinkling-stars' 
  | 'geometric' 
  | 'color-changing' 
  | 'fast-moving';

interface SparkleEffectProps {
  variant?: SparkleVariant;
}

const SparkleEffect = ({ variant = 'classic' }: SparkleEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createParticle = (): Particle => {
      const maxLife = variant === 'fast-moving' ? 30 + Math.random() * 60 : 60 + Math.random() * 120;
      const baseSpeed = variant === 'fast-moving' ? 4 : variant === 'floating-orbs' ? 0.5 : 2;
      
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: variant === 'geometric' ? Math.random() * 4 + 2 : Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * baseSpeed,
        speedY: (Math.random() - 0.5) * baseSpeed,
        opacity: 0,
        life: 0,
        maxLife,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        color: variant === 'color-changing' ? 
          ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][Math.floor(Math.random() * 5)] : 
          '#ffffff',
        pulsePhase: Math.random() * Math.PI * 2
      };
    };

    // Initialize particles
    const particleCount = variant === 'fast-moving' ? 80 : variant === 'floating-orbs' ? 30 : 50;
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(createParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life++;
        if (particle.rotation !== undefined && particle.rotationSpeed !== undefined) {
          particle.rotation += particle.rotationSpeed;
        }
        if (particle.pulsePhase !== undefined) {
          particle.pulsePhase += 0.1;
        }

        // Calculate opacity based on life cycle
        const halfLife = particle.maxLife / 2;
        if (particle.life < halfLife) {
          particle.opacity = particle.life / halfLife;
        } else {
          particle.opacity = 1 - (particle.life - halfLife) / halfLife;
        }

        // Remove dead particles and create new ones
        if (particle.life >= particle.maxLife) {
          particlesRef.current[index] = createParticle();
          return;
        }

        // Wrap around screen edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw based on variant
        ctx.save();
        
        switch (variant) {
          case 'classic':
            drawClassicSparkle(ctx, particle);
            break;
          case 'floating-orbs':
            drawFloatingOrb(ctx, particle);
            break;
          case 'twinkling-stars':
            drawTwinklingStar(ctx, particle);
            break;
          case 'geometric':
            drawGeometricSparkle(ctx, particle);
            break;
          case 'color-changing':
            drawColorChangingSparkle(ctx, particle);
            break;
          case 'fast-moving':
            drawFastMovingSparkle(ctx, particle);
            break;
        }
        
        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Drawing functions for different variants
    const drawClassicSparkle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
      ctx.globalAlpha = particle.opacity * 0.8;
      
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.8)');
      gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 255, 255, ${particle.opacity * 0.6})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(particle.x - particle.size * 2, particle.y);
      ctx.lineTo(particle.x + particle.size * 2, particle.y);
      ctx.moveTo(particle.x, particle.y - particle.size * 2);
      ctx.lineTo(particle.x, particle.y + particle.size * 2);
      ctx.stroke();
    };

    const drawFloatingOrb = (ctx: CanvasRenderingContext2D, particle: Particle) => {
      const pulse = particle.pulsePhase ? Math.sin(particle.pulsePhase) * 0.3 + 0.7 : 1;
      ctx.globalAlpha = particle.opacity * 0.6 * pulse;
      
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 3
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(0.3, 'rgba(59, 130, 246, 0.6)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * pulse, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawTwinklingStar = (ctx: CanvasRenderingContext2D, particle: Particle) => {
      const twinkle = particle.pulsePhase ? Math.abs(Math.sin(particle.pulsePhase * 2)) : 1;
      ctx.globalAlpha = particle.opacity * twinkle;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation || 0);
      
      // Draw star shape
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5;
        const x = Math.cos(angle) * particle.size;
        const y = Math.sin(angle) * particle.size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };

    const drawGeometricSparkle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
      ctx.globalAlpha = particle.opacity * 0.7;
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation || 0);
      
      // Draw diamond shape
      ctx.fillStyle = 'rgba(168, 85, 247, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, -particle.size);
      ctx.lineTo(particle.size, 0);
      ctx.lineTo(0, particle.size);
      ctx.lineTo(-particle.size, 0);
      ctx.closePath();
      ctx.fill();
      
      // Add outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawColorChangingSparkle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
      ctx.globalAlpha = particle.opacity * 0.8;
      
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      gradient.addColorStop(0, particle.color || '#ffffff');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawFastMovingSparkle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
      ctx.globalAlpha = particle.opacity * 0.9;
      
      // Draw trail effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(particle.x - particle.speedX * 5, particle.y - particle.speedY * 5);
      ctx.lineTo(particle.x, particle.y);
      ctx.stroke();
      
      // Draw main sparkle
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default SparkleEffect;