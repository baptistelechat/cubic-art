import type {
  BOMItem,
  BillOfMaterials,
  LegoColor,
  MosaicResult,
} from "@/types";
import { toast } from "sonner";
import {
  getLocalBulkElementIds,
  getLocalElementId,
  loadColorMapping,
} from "./csvDataService";

// Constantes pour les références de pièces Technic
// BrickLink utilise des références différentes de LEGO officiel
const BRICKLINK_CONNECTOR_PART_NUM = "2780"; // Item No BrickLink pour connecteur
const LEGO_CONNECTOR_ELEMENT_ID = "6279875"; // Element ID pour Pick-A-Brick
const TECHNIC_BASEPLATE_PART_NUM = "65803"; // Plaque Technic 16x16

// Cache pour le mapping des couleurs
let colorMappingData: Map<number, number> | null = null;

/**
 * Mappe les color_ids de Rebrickable vers les color_ids de BrickLink
 * @param rebrickableColorId ID de couleur Rebrickable
 * @returns Promise avec l'ID de couleur BrickLink correspondant
 */
const mapRebrickableColorToBrickLink = async (
  rebrickableColorId: number
): Promise<number> => {
  // Charger le mapping si pas encore fait
  if (!colorMappingData) {
    colorMappingData = await loadColorMapping();
  }

  // Retourner l'ID BrickLink correspondant ou l'ID original si pas trouvé
  return colorMappingData.get(rebrickableColorId) || rebrickableColorId;
};

/**
 * Génère une BOM (Bill of Materials) à partir d'un résultat de mosaïque
 * @param mosaicResult Résultat de la génération de mosaïque
 * @param includePricing Inclure l'estimation de coût (actuellement désactivé)
 * @returns BOM avec les pièces et quantités nécessaires
 */
export const generateBOM = async (
  mosaicResult: MosaicResult,
  includePricing: boolean = true
): Promise<BillOfMaterials> => {
  try {
    // 1. Analyser la grille pour compter les pièces par couleur
    const colorCounts = countColorUsage(mosaicResult.grid);

    // 2. Créer les items BOM de base
    const bomItems: BOMItem[] = [];

    for (const [colorHex, quantity] of colorCounts.entries()) {
      // Trouver la couleur LEGO correspondante
      const legoColor = mosaicResult.config.colorPalette.find(
        (c) => c.hex === colorHex
      );
      if (!legoColor) continue;

      // Utiliser l'ID de couleur LEGO
      const legoColorId = legoColor.id;

      const bomItem: BOMItem = {
        part_num: "3024", // Plate 1x1
        color_id: legoColorId,
        quantity,
        color_name: legoColor.name,
        color_hex: legoColor.hex,
      };

      bomItems.push(bomItem);
    }

    // 3. Enrichir avec les element_ids pour Pick a Brick
    await enrichWithElementIds(bomItems);

    // 4. Enrichir avec les prix si demandé (actuellement désactivé)
    // if (includePricing) {
    //   toast.warning("Estimation des prix temporairement désactivée", {
    //     description: "Aucune source de prix configurée",
    //   });
    //   // TODO: Intégrer une source de prix externe si nécessaire
    // }

    // 5. Calculer le coût total estimé
    const totalEstimatedCost = includePricing
      ? bomItems.reduce((total, item) => {
          return total + (item.avg_price || 0) * item.quantity;
        }, 0)
      : 0;

    // 6. Créer la BOM finale
    const bom: BillOfMaterials = {
      items: bomItems,
      total_pieces: bomItems.reduce((sum, item) => sum + item.quantity, 0),
      estimated_cost:
        totalEstimatedCost > 0
          ? {
              min: totalEstimatedCost * 0.8,
              avg: totalEstimatedCost,
              max: totalEstimatedCost * 1.2,
              currency: "USD",
            }
          : undefined,
      generated_at: new Date(),
    };

    return bom;
  } catch (error) {
    toast.error("Erreur lors de la génération de la BOM", {
      description:
        error instanceof Error
          ? error.message
          : "Une erreur inattendue s'est produite",
    });
    throw error;
  }
};

/**
 * Compte l'utilisation de chaque couleur dans la grille
 * @param grid Grille de couleurs de la mosaïque
 * @returns Map avec le nombre d'occurrences par couleur (hex)
 */
const countColorUsage = (grid: LegoColor[][]): Map<string, number> => {
  const colorCounts = new Map<string, number>();

  for (const row of grid) {
    for (const color of row) {
      const currentCount = colorCounts.get(color.hex) || 0;
      colorCounts.set(color.hex, currentCount + 1);
    }
  }

  return colorCounts;
};

