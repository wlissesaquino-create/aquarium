import { useState } from 'react';
import { Check, Eraser, Edit3 } from 'lucide-react';
import { AnimalType } from '../types/Animal';
import { GlassModal } from './GlassModal';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: string | null;
  animalType: AnimalType;
  onConfirm: (name: string, processedImage: string) => void;
}

const animalNames = {
  fish: 'Peixinho',
  jellyfish: 'Água-viva', 
  crab: 'Caranguejo'
};

export function ImageEditor({ isOpen, onClose, imageData, animalType, onConfirm }: ImageEditorProps) {
  const [animalName, setAnimalName] = useState('');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const removeBackground = async () => {
    if (!imageData) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Redimensionar para tamanho gerenciável
        const maxSize = 512;
        const aspect = img.width / img.height;
        
        if (img.width > img.height) {
          canvas.width = Math.min(maxSize, img.width);
          canvas.height = canvas.width / aspect;
        } else {
          canvas.height = Math.min(maxSize, img.height);
          canvas.width = canvas.height * aspect;
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageDataObj.data;
        
        // Algoritmo melhorado de remoção de fundo
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calcular luminosidade
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
          
          // Se o pixel for muito claro (fundo), torná-lo transparente
          if (luminance > 180 && (r > 150 && g > 150 && b > 150)) {
            data[i + 3] = 0; // alpha = 0 (transparente)
          }
          // Se for muito escuro mas com pouco contraste, também remover
          else if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30 && luminance > 200) {
            data[i + 3] = 0;
          }
        }
        
        ctx.putImageData(imageDataObj, 0, 0);
        const processedDataUrl = canvas.toDataURL('image/png');
        console.log('Fundo removido no editor, tamanho:', processedDataUrl.length, 'chars');
        setProcessedImage(processedDataUrl);
        setIsProcessing(false);
      };
      
      img.src = imageData;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    console.log('Confirmando no ImageEditor:', { animalName, imageData: !!imageData, processedImage: !!processedImage });
    
    if (imageData) {
      const finalImage = processedImage || imageData;
      const finalName = animalName.trim() || getDefaultName();
      
      console.log('Enviando para onConfirm:', { finalName, finalImage: finalImage.substring(0, 50) + '...' });
      onConfirm(finalName, finalImage);
      
      // Reset state
      setAnimalName('');
      setProcessedImage(null);
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setAnimalName('');
    setProcessedImage(null);
    setIsProcessing(false);
    onClose();
  };

  const getDefaultName = () => {
    const defaultNames = {
      fish: ['Nemo', 'Dory', 'Bubbles', 'Finn'],
      jellyfish: ['Luna', 'Coral', 'Neptune', 'Jelly'],
      crab: ['Sebastian', 'Sandy', 'Pincer', 'Scuttle']
    };
    
    const names = defaultNames[animalType];
    return names[Math.floor(Math.random() * names.length)];
  };

  return (
    <GlassModal isOpen={isOpen} onClose={handleClose} className="w-[600px] p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          <Edit3 className="inline-block mr-2" size={24} />
          Personalize seu {animalNames[animalType]}
        </h2>
        
        {/* Preview da imagem */}
        <div className="mb-6">
          {imageData && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/80 text-sm mb-2">Imagem Original</p>
                <img
                  src={imageData}
                  alt="Original"
                  className="w-full h-40 object-contain bg-white/10 rounded-xl border border-white/20"
                />
              </div>
              <div>
                <p className="text-white/80 text-sm mb-2">
                  {processedImage ? 'Fundo Removido ✨' : 'Preview Final'}
                </p>
                <img
                  src={processedImage || imageData}
                  alt="Processed"
                  className="w-full h-40 object-contain bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border-2 border-blue-400/40"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Campo nome */}
        <div className="mb-6">
          <label className="block text-white text-lg font-medium mb-2">
            💫 Dê um nome especial ao seu {animalNames[animalType].toLowerCase()}:
          </label>
          <input
            type="text"
            value={animalName}
            onChange={(e) => setAnimalName(e.target.value)}
            placeholder={`Ex: ${getDefaultName()}`}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-blue-400/60 focus:outline-none transition-all duration-200 text-center text-lg font-medium"
            maxLength={20}
          />
        </div>
        
        {/* Botão remover fundo */}
        {!processedImage && (
          <div className="mb-6">
            <button
              onClick={removeBackground}
              disabled={isProcessing}
              className="px-8 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 rounded-xl flex items-center space-x-2 text-white transition-all duration-200 mx-auto hover:scale-105 disabled:opacity-50"
            >
              <Eraser size={20} />
              <span>{isProcessing ? '✨ Removendo fundo...' : '🎨 Remover Fundo'}</span>
            </button>
          </div>
        )}
        
        {/* Botões de ação */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleClose}
            className="px-8 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 rounded-xl text-white transition-all duration-200 hover:scale-105"
          >
            ❌ Cancelar
          </button>
          
          <button
            onClick={handleConfirm}
            className="px-8 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-400/40 rounded-xl flex items-center space-x-2 text-white transition-all duration-200 hover:scale-105 font-medium"
          >
            <Check size={20} />
            <span>🎉 Adicionar ao Aquário!</span>
          </button>
        </div>
      </div>
    </GlassModal>
  );
}