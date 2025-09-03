import type { LegoColor } from "@/types";

/**
 * Service pour gérer les données CSV locales LEGO
 * Fournit un accès rapide et fiable aux données de couleurs et pièces
 */

interface CSVInventoryPart {
  inventory_id: number;
  part_num: string;
  color_id: number;
  quantity: number;
  is_spare: boolean;
}

// Cache pour les données CSV
let colorsCache: Map<number, LegoColor> | null = null;
let inventoryPartsCache: Map<string, CSVInventoryPart[]> | null = null;
let elementsCache: Map<string, string> | null = null; // (part_num-color_id) -> element_id

/**
 * Charge et parse les fichiers colors.csv (principal + splittés)
 */
export const loadColors = async (): Promise<Map<number, LegoColor>> => {
  if (colorsCache && colorsCache.size > 0) {
    return colorsCache;
  }

  try {
    const rows = await loadProjectCSVFiles("colors.csv");
    const headers = rows[0];
    const idIndex = headers.indexOf("id");
    const nameIndex = headers.indexOf("name");
    const rgbIndex = headers.indexOf("rgb");
    const isTransIndex = headers.indexOf("is_trans");

    colorsCache = new Map();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length > Math.max(idIndex, nameIndex, rgbIndex, isTransIndex)) {
        const colorId = parseInt(row[idIndex], 10);
        const hex = row[rgbIndex].startsWith("#")
          ? row[rgbIndex]
          : `#${row[rgbIndex]}`;
        const rgbArray = hexToRgbArray(row[rgbIndex]);

        const color: LegoColor = {
          id: colorId,
          name: row[nameIndex],
          hex: hex,
          rgb: rgbArray,
        };
        colorsCache.set(colorId, color);
      }
    }

    return colorsCache;
  } catch (error) {
    console.error("Erreur lors du chargement des couleurs:", error);
    throw error;
  }
};

// Fonction pour charger les fichiers CSV spécifiques du projet
const loadProjectCSVFiles = async (fileName: string): Promise<string[][]> => {
  try {
    const response = await fetch(`/data/${fileName}`);

    if (!response.ok) {
      throw new Error(`Fichier ${fileName} non trouvé`);
    }

    const text = await response.text();
    const rows = text
      .split("\n")
      .filter((row) => row.trim() !== "") // Filtrer les lignes vides
      .map((row) => row.split(","));

    return rows;
  } catch (error) {
    console.error(`Erreur lors du chargement du fichier ${fileName}:`, error);
    throw error;
  }
};

// Fonction pour fusionner les fichiers inventory_parts splittés
const loadInventoryPartsSplit = async (): Promise<string[][]> => {
  try {
    const [file1Data, file2Data] = await Promise.all([
      loadProjectCSVFiles("inventory_parts_1.csv"),
      loadProjectCSVFiles("inventory_parts_2.csv"),
    ]);

    // Fusionner les données : en-tête du premier fichier + données des deux fichiers
    const header = file1Data[0];
    const data1 = file1Data.slice(1);
    const data2 = file2Data.slice(1); // Exclure l'en-tête du second fichier

    return [header, ...data1, ...data2];
  } catch (error) {
    console.error(
      "Erreur lors du chargement des fichiers inventory_parts splittés:",
      error
    );
    throw error;
  }
};

// Fonction pour charger et parser les inventory_parts avec la nouvelle logique
export const loadInventoryParts = async (): Promise<
  Map<string, CSVInventoryPart[]>
