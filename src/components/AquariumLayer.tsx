import React from 'react';
import { SwimmingImage } from './SwimmingImage';

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

export function AquariumLayer({ fishes }: AquariumLayerProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {fishes.map((fish) => (
        <SwimmingImage 
          key={fish.id} 
          src={fish.src} 
          name={fish.name}
          type={fish.type}
        />
      ))}
    </div>
  );
}