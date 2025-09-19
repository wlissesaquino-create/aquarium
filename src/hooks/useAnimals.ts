import { useState, useEffect } from 'react';
import { Animal, AnimalType } from '../types/Animal';

const ANIMAL_LIFETIME = 5 * 60 * 1000; // 5 minutos
const STORAGE_KEY = 'aq_meta';

export function useAnimals() {
  const [animals, setAnimals] = useState<Animal[]>([]);

  // Carregar apenas metadados do localStorage na inicialização
  useEffect(() => {
    const savedMeta = localStorage.getItem(STORAGE_KEY);
    if (savedMeta) {
      try {
        const parsedMeta = JSON.parse(savedMeta);
        // Apenas metadados, sem imagens - imagens ficam em memória
        const animalsFromMeta = parsedMeta.map((meta: any) => ({
          ...meta,
          image: null, // Imagens não persistem entre sessões
          x: Math.random() < 0.5 ? -150 : window.innerWidth + 150,
          y: getInitialY(meta.type),
          baseY: 0,
          direction: Math.random() < 0.5 ? 1 : -1,
          speed: getSpeedForType(meta.type),
          size: getSizeForType(meta.type),
          phase: Math.random() * Math.PI * 2,
          visible: true
        }));
        
        // Filtrar animais expirados
        const validAnimals = animalsFromMeta.filter((animal: Animal) => 
          Date.now() - animal.birthTime < ANIMAL_LIFETIME
        );
        
        setAnimals(validAnimals);
      } catch (error) {
        console.error('Erro ao carregar metadados do localStorage:', error);
      }
    }
  }, []);

  // Salvar apenas metadados no localStorage sempre que a lista mudar
  useEffect(() => {
    try {
      const metas = animals.map(({id, name, type, birthTime}) => ({
        id, name, type, birthTime
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metas));
      console.log('Metadados salvos no localStorage:', metas.length, 'animais');
    } catch (error) {
      console.error('Erro ao salvar metadados no localStorage:', error);
      // Se der quota exceeded, limpar localStorage antigo
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('QuotaExceededError detectado - limpando localStorage antigo');
        localStorage.removeItem('aquarium_animals'); // Remove chave antiga se existir
        try {
          const metas = animals.map(({id, name, type, birthTime}) => ({
            id, name, type, birthTime
          }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(metas));
        } catch (retryError) {
          console.error('Falha ao salvar mesmo após limpeza:', retryError);
        }
      }
    }
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
      image, // Imagem fica apenas em memória
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