/**
 * Enrichit les items BOM avec les element_ids pour Pick a Brick
 * @param bomItems Items BOM à enrichir
 */
const enrichWithElementIds = async (bomItems: BOMItem[]): Promise<void> => {
  try {
    // Préparer les items pour la requête en lot
    const itemsForElementIds = bomItems.map((item) => ({
      partNum: item.part_num,
      colorId: item.color_id,
    }));

    // Récupérer les element_ids en lot depuis les CSV locaux
    const elementIdsMap = await getLocalBulkElementIds(itemsForElementIds);

    // Enrichir chaque item avec son element_id
    bomItems.forEach((item) => {
      const legoColorId = item.color_id;
      if (legoColorId) {
        const key = `${item.part_num}-${legoColorId}`;
        const elementId = elementIdsMap.get(key);
        if (elementId) {
          item.element_id = elementId;
        }
      }
    });
  } catch (error) {
    toast.error("Erreur lors de l'enrichissement avec les element_ids", {
      description:
        error instanceof Error
          ? error.message
          : "Impossible de récupérer les éléments LEGO",
    });
    // Ne pas faire échouer la génération BOM si les element_ids ne sont pas disponibles
  }
};

// Fonctions de pricing supprimées (non utilisées avec les données CSV locales)

/**
 * Génère un CSV Pick a Brick à partir d'une BOM
 * @param bom Bill of Materials
 * @returns Contenu CSV pour Pick a Brick
 */
export const generatePickABrickCSV = (bom: BillOfMaterials): string => {
  let csvContent = "element_id,quantity\n";

  bom.items
    .filter((item) => item.element_id) // Seulement les items avec element_id
    .forEach((item) => {
      csvContent += `${item.element_id},${item.quantity}\n`;
    });

  return csvContent;
};

/**
 * Génère un XML BrickLink à partir d'une BOM
 * @param bom Bill of Materials
 * @returns Promise avec le contenu XML pour BrickLink Wanted List
 */
export const generateBricklinkXML = async (
  bom: BillOfMaterials
): Promise<string> => {
  let xml = "<INVENTORY>";

  // Regrouper les items par combinaison part_num/color_id
  const groupedItems = new Map<
    string,
    { part_num: string; color_id: number; quantity: number }
  >();

  // Traiter chaque item de manière asynchrone
  for (const item of bom.items) {
    const bricklinkColorId = await mapRebrickableColorToBrickLink(
      item.color_id
    );
    const key = `${item.part_num}-${bricklinkColorId}`;
    const existing = groupedItems.get(key);

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      groupedItems.set(key, {
        part_num: item.part_num,
        color_id: bricklinkColorId,
        quantity: item.quantity,
      });
    }
  }

  // Générer le XML avec les items regroupés
  groupedItems.forEach((item) => {
    xml += "<ITEM>";
    xml += "<ITEMTYPE>P</ITEMTYPE>";
    xml += `<ITEMID>${item.part_num}</ITEMID>`;
    xml += `<COLOR>${item.color_id}</COLOR>`;
    xml += `<MINQTY>${item.quantity}</MINQTY>`;
    xml += "</ITEM>";
  });

  xml += "</INVENTORY>";
  return xml;
};

/**
 * Génère un XML BrickLink à partir d'une liste de pièces et palette de couleurs
 * @param piecesList Liste des pièces avec quantités
 * @param colorPalette Palette de couleurs LEGO
 * @returns Promise avec le contenu XML pour BrickLink Wanted List
 */
