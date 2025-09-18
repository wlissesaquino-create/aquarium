import { useEffect, useRef, useState } from 'react';

interface SwimmingImageProps {
  src: string;
  name: string;
  type: string;
}

interface Position {
  x: number;
  y: number;
  baseY: number;
  direction: number;
  speed: number;
  size: number;
  phase: number;
}

export function SwimmingImage({ src, name, type }: SwimmingImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  
  const [position, setPosition] = useState<Position>(() => {
    const groundHeight = 120;
    const fromLeft = Math.random() < 0.5;
    const direction = fromLeft ? 1 : -1;
    const size = 80 + Math.random() * 140; // 80-220px
    
    let y: number;
    if (type === 'crab') {
      y = window.innerHeight * 0.67 + Math.random() * (window.innerHeight * 0.33 - groundHeight - 20);
    } else if (type === 'jellyfish') {
      y = 60 + Math.random() * (window.innerHeight * 0.6 - 60);
    } else {
      y = 60 + Math.random() * (window.innerHeight - groundHeight - 210);
    }
    
    return {
      x: fromLeft ? -size - 50 : window.innerWidth + size + 50,
      y,
      baseY: y,
      direction,
      speed: (0.6 + Math.random() * 2.0) * (120 / size), // Peixes maiores mais lentos
      size,
      phase: Math.random() * Math.PI * 2
    };
  });

  useEffect(() => {
    const animate = () => {
      setPosition(prev => {
        const newPos = { ...prev };
        const t = performance.now();
        
        // Movimento horizontal
        newPos.x += newPos.direction * newPos.speed;
        
        // Movimento vertical baseado no tipo
        if (type === 'fish') {
          newPos.y = newPos.baseY + Math.sin((t / 600) + newPos.phase) * (8 + (newPos.size / 150) * 6);
        } else if (type === 'jellyfish') {
          newPos.y = newPos.baseY + Math.sin((t / 900) + newPos.phase) * (20 + (newPos.size / 120) * 12);
          newPos.x += Math.sin((t / 1200) + newPos.phase * 2) * 0.6;
        } else if (type === 'crab') {
          // Caranguejo fica no chão, movimento mínimo
          newPos.y = newPos.baseY + Math.sin((t / 1000) + newPos.phase) * 2;
        }
        
        // Respawn quando sai da tela
        const buffer = newPos.size + 200;
        if (newPos.x < -buffer || newPos.x > window.innerWidth + buffer) {
          const groundHeight = 120;
          const fromLeft = Math.random() < 0.5;
          newPos.direction = fromLeft ? 1 : -1;
          newPos.x = fromLeft ? -newPos.size - 50 : window.innerWidth + newPos.size + 50;
          newPos.size = 80 + Math.random() * 140; // Novo tamanho aleatório
          newPos.speed = (0.6 + Math.random() * 2.0) * (120 / newPos.size);
          newPos.phase = Math.random() * Math.PI * 2;
          
          // Nova posição Y baseada no tipo
          if (type === 'crab') {
            newPos.y = window.innerHeight * 0.67 + Math.random() * (window.innerHeight * 0.33 - groundHeight - 20);
          } else if (type === 'jellyfish') {
            newPos.y = 60 + Math.random() * (window.innerHeight * 0.6 - 60);
          } else {
            newPos.y = 60 + Math.random() * (window.innerHeight - groundHeight - 210);
          }
          newPos.baseY = newPos.y;
        }
        
        return newPos;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [type]);

  return (
    <div className="absolute pointer-events-none" style={{ zIndex: 15 }}>
      {/* Imagem do peixe */}
      <img
        ref={imgRef}
        src={src}
        alt={name}
        className="absolute"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${position.size}px`,
          height: 'auto',
          transform: position.direction < 0 ? 'scaleX(-1)' : 'scaleX(1)',
          transformOrigin: 'center center',
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
          userSelect: 'none',
          pointerEvents: 'none'
        }}
        draggable={false}
      />
      
      {/* Nome embaixo - nunca invertido */}
      <div
        ref={labelRef}
        className="absolute whitespace-nowrap text-sm font-bold text-white pointer-events-none"
        style={{
          left: `${position.x + position.size / 2}px`,
          top: `${position.y + position.size + 6}px`,
          transform: 'translateX(-50%)', // Centralizar o texto
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '12px',
          userSelect: 'none'
        }}
      >
        {name}
      </div>
    </div>
  );
}