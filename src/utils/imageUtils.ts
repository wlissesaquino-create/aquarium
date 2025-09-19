export const processImageUpload = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Arquivo deve ser uma imagem'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Erro ao processar arquivo'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
};

export const saveImageToDevice = async (imageData: string, filename: string) => {
  try {
    // Verificar se o browser suporta File System Access API e está em contexto seguro
    if ('showSaveFilePicker' in window && window.isSecureContext) {
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: `${filename}.png`,
        types: [
          {
            description: 'PNG images',
            accept: {
              'image/png': ['.png'],
            },
          },
        ],
      });

      const writable = await fileHandle.createWritable();
      
      // Converter data URL para blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      await writable.write(blob);
      await writable.close();
      
      console.log('Arquivo salvo via File System Access API');
      return true;
    } else {
      // Fallback: download automático
      console.log('Usando fallback de download automático');
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = imageData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'SecurityError') {
      console.warn('SecurityError ao usar showSaveFilePicker, usando fallback');
      // Fallback para anchor download
      try {
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = imageData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      } catch (fallbackError) {
        console.error('Erro no fallback de download:', fallbackError);
        return false;
      }
    } else {
      console.error('Erro ao salvar imagem:', error);
    }
    return false;
  }
};