import { create } from 'zustand';
import type { LegoColor } from '@/types';
import { getLocalColorPalette } from '@/services/csvDataService';

interface ColorStore {
  // État
  palettes: Map<string, LegoColor[]>;
  isLoading: boolean;
  loadingParts: Set<string>;
  error: string | null;
  
  // Actions
  loadPalette: (partNum: string) => Promise<LegoColor[]>;
  getPalette: (partNum: string) => LegoColor[] | null;
  preloadCommonPalettes: () => Promise<void>;
  clearCache: () => void;
  setError: (error: string | null) => void;
}

// Pièces 1x1 les plus courantes à pré-charger
// Réduit à une seule pièce pour éviter la surcharge au démarrage
const COMMON_1X1_PARTS = ['3024'];

export const useColorStore = create<ColorStore>((set, get) => ({
  // État initial
  palettes: new Map(),
  isLoading: false,
  loadingParts: new Set(),
  error: null,

  // Charger une palette pour une pièce donnée
  loadPalette: async (partNum: string): Promise<LegoColor[]> => {
    const state = get();
    
    // Vérifier si déjà en cache
    const cached = state.palettes.get(partNum);
    if (cached) {

      return cached;
    }

    // Vérifier si déjà en cours de chargement
    if (state.loadingParts.has(partNum)) {

      // Attendre que le chargement se termine
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const currentState = get();
          if (!currentState.loadingParts.has(partNum)) {
            clearInterval(checkInterval);
            const palette = currentState.palettes.get(partNum) || [];
            resolve(palette);
          }
        }, 100);
      });
    }

    try {
      // Marquer comme en cours de chargement
      set((state) => ({
        loadingParts: new Set([...state.loadingParts, partNum]),
        isLoading: true,
        error: null
      }));

  
      
      // Charger depuis les CSV locaux (pas d'appel API)
      const palette = await getLocalColorPalette(partNum);
      
      // Sauvegarder en cache
      set((state) => {
        const newPalettes = new Map(state.palettes);
        newPalettes.set(partNum, palette);
        const newLoadingParts = new Set(state.loadingParts);
        newLoadingParts.delete(partNum);
        
        return {
          palettes: newPalettes,
          loadingParts: newLoadingParts,
          isLoading: newLoadingParts.size > 0,
          error: null
        };
      });

  
      return palette;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error(`❌ Erreur lors du chargement de ${partNum}:`, errorMessage);
      
      // Retirer du loading et définir l'erreur
      set((state) => {
        const newLoadingParts = new Set(state.loadingParts);
        newLoadingParts.delete(partNum);
        
        return {
          loadingParts: newLoadingParts,
          isLoading: newLoadingParts.size > 0,
          error: `Erreur lors du chargement de ${partNum}: ${errorMessage}`
        };
      });
      
      return [];
    }
  },

  // Récupérer une palette depuis le cache (sans appel API)
  getPalette: (partNum: string): LegoColor[] | null => {
    const palette = get().palettes.get(partNum);
    return palette || null;
  },

  // Pré-charger les palettes des pièces courantes
  preloadCommonPalettes: async (): Promise<void> => {
  
    
    try {
      // Charger les pièces courantes (pas de délai nécessaire car pas d'appel API)
      for (const partNum of COMMON_1X1_PARTS) {
        await get().loadPalette(partNum);
  
      }
      
    
    } catch (error) {
      console.error('❌ Erreur lors du pré-chargement:', error);
    }
  },

  // Vider le cache
  clearCache: () => {
  
    set({
      palettes: new Map(),
      isLoading: false,
      loadingParts: new Set(),
      error: null
    });
  },

  // Définir une erreur
  setError: (error: string | null) => {
    set({ error });
  }
}));

// Sélecteurs pour optimiser les re-renders
export const useColorPalette = (partNum: string) => {
  const palette = useColorStore(state => state.palettes.get(partNum));
  const isLoading = useColorStore(state => state.loadingParts.has(partNum));
  const loadPalette = useColorStore(state => state.loadPalette);
  
  return {
    palette: palette || null,
    isLoading,
    loadPalette: () => loadPalette(partNum)
  };
};

export const useColorStoreStatus = () => {
  const isLoading = useColorStore(state => state.isLoading);
  const error = useColorStore(state => state.error);
  const cacheSize = useColorStore(state => state.palettes.size);
  
  return {
    isLoading,
    error,
    cacheSize
  };
};