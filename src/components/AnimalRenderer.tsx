import { useEffect, useRef } from 'react';
import { Animal } from '../types/Animal';

interface AnimalRendererProps {
  animals: Animal[];
}

export function AnimalRenderer({ animals }: AnimalRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const updateAnimals = () => {
      const currentTime = Date.now();
      
      animals.forEach((animal, index) => {
        const animalElement = document.getElementById(`animal-${animal.id}`);
        if (!animalElement) return;

        const timeSinceBirth = (currentTime - animal.birthTime) / 1000;
        
        // Movimento horizontal
        animal.x += animal.speed * animal.direction;
        
        // Movimento vertical específico por tipo
        if (animal.type === 'fish') {
          animal.y = animal.baseY + Math.sin(timeSinceBirth * 2 + animal.phase) * 25;
        } else if (animal.type === 'jellyfish') {
          animal.y = animal.baseY + Math.sin(timeSinceBirth * 1.5 + animal.phase) * 50;
        } else if (animal.type === 'crab') {
          animal.y = animal.baseY + Math.sin(timeSinceBirth * 6 + animal.phase) * 8;
        }

        // Verificar bordas e inverter direção
        if (animal.x > window.innerWidth + 150 || animal.x < -150) {
          animal.direction *= -1;
          animal.x = animal.direction > 0 ? -100 : window.innerWidth + 100;
          
          if (animal.type !== 'crab') {
            animal.baseY = 100 + Math.random() * (window.innerHeight - 300);
            animal.y = animal.baseY;
          }
        }

        // Efeito de piscar (visibilidade)
        const visibilityTimer = (currentTime - animal.birthTime) % 30000;
        animal.visible = visibilityTimer < 25000;

        // Atualizar posição e visibilidade no DOM
        animalElement.style.transform = `translate(${animal.x}px, ${animal.y}px) ${animal.direction < 0 ? 'scaleX(-1)' : 'scaleX(1)'}`;
        animalElement.style.opacity = animal.visible ? '1' : '0.3';
      });

      animationRef.current = requestAnimationFrame(updateAnimals);
    };

    animationRef.current = requestAnimationFrame(updateAnimals);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animals]);

  const renderAnimalImage = (animal: Animal) => {
    if (animal.image) {
      return (
        <div className="w-full h-full relative">
          <img
            src={animal.image}
            alt={animal.name}
            className="w-full h-full object-contain opacity-95 drop-shadow-lg"
            style={{ 
              filter: 'brightness(1.1) contrast(1.1) saturate(1.2)',
              imageRendering: 'crisp-edges'
            }}
          />
          {/* Efeito de brilho sutil */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 rounded-full pointer-events-none" />
        </div>
      );
    }

    // Render placeholder baseado no tipo
    return (
      <div className="w-full h-full flex items-center justify-center text-6xl drop-shadow-lg">
        {animal.type === 'fish' && '🐟'}
        {animal.type === 'jellyfish' && '🪼'}
        {animal.type === 'crab' && '🦀'}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-10">
      {animals.map(animal => (
        <div
          key={animal.id}
          id={`animal-${animal.id}`}
          className="absolute transition-all duration-500"
          style={{
            width: `${animal.size}px`,
            height: `${animal.size}px`,
            transform: `translate(${animal.x}px, ${animal.y}px)`,
            transformOrigin: 'center center',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }}
        >
          {renderAnimalImage(animal)}
          
          {/* Nome do animal */}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-black/70 backdrop-blur-sm text-white text-sm rounded-full font-bold whitespace-nowrap border border-white/20 shadow-lg"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
              transform: animal.direction < 0 ? 'translateX(-50%) scaleX(-1)' : 'translateX(-50%)'
            }}
          >
            {animal.name}
          </div>
        </div>
      ))}
    </div>
  );
}