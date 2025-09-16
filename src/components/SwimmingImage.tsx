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
}

export function SwimmingImage({ src, name, type }: SwimmingImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<number>();
  const [position, setPosition] = useState<Position>(() => ({
    x: Math.random() < 0.5 ? -100 : window.innerWidth + 100,
    y: 150 + Math.random() * (window.innerHeight - 300), // Evita topo e fundo
    direction: Math.random() < 0.5 ? 1 : -1,
    speed: 1 + Math.random() * 2
  }));

  useEffect(() => {
    const animate = () => {
      setPosition(prev => {
        const newPos = { ...prev };
        
        // Movimento horizontal simples
        newPos.x += newPos.speed * newPos.direction;
        
        // Quando sai da tela, volta do outro lado
        if (newPos.x > window.innerWidth + 150) {
          newPos.x = -150;
          newPos.y = 150 + Math.random() * (window.innerHeight - 300);
        } else if (newPos.x < -150) {
          newPos.x = window.innerWidth + 150;
          newPos.y = 150 + Math.random() * (window.innerHeight - 300);
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
  }, []);

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: position.direction < 0 ? 'scaleX(-1)' : 'scaleX(1)',
        zIndex: 15
      }}
    >
      {/* Imagem do peixe */}
      <img
        ref={imgRef}
        src={src}
        alt={name}
        className="w-20 h-20 object-contain"
        style={{ 
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
        }}
      />
      
      {/* Nome embaixo */}
      <div
        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-black/80 text-white text-xs rounded font-bold whitespace-nowrap"
      >
        {name}
      </div>
    </div>
  );
}