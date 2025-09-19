import { useRef, useEffect, useState } from 'react';
import { Camera, RotateCcw, Check, Scissors, Edit3 } from 'lucide-react';
import { GlassModal } from './GlassModal';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
  animalType: string;
}

const animalNames = {
  fish: 'Peixinho',
  jellyfish: 'Água-viva',
  crab: 'Caranguejo'
};

export function CameraCapture({ isOpen, onClose, onCapture, animalType }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNaming, setShowNaming] = useState(false);
  const [animalName, setAnimalName] = useState('');

  useEffect(() => {
    if (isOpen && !capturedImage && !processedImage) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage, processedImage]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
      
      handleCameraError(error);
    }
  };

  const handleCameraError = async (error: any) => {
    if (error instanceof Error && error.name === 'NotReadableError') {
      // Câmera em uso por outro app
      const shouldRetry = confirm(
        'A câmera está sendo usada por outro aplicativo. ' +
        'Feche outros aplicativos que usam a câmera e clique OK para tentar novamente, ' +
        'ou Cancelar para usar upload de arquivo.'
      );
      
      if (shouldRetry) {
        // Tentar novamente após 2 segundos
        setTimeout(() => {
          startCamera();
        }, 2000);
        return;
      } else {
        // Fallback para upload
        alert('Redirecionando para upload de arquivo...');
        onClose();
        // Aqui poderia chamar um callback para abrir o upload
        return;
      }
    } else if (error instanceof Error && error.name === 'NotAllowedError') {
      alert('Permissão de câmera negada. Verifique as configurações do navegador.');
    } else {
      alert('Não foi possível acessar a câmera. Tente usar upload de arquivo.');
    }
    
    // Enumerar dispositivos para diagnóstico
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('Dispositivos disponíveis:', devices);
    } catch (enumError) {
      console.error('Erro ao enumerar dispositivos:', enumError);
    }
    
    onClose();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Limitar tamanho para evitar problemas de memória
        const maxSize = 1024;
        const videoAspect = video.videoWidth / video.videoHeight;
        
        if (video.videoWidth > video.videoHeight) {
          canvas.width = Math.min(maxSize, video.videoWidth);
          canvas.height = canvas.width / videoAspect;
        } else {
          canvas.height = Math.min(maxSize, video.videoHeight);
          canvas.width = canvas.height * videoAspect;
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        console.log('Imagem capturada, tamanho:', imageData.length, 'chars');
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const removeBackground = async () => {
    if (!capturedImage) return;
    
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
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Algoritmo de remoção de fundo melhorado
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
        
        ctx.putImageData(imageData, 0, 0);
        const processedDataUrl = canvas.toDataURL('image/png');
        console.log('Fundo removido, novo tamanho:', processedDataUrl.length, 'chars');
        setProcessedImage(processedDataUrl);
        setIsProcessing(false);
      };
      
      img.src = capturedImage;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      setIsProcessing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setProcessedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    setShowNaming(true);
  };

  const handleFinalConfirm = () => {
    const finalImage = processedImage || capturedImage;
    const finalName = animalName.trim() || getDefaultName();
    
    if (finalImage) {
      // Criar um objeto JSON com os dados necessários
      const animalData = {
        image: finalImage,
        name: finalName,
        type: animalType
      };
      
      console.log('Enviando dados da câmera:', animalData);
      onCapture(JSON.stringify(animalData));
      
      // Reset todos os estados
      setCapturedImage(null);
      setProcessedImage(null);
      setShowNaming(false);
      setAnimalName('');
    }
  };

  const getDefaultName = () => {
    const defaultNames = {
      fish: ['Nemo', 'Dory', 'Bubbles', 'Finn'],
      jellyfish: ['Luna', 'Coral', 'Neptune', 'Jelly'],
      crab: ['Sebastian', 'Sandy', 'Pincer', 'Scuttle']
    };
    
    const names = defaultNames[animalType as keyof typeof defaultNames] || defaultNames.fish;
    return names[Math.floor(Math.random() * names.length)];
  };

  const handleClose = () => {
    setCapturedImage(null);
    setProcessedImage(null);
    setShowNaming(false);
    setAnimalName('');
    stopCamera();
    onClose();
  };

  // Se estiver na tela de nomeação
  if (showNaming) {
    return (
      <GlassModal isOpen={isOpen} onClose={handleClose} className="w-[500px] p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            <Edit3 className="inline-block mr-2" size={24} />
            Personalize seu {animalNames[animalType as keyof typeof animalNames]}
          </h2>
          
          {/* Preview da imagem final */}
          <div className="mb-6">
            <img
              src={processedImage || capturedImage || ''}
              alt="Animal capturado"
              className="w-full h-60 object-contain bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border-2 border-blue-400/40"
            />
          </div>
          
          {/* Campo nome */}
          <div className="mb-6">
            <label className="block text-white text-lg font-medium mb-2">
              💫 Dê um nome especial ao seu {animalNames[animalType as keyof typeof animalNames]?.toLowerCase()}:
            </label>
            <input
              type="text"
              value={animalName}
              onChange={(e) => setAnimalName(e.target.value)}
              placeholder={`Ex: ${getDefaultName()}`}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:bg-white/20 focus:border-blue-400/60 focus:outline-none transition-all duration-200 text-center text-lg font-medium"
              maxLength={20}
              autoFocus
            />
          </div>
          
          {/* Botões de ação */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowNaming(false)}
              className="px-8 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/40 rounded-xl text-white transition-all duration-200 hover:scale-105"
            >
              ⬅️ Voltar
            </button>
            
            <button
              onClick={handleFinalConfirm}
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
  return (
    <GlassModal isOpen={isOpen} onClose={handleClose} className="w-[500px] p-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-4">
          📸 Capturar {animalNames[animalType as keyof typeof animalNames]}
        </h2>
        
        <div className="relative mb-6">
          {!capturedImage && !processedImage ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-80 bg-black/50 rounded-xl object-cover"
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {capturedImage && (
                  <div>
                    <p className="text-white text-sm mb-2">Original</p>
                    <img
                      src={capturedImage}
                      alt="Original"
                      className="w-full h-40 rounded-xl object-cover border-2 border-white/20"
                    />
                  </div>
                )}
                {processedImage && (
                  <div>
                    <p className="text-white text-sm mb-2">Sem Fundo</p>
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="w-full h-40 rounded-xl object-cover border-2 border-green-400/60 bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        <div className="flex justify-center space-x-4">
          {!capturedImage && !processedImage ? (
            <button
              onClick={capturePhoto}
              className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 rounded-full flex items-center space-x-2 text-white transition-colors duration-200"
            >
              <Camera size={20} />
              <span>Capturar</span>
            </button>
          ) : capturedImage && !processedImage ? (
            <>
              <button
                onClick={retakePhoto}
                className="px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/40 rounded-full flex items-center space-x-2 text-white transition-colors duration-200"
              >
                <RotateCcw size={20} />
                <span>Refazer</span>
              </button>
              
              <button
                onClick={removeBackground}
                disabled={isProcessing}
                className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 rounded-full flex items-center space-x-2 text-white transition-colors duration-200 disabled:opacity-50"
              >
                <Scissors size={20} />
                <span>{isProcessing ? 'Processando...' : 'Remover Fundo'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                className="px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/40 rounded-full flex items-center space-x-2 text-white transition-colors duration-200"
              >
                <RotateCcw size={20} />
                <span>Refazer</span>
              </button>
              
              <button
                onClick={confirmPhoto}
                className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-400/40 rounded-full flex items-center space-x-2 text-white transition-colors duration-200"
              >
               <Edit3 size={20} />
               <span>Continuar</span>
              </button>
            </>
          )}
        </div>
      </div>
    </GlassModal>
  );
}