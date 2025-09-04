import type { LegoColor } from "@/types";

/**
 * Service pour gérer les données CSV locales LEGO
 * Fournit un accès rapide et fiable aux données de couleurs et pièces
 */

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
let colorMappingCache: Map<number, number> | null = null; // Rebrickable ID -> BrickLink ID

// Fonction pour vider le cache des elements
export const clearElementsCache = (): void => {
  elementsCache = null;
};

// Fonction pour vider le cache de mapping des couleurs
export const clearColorMappingCache = (): void => {
  colorMappingCache = null;
};

/**
 * Parse une ligne CSV en gérant les guillemets et les virgules imbriquées
 * @param line Ligne CSV à parser
 * @returns Array des colonnes
 */
const parseCSVLine = (line: string): string[] => {
  const columns: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      columns.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Ajouter la dernière colonne
  columns.push(current.trim());

  return columns;
};

/**
 * Vide TOUS les caches CSV pour forcer un rechargement complet
 */
export const clearAllCaches = (): void => {
  colorsCache = null;
  inventoryPartsCache = null;
  elementsCache = null;
  colorMappingCache = null;
};

// Alias pour la compatibilité
export const clearCSVCache = clearAllCaches;

/**
 * Charge et parse le fichier colors_mapping.csv (données complètes de Rebrickable)
 * @returns Promise avec un Map des mappings Rebrickable ID -> BrickLink ID
 */
export const loadColorMapping = async (): Promise<Map<number, number>> => {
  if (colorMappingCache) {
    return colorMappingCache;
  }

  try {
    const response = await fetch("/data/colors_mapping.csv");
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const csvText = await response.text();
    const lines = csvText.split("\n");

    colorMappingCache = new Map<number, number>();

    // Ignorer la première ligne (en-têtes)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parser CSV avec gestion des guillemets
      const columns = parseCSVLine(line);
      if (columns.length < 11) continue; // Vérifier qu'on a assez de colonnes

      const rebrickableId = parseInt(columns[2], 10); // Colonne ID (décalée à cause de la colonne Img)
      const bricklinkColumn = columns[11]; // Colonne BrickLink (décalée)

      if (isNaN(rebrickableId) || !bricklinkColumn) continue;

      // Parser la colonne BrickLink pour extraire l'ID
      // Format: "85 ['Dark Bluish Gray']"
      const bricklinkMatch = bricklinkColumn.match(/^(\d+)\s*\[/);
      if (bricklinkMatch) {
        const bricklinkId = parseInt(bricklinkMatch[1], 10);
        if (!isNaN(bricklinkId)) {
          colorMappingCache.set(rebrickableId, bricklinkId);
        }
      }
    }

    // Mapping des couleurs chargé silencieusement
    return colorMappingCache;
  } catch (error) {
    console.error("Erreur lors du chargement du mapping des couleurs:", error);
    // Retourner un mapping vide en cas d'erreur
    colorMappingCache = new Map<number, number>();
    return colorMappingCache;
  }
};

/**
 * Charge et parse le fichier colors_mapping.csv (données complètes de Rebrickable)
 */
