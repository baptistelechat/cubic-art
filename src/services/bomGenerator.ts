import type {
  BOMItem,
  BillOfMaterials,
  LegoColor,
  MosaicResult,
} from "@/types";
import { getLocalBulkElementIds } from "./csvDataService";

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
    if (includePricing) {
      console.warn(
        "Estimation des prix temporairement désactivée - aucune source de prix configurée"
      );
      // TODO: Intégrer une source de prix externe si nécessaire
    }

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
    console.error("Erreur lors de la génération de la BOM:", error);
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
    console.error(
      "Erreur lors de l'enrichissement avec les element_ids:",
      error
    );
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
 * @returns Contenu XML pour BrickLink Wanted List
 */
export const generateBricklinkXML = (bom: BillOfMaterials): string => {
  let xml = '<INVENTORY>';

  bom.items.forEach((item) => {
    xml += '<ITEM>';
    xml += '<ITEMTYPE>P</ITEMTYPE>';
    xml += `<ITEMID>${item.part_num}</ITEMID>`;
    xml += `<COLOR>${item.color_id}</COLOR>`;
    xml += `<MINQTY>${item.quantity}</MINQTY>`;
    xml += '</ITEM>';
  });

  xml += '</INVENTORY>';
  return xml;
};

/**
 * Génère un XML BrickLink à partir d'une liste de pièces et palette de couleurs
 * @param piecesList Liste des pièces avec quantités
 * @param colorPalette Palette de couleurs LEGO
 * @returns Contenu XML pour BrickLink Wanted List
 */
export const generateBricklinkXMLFromPieces = (
  piecesList: Record<string, number>,
  colorPalette: LegoColor[]
): string => {
  let xml = '<INVENTORY>';

  Object.entries(piecesList)
    .filter(([key]) => 
      !key.includes("Plaque de base Technic") && 
      !key.includes("Connecteur")
    )
    .forEach(([colorInfo, quantity]) => {
      const colorHex = colorInfo.match(/\(([^)]+)\)/)?.[1] || "#000000";
      const legoColor = colorPalette.find(c => c.hex === colorHex);
      
      if (legoColor) {
        xml += '<ITEM>';
        xml += '<ITEMTYPE>P</ITEMTYPE>';
        xml += '<ITEMID>3024</ITEMID>'; // Pièce 1x1
        xml += `<COLOR>${legoColor.id}</COLOR>`;
        xml += `<MINQTY>${quantity}</MINQTY>`;
        xml += '</ITEM>';
      }
    });

  xml += '</INVENTORY>';
  return xml;
};

/**
 * Génère un CSV PAB (Pick-A-Brick) à partir d'une liste de pièces et palette de couleurs
 * @param piecesList Liste des pièces avec quantités
 * @param colorPalette Palette de couleurs LEGO
 * @returns Contenu CSV pour PAB au format elementId,quantity
 */
export const generatePABCSV = (
  piecesList: Record<string, number>,
  colorPalette: LegoColor[]
): string => {
  let csv = "elementId,quantity\n";

  Object.entries(piecesList)
    .filter(([key]) => 
      !key.includes("Plaque de base Technic") && 
      !key.includes("Connecteur")
    )
    .forEach(([colorInfo, quantity]) => {
      const colorHex = colorInfo.match(/\(([^)]+)\)/)?.[1] || "#000000";
      const legoColor = colorPalette.find(c => c.hex === colorHex);
      
      if (legoColor) {
        // Format: elementId = color_id + part_id (ex: 300321 = color 3 + part 00321)
        const elementId = `${legoColor.id.toString().padStart(2, '0')}0321`; // 0321 pour pièce 1x1
        csv += `${elementId},${quantity}\n`;
      }
    });

  return csv;
};

/**
 * Génère un JSON PAB (Pick-A-Brick) à partir d'une liste de pièces et palette de couleurs
 * @param piecesList Liste des pièces avec quantités
 * @param colorPalette Palette de couleurs LEGO
 * @returns Contenu JSON pour PAB au format [{elementId, quantity}]
 */
export const generatePABJSON = (
  piecesList: Record<string, number>,
  colorPalette: LegoColor[]
): string => {
  const items: Array<{elementId: string, quantity: number}> = [];

  Object.entries(piecesList)
    .filter(([key]) => 
      !key.includes("Plaque de base Technic") && 
      !key.includes("Connecteur")
    )
    .forEach(([colorInfo, quantity]) => {
      const colorHex = colorInfo.match(/\(([^)]+)\)/)?.[1] || "#000000";
      const legoColor = colorPalette.find(c => c.hex === colorHex);
      
      if (legoColor) {
        // Format: elementId = color_id + part_id (ex: 300321 = color 3 + part 00321)
        const elementId = `${legoColor.id.toString().padStart(2, '0')}0321`; // 0321 pour pièce 1x1
        items.push({ elementId, quantity });
      }
    });

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
