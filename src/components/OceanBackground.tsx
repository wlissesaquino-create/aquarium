import { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  r: number;
  speed: number;
  opacity: number;
}

interface SeaweedPoint {
  x: number;
  height: number;
}

interface OceanBackgroundProps {
  layer?: 'back' | 'front' | 'ground';
}

export function OceanBackground({ layer = 'back' }: OceanBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const bubblesRef = useRef<Bubble[]>([]);
  const seaweedRef = useRef<SeaweedPoint[]>([]);
  const sandRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeElements();
    };

    const initializeElements = () => {
      // Inicializar bolhas
      bubblesRef.current = [];
      for (let i = 0; i < 80; i++) {
        bubblesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: 3 + Math.random() * 9,
          speed: 0.3 + Math.random() * 1.2,
          opacity: 50 + Math.random() * 100
        });
      }

      // Inicializar areia
      sandRef.current = [];
      for (let i = 0; i <= canvas.width / 10; i++) {
        sandRef.current.push(canvas.height - 40 - Math.random() * 60);
      }

      // Inicializar pontos das algas
      seaweedRef.current = [];
      for (let x = 100; x < canvas.width; x += 200) {
        seaweedRef.current.push({
          x,
          height: 150 + Math.random() * 50
        });
      }
    };

    const drawOceanGradient = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(30, 70, 120, 1)');
      gradient.addColorStop(0.5, 'rgba(20, 50, 100, 1)');
      gradient.addColorStop(1, 'rgba(10, 30, 60, 1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawBubbles = () => {
      bubblesRef.current.forEach(bubble => {
        ctx.save();
        ctx.globalAlpha = (bubble.opacity / 255) * (layer === 'front' ? 0.3 : 1);
        ctx.fillStyle = 'rgba(180, 220, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Atualizar posição
        bubble.y -= bubble.speed;
        bubble.x += Math.sin(bubble.y * 0.01) * 0.5;

        if (bubble.y < -20) {
          bubble.y = canvas.height + 20;
          bubble.x = Math.random() * canvas.width;
        }
      });
    };

    const drawSand = () => {
      ctx.fillStyle = layer === 'ground' ? 'rgba(45, 35, 25, 0.9)' : 'rgba(45, 35, 25, 1)';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      for (let i = 0; i < sandRef.current.length; i++) {
        ctx.lineTo(i * 10, sandRef.current[i]);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();
    };

    const drawSeaweed = () => {
      ctx.strokeStyle = layer === 'front' ? 'rgba(30, 80, 40, 0.4)' : 'rgba(30, 80, 40, 0.8)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      seaweedRef.current.forEach(seaweed => {
        const baseY = canvas.height - 60;
        const time = Date.now() * 0.001;
        const waveOffset = Math.sin(time + seaweed.x * 0.01) * 10;

        ctx.beginPath();
        for (let y = baseY; y > baseY - seaweed.height; y -= 10) {
          const progress = (baseY - y) / seaweed.height;
          const offsetX = Math.sin(progress * Math.PI * 2 + time * 2) * 15 * progress + waveOffset;
          
          if (y === baseY) {
            ctx.moveTo(seaweed.x + offsetX, y);
          } else {
            ctx.lineTo(seaweed.x + offsetX, y);
          }
        }
        ctx.stroke();
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (layer === 'back' || layer === 'ground') {
        drawOceanGradient();
      }
      
      if (layer === 'back' || layer === 'ground') {
        drawSand();
      }
      
      drawBubbles();
      drawSeaweed();
      
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${
        layer === 'back' ? 'z-0' : 
        layer === 'ground' ? 'z-5' : 
        'z-20'
      }`}
      style={{ background: 'linear-gradient(to bottom, #1e4678, #0a1e3c)' }}
    />
  );
}