export const generateBricklinkXMLFromPieces = async (
  piecesList: Record<string, number>,
  colorPalette: LegoColor[]
): Promise<string> => {
  let xml = "<INVENTORY>";

  // Regrouper les items par combinaison part_num/color_id
  const groupedItems = new Map<
    string,
    { part_num: string; color_id: number; quantity: number }
  >();

  // Traiter chaque pièce de manière asynchrone
  const filteredEntries = Object.entries(piecesList).filter(
    ([key]) =>
      !key.includes("Plaque de base Technic") && !key.includes("Connecteur")
  );

  for (const [colorInfo, quantity] of filteredEntries) {
    const colorHex = colorInfo.match(/\(([^)]+)\)/)?.[1] || "#000000";
    const legoColor = colorPalette.find((c) => c.hex === colorHex);

    if (legoColor) {
      const bricklinkColorId = await mapRebrickableColorToBrickLink(
        legoColor.id
      );
      const key = `3024-${bricklinkColorId}`; // Pièce 1x1
      const existing = groupedItems.get(key);

      if (existing) {
        existing.quantity += quantity;
      } else {
        groupedItems.set(key, {
          part_num: "3024",
          color_id: bricklinkColorId,
          quantity: quantity,
        });
      }
    }
  }

  // Calculer la couleur noire BrickLink une seule fois pour les pièces Technic
  const blackColorId = await mapRebrickableColorToBrickLink(0); // Noir = color_id 0 dans Rebrickable

  // Ajouter les plaques Technic 16x16 noires - utiliser les quantités exactes de piecesList
  const baseplateEntry = Object.entries(piecesList).find(([key]) =>
    key.includes("Plaque de base Technic")
  );
  if (baseplateEntry) {
    const baseplatesNeeded = baseplateEntry[1];

    groupedItems.set(`${TECHNIC_BASEPLATE_PART_NUM}-${blackColorId}`, {
      part_num: TECHNIC_BASEPLATE_PART_NUM, // "65803"
      color_id: blackColorId,
      quantity: baseplatesNeeded,
    });
  }

  // Ajouter les connecteurs Technic noirs - utiliser les quantités exactes de piecesList
  const connectorEntry = Object.entries(piecesList).find(([key]) =>
    key.includes("Connecteur")
  );
  if (connectorEntry) {
    const connectorsNeeded = connectorEntry[1];

    // Utiliser la référence BrickLink (2780) au lieu de LEGO officiel (61332)
    groupedItems.set(`${BRICKLINK_CONNECTOR_PART_NUM}-${blackColorId}`, {
      part_num: BRICKLINK_CONNECTOR_PART_NUM, // "2780" pour BrickLink
      color_id: blackColorId,
      quantity: connectorsNeeded,
    });
  }

  // Générer le XML avec les items regroupés
  groupedItems.forEach((item) => {
    xml += "<ITEM>";
    xml += "<ITEMTYPE>P</ITEMTYPE>";
    xml += `<ITEMID>${item.part_num}</ITEMID>`;
    xml += `<COLOR>${item.color_id}</COLOR>`;
    xml += `<MINQTY>${item.quantity}</MINQTY>`;
    xml += "</ITEM>";
  });

  xml += "</INVENTORY>";
  return xml;
};

/**
 * Génère un CSV PAB (Pick-A-Brick) à partir d'une liste de pièces et palette de couleurs
 * @param piecesList Liste des pièces avec quantités
 * @param colorPalette Palette de couleurs LEGO
 * @returns Contenu CSV pour PAB au format elementId,quantity
 */
export const generatePABCSV = async (
  piecesList: Record<string, number>,
  colorPalette: LegoColor[]
): Promise<string> => {
  let csv = "elementId,quantity\n";

  for (const [colorInfo, quantity] of Object.entries(piecesList)) {
    // Filtrer les pièces Technic
    if (
      colorInfo.includes("Plaque de base Technic") ||
      colorInfo.includes("Connecteur")
    ) {
      continue;
    }

    const colorHex = colorInfo.match(/\(([^)]+)\)/)?.[1] || "#000000";
    const legoColor = colorPalette.find((c) => c.hex === colorHex);

    if (legoColor) {
      // Récupérer le vrai elementID depuis les CSV
      const elementId = await getLocalElementId("3024", legoColor.id);

      if (elementId) {
        csv += `${elementId},${quantity}\n`;
      }
    }
  }

  // Ajouter les plaques Technic 16x16 noires - utiliser les quantités exactes de piecesList
  const baseplateEntry = Object.entries(piecesList).find(([key]) =>
    key.includes("Plaque de base Technic")
  );
  if (baseplateEntry) {
    const baseplatesNeeded = baseplateEntry[1];

    // Récupérer l'element_id pour la plaque Technic 16x16 noire
    const baseplateElementId = await getLocalElementId(
      TECHNIC_BASEPLATE_PART_NUM,
      0
    ); // Noir = color_id 0
    if (baseplateElementId) {
      csv += `${baseplateElementId},${baseplatesNeeded}\n`;
    }
  }

  // Ajouter les connecteurs Technic noirs - utiliser les quantités exactes de piecesList
  const connectorEntry = Object.entries(piecesList).find(([key]) =>
    key.includes("Connecteur")
  );
  if (connectorEntry) {
    const connectorsNeeded = connectorEntry[1];

    // Utiliser l'element_id LEGO officiel pour Pick-A-Brick
    csv += `${LEGO_CONNECTOR_ELEMENT_ID},${connectorsNeeded}\n`;
  }

  return csv;
};

/**
 * Génère un JSON PAB (Pick-A-Brick) à partir d'une liste de pièces et palette de couleurs
 * @param piecesList Liste des pièces avec quantités
 * @param colorPalette Palette de couleurs LEGO
 * @returns Contenu JSON pour PAB au format [{elementId, quantity}]
 */
