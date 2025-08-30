import { create } from 'zustand';
import type { MosaicImageData, MosaicResult, MosaicConfig, AppState } from '@/types';
import { DEFAULT_MOSAIC_CONFIG } from '@/utils/legoColors';

interface StoreActions {
  setCurrentImage: (image: MosaicImageData | null) => void;
  setMosaicResult: (result: MosaicResult | null) => void;
  setIsProcessing: (processing: boolean) => void;
  updateConfig: (config: Partial<MosaicConfig>) => void;
  addToGallery: (image: MosaicImageData) => void;
  removeFromGallery: (imageId: string) => void;
  clearGallery: () => void;
  reset: () => void;
}

type Store = AppState & StoreActions;

const initialState: AppState = {
  currentImage: null,
  mosaicResult: null,
  isProcessing: false,
  config: DEFAULT_MOSAIC_CONFIG,
  gallery: []
};

export const useStore = create<Store>((set) => ({
  ...initialState,
  
  setCurrentImage: (image) => set({ currentImage: image }),
  
  setMosaicResult: (result) => set({ mosaicResult: result }),
  
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  
  updateConfig: (configUpdate) => set((state) => ({
    config: { ...state.config, ...configUpdate }
  })),
  
  addToGallery: (image) => set((state) => {
    const exists = state.gallery.find(img => img.id === image.id);
    if (exists) return state;
    
    return {
      gallery: [image, ...state.gallery].slice(0, 50) // Limite à 50 images
    };
  }),
  
  removeFromGallery: (imageId) => set((state) => ({
    gallery: state.gallery.filter(img => img.id !== imageId)
  })),
  
  clearGallery: () => set({ gallery: [] }),
  
  reset: () => set(initialState)
}));

// Hook personnalisé pour les actions fréquentes
export const useImageProcessing = () => {
  const { setCurrentImage, setMosaicResult, setIsProcessing } = useStore();
  
  const startProcessing = (image: MosaicImageData) => {
    setCurrentImage(image);
    setIsProcessing(true);
    setMosaicResult(null);
  };
  
  const completeProcessing = (result: MosaicResult) => {
    setMosaicResult(result);
    setIsProcessing(false);
  };
  
  const cancelProcessing = () => {
    setIsProcessing(false);
    setMosaicResult(null);
  };
  
  return {
    startProcessing,
    completeProcessing,
    cancelProcessing
  };
};

// Sélecteurs pour optimiser les re-renders
export const useCurrentImage = () => useStore(state => state.currentImage);
export const useMosaicResult = () => useStore(state => state.mosaicResult);
export const useIsProcessing = () => useStore(state => state.isProcessing);
export const useConfig = () => useStore(state => state.config);
export const useGallery = () => useStore(state => state.gallery);