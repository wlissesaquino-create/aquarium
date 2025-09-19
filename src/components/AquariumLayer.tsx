import React, { useEffect, useRef, useState } from 'react';

export interface Fish {
  id: string;
  src: string;
  name: string;
  type: string;
  x?: number;
  y?: number;
  direction?: number;
  size?: number;
  speed?: number;
}

interface AquariumLayerProps {
  fishes: Fish[];
}

interface SketchAnimal {
  id: string;
  name: string;
  type: string;
  p5img: any | null;
  x: number;
  y: number;
  baseY: number;
  direction: number;
  size: number;
  speed: number;
  phase: number;
  birth: number;
}

export function AquariumLayer({ fishes }: AquariumLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sketchRef = useRef<any>(null);
  const sketchAnimalsRef = useRef<SketchAnimal[]>([]);
  const pendingAddsRef = useRef<Fish[]>([]);
  const [p5Instance, setP5Instance] = useState<any>(null);

  useEffect(() => {
    // Importar p5 dinamicamente
    import('p5').then((p5Module) => {
      const p5 = p5Module.default;
      
      const sketch = (s: any) => {
        s.setup = () => {
          const canvas = s.createCanvas(window.innerWidth, window.innerHeight);
          canvas.parent(canvasRef.current);
          s.textAlign(s.CENTER, s.CENTER);
          s.textSize(12);
          console.log('p5 sketch inicializado');
        };

        s.draw = () => {
          try {
            s.clear(); // Limpar canvas para mostrar fundo oceânico
            
            // Consumir fila de pendências
            consumePending(s);
            
            // Desenhar animais
            drawAnimals(s);
            
            // Limpar animais expirados
            cleanupExpiredAnimals();
            
          } catch (error) {
            console.error('Erro no draw():', error);
            // Não parar o loop, apenas logar o erro
          }
        };

        s.windowResized = () => {
          s.resizeCanvas(window.innerWidth, window.innerHeight);
        };
      };

      const consumePending = (s: any) => {
        const toAdd = pendingAddsRef.current.splice(0);
        for (const item of toAdd) {
          console.log('Carregando imagem para animal:', item.id);
          
          if (item.src) {
            s.loadImage(
              item.src,
              (img: any) => {
                console.log('p5.loadImage sucesso para:', item.id);
                const animal: SketchAnimal = {
                  id: item.id,
                  name: item.name,
                  type: item.type,
                  p5img: img,
                  x: item.x || (Math.random() < 0.5 ? -150 : window.innerWidth + 150),
                  y: item.y || getInitialY(item.type),
                  baseY: item.y || getInitialY(item.type),
                  direction: item.direction || (Math.random() < 0.5 ? 1 : -1),
                  size: 100, // Tamanho fixo
                  speed: item.speed || getSpeedForType(item.type),
                  phase: Math.random() * Math.PI * 2,
                  birth: Date.now()
                };
                animal.baseY = animal.y;
                sketchAnimalsRef.current.push(animal);
              },
              (err: any) => {
                console.warn('p5.loadImage falhou para:', item.id, err);
                // Adicionar placeholder sem imagem para não travar
                const animal: SketchAnimal = {
                  id: item.id,
                  name: item.name,
                  type: item.type,
                  p5img: null,
                  x: item.x || (Math.random() < 0.5 ? -150 : window.innerWidth + 150),
                  y: item.y || getInitialY(item.type),
                  baseY: item.y || getInitialY(item.type),
                  direction: item.direction || (Math.random() < 0.5 ? 1 : -1),
                  size: 100,
                  speed: item.speed || getSpeedForType(item.type),
                  phase: Math.random() * Math.PI * 2,
                  birth: Date.now()
                };
                animal.baseY = animal.y;
                sketchAnimalsRef.current.push(animal);
              }
            );
          }
        }
      };

      const drawAnimals = (s: any) => {
        const currentTime = s.millis();
        
        for (const animal of sketchAnimalsRef.current) {
          if (!animal) continue;
          
          // Atualizar posição baseada no tipo
          updateAnimalPosition(animal, currentTime);
          
          // Desenhar imagem (espelhada se necessário, mas não o texto)
          s.push();
          s.translate(animal.x, animal.y);
          
          if (animal.direction < 0) {
            s.scale(-1, 1);
          }
          
          if (animal.p5img) {
            s.image(animal.p5img, 0, 0, animal.size, animal.size);
          } else {
            // Placeholder se imagem não carregou
            drawPlaceholder(s, animal);
          }
          
          s.pop();
          
          // Desenhar nome (sempre legível, nunca espelhado)
          s.fill(255);
          s.stroke(0);
          s.strokeWeight(2);
          s.text(animal.name, animal.x + animal.size/2, animal.y + animal.size + 20);
          s.noStroke();
          
          // Respawn se saiu da tela
          const buffer = animal.size + 200;
          if (animal.x < -buffer || animal.x > window.innerWidth + buffer) {
            respawnAnimal(animal);
          }
        }
      };

      const updateAnimalPosition = (animal: SketchAnimal, currentTime: number) => {
        const t = (currentTime - animal.birth) / 1000; // segundos desde nascimento
        
        switch (animal.type) {
          case 'fish':
            // Movimento horizontal com pequena ondulação vertical
            animal.x += animal.speed * animal.direction;
            animal.y = animal.baseY + Math.sin(t * 0.8 + animal.phase) * 8;
            break;
            
          case 'jellyfish':
            // Movimento suave com padrão em N
            animal.x += animal.speed * animal.direction;
            animal.y = animal.baseY + Math.sin(t * 0.6 + animal.phase) * 20;
            animal.x += Math.sin(t * 1.2 + animal.phase * 2) * 0.8;
            break;
            
          case 'crab':
            // Movimento no chão com pequena oscilação
            animal.x += animal.speed * animal.direction;
            animal.y = animal.baseY + Math.sin(t * 8 + animal.phase) * 3;
            break;
            
          default:
            animal.x += animal.speed * animal.direction;
            break;
        }
      };

      const drawPlaceholder = (s: any, animal: SketchAnimal) => {
        s.fill(100, 150, 255, 100);
        s.stroke(255);
        s.strokeWeight(2);
        s.rect(0, 0, animal.size, animal.size);
        s.fill(255);
        s.noStroke();
        s.textAlign(s.CENTER, s.CENTER);
        s.text('?', animal.size/2, animal.size/2);
        s.textAlign(s.CENTER, s.CENTER); // Reset
      };

      const respawnAnimal = (animal: SketchAnimal) => {
        const fromLeft = Math.random() < 0.5;
        animal.direction = fromLeft ? 1 : -1;
        animal.x = fromLeft ? -animal.size - 50 : window.innerWidth + animal.size + 50;
        animal.y = getInitialY(animal.type);
        animal.baseY = animal.y;
        animal.speed = getSpeedForType(animal.type);
        animal.phase = Math.random() * Math.PI * 2;
      };

      const cleanupExpiredAnimals = () => {
        const now = Date.now();
        const LIFETIME = 5 * 60 * 1000; // 5 minutos
        
        sketchAnimalsRef.current = sketchAnimalsRef.current.filter(animal => {
          const expired = now - animal.birth > LIFETIME;
          if (expired) {
            console.log('Removendo animal expirado:', animal.id);
            // Limpar imagem p5 se necessário
            if (animal.p5img && typeof animal.p5img.remove === 'function') {
              animal.p5img.remove();
            }
          }
          return !expired;
        });
      };

      const getInitialY = (type: string): number => {
        const screenHeight = window.innerHeight;
        const safeZoneTop = 100;
        const safeZoneBottom = 150;
        
        switch (type) {
          case 'crab':
            return screenHeight - safeZoneBottom;
          case 'jellyfish':
            return safeZoneTop + Math.random() * (screenHeight * 0.4);
          case 'fish':
          default:
            return safeZoneTop + Math.random() * (screenHeight - safeZoneTop - safeZoneBottom);
        }
      };

      const getSpeedForType = (type: string): number => {
        switch (type) {
          case 'crab':
            return 0.3 + Math.random() * 0.7;
          case 'jellyfish':
            return 0.5 + Math.random() * 0.8;
          case 'fish':
          default:
            return 0.8 + Math.random() * 1.2;
        }
      };

      if (canvasRef.current) {
        const p5Instance = new p5(sketch);
        sketchRef.current = p5Instance;
        setP5Instance(p5Instance);
      }
    }).catch(error => {
      console.error('Erro ao carregar p5:', error);
    });

    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove();
      }
    };
  }, []);

  // Sincronizar peixes do React com o sketch p5
  useEffect(() => {
    if (!fishes || fishes.length === 0) return;
    
    console.log('Sincronizando peixes com sketch:', fishes.length);
    
    // Adicionar novos peixes à fila de pendências
    const existingIds = new Set(sketchAnimalsRef.current.map(a => a.id));
    const newFishes = fishes.filter(fish => !existingIds.has(fish.id));
    
    if (newFishes.length > 0) {
      console.log('Adicionando à fila de pendências:', newFishes.length, 'novos peixes');
      pendingAddsRef.current.push(...newFishes);
    }
  }, [fishes]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <div ref={canvasRef} />
    </div>
  );
}