import type { LegoColor } from "@/types";

/**
 * Service pour gérer les données CSV locales LEGO
 * Fournit un accès rapide et fiable aux données de couleurs et pièces
 */

interface CSVColor {
  id: number;
  name: string;
  rgb: string; // Format hex sans # (ex: "05131D")
  is_trans: boolean;
  num_parts: number;
  num_sets: number;
  y1: number;
  y2: number;
}

interface CSVInventoryPart {
  inventory_id: number;
  part_num: string;
  color_id: number;
  quantity: number;
  is_spare: boolean;
  img_url: string;
}

interface CSVElement {
  element_id: string;
  part_num: string;
  color_id: number;
  design_id: string;
}

// Cache pour les données CSV
let colorsCache: Map<number, CSVColor> | null = null;
let inventoryPartsCache: Map<string, CSVInventoryPart[]> | null = null;
let elementsCache: Map<string, string> | null = null; // (part_num-color_id) -> element_id

/**
 * Parse une ligne CSV en tenant compte des guillemets
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

/**
 * Charge et parse le fichier colors.csv
 */
const loadColors = async (): Promise<Map<number, CSVColor>> => {
  if (colorsCache) {
    return colorsCache;
  }

  try {
    console.log("📊 Chargement du fichier colors.csv...");
    const response = await fetch("/data/colors.csv");

    if (!response.ok) {
      throw new Error(
        `Erreur lors du chargement de colors.csv: ${response.status}`
      );
    }

    const csvText = await response.text();
    const lines = csvText.split("\n").filter((line) => line.trim());

    // Ignorer la première ligne (headers)
    const headers = parseCSVLine(lines[0]);
    console.log("📋 Headers colors.csv:", headers);

    colorsCache = new Map();

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      if (values.length >= 8) {
        const color: CSVColor = {
          id: parseInt(values[0], 10),
          name: values[1],
          rgb: values[2], // Déjà en format hex sans #
          is_trans: values[3].toLowerCase() === "true",
          num_parts: parseInt(values[4], 10) || 0,
          num_sets: parseInt(values[5], 10) || 0,
          y1: parseInt(values[6], 10) || 0,
          y2: parseInt(values[7], 10) || 0,
        };

        colorsCache.set(color.id, color);
      }
    }

    console.log(`✅ ${colorsCache.size} couleurs chargées depuis colors.csv`);
    return colorsCache;
  } catch (error) {
    console.error("❌ Erreur lors du chargement de colors.csv:", error);
    throw error;
  }
};

/**
 * Charge et parse le fichier inventory_parts.csv
 */
const loadInventoryParts = async (): Promise<
  Map<string, CSVInventoryPart[]>
> => {
  if (inventoryPartsCache) {
    return inventoryPartsCache;
  }

  try {
    console.log("📊 Chargement du fichier inventory_parts.csv...");
    const response = await fetch("/data/inventory_parts.csv");

    if (!response.ok) {
      throw new Error(
        `Erreur lors du chargement de inventory_parts.csv: ${response.status}`
      );
    }

    const csvText = await response.text();
    const lines = csvText.split("\n").filter((line) => line.trim());

    // Ignorer la première ligne (headers)
    const headers = parseCSVLine(lines[0]);
    console.log("📋 Headers inventory_parts.csv:", headers);

    inventoryPartsCache = new Map();

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      if (values.length >= 6) {
        const inventoryPart: CSVInventoryPart = {
          inventory_id: parseInt(values[0], 10),
          part_num: values[1],
          color_id: parseInt(values[2], 10),
          quantity: parseInt(values[3], 10),
          is_spare: values[4].toLowerCase() === "true",
          img_url: values[5] || "",
        };

        // Grouper par part_num
        if (!inventoryPartsCache.has(inventoryPart.part_num)) {
          inventoryPartsCache.set(inventoryPart.part_num, []);
        }

        inventoryPartsCache.get(inventoryPart.part_num)!.push(inventoryPart);
      }
    }

    console.log(
      `✅ ${inventoryPartsCache.size} pièces chargées depuis inventory_parts.csv`
    );
    return inventoryPartsCache;
  } catch (error) {
    console.error(
      "❌ Erreur lors du chargement de inventory_parts.csv:",
      error
    );
    throw error;
  }
};

/**
 * Charge et parse le fichier elements.csv
 */
