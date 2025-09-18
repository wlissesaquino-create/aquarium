import { useState } from 'react';
import { Plus, Camera } from 'lucide-react';
import { OceanBackground } from './components/OceanBackground';
import { AquariumLayer, Fish } from './components/AquariumLayer';
import { AnimalTypeSelector } from './components/AnimalTypeSelector';
import { UploadMethodSelector } from './components/UploadMethodSelector';
import { CameraCapture } from './components/CameraCapture';
import { ImageEditor } from './components/ImageEditor';
import { AnimalGallery } from './components/AnimalGallery';
import { useAnimals } from './hooks/useAnimals';
import { AnimalType } from './types/Animal';
import { processImageUpload, saveImageToDevice } from './utils/imageUtils';

function App() {
  const { animals, addAnimal, removeAnimal, getTimeRemaining } = useAnimals();
  
  // Estado dos peixes para o aquário
  const [fishList, setFishList] = useState<Fish[]>([]);
  
  // Estados dos modais
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showMethodSelector, setShowMethodSelector] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  
  // Estados temporários
  const [selectedAnimalType, setSelectedAnimalType] = useState<AnimalType>('fish');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Handlers
  const handleAddAnimal = () => {
    setShowTypeSelector(true);
  };

  const handleSelectType = (type: AnimalType) => {
    setSelectedAnimalType(type);
    setShowTypeSelector(false);
    setShowMethodSelector(true);
  };

  const handleSelectCamera = () => {
    setShowMethodSelector(false);
    setShowCamera(true);
  };

  const handleSelectUpload = () => {
    setShowMethodSelector(false);
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const imageData = await processImageUpload(file);
          setCapturedImage(imageData);
          setShowImageEditor(true);
        } catch (error) {
          console.error('Erro ao processar upload:', error);
          alert('Erro ao processar a imagem. Tente novamente.');
        }
      }
    };
    input.click();
  };

  const handleCameraCapture = (imageData: string) => {
    try {
      // imageData agora é um objeto com image, name e type
      const animalData = JSON.parse(imageData);
      console.log('Dados do animal da câmera:', animalData);
      
      // Adicionar ao sistema de animais (para galeria e controle de tempo)
      addAnimal(animalData.type, animalData.name, animalData.image);
      
      // Adicionar à lista de peixes nadando com parâmetros aleatórios
      const groundHeight = 120;
      const fromLeft = Math.random() < 0.5;
      const direction = fromLeft ? 1 : -1;
      const size = 80 + Math.random() * 140; // 80-220px
      
      let initialY: number;
      if (animalData.type === 'crab') {
        initialY = window.innerHeight * 0.67 + Math.random() * (window.innerHeight * 0.33 - groundHeight - 20);
      } else if (animalData.type === 'jellyfish') {
        initialY = 60 + Math.random() * (window.innerHeight * 0.6 - 60);
      } else {
        initialY = 60 + Math.random() * (window.innerHeight - groundHeight - 210);
      }
      
      const newFish: Fish = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        src: animalData.image,
        name: animalData.name,
        type: animalData.type,
        x: fromLeft ? -size - 50 : window.innerWidth + size + 50,
        y: initialY,
        direction,
        size,
        speed: (0.6 + Math.random() * 2.0) * (120 / size)
      };
      setFishList(prev => [...prev, newFish]);
    } catch (error) {
      console.error('Erro ao processar dados da câmera:', error);
      // Fallback: tratar como string simples
      const defaultName = 'Animal da Câmera';
      addAnimal(selectedAnimalType, defaultName, imageData);
      
      const groundHeight = 120;
      const fromLeft = Math.random() < 0.5;
      const direction = fromLeft ? 1 : -1;
      const size = 80 + Math.random() * 140;
      
      let initialY: number;
      if (selectedAnimalType === 'crab') {
        initialY = window.innerHeight * 0.67 + Math.random() * (window.innerHeight * 0.33 - groundHeight - 20);
      } else if (selectedAnimalType === 'jellyfish') {
        initialY = 60 + Math.random() * (window.innerHeight * 0.6 - 60);
      } else {
        initialY = 60 + Math.random() * (window.innerHeight - groundHeight - 210);
      }
      
      const newFish: Fish = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        src: imageData,
        name: defaultName,
        type: selectedAnimalType,
        x: fromLeft ? -size - 50 : window.innerWidth + size + 50,
        y: initialY,
        direction,
        size,
        speed: (0.6 + Math.random() * 2.0) * (120 / size)
      };
      setFishList(prev => [...prev, newFish]);
    }
    setShowCamera(false);
  };

  const handleImageConfirm = async (name: string, processedImage: string) => {
    console.log('Confirmando imagem:', { name, processedImage: processedImage.substring(0, 50) + '...' });
    
    // Adicionar animal ao aquário
    addAnimal(selectedAnimalType, name, processedImage);
    
    // Adicionar à lista de peixes nadando
    const groundHeight = 120;
    const fromLeft = Math.random() < 0.5;
    const direction = fromLeft ? 1 : -1;
    const size = 80 + Math.random() * 140; // 80-220px
    
    let initialY: number;
    if (selectedAnimalType === 'crab') {
      initialY = window.innerHeight * 0.67 + Math.random() * (window.innerHeight * 0.33 - groundHeight - 20);
    } else if (selectedAnimalType === 'jellyfish') {
      initialY = 60 + Math.random() * (window.innerHeight * 0.6 - 60);
    } else {
      initialY = 60 + Math.random() * (window.innerHeight - groundHeight - 210);
    }
    
    const newFish: Fish = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      src: processedImage,
      name: name,
      type: selectedAnimalType,
      x: fromLeft ? -size - 50 : window.innerWidth + size + 50,
      y: initialY,
      direction,
      size,
      speed: (0.6 + Math.random() * 2.0) * (120 / size)
    };
    setFishList(prev => [...prev, newFish]);
    
    // Salvar imagem no dispositivo
    const success = await saveImageToDevice(
      processedImage,
      `aquario_${name.replace(/\s+/g, '_')}_${Date.now()}`
    );
    
    if (success) {
      console.log('Imagem salva no dispositivo!');
    }
    
    // Resetar estados
    setCapturedImage(null);
    setShowImageEditor(false);
    
    console.log('Peixe adicionado à lista:', newFish);
  };

  const handleCloseModals = () => {
    setShowTypeSelector(false);
    setShowMethodSelector(false);
    setShowCamera(false);
    setShowImageEditor(false);
    setCapturedImage(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden font-nunito">
      {/* Fundo oceânico animado */}
      <OceanBackground layer="back" />
      
      {/* Animais do aquário */}
      <AquariumLayer fishes={fishList} />
      
      {/* Botões flutuantes */}
      <div className="fixed inset-0 z-30 pointer-events-none">
        <button
          onClick={handleAddAnimal}
          className="fixed top-6 left-6 w-14 h-14 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110 pointer-events-auto z-40"
        >
          <Plus size={24} />
        </button>
        
        {/* Botão galeria */}
        <button
          onClick={() => setShowGallery(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110 pointer-events-auto z-40"
        >
          <Camera size={24} />
        </button>
      </div>
      
      {/* Modais */}
      <AnimalTypeSelector
        isOpen={showTypeSelector}
        onClose={handleCloseModals}
        onSelectType={handleSelectType}
      />
      
      <UploadMethodSelector
        isOpen={showMethodSelector}
        onClose={handleCloseModals}
        animalType={selectedAnimalType}
        onSelectCamera={handleSelectCamera}
        onSelectUpload={handleSelectUpload}
      />
      
      <CameraCapture
        isOpen={showCamera}
        onClose={handleCloseModals}
        onCapture={handleCameraCapture}
        animalType={selectedAnimalType}
      />
      
      <ImageEditor
        isOpen={showImageEditor}
        onClose={handleCloseModals}
        imageData={capturedImage}
        animalType={selectedAnimalType}
        onConfirm={handleImageConfirm}
      />
      
      <AnimalGallery
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        animals={animals}
        onRemoveAnimal={removeAnimal}
        getTimeRemaining={getTimeRemaining}
      />
    </div>
  );
}

export default App;