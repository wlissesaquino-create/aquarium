import { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  r: number;
  speedY: number;
  driftX: number;
  opacity: number;
  seed: number;
}

interface OceanBackgroundProps {
  layer?: 'back' | 'front' | 'ground';
}

export function OceanBackground({ layer = 'back' }: OceanBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const bubblesRef = useRef<Bubble[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeBubbles();
    };

    const getGroundTop = (): number => {
      // Try to get ground element height, fallback to 120px
      const groundElement = document.querySelector('.ocean-ground');
      if (groundElement) {
        const rect = groundElement.getBoundingClientRect();
        return rect.top;
      }
      return canvas.height - 120; // fallback
    };

    const initializeBubbles = () => {
      const groundTop = getGroundTop();
      bubblesRef.current = [];
      
      for (let i = 0; i < 60; i++) {
        bubblesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * (groundTop - 8),
          r: 2 + Math.random() * 6,
          speedY: 0.05 + Math.random() * 0.55,
          driftX: (Math.random() - 0.5) * 2.4, // -1.2 to +1.2
          opacity: 0.15 + Math.random() * 0.4,
          seed: Math.random() * 1000
        });
      }
    };

    const drawOceanGradient = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1e4678');
      gradient.addColorStop(0.7, '#0f2a4a');
      gradient.addColorStop(1, '#0a1e3c');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawSeaFloor = () => {
      // Chão de areia
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
      
      // Textura da areia
      ctx.fillStyle = '#A0522D';
      for (let i = 0; i < canvas.width; i += 20) {
        const height = 10 + Math.random() * 15;
        ctx.fillRect(i, canvas.height - height, 20, height);
      }
      
      // Algumas pedras
      ctx.fillStyle = '#696969';
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width;
        const y = canvas.height - 60 + Math.random() * 40;
        const size = 10 + Math.random() * 20;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawBubbles = () => {
      const groundTop = getGroundTop();
      const currentTime = Date.now();
      
      bubblesRef.current.forEach(bubble => {
        ctx.save();
        ctx.globalAlpha = bubble.opacity;
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Movimento das bolhas - muito mais lento
        bubble.y -= bubble.speedY;
        bubble.x += Math.sin((currentTime + bubble.seed) / 2000) * (bubble.driftX * 0.3);

        // Reposicionar se sair da área válida
        if (bubble.y < -10) {
          bubble.y = groundTop - 10;
          bubble.x = Math.random() * canvas.width;
        }
        
        // Garantir que não invada o chão
        if (bubble.y >= groundTop - 4) {
          bubble.y = groundTop - (10 + Math.random() * 30);
        }
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (layer === 'back') {
        drawOceanGradient();
        drawSeaFloor();
      }
      
      if (layer === 'back' || layer === 'front') {
        drawBubbles();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [layer]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${
        layer === 'back' ? 'z-0' : 'z-20'
      }`}
    />
  );
}