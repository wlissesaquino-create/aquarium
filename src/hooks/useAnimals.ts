import { useState, useEffect } from 'react';
import { Animal, AnimalType } from '../types/Animal';

const ANIMAL_LIFETIME = 5 * 60 * 1000; // 5 minutos
const STORAGE_KEY = 'aquarium_animals';

export function useAnimals() {
  const [animals, setAnimals] = useState<Animal[]>([]);

  // Carregar animais do localStorage na inicialização
  useEffect(() => {
    const savedAnimals = localStorage.getItem(STORAGE_KEY);
    if (savedAnimals) {
      try {
        const parsedAnimals = JSON.parse(savedAnimals);
        setAnimals(parsedAnimals);
      } catch (error) {
        console.error('Erro ao carregar animais do localStorage:', error);
      }
    }
  }, []);

  // Salvar animais no localStorage sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(animals));
  }, [animals]);

  // Limpar animais expirados
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimals(prev => prev.filter(animal => 
        Date.now() - animal.birthTime < ANIMAL_LIFETIME
      ));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addAnimal = (type: AnimalType, name: string, image: string | null = null) => {
    console.log('Adicionando animal:', { type, name, image: image ? 'Imagem presente' : 'Sem imagem' });
    
    const newAnimal: Animal = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      name: name.trim() || getDefaultName(type),
      image,
      birthTime: Date.now(),
      x: Math.random() < 0.5 ? -150 : window.innerWidth + 150,
      y: getInitialY(type),
      baseY: 0,
      direction: Math.random() < 0.5 ? 1 : -1,
      speed: getSpeedForType(type),
      size: getSizeForType(type),
      phase: Math.random() * Math.PI * 2,
      visible: true
    };
    
    newAnimal.baseY = newAnimal.y;
    setAnimals(prev => [...prev, newAnimal]);
    
    console.log('Animal adicionado com sucesso:', newAnimal.id);
  };

  const getInitialY = (type: AnimalType): number => {
    const screenHeight = window.innerHeight;
    const safeZoneTop = 100; // Evitar o topo
    const safeZoneBottom = 150; // Evitar o fundo (areia)
    
    switch (type) {
      case 'crab':
        // Caranguejos ficam no fundo, mas acima da areia
        return screenHeight - safeZoneBottom;
      case 'jellyfish':
        // Águas-vivas ficam na parte superior-média
        return safeZoneTop + Math.random() * (screenHeight * 0.4);
      case 'fish':
      default:
        // Peixes ficam na zona média
        return safeZoneTop + Math.random() * (screenHeight - safeZoneTop - safeZoneBottom);
    }
  };

  const getSpeedForType = (type: AnimalType): number => {
    switch (type) {
      case 'crab':
        return 0.3 + Math.random() * 0.7; // Mais lento
      case 'jellyfish':
        return 0.5 + Math.random() * 0.8; // Velocidade média
      case 'fish':
      default:
        return 0.8 + Math.random() * 1.2; // Mais rápido
    }
  };

  const getSizeForType = (type: AnimalType): number => {
    switch (type) {
      case 'crab':
        return 50 + Math.random() * 40; // Menores
      case 'jellyfish':
        return 70 + Math.random() * 50; // Médias
      case 'fish':
      default:
        return 60 + Math.random() * 60; // Variados
    }
  };
  const removeAnimal = (id: string) => {
    setAnimals(prev => prev.filter(animal => animal.id !== id));
  };

  const getDefaultName = (type: AnimalType): string => {
    const names = {
      fish: ['Nemo', 'Dory', 'Marlin', 'Bubbles', 'Finn'],
      jellyfish: ['Jelly', 'Luna', 'Coral', 'Pearl', 'Neptune'],
      crab: ['Sebastian', 'Pincer', 'Sandy', 'Scuttle', 'Crusty']
    };
    const typeNames = names[type];
    return typeNames[Math.floor(Math.random() * typeNames.length)];
  };

  const getTimeRemaining = (animal: Animal): number => {
    return Math.max(0, ANIMAL_LIFETIME - (Date.now() - animal.birthTime));
  };

  return {
    animals,
    addAnimal,
    removeAnimal,
    getTimeRemaining
  };
}