export const loadColors = async (): Promise<Map<number, LegoColor>> => {
  if (colorsCache) {
    return colorsCache;
  }

  try {
    const response = await fetch("/data/colors_mapping.csv");
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    const csvText = await response.text();
    const lines = csvText.split("\n");

    colorsCache = new Map();

    // Ignorer la première ligne (en-têtes)
    // Format: Img,ID,Name,RGB,Num Parts,Num Sets,First Year,Last Year,LEGO,LDraw,BrickLink,BrickOwl
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        continue;
      }

      // Parser CSV avec gestion des guillemets
      const columns = parseCSVLine(line);
      if (columns.length < 5) {
        continue; // Vérifier qu'on a au moins ID, Name, RGB
      }

      const colorId = parseInt(columns[2], 10); // Colonne ID (décalée à cause de la colonne Img)
      const colorName = columns[3]; // Colonne Name
      const rgbHex = columns[4]; // Colonne RGB
      const firstYear = columns[7] ? parseInt(columns[7], 10) : undefined; // Colonne First Year
      const lastYear = columns[8] ? parseInt(columns[8], 10) : undefined; // Colonne Last Year

      if (isNaN(colorId) || !colorName || !rgbHex) {
        continue;
      }

      // Convertir RGB hex en format avec #
      const hex = rgbHex.startsWith("#") ? rgbHex : `#${rgbHex}`;
      const rgbArray = hexToRgbArray(rgbHex);

      const color: LegoColor = {
        id: colorId,
        name: colorName,
        hex: hex,
        rgb: rgbArray,
        y1: firstYear,
        y2: lastYear,
      };

      colorsCache.set(colorId, color);
    }

    // Couleurs chargées silencieusement
    return colorsCache;
  } catch (error) {
    console.error(
      "Erreur lors du chargement des couleurs depuis colors_mapping.csv:",
      error
    );
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
 * Charge et parse les fichiers elements.csv avec vérification croisée inventory_parts
 */
export const loadElements = async (): Promise<Map<string, string>> => {
  if (elementsCache) {
    return elementsCache;
  }

  try {
    // Charger elements.csv et les deux fichiers inventory_parts fusionnés
    const [elementsRows, inventoryPartsRows] = await Promise.all([
      loadProjectCSVFiles("elements.csv"),
      loadInventoryPartsSplit(),
    ]);

    // Nettoyer les en-têtes en supprimant les caractères de fin de ligne (\r, \n)
    const elementsHeaders = elementsRows[0].map((header) => header.trim());
    const elementIdIndex = elementsHeaders.indexOf("element_id");
    const partNumIndex = elementsHeaders.indexOf("part_num");
    const colorIdIndex = elementsHeaders.indexOf("color_id");
    const designIdIndex = elementsHeaders.indexOf("design_id");

    const inventoryHeaders = inventoryPartsRows[0].map((header) =>
      header.trim()
    );
    const invPartNumIndex = inventoryHeaders.indexOf("part_num");
    const invColorIdIndex = inventoryHeaders.indexOf("color_id");
    const invImgUrlIndex = inventoryHeaders.indexOf("img_url");

    // Extraire les element_ids réellement utilisés depuis les fichiers inventory_parts (1 et 2)
    const usedElementIds = new Set<string>();
    const inventoryElementIds = new Map<string, string>(); // key -> element_id utilisé

    for (let i = 1; i < inventoryPartsRows.length; i++) {
      const row = inventoryPartsRows[i];
      if (
        row.length > Math.max(invPartNumIndex, invColorIdIndex, invImgUrlIndex)
      ) {
        const key = `${row[invPartNumIndex]}-${row[invColorIdIndex]}`;
        const imgUrl = row[invImgUrlIndex];

        // Extraire l'element_id de l'URL (ex: "4496989.jpg" -> "4496989")
        if (imgUrl && typeof imgUrl === "string") {
          const elementIdMatch = imgUrl.match(/\/elements\/(\d+)\.jpg$/);
          if (elementIdMatch) {
            const elementId = elementIdMatch[1];
            usedElementIds.add(elementId);
            inventoryElementIds.set(key, elementId);
          }
        }
      }
    }

    elementsCache = new Map();
    // Map temporaire pour stocker les entrées avec leurs informations complètes
    const tempEntries = new Map<
      string,
      {
        elementId: string;
        hasDesignId: boolean;
        hasMatchingDesignId: boolean;
        numericId: number;
        isUsedInInventory: boolean;
      }
    >();

    for (let i = 1; i < elementsRows.length; i++) {
      const row = elementsRows[i];
      if (row.length > Math.max(elementIdIndex, partNumIndex, colorIdIndex)) {
        const key = `${row[partNumIndex]}-${row[colorIdIndex]}`;
        const partNum = row[partNumIndex];
        const elementId = row[elementIdIndex];
        const designId = designIdIndex >= 0 ? row[designIdIndex] : "";
        const hasDesignId = Boolean(designId && designId.trim() !== "");
        const hasMatchingDesignId = designId.trim() === partNum; // NOUVEAU: design_id correspond au part_num
        const numericId = parseInt(elementId, 10);
        const isUsedInInventory = usedElementIds.has(elementId);

        const existingEntry = tempEntries.get(key);

        if (!existingEntry) {
          // Première entrée pour cette clé
          tempEntries.set(key, {
            elementId,
            hasDesignId,
            hasMatchingDesignId,
            numericId,
            isUsedInInventory,
          });
        } else {
          // Logique de priorité LEGO officielle (Pick-a-Brick) :
          // 1. PRIORITÉ ABSOLUE : design_id = part_num (ex: 6357797 pour 3024-78)
          // 2. Sinon, element_id utilisé dans les fichiers inventory_parts (1 et 2)
          // 3. Sinon, celui avec design_id quelconque
          // 4. Sinon, le plus petit numericId
          const shouldReplace =
            (hasMatchingDesignId && !existingEntry.hasMatchingDesignId) || // PRIORITÉ 1: design_id = part_num
            (hasMatchingDesignId === existingEntry.hasMatchingDesignId &&
              isUsedInInventory &&
              !existingEntry.isUsedInInventory) || // PRIORITÉ 2: utilisé dans inventory
            (hasMatchingDesignId === existingEntry.hasMatchingDesignId &&
              isUsedInInventory === existingEntry.isUsedInInventory &&
              hasDesignId &&
              !existingEntry.hasDesignId) || // PRIORITÉ 3: design_id quelconque
            (hasMatchingDesignId === existingEntry.hasMatchingDesignId &&
              isUsedInInventory === existingEntry.isUsedInInventory &&
              hasDesignId === existingEntry.hasDesignId &&
              numericId < existingEntry.numericId); // PRIORITÉ 4: plus petit numericId

          if (shouldReplace) {
            tempEntries.set(key, {
              elementId,
              hasDesignId,
              hasMatchingDesignId,
              numericId,
              isUsedInInventory,
            });
          }
        }
      }
    }

    // Transférer les résultats finaux dans le cache
    for (const [key, entry] of tempEntries) {
      elementsCache.set(key, entry.elementId);
    }

    return elementsCache;
  } catch (error) {
    console.error("Erreur lors du chargement des éléments:", error);
    throw error;
  }
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
      // Si aucune pièce spécifique n'est trouvée, retourner toutes les couleurs disponibles
      const allColors = Array.from(colors.values());
      // Utilisation de toutes les couleurs disponibles
      return allColors
        .filter((color) => !color.name.startsWith("Trans-"))
        .slice(0, 50); // Exclure les transparentes et limiter
    }

    // Créer un Set pour éviter les doublons de couleurs
    const uniqueColorIds = new Set(
      partInventory
        .filter((item) => !item.is_spare) // Exclure les pièces de rechange
        .map((item) => item.color_id)
    );

    // Convertir en format LegoColor avec filtrage
    const legoColors: LegoColor[] = [];

    // Calculer la fenêtre glissante de 5 ans
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 5;

    for (const colorId of uniqueColorIds) {
      const colorData = colors.get(colorId);

      if (colorData) {
        // Filtrer les couleurs transparentes (nom commençant par "Trans-")
        if (colorData.name.startsWith("Trans-")) {
          continue;
        }

        // Filtrer les couleurs discontinuées (fenêtre glissante de 5 ans)
        if (colorData.y2 && colorData.y2 < minYear) {
          continue;
        }

        legoColors.push(colorData);
      }
    }

    // Trier par nom pour un affichage cohérent
    legoColors.sort((a, b) => a.name.localeCompare(b.name));

    return legoColors;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la palette locale:",
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

// clearCSVCache est maintenant défini comme alias de clearAllCaches plus haut dans le fichier

/**
 * Vide spécifiquement le cache des couleurs pour forcer un rechargement complet
 */
export const clearColorsCache = (): void => {
  colorsCache = null;
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
