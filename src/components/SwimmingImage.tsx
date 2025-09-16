import { useEffect, useRef, useState } from 'react';

interface SwimmingImageProps {
  src: string;
  name: string;
  type: string;
}

interface Position {
  x: number;
  y: number;
  direction: number;
  speed: number;
  baseY: number;
  phase: number;
  size: number;
}

export function SwimmingImage({ src, name, type }: SwimmingImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<number>();
  const [position, setPosition] = useState<Position>(() => {
    const screenHeight = window.innerHeight;
    const safeZoneTop = 100;
    const safeZoneBottom = 150;
    
    let initialY: number;
    let speed: number;
    let size: number;
    
    // Posicionamento baseado no tipo
    switch (type) {
      case 'crab':
        initialY = screenHeight - safeZoneBottom;
        speed = 0.5 + Math.random() * 0.5;
        size = 60 + Math.random() * 30;
        break;
      case 'jellyfish':
        initialY = safeZoneTop + Math.random() * (screenHeight * 0.4);
        speed = 0.7 + Math.random() * 0.6;
        size = 80 + Math.random() * 40;
        break;
      case 'fish':
      default:
        initialY = safeZoneTop + Math.random() * (screenHeight - safeZoneTop - safeZoneBottom);
        speed = 1 + Math.random() * 1;
        size = 70 + Math.random() * 50;
        break;
    }
    
    return {
      x: Math.random() < 0.5 ? -150 : window.innerWidth + 150,
      y: initialY,
      direction: Math.random() < 0.5 ? 1 : -1,
      speed,
      baseY: initialY,
      phase: Math.random() * Math.PI * 2,
      size
    };
  });

  useEffect(() => {
    const animate = () => {
      setPosition(prev => {
        const newPos = { ...prev };
        const currentTime = Date.now() / 1000;
        
        // Movimento horizontal
        newPos.x += newPos.speed * newPos.direction;
        
        // Movimento vertical baseado no tipo
        if (type === 'fish') {
          newPos.y = newPos.baseY + Math.sin(currentTime * 2 + newPos.phase) * 25;
        } else if (type === 'jellyfish') {
          newPos.y = newPos.baseY + Math.sin(currentTime * 1.5 + newPos.phase) * 50;
        } else if (type === 'crab') {
          newPos.y = newPos.baseY + Math.sin(currentTime * 6 + newPos.phase) * 8;
        }
        
        // Verificar bordas e inverter direção
        if (newPos.x > window.innerWidth + 200 || newPos.x < -200) {
          newPos.direction *= -1;
          newPos.x = newPos.direction > 0 ? -150 : window.innerWidth + 150;
          
          // Reposicionar Y baseado no tipo
          const screenHeight = window.innerHeight;
          const safeZoneTop = 100;
          const safeZoneBottom = 150;
          
          if (type === 'crab') {
            newPos.baseY = screenHeight - safeZoneBottom;
          } else if (type === 'jellyfish') {
            newPos.baseY = safeZoneTop + Math.random() * (screenHeight * 0.4);
          } else {
            newPos.baseY = safeZoneTop + Math.random() * (screenHeight - safeZoneTop - safeZoneBottom);
          }
          
          if (type !== 'crab') {
            newPos.y = newPos.baseY;
          }
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
    <div
      className="absolute transition-opacity duration-500"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${position.size}px`,
        height: `${position.size}px`,
        transform: position.direction < 0 ? 'scaleX(-1)' : 'scaleX(1)',
        transformOrigin: 'center center',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
        zIndex: 10
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={name}
        className="w-full h-full object-contain opacity-95 drop-shadow-lg"
        style={{ 
          filter: 'brightness(1.1) contrast(1.1) saturate(1.2)',
          imageRendering: 'auto'
        }}
        onError={(e) => console.error('Erro ao carregar imagem:', name, e)}
      />
      
      {/* Efeito de brilho sutil */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 rounded-full pointer-events-none" />
      
      {/* Nome do animal */}
      <div
        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-black/70 backdrop-blur-sm text-white text-sm rounded-full font-bold whitespace-nowrap border border-white/20 shadow-lg"
        style={{
          textShadow: '2px 2px 4px rgba(0,0,0,0.9)'
        }}
      >
        {name}
      </div>
    </div>
  );
}