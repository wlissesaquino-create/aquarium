import { useRef, useEffect, useState } from 'react';
import { Camera, RotateCcw, Check, Scissors } from 'lucide-react';
import { GlassModal } from './GlassModal';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export function CameraCapture({ isOpen, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
      onClose();
    }
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
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/png');
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

        canvas.width = img.width;
        canvas.height = img.height;
        
        // Desenhar a imagem original
        ctx.drawImage(img, 0, 0);
        
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
    const finalImage = processedImage || capturedImage;
    if (finalImage) {
      onCapture(finalImage);
      setCapturedImage(null);
      setProcessedImage(null);
      onClose();
    }
  };

  const handleClose = () => {
    setCapturedImage(null);
    setProcessedImage(null);
    stopCamera();
    onClose();
  };

  return (
    <GlassModal isOpen={isOpen} onClose={handleClose} className="w-[500px] p-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-4">
          Capturar Foto
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
                <Check size={20} />
                <span>Confirmar</span>
              </button>
            </>
          )}
        </div>
      </div>
    </GlassModal>
  );
}