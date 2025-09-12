export type AnimalType = 'fish' | 'jellyfish' | 'crab';

export interface Animal {
  id: string;
  type: AnimalType;
  name: string;
  image: string | null;
  birthTime: number;
  x: number;
  y: number;
  baseY: number;
  direction: number;
  speed: number;
  size: number;
  phase: number;
  visible: boolean;
}

export interface AnimalTypeOption {
  type: AnimalType;
  icon: string;
  text: string;
}