> => {
  if (inventoryPartsCache) {
    return inventoryPartsCache;
  }

  try {
    const rows = await loadInventoryPartsSplit();
    const headers = rows[0];
    const inventoryIdIndex = headers.indexOf("inventory_id");
    const partNumIndex = headers.indexOf("part_num");
    const colorIdIndex = headers.indexOf("color_id");
    const quantityIndex = headers.indexOf("quantity");
    const isSpareIndex = headers.indexOf("is_spare");

    inventoryPartsCache = new Map();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (
        row.length >
        Math.max(
          inventoryIdIndex,
          partNumIndex,
          colorIdIndex,
          quantityIndex,
          isSpareIndex
        )
      ) {
        const part: CSVInventoryPart = {
          inventory_id: parseInt(row[inventoryIdIndex], 10),
          part_num: row[partNumIndex],
          color_id: parseInt(row[colorIdIndex], 10),
          quantity: parseInt(row[quantityIndex], 10) || 0,
          is_spare: row[isSpareIndex] === "t",
        };

        if (!inventoryPartsCache.has(part.part_num)) {
          inventoryPartsCache.set(part.part_num, []);
        }
        inventoryPartsCache.get(part.part_num)!.push(part);
      }
    }

    return inventoryPartsCache;
  } catch (error) {
    console.error("Erreur lors du chargement des pièces d'inventaire:", error);
    throw error;
  }
};

/**
 * Charge et parse les fichiers elements.csv (principal + splittés)
 */
export const loadElements = async (): Promise<Map<string, string>> => {
  if (elementsCache) {
    return elementsCache;
  }

  try {
    const rows = await loadProjectCSVFiles("elements.csv");
    const headers = rows[0];
    const elementIdIndex = headers.indexOf("element_id");
    const partNumIndex = headers.indexOf("part_num");
    const colorIdIndex = headers.indexOf("color_id");

    elementsCache = new Map();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length > Math.max(elementIdIndex, partNumIndex, colorIdIndex)) {
        const key = `${row[partNumIndex]}-${row[colorIdIndex]}`;
        elementsCache.set(key, row[elementIdIndex]);
      }
    }

    return elementsCache;
  } catch (error) {
    console.error("Erreur lors du chargement des éléments:", error);
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

    // Convertir en format LegoColor
    const legoColors: LegoColor[] = [];

    for (const colorId of uniqueColorIds) {
      const colorData = colors.get(colorId);

      if (colorData) {
        // Filtrer les couleurs transparentes (nom commençant par "Trans-")
        if (colorData.name.startsWith("Trans-")) {
          continue;
        }

        legoColors.push(colorData);
      } else {
        console.warn(`⚠️ Couleur ${colorId} non trouvée dans colors.csv`);
      }
    }

    // Trier par nom pour un affichage cohérent
    legoColors.sort((a, b) => a.name.localeCompare(b.name));

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

    return colorData;
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
    // Utiliser la fonction existante pour récupérer les couleurs de la pièce 65803
    const colors = await getLocalColorPalette("65803");

    // Trier par ID pour un affichage cohérent
    const sortedColors = colors.sort((a, b) => a.id - b.id);

    return sortedColors;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des couleurs de la plaque Technic:",
      error
    );
    // Retourner une couleur par défaut en cas d'erreur
    return [
      {
        id: 0,
        name: "Black",
        hex: "#05131D",
        rgb: [5, 19, 29],
      },
    ];
  }
};

/**
 * Récupère les couleurs disponibles pour la pièce 61332 (Connecteur Technic)
 * @returns Promise avec la liste des couleurs disponibles pour les connecteurs Technic
 */
export const getTechnicConnectorColors = async (): Promise<LegoColor[]> => {
  try {
    // Utiliser la fonction existante pour récupérer les couleurs de la pièce 61332
    const colors = await getLocalColorPalette("61332");

    // Trier par ID pour un affichage cohérent
    const sortedColors = colors.sort((a, b) => a.id - b.id);

    return sortedColors;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la récupération des couleurs du connecteur Technic:",
      error
    );
    // Retourner une couleur par défaut en cas d'erreur
    return [
      {
        id: 0,
        name: "Black",
        hex: "#05131D",
        rgb: [5, 19, 29],
      },
    ];
  }
};

/**
 * Vide le cache des données CSV (utile pour forcer un rechargement)
 */
export const clearCSVCache = (): void => {
  colorsCache = null;
  inventoryPartsCache = null;
  elementsCache = null;
};

/**
 * Récupère les statistiques du cache CSV
 */
export const getCSVCacheStats = (): {
  colors: number | null;
  inventoryParts: number | null;
  elements: number | null;
} => {
  return {
    colors: colorsCache?.size || null,
    inventoryParts: inventoryPartsCache?.size || null,
    elements: elementsCache?.size || null,
  };
};