const loadElements = async (): Promise<Map<string, string>> => {
  if (elementsCache) {
    return elementsCache;
  }

  try {
    console.log("📊 Chargement du fichier elements.csv...");
    const response = await fetch("/data/elements.csv");

    if (!response.ok) {
      throw new Error(
        `Erreur lors du chargement de elements.csv: ${response.status}`
      );
    }

    const csvText = await response.text();
    const lines = csvText.split("\n").filter((line) => line.trim());

    // Ignorer la première ligne (headers)
    const headers = parseCSVLine(lines[0]);
    console.log("📋 Headers elements.csv:", headers);

    elementsCache = new Map();

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);

      if (values.length >= 4) {
        const element: CSVElement = {
          element_id: values[0],
          part_num: values[1],
          color_id: parseInt(values[2], 10),
          design_id: values[3] || "",
        };

        // Créer la clé part_num-color_id
        const key = `${element.part_num}-${element.color_id}`;
        elementsCache.set(key, element.element_id);
      }
    }

    console.log(
      `✅ ${elementsCache.size} éléments chargés depuis elements.csv`
    );
    return elementsCache;
  } catch (error) {
    console.error("❌ Erreur lors du chargement de elements.csv:", error);
    throw error;
  }
};

/**
 * Convertit une couleur RGB hex en format [r, g, b]
 */
const hexToRgbArray = (hex: string): [number, number, number] => {
  // Assurer que le hex commence par #
  if (!hex.startsWith("#")) {
    hex = "#" + hex;
  }

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
};

/**
 * Récupère les couleurs disponibles pour une pièce donnée depuis les CSV locaux
 * @param partNum Numéro de la pièce (ex: '3024')
 * @returns Promise avec la liste des couleurs disponibles
 */
export const getLocalColorPalette = async (
  partNum: string = "3024"
): Promise<LegoColor[]> => {
  try {
    console.log(
      `🎨 Récupération de la palette locale pour la pièce ${partNum}`
    );

    // Charger les données CSV
    const [colors, inventoryParts] = await Promise.all([
      loadColors(),
      loadInventoryParts(),
    ]);

    // Récupérer les couleurs disponibles pour cette pièce
    const partInventory = inventoryParts.get(partNum) || [];

    if (partInventory.length === 0) {
      console.warn(
        `⚠️ Aucune couleur trouvée pour la pièce ${partNum} dans inventory_parts.csv`
      );
      return [];
    }

    // Créer un Set pour éviter les doublons de couleurs
    const uniqueColorIds = new Set(
      partInventory
        .filter((item) => !item.is_spare) // Exclure les pièces de rechange
        .map((item) => item.color_id)
    );

    console.log(
      `🔍 ${uniqueColorIds.size} couleurs uniques trouvées pour ${partNum}`
    );

    // Convertir en format LegoColor
    const legoColors: LegoColor[] = [];

    for (const colorId of uniqueColorIds) {
      const colorData = colors.get(colorId);

      if (colorData) {
        // Filtrer les couleurs transparentes (is_trans = true)
        if (colorData.is_trans) {
          console.log(`🚫 Couleur transparente exclue: ${colorData.name}`);
          continue;
        }

        const hex = colorData.rgb.startsWith("#")
          ? colorData.rgb
          : `#${colorData.rgb}`;
        const rgb = hexToRgbArray(colorData.rgb);

        legoColors.push({
          id: colorData.id,
          name: colorData.name,
          hex: hex,
          rgb: rgb,
        });
      } else {
        console.warn(`⚠️ Couleur ${colorId} non trouvée dans colors.csv`);
      }
    }

    // Trier par nom pour un affichage cohérent
    legoColors.sort((a, b) => a.name.localeCompare(b.name));

    const transparentCount = uniqueColorIds.size - legoColors.length;
    console.log(
      `✅ Palette locale chargée: ${legoColors.length} couleurs opaques (${transparentCount} transparentes exclues)`
    );

    return legoColors;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération de la palette locale:",
      error
    );
    throw error;
  }
};

/**
 * Récupère les informations d'une couleur par son ID depuis les CSV locaux
 * @param colorId ID de la couleur
 * @returns Promise avec les informations de la couleur ou null
 */
export const getLocalColor = async (
  colorId: number
): Promise<LegoColor | null> => {
  try {
    const colors = await loadColors();
    const colorData = colors.get(colorId);

    if (!colorData) {
      return null;
    }

    const hex = colorData.rgb.startsWith("#")
      ? colorData.rgb
      : `#${colorData.rgb}`;
    const rgb = hexToRgbArray(colorData.rgb);

    return {
      id: colorData.id,
      name: colorData.name,
      hex: hex,
      rgb: rgb,
    };
  } catch (error) {
    console.error(
      `❌ Erreur lors de la récupération de la couleur ${colorId}:`,
      error
    );
    return null;
  }
};

