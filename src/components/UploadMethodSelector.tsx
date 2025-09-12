import { Camera, Upload } from 'lucide-react';
import { AnimalType } from '../types/Animal';
import { GlassModal } from './GlassModal';

interface UploadMethodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  animalType: AnimalType;
  onSelectCamera: () => void;
  onSelectUpload: () => void;
}

const animalNames = {
  fish: 'Peixinho',
  jellyfish: 'Água-viva',
  crab: 'Caranguejo'
};

export function UploadMethodSelector({ 
  isOpen, 
  onClose, 
  animalType, 
  onSelectCamera, 
  onSelectUpload 
}: UploadMethodSelectorProps) {
  return (
    <GlassModal isOpen={isOpen} onClose={onClose} className="w-96 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Adicionar {animalNames[animalType]}
        </h2>
        <p className="text-white/80 mb-6">
          Como você quer enviar a imagem?
        </p>
        
        <div className="space-y-4">
          <button
            onClick={onSelectCamera}
            className="w-full p-6 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-4 group"
          >
            <Camera className="w-8 h-8 text-white transform group-hover:scale-110 transition-transform duration-200" />
            <span className="text-lg font-medium text-white">
              Usar Câmera
            </span>
          </button>
          
          <button
            onClick={onSelectUpload}
            className="w-full p-6 bg-green-500/20 hover:bg-green-500/30 border border-green-400/40 rounded-2xl transition-all duration-200 flex items-center justify-center space-x-4 group"
          >
            <Upload className="w-8 h-8 text-white transform group-hover:scale-110 transition-transform duration-200" />
            <span className="text-lg font-medium text-white">
              Enviar PNG
            </span>
          </button>
        </div>
      </div>
    </GlassModal>
  );
}