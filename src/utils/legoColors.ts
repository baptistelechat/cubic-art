import { clearCSVCache, getLocalColorPalette } from "@/services/csvDataService";
import type { LegoColor } from "@/types";

// Fonction pour obtenir la palette de couleurs LEGO depuis les données CSV filtrées
export const getLegoColors = async (): Promise<LegoColor[]> => {
  // Forcer le rechargement des données CSV
  clearCSVCache();
  return getLocalColorPalette();
};

// Palette de couleurs par défaut (vide, sera chargée dynamiquement)
export const LEGO_COLORS: LegoColor[] = [];

// Note: Les fonctions liées aux plaques Technic ont été déplacées vers defaultConfig.ts
// et utilisent maintenant les données CSV au lieu de mappings en dur
// La configuration DEFAULT_MOSAIC_CONFIG est également dans defaultConfig.ts