/**
 * Récupère l'element_id LEGO pour une pièce et une couleur données
 * @param partNum Numéro de la pièce (ex: '3024')
 * @param colorId ID de la couleur LEGO
 * @returns Promise avec l'element_id ou null si non trouvé
 */
export const getLocalElementId = async (
  partNum: string,
  colorId: number
): Promise<string | null> => {
  try {
    const elements = await loadElements();
    const key = `${partNum}-${colorId}`;
    return elements.get(key) || null;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la récupération de l'element_id pour ${partNum}-${colorId}:`,
      error
    );
    return null;
  }
};

/**
 * Récupère plusieurs element_id en lot
 * @param items Liste des pièces avec couleurs
 * @returns Promise avec un map des element_ids par pièce/couleur
 */
export const getLocalBulkElementIds = async (
  items: Array<{ partNum: string; colorId: number }>
): Promise<Map<string, string>> => {
  try {
    const elements = await loadElements();
    const elementIdsMap = new Map<string, string>();

    for (const { partNum, colorId } of items) {
      const key = `${partNum}-${colorId}`;
      const elementId = elements.get(key);

      if (elementId) {
        elementIdsMap.set(key, elementId);
      }
    }

    console.log(`📦 ${elementIdsMap.size}/${items.length} element_ids trouvés`);
    return elementIdsMap;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération en lot des element_ids:",
      error
    );
    return new Map();
  }
};

/**
 * Récupère les couleurs disponibles pour la pièce 65803 (Plaque de base Technic 16x16)
 * @returns Promise avec la liste des couleurs disponibles pour les plaques Technic
 */
export const getTechnicPlateColors = async (): Promise<LegoColor[]> => {
  try {
    console.log("🔧 Récupération des couleurs pour la plaque Technic 16x16 (65803)");
    
    // Utiliser la fonction existante pour récupérer les couleurs de la pièce 65803
    const colors = await getLocalColorPalette("65803");
    
    // Trier par ID pour un affichage cohérent
    const sortedColors = colors.sort((a, b) => a.id - b.id);
    
    console.log(`✅ ${sortedColors.length} couleurs trouvées pour la plaque 65803:`, 
      sortedColors.map(c => `${c.name} (${c.id})`).join(", "));
    
    return sortedColors;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des couleurs de la plaque Technic:", error);
    // Retourner une couleur par défaut en cas d'erreur
    return [{
      id: 0,
      name: "Black",
      hex: "#05131D",
      rgb: [5, 19, 29]
    }];
  }
};

/**
 * Récupère les couleurs disponibles pour la pièce 61332 (Connecteur Technic)
 * @returns Promise avec la liste des couleurs disponibles pour les connecteurs Technic
 */
export const getTechnicConnectorColors = async (): Promise<LegoColor[]> => {
  try {
    console.log("🔧 Récupération des couleurs pour le connecteur Technic (61332)");
    
    // Utiliser la fonction existante pour récupérer les couleurs de la pièce 61332
    const colors = await getLocalColorPalette("61332");
    
    // Trier par ID pour un affichage cohérent
    const sortedColors = colors.sort((a, b) => a.id - b.id);
    
    console.log(`✅ ${sortedColors.length} couleurs trouvées pour le connecteur 61332:`, 
      sortedColors.map(c => `${c.name} (${c.id})`).join(", "));
    
    return sortedColors;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des couleurs du connecteur Technic:", error);
    // Retourner une couleur par défaut en cas d'erreur
    return [{
      id: 0,
      name: "Black",
      hex: "#05131D",
      rgb: [5, 19, 29]
    }];
  }
};

/**
 * Vide le cache des données CSV (utile pour forcer un rechargement)
 */
export const clearCSVCache = (): void => {
  colorsCache = null;
  inventoryPartsCache = null;
  elementsCache = null;
  console.log("🗑️ Cache CSV vidé");
};

/**
 * Récupère les statistiques du cache CSV
 */
export const getCSVCacheStats = (): {
  colors: number;
  parts: number;
  elements: number;
} => {
  return {
    colors: colorsCache?.size || 0,
    parts: inventoryPartsCache?.size || 0,
    elements: elementsCache?.size || 0,
  };
};