export const generatePABJSON = async (
  piecesList: Record<string, number>,
  colorPalette: LegoColor[]
): Promise<string> => {
  const items: Array<{ elementId: string; quantity: number }> = [];

  for (const [colorInfo, quantity] of Object.entries(piecesList)) {
    // Filtrer les pièces Technic
    if (
      colorInfo.includes("Plaque de base Technic") ||
      colorInfo.includes("Connecteur")
    ) {
      continue;
    }

    const colorHex = colorInfo.match(/\(([^)]+)\)/)?.[1] || "#000000";
    const legoColor = colorPalette.find((c) => c.hex === colorHex);

    if (legoColor) {
      // Récupérer le vrai elementID depuis les CSV
      const elementId = await getLocalElementId("3024", legoColor.id);

      if (elementId) {
        items.push({ elementId, quantity });
      }
    }
  }

  // Ajouter les plaques Technic 16x16 noires - utiliser les quantités exactes de piecesList
  const baseplateEntry = Object.entries(piecesList).find(([key]) =>
    key.includes("Plaque de base Technic")
  );
  if (baseplateEntry) {
    const baseplatesNeeded = baseplateEntry[1];

    // Récupérer l'element_id pour la plaque Technic 16x16 noire
    const baseplateElementId = await getLocalElementId(
      TECHNIC_BASEPLATE_PART_NUM,
      0
    ); // Noir = color_id 0
    if (baseplateElementId) {
      items.push({ elementId: baseplateElementId, quantity: baseplatesNeeded });
    }
  }

  // Ajouter les connecteurs Technic noirs - utiliser les quantités exactes de piecesList
  const connectorEntry = Object.entries(piecesList).find(([key]) =>
    key.includes("Connecteur")
  );
  if (connectorEntry) {
    const connectorsNeeded = connectorEntry[1];

    // Utiliser l'element_id LEGO officiel pour Pick-A-Brick
    items.push({
      elementId: LEGO_CONNECTOR_ELEMENT_ID,
      quantity: connectorsNeeded,
    });
  }

  return JSON.stringify(items, null, 2);
};

/**
 * Valide une BOM pour s'assurer qu'elle est complète
 * @param bom Bill of Materials à valider
 * @returns Objet avec le statut de validation et les erreurs éventuelles
 */
export const validateBOM = (bom: BillOfMaterials) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Vérifications de base
  if (bom.items.length === 0) {
    errors.push("La BOM ne contient aucun item");
  }

  if (bom.total_pieces === 0) {
    errors.push("Le nombre total de pièces est zéro");
  }

  // Vérifications des items
  bom.items.forEach((item, index) => {
    if (!item.part_num) {
      errors.push(`Item ${index + 1}: part_num manquant`);
    }

    if (item.quantity <= 0) {
      errors.push(`Item ${index + 1}: quantité invalide (${item.quantity})`);
    }

    if (!item.element_id) {
      warnings.push(`Item ${index + 1}: element_id manquant pour Pick a Brick`);
    }

    if (item.avg_price === undefined) {
      warnings.push(`Item ${index + 1}: informations de prix manquantes`);
    }
  });

  // Vérification de cohérence
  const calculatedTotal = bom.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  if (calculatedTotal !== bom.total_pieces) {
    errors.push(
      `Incohérence: total calculé (${calculatedTotal}) != total déclaré (${bom.total_pieces})`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Formate une BOM pour l'affichage dans l'interface utilisateur
 * @param bom Bill of Materials
 * @returns Objet formaté pour l'affichage
 */
export const formatBOMForDisplay = (bom: BillOfMaterials) => {
  return {
    totalPieces: bom.total_pieces,
    totalColors: bom.items.length,
    estimatedCost: bom.estimated_cost
      ? {
          min: `${bom.estimated_cost.min.toFixed(2)} ${
            bom.estimated_cost.currency
          }`,
          avg: `${bom.estimated_cost.avg.toFixed(2)} ${
            bom.estimated_cost.currency
          }`,
          max: `${bom.estimated_cost.max.toFixed(2)} ${
            bom.estimated_cost.currency
          }`,
        }
      : undefined,
    items: bom.items.map((item) => ({
      colorName: item.color_name || "Couleur inconnue",
      colorHex: item.color_hex || "#CCCCCC",
      quantity: item.quantity,
      partNum: item.part_num,
      colorId: item.color_id,
      elementId: item.element_id || "N/A",
      unitPrice: item.avg_price ? `${item.avg_price.toFixed(3)} EUR` : "N/A",
      totalPrice: item.avg_price
        ? `${(item.avg_price * item.quantity).toFixed(2)} EUR`
        : "N/A",
    })),
    generatedAt: bom.generated_at.toLocaleString("fr-FR"),
  };
};
