import { AnimalType, AnimalTypeOption } from '../types/Animal';
import { GlassModal } from './GlassModal';

interface AnimalTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: AnimalType) => void;
}

const animalTypes: AnimalTypeOption[] = [
  { type: 'fish', icon: '🐟', text: 'Parece um peixe?' },
  { type: 'jellyfish', icon: '🪼', text: 'Parece uma água-viva?' },
  { type: 'crab', icon: '🦀', text: 'Parece um caranguejo?' }
];

export function AnimalTypeSelector({ isOpen, onClose, onSelectType }: AnimalTypeSelectorProps) {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} className="w-80 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-6">
          Que animal você encontrou?
        </h2>
        
        <div className="space-y-4">
          {animalTypes.map(animal => (
            <button
              key={animal.type}
              onClick={() => onSelectType(animal.type)}
              className="w-full p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-200 flex items-center space-x-4 group"
            >
              <span className="text-3xl transform group-hover:scale-110 transition-transform duration-200">
                {animal.icon}
              </span>
              <span className="text-lg font-medium text-white">
                {animal.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </GlassModal>
  );
}