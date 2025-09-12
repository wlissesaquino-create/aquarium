import { useState } from 'react';
import { GalleryVertical as Gallery, Trash2, Timer } from 'lucide-react';
import { Animal } from '../types/Animal';

interface AnimalGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  animals: Animal[];
  onRemoveAnimal: (id: string) => void;
  getTimeRemaining: (animal: Animal) => number;
}

export function AnimalGallery({ isOpen, onClose, animals, onRemoveAnimal, getTimeRemaining }: AnimalGalleryProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDelete = (animalId: string) => {
    onRemoveAnimal(animalId);
    setDeleteConfirm(null);
  };

  const getAnimalIcon = (type: string) => {
    switch (type) {
      case 'fish': return '🐟';
      case 'jellyfish': return '🪼';
      case 'crab': return '🦀';
      default: return '🐟';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-80 bg-white/10 backdrop-blur-md border-l border-white/20 z-50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gallery className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Meu Aquário</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 rounded-full flex items-center justify-center text-white transition-colors duration-200"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {animals.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4">🌊</div>
                <p className="text-white/60">
                  Nenhum animal no aquário
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {animals.map(animal => {
                const timeRemaining = getTimeRemaining(animal);
                const isExpiring = timeRemaining < 60000; // Menos de 1 minuto
                
                return (
                  <div
                    key={animal.id}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {getAnimalIcon(animal.type)}
                        </span>
                        <div>
                          <p className="font-medium text-white">{animal.name}</p>
                          <div className={`flex items-center space-x-1 text-sm ${isExpiring ? 'text-red-400' : 'text-white/60'}`}>
                            <Timer size={12} />
                            <span>{formatTime(timeRemaining)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setDeleteConfirm(animal.id)}
                        className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 rounded-full flex items-center justify-center text-red-400 hover:text-red-300 transition-colors duration-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 max-w-sm mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">😢</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Tem certeza?
              </h3>
              <p className="text-white/80 mb-6">
                Você quer mesmo excluir este animal do aquário?
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-400/40 rounded-xl text-white transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 rounded-xl text-white transition-colors duration-200"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}