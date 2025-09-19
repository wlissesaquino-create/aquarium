import React, { useEffect, useRef, useState } from 'react';

// Interface para os dados que chegam no componente
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

// Interface interna para os animais que o p5.js vai desenhar
interface SketchAnimal {
  id: string;
  name: string;
  type: string;
  p5img: any | null;
  x: number;
  y: number;
  baseY: number;
  direction: number;
  width: number;
  height: number;
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
    import('p5').then((p5Module) => {
      const p5 = p5Module.default;
      
      const sketch = (s: any) => {
        s.setup = () => {
          const canvas = s.createCanvas(window.innerWidth, window.innerHeight);
          canvas.parent(canvasRef.current);
          s.textAlign(s.CENTER, s.CENTER);
          s.textSize(12);
        };

        s.draw = () => {
          try {
            s.clear();
            consumePending(s);
            drawAnimals(s);
            cleanupExpiredAnimals();
          } catch (error) {
            console.error('Erro no draw():', error);
          }
        };

        s.windowResized = () => {
          s.resizeCanvas(window.innerWidth, window.innerHeight);
        };
      };

      const consumePending = (s: any) => {
        const toAdd = pendingAddsRef.current.splice(0);
        for (const item of toAdd) {
          if (item.src) {
            // --- PONTO DE AJUSTE DE TAMANHO ---
            const fishWidth = 160; // Altere este valor para ajustar o tamanho dos animais
            const fishHeight = (fishWidth * 9) / 16;

            s.loadImage(
              item.src,
              (img: any) => {
                const animal: SketchAnimal = {
                  id: item.id,
                  name: item.name,
                  type: item.type,
                  p5img: img,
                  x: item.x || (Math.random() < 0.5 ? -150 : window.innerWidth + 150),
                  y: item.y || getInitialY(item.type),
                  baseY: item.y || getInitialY(item.type),
                  direction: item.direction || (Math.random() < 0.5 ? 1 : -1),
                  width: fishWidth,
                  height: fishHeight,
                  speed: item.speed || getSpeedForType(item.type),
                  phase: Math.random() * Math.PI * 2,
                  birth: Date.now()
                };
                animal.baseY = animal.y;
                sketchAnimalsRef.current.push(animal);
              },
              (err: any) => {
                console.warn(`p5.loadImage falhou para: ${item.name} (${item.id})`, err);
                const animal: SketchAnimal = {
                  id: item.id,
                  name: item.name,
                  type: item.type,
                  p5img: null,
                  x: item.x || (Math.random() < 0.5 ? -150 : window.innerWidth + 150),
                  y: item.y || getInitialY(item.type),
                  baseY: item.y || getInitialY(item.type),
                  direction: item.direction || (Math.random() < 0.5 ? 1 : -1),
                  width: fishWidth,
                  height: fishHeight,
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
          
          updateAnimalPosition(animal, currentTime);
          
          s.push();
          s.translate(animal.x, animal.y);
          
          if (animal.direction < 0) {
            s.scale(-1, 1);
          }
          
          if (animal.p5img) {
            s.image(animal.p5img, 0, 0, animal.width, animal.height);
          } else {
            drawPlaceholder(s, animal);
          }
          
          s.pop();
          
          s.fill(255);
          s.stroke(0);
          s.strokeWeight(2);
          s.text(animal.name, animal.x + animal.width / 2, animal.y + animal.height + 15);
          s.noStroke();
          
          const buffer = animal.width + 200;
          if (animal.x < -buffer || animal.x > window.innerWidth + buffer) {
            respawnAnimal(animal);
          }
        }
      };

      const updateAnimalPosition = (animal: SketchAnimal, currentTime: number) => {
        const t = (currentTime - animal.birth) / 1000;
        
        switch (animal.type) {
          case 'fish':
            animal.x += animal.speed * animal.direction;
            animal.y = animal.baseY + Math.sin(t * 0.8 + animal.phase) * 8;
            break;
          case 'jellyfish':
            animal.x += animal.speed * animal.direction;
            animal.y = animal.baseY + Math.sin(t * 0.6 + animal.phase) * 20;
            animal.x += Math.sin(t * 1.2 + animal.phase * 2) * 0.8;
            break;
          case 'crab':
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
        s.rect(0, 0, animal.width, animal.height);
        s.fill(255);
        s.noStroke();
        s.textAlign(s.CENTER, s.CENTER);
        s.text('?', animal.width / 2, animal.height / 2);
        s.textAlign(s.CENTER, s.CENTER);
      };

      const respawnAnimal = (animal: SketchAnimal) => {
        const fromLeft = Math.random() < 0.5;
        animal.direction = fromLeft ? 1 : -1;
        animal.x = fromLeft ? -animal.width - 50 : window.innerWidth + animal.width + 50;
        animal.y = getInitialY(animal.type);
        animal.baseY = animal.y;
        animal.speed = getSpeedForType(animal.type);
        animal.phase = Math.random() * Math.PI * 2;
      };

      const cleanupExpiredAnimals = () => {
        const now = Date.now();
        // --- PONTO DE AJUSTE DE TEMPO DE VIDA ---
        const LIFETIME = 7 * 60 * 1000; // 7 minutos

        sketchAnimalsRef.current = sketchAnimalsRef.current.filter(animal => {
          const expired = now - animal.birth > LIFETIME;
          if (expired) {
            console.log(`Removendo animal expirado: ${animal.name} (${animal.id})`);
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

  // --- O PONTO PRINCIPAL DA CORREÇÃO: SINCRONIZAÇÃO COMPLETA ---
  useEffect(() => {
    if (!p5Instance) {
      return;
    }

    const currentAnimalIds = new Set(sketchAnimalsRef.current.map(a => a.id));
    const desiredFishIds = new Set(fishes.map(f => f.id));

    // LÓGICA DE REMOÇÃO:
    const animalsToRemove = sketchAnimalsRef.current.filter(animal => !desiredFishIds.has(animal.id));
    if (animalsToRemove.length > 0) {
      console.log(`%cRemovendo ${animalsToRemove.length} peixe(s) via sync:`, 'color: orange;', animalsToRemove.map(a => a.name));
      animalsToRemove.forEach(animal => {
        if (animal.p5img && typeof animal.p5img.remove === 'function') {
          animal.p5img.remove();
        }
      });
      sketchAnimalsRef.current = sketchAnimalsRef.current.filter(animal => desiredFishIds.has(animal.id));
    }

    // LÓGICA DE ADIÇÃO:
    const newFishesToAdd = fishes.filter(fish => !currentAnimalIds.has(fish.id));
    if (newFishesToAdd.length > 0) {
      console.log(`%cAdicionando ${newFishesToAdd.length} novo(s) peixe(s) via sync:`, 'color: cyan;', newFishesToAdd.map(f => f.name));
      pendingAddsRef.current.push(...newFishesToAdd);
    }
  }, [fishes, p5Instance]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <div ref={canvasRef} />
    </div>
  );
}