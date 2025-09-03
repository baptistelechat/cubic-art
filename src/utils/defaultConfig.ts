import type { LegoColor, MosaicConfig } from "@/types";
import { getTechnicPlateColors } from "@/services/csvDataService";

// Configuration par défaut de la mosaïque utilisant les données CSV locales
export const DEFAULT_MOSAIC_CONFIG: MosaicConfig = {
  width: 48 as const,
  height: 48 as const,
  colorPalette: [], // Sera rempli dynamiquement par les données locales
  brickType: "1x1" as const,
  showModuleGrid: false,
};

/**
 * Récupère la couleur appropriée pour une plaque Technic 16x16
 * Utilise les données CSV pour trouver la couleur correspondante disponible
 * @param originalColor Couleur d'origine
 * @returns Promise avec la couleur appropriée pour la plaque Technic
 */
export const createTechnicPlateColor = async (
  originalColor: LegoColor
): Promise<LegoColor> => {
  try {
    // Récupérer les couleurs disponibles pour les plaques Technic depuis les CSV
    const availableColors = await getTechnicPlateColors();
    
    // Chercher une couleur correspondante par ID
    const exactMatch = availableColors.find(color => color.id === originalColor.id);
    if (exactMatch) {
      return exactMatch;
    }
    
    // Chercher une couleur correspondante par nom
    const nameMatch = availableColors.find(color => 
      color.name.toLowerCase() === originalColor.name.toLowerCase()
    );
    if (nameMatch) {
      return nameMatch;
    }
    
    // Si aucune correspondance, retourner la première couleur disponible (généralement Black)
    return availableColors[0] || originalColor;
  } catch (error) {
    console.error("Erreur lors de la récupération de la couleur Technic:", error);
    // En cas d'erreur, retourner la couleur d'origine
    return originalColor;
  }
};
