import jsPDF from "jspdf";
import type { LegoColor, MosaicConfig, MosaicResult } from "@/types";

// Types pour le générateur PDF
interface ModuleData {
  moduleNumber: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  grid: LegoColor[][];
  piecesList: Record<string, number>;
  totalPieces: number;
}

interface PDFConfig {
  pageWidth: number;
  pageHeight: number;
  margin: number;
  titleHeight: number;
  imageHeight: number;
  listStartY: number;
}

// Interface pour le système de repérage des couleurs
interface ColorReference {
  color: LegoColor;
  reference: string; // A, B, C, etc.
  count: number;
}

// Configuration PDF A4 paysage (297x210mm)
const PDF_CONFIG: PDFConfig = {
  pageWidth: 297,
  pageHeight: 210,
  margin: 15,
  titleHeight: 25,
  imageHeight: 120,
  listStartY: 50,
};

/**
 * Génère un système de repérage global des couleurs
 */
function generateColorReferences(mosaicResult: MosaicResult): Map<string, string> {
  const colorMap = new Map<string, string>();
  const colorCounts: Record<string, number> = {};
  
  // Compter toutes les couleurs utilisées
  mosaicResult.grid.forEach(row => {
    row.forEach(color => {
      const colorKey = `${color.name} (${color.hex})`;
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    });
  });
  
  // Trier par fréquence d'utilisation (plus utilisées en premier)
  const sortedColors = Object.entries(colorCounts)
    .sort(([, countA], [, countB]) => countB - countA);
  
  // Assigner des références (A, B, C, etc.)
  sortedColors.forEach(([colorKey], index) => {
    const reference = String.fromCharCode(65 + index); // A, B, C, etc.
    colorMap.set(colorKey, reference);
  });
  
  return colorMap;
}

/**
 * Génère les données de modules 16x16 à partir de la grille complète
 */
function generateModulesData(mosaicResult: MosaicResult): ModuleData[] {
  const { grid, config } = mosaicResult;
  const moduleSize = 16;
  const modules: ModuleData[] = [];
  
  const gridCols = Math.ceil(config.width / moduleSize);
  const gridRows = Math.ceil(config.height / moduleSize);
  
  let moduleNumber = 1;
  
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const startX = col * moduleSize;
      const startY = row * moduleSize;
      const endX = Math.min(startX + moduleSize, config.width);
      const endY = Math.min(startY + moduleSize, config.height);
      
      // Extraire la sous-grille pour ce module
      const moduleGrid: LegoColor[][] = [];
      const modulePieces: Record<string, number> = {};
      
      for (let y = startY; y < endY; y++) {
        const moduleRow: LegoColor[] = [];
        for (let x = startX; x < endX; x++) {
          if (y < grid.length && x < grid[y].length) {
            const color = grid[y][x];
            moduleRow.push(color);
            
            // Compter les pièces pour ce module
            const colorKey = `${color.name} (${color.hex})`;
            modulePieces[colorKey] = (modulePieces[colorKey] || 0) + 1;
          }
        }
        if (moduleRow.length > 0) {
          moduleGrid.push(moduleRow);
        }
      }
      
      const totalPieces = Object.values(modulePieces).reduce((sum, count) => sum + count, 0);
      
      modules.push({
        moduleNumber,
        startX,
        startY,
        endX,
        endY,
        grid: moduleGrid,
        piecesList: modulePieces,
        totalPieces,
      });
      
      moduleNumber++;
    }
  }
  
  return modules;
}

/**
 * Dessine une pièce LEGO avec effet 3D
 */
function drawLegoBrick(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  color: LegoColor,
  reference?: string
): void {
  const rgb = color.rgb || [128, 128, 128];
  
  // Couleur principale
  pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
  pdf.rect(x, y, width, height, "F");
  
  // Effet 3D - côté droit plus sombre
  const shadowFactor = 0.7;
  const shadowRgb = rgb.map(c => Math.floor(c * shadowFactor));
  pdf.setFillColor(shadowRgb[0], shadowRgb[1], shadowRgb[2]);
  
  // Ombre droite
  const shadowWidth = Math.min(width * 0.15, 0.8);
  pdf.rect(x + width - shadowWidth, y, shadowWidth, height, "F");
  
  // Ombre bas
  const shadowHeight = Math.min(height * 0.15, 0.8);
  pdf.rect(x, y + height - shadowHeight, width, shadowHeight, "F");
  
  // Effet 3D - côté gauche/haut plus clair
  const highlightFactor = 1.2;
  const highlightRgb = rgb.map(c => Math.min(255, Math.floor(c * highlightFactor)));
  pdf.setFillColor(highlightRgb[0], highlightRgb[1], highlightRgb[2]);
  
  // Highlight gauche
  const highlightWidth = Math.min(width * 0.1, 0.6);
  pdf.rect(x, y, highlightWidth, height, "F");
  
  // Highlight haut
  const highlightHeight = Math.min(height * 0.1, 0.6);
  pdf.rect(x, y, width, highlightHeight, "F");
  
  // Bordure noire fine
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.2);
  pdf.rect(x, y, width, height, "S");
  
  // Ajouter la référence de couleur si fournie et si la cellule est assez grande
  if (reference && width > 3 && height > 3) {
    // Calculer la luminosité pour choisir la couleur du texte
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    const textColor = brightness > 128 ? [0, 0, 0] : [255, 255, 255];
    
    // Texte de référence centré directement sur la couleur de fond avec taille encore augmentée
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.setFont("helvetica", "bold");
    const textSize = Math.min(width , height , 7); // Taille encore augmentée
    pdf.setFontSize(textSize);
    pdf.text(reference, x + width / 2, y + height / 2, 
            { align: "center", baseline: "middle" });
  }
}

/**
 * Dessine la grille d'un module sur le PDF avec repérage des couleurs et style LEGO 3D
 */
function drawModuleGrid(
  pdf: jsPDF,
  module: ModuleData,
  x: number,
  y: number,
  width: number,
  height: number,
  colorReferences: Map<string, string>
): void {
  const cellWidth = width / module.grid[0]?.length || 1;
  const cellHeight = height / module.grid.length;
  
  // Dessiner les cellules colorées avec effet LEGO 3D
  module.grid.forEach((row, rowIndex) => {
    row.forEach((color, colIndex) => {
      const cellX = x + colIndex * cellWidth;
      const cellY = y + rowIndex * cellHeight;
      
      const colorKey = `${color.name} (${color.hex})`;
      const reference = colorReferences.get(colorKey);
      
      // Dessiner la pièce LEGO avec effet 3D
      drawLegoBrick(pdf, cellX, cellY, cellWidth, cellHeight, color, reference);
    });
  });
  
  // Bordure épaisse autour du module
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.rect(x, y, width, height, "S");
}

/**
 * Dessine l'image complète de la mosaïque (style MosaicComparison avec effet LEGO 3D)
 */
function drawFullMosaicImage(
  pdf: jsPDF,
  mosaicResult: MosaicResult,
  x: number,
  y: number,
  width: number,
  height: number,
  colorReferences: Map<string, string>
): void {
  const { grid, config } = mosaicResult;
  const cellWidth = width / config.width;
  const cellHeight = height / config.height;
  
  // Dessiner chaque pixel de la mosaïque avec effet LEGO 3D
  grid.forEach((row, rowIndex) => {
    row.forEach((color, colIndex) => {
      const cellX = x + colIndex * cellWidth;
      const cellY = y + rowIndex * cellHeight;
      
      // Dessiner la pièce LEGO avec effet 3D (sans référence pour l'image complète)
      drawLegoBrick(pdf, cellX, cellY, cellWidth, cellHeight, color);
    });
  });
  
  // Dessiner la grille modulaire si activée
  if (config.showModuleGrid) {
    const moduleSize = 16;
    const gridCols = Math.ceil(config.width / moduleSize);
    const gridRows = Math.ceil(config.height / moduleSize);
    
    const moduleDisplayWidth = width / gridCols;
    const moduleDisplayHeight = height / gridRows;
    
    // Style de la grille
    pdf.setDrawColor(255, 0, 0);
    pdf.setLineWidth(0.5);
    
    // Lignes verticales
    for (let i = 1; i < gridCols; i++) {
      const lineX = x + i * moduleDisplayWidth;
      pdf.line(lineX, y, lineX, y + height);
    }
    
    // Lignes horizontales
    for (let i = 1; i < gridRows; i++) {
      const lineY = y + i * moduleDisplayHeight;
      pdf.line(x, lineY, x + width, lineY);
    }
    
    // Numéros des modules
    let moduleNumber = 1;
    const fontSize = Math.min(moduleDisplayWidth, moduleDisplayHeight) * 0.1;
    
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const centerX = x + col * moduleDisplayWidth + moduleDisplayWidth / 2;
        const centerY = y + row * moduleDisplayHeight + moduleDisplayHeight / 2;
        
        // Fond blanc pour le numéro
        const bubbleRadius = fontSize * 1.5;
        pdf.setFillColor(255, 255, 255);
        pdf.setGState(pdf.GState({ opacity: 0.9 }));
        pdf.circle(centerX, centerY, bubbleRadius, "F");
        
        // Bordure
        pdf.setGState(pdf.GState({ opacity: 1 }));
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.2);
        pdf.circle(centerX, centerY, bubbleRadius, "S");
        
        // Numéro du module
        pdf.setTextColor(51, 51, 51);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(fontSize);
        pdf.text(moduleNumber.toString(), centerX, centerY, 
                { align: "center", baseline: "middle" });
        
        moduleNumber++;
      }
    }
  }
  
  // Bordure supprimée pour un aperçu plus propre
}

/**
 * Calcule le nombre de connecteurs nécessaires pour un module
 */
function calculateConnectors(moduleNumber: number, totalModules: number, gridCols: number): number {
  // Chaque module peut avoir jusqu'à 4 côtés connectés
  // Calculer selon la position du module dans la grille
  const row = Math.floor((moduleNumber - 1) / gridCols);
  const col = (moduleNumber - 1) % gridCols;
  const gridRows = Math.ceil(totalModules / gridCols);
  
  let connectors = 0;
  
  // Côté droit (si pas le dernier de la ligne)
  if (col < gridCols - 1) connectors += 4;
  
  // Côté bas (si pas la dernière ligne)
  if (row < gridRows - 1) connectors += 4;
  
  return connectors;
}

/**
 * Ajoute la liste des pièces sur la page (colonne droite) avec système de repérage
 */
function addPiecesList(
  pdf: jsPDF,
  module: ModuleData,
  config: MosaicConfig,
  startX: number,
  startY: number,
  totalModules: number,
  gridCols: number,
  colorReferences: Map<string, string>
): void {
  let currentY = startY;
  
  // Titre de la section - FORCER COULEUR NOIRE
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text("Pièces nécessaires :", startX, currentY);
  currentY += 8;
  
  // Ajouter la plaque Technic et les connecteurs
  const connectorsCount = calculateConnectors(module.moduleNumber, totalModules, gridCols);
  
  // Plaque Technic 16x16 - FORCER COULEUR NOIRE
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("• 1× Plaque Technic 16×16 (65803)", startX, currentY);
  currentY += 6;
  
  // Connecteurs (si nécessaires) - FORCER COULEUR NOIRE
  if (connectorsCount > 0) {
    pdf.setTextColor(0, 0, 0);
    pdf.text(`• ${connectorsCount}× Connecteurs Technic (61332)`, startX, currentY);
    currentY += 8;
  } else {
    currentY += 2;
  }

  // En-têtes du tableau des pièces colorées - FORCER COULEUR NOIRE
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Pièces 1×1 colorées :", startX, currentY);
  currentY += 8;
  
  // Colonnes optimisées pour éviter les débordements
  const colWidths = [16, 60, 30, 25]; // Ref, Couleur, Code, Qté
  const colPositions = [
    startX, 
    startX + colWidths[0], 
    startX + colWidths[0] + colWidths[1], 
    startX + colWidths[0] + colWidths[1] + colWidths[2]
  ];
  
  // En-têtes du tableau - FORCER COULEUR NOIRE
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("Réf", colPositions[0] + 8, currentY, { align: "center" });
  pdf.text("Couleur", colPositions[1] + 5, currentY);
  pdf.text("Code", colPositions[2] + 15, currentY, { align: "center" });
  pdf.text("Qté", colPositions[3] + 12, currentY, { align: "center" });
  currentY += 2;
  
  // Ligne de séparation ajustée
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.2);
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
  pdf.line(startX, currentY, startX + tableWidth, currentY);
  currentY += 5;
  
  // Données du tableau avec références
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  
  Object.entries(module.piecesList)
    .sort(([colorInfoA], [colorInfoB]) => {
      const colorHexA = colorInfoA.match(/\(([^)]+)\)/)?.[1] || "#000000";
      const colorHexB = colorInfoB.match(/\(([^)]+)\)/)?.[1] || "#000000";
      const legoColorA = config.colorPalette.find((c) => c.hex === colorHexA);
      const legoColorB = config.colorPalette.find((c) => c.hex === colorHexB);
      const idA = legoColorA?.id || 999999;
      const idB = legoColorB?.id || 999999;
      return idA - idB;
    })
    .forEach(([colorInfo, count]) => {
      const colorName = colorInfo.split(" (")[0];
      const colorHex = colorInfo.match(/\(([^)]+)\)/)?.[1] || "#000000";
      const legoColor = config.colorPalette.find((c) => c.hex === colorHex);
      const legoId = legoColor?.id.toString() || "N/A";
      const reference = colorReferences.get(colorInfo) || "?";
      
      // Vérifier si on a assez de place sur la page
      if (currentY > PDF_CONFIG.pageHeight - 20) {
        pdf.addPage("landscape");
        currentY = PDF_CONFIG.margin + 10;
      }
      
      // Référence avec fond coloré et effet 3D LEGO
      const rgb = legoColor?.rgb || [128, 128, 128];
      drawLegoBrick(pdf, colPositions[0] + 4, currentY - 3, 10, 6, legoColor || { hex: colorHex, rgb, name: colorName, id: 0 }, reference);
      
      // Reste du texte en noir avec alignement vertical centré - FORCER COULEUR NOIRE
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      
      // Nom de couleur (tronqué si nécessaire avec mesure de largeur)
      const maxColorNameWidth = colWidths[1] - 10;
      let displayName = colorName;
      if (pdf.getTextWidth(displayName) > maxColorNameWidth) {
        while (pdf.getTextWidth(displayName + "...") > maxColorNameWidth && displayName.length > 0) {
          displayName = displayName.slice(0, -1);
        }
        displayName += "...";
      }
      
      // Alignement vertical centré pour le texte - FORCER COULEUR NOIRE
      const textY = currentY + 1.5; // Centrage vertical dans la ligne
      
      pdf.setTextColor(0, 0, 0);
      pdf.text(displayName, colPositions[1] + 5, textY);
      pdf.setTextColor(0, 0, 0);
      pdf.text(legoId, colPositions[2] + 15, textY, { align: "center" });
      pdf.setTextColor(0, 0, 0);
      pdf.text(count.toString(), colPositions[3] + 12, textY, { align: "center" });
      
      currentY += 7;
    });
}

/**
 * Génère la page de récapitulatif avec mise en page à deux colonnes
 */
function generateSummaryPage(
  pdf: jsPDF,
  mosaicResult: MosaicResult,
  colorReferences: Map<string, string>
): void {
  const { pageWidth, pageHeight, margin } = PDF_CONFIG;
  const centerX = pageWidth / 2;
  
  // Titre de la page
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("Récapitulatif des Pièces", centerX, 25, { align: "center" });
  
  // Configuration des colonnes
  const columnWidth = (pageWidth - 3 * margin) / 2;
  const leftColumnX = margin;
  const rightColumnX = margin + columnWidth + margin;
  
  // === COLONNE GAUCHE ===
  let leftY = 45;
  
  // Informations générales
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Informations générales :", leftColumnX, leftY);
  leftY += 8;
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const totalModules = Math.ceil(mosaicResult.config.width / 16) * Math.ceil(mosaicResult.config.height / 16);
  
  pdf.text(`Dimensions : ${mosaicResult.config.width} × ${mosaicResult.config.height}`, leftColumnX, leftY);
  leftY += 6;
  pdf.text(`Modules 16×16 : ${totalModules}`, leftColumnX, leftY);
  leftY += 6;
  pdf.text(`Total pièces : ${mosaicResult.totalPieces}`, leftColumnX, leftY);
  leftY += 6;
  pdf.text(`Couleurs : ${colorReferences.size}`, leftColumnX, leftY);
  leftY += 12;
  
  // Instructions générales
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Instructions générales :", leftColumnX, leftY);
  leftY += 8;
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  const instructions = [
    "- Consultez le récapitulatif ci-contre pour préparer toutes vos pièces",
    "- Chaque couleur a une référence (A, B, C...) visible dans les diagrammes",
    "- Assemblez chaque module individuellement selon les étapes",
    "- Connectez les modules avec les connecteurs Technic",
    "- Suivez la numérotation des modules de gauche à droite, haut en bas"
  ];
  
  instructions.forEach(instruction => {
    pdf.text(instruction, leftColumnX, leftY);
    leftY += 5;
  });
  
  leftY += 10;
  
  // Pièces techniques nécessaires
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Pièces Technic nécessaires :", leftColumnX, leftY);
  leftY += 8;
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(`• ${totalModules}× Plaques Technic 16×16 (réf. 65803)`, leftColumnX, leftY);
  leftY += 6;
  
  // Calculer le total des connecteurs
  const gridCols = Math.ceil(mosaicResult.config.width / 16);
  let totalConnectors = 0;
  for (let i = 1; i <= totalModules; i++) {
    totalConnectors += calculateConnectors(i, totalModules, gridCols);
  }
  
  if (totalConnectors > 0) {
    pdf.text(`• ${totalConnectors}× Connecteurs Technic (réf. 61332)`, leftColumnX, leftY);
  }
  
  // === COLONNE DROITE ===
  let rightY = 45;
  
  // Tableau récapitulatif des couleurs
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Décomposition par couleur :", rightColumnX, rightY);
  rightY += 10;
  
  // En-têtes du tableau récapitulatif - MÊME STYLE QUE LES ÉTAPES
  const colWidths = [16, 55, 30, 25]; // Réf, Couleur, Code, Qté - Couleur réduite
  const colPositions = [
    rightColumnX,
    rightColumnX + colWidths[0],
    rightColumnX + colWidths[0] + colWidths[1],
    rightColumnX + colWidths[0] + colWidths[1] + colWidths[2]
  ];
  
  // En-têtes du tableau - FORCER COULEUR NOIRE ET MÊME STYLE
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text("Réf", colPositions[0] + 8, rightY, { align: "center" });
  pdf.text("Couleur", colPositions[1] + 5, rightY);
  pdf.text("Code", colPositions[2] + 15, rightY, { align: "center" });
  pdf.text("Qté", colPositions[3] + 12, rightY, { align: "center" });
  rightY += 2;
  
  // Ligne de séparation ajustée à la largeur du tableau - MÊME STYLE
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.2);
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);
  pdf.line(rightColumnX, rightY, rightColumnX + tableWidth, rightY);
  rightY += 5;
  
  // Calculer les totaux par couleur
  const colorTotals: Record<string, number> = {};
  mosaicResult.grid.forEach(row => {
    row.forEach(color => {
      const colorKey = `${color.name} (${color.hex})`;
      colorTotals[colorKey] = (colorTotals[colorKey] || 0) + 1;
    });
  });
  
  // Trier par quantité décroissante
  const sortedColorTotals = Object.entries(colorTotals)
    .sort(([, countA], [, countB]) => countB - countA);
  
  // Données du tableau - MÊME STYLE QUE LES ÉTAPES
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  
  sortedColorTotals.forEach(([colorInfo, count]) => {
    const colorName = colorInfo.split(" (")[0];
    const colorHex = colorInfo.match(/\(([^)]+)\)/)?.[1] || "#000000";
    const legoColor = mosaicResult.config.colorPalette.find((c) => c.hex === colorHex);
    const legoId = legoColor?.id.toString() || "N/A";
    const reference = colorReferences.get(colorInfo) || "?";
    
    // Référence avec fond coloré et effet 3D - MÊME TAILLE QUE LES ÉTAPES
    const rgb = legoColor?.rgb || [128, 128, 128];
    drawLegoBrick(pdf, colPositions[0] + 4, rightY - 3, 10, 6, legoColor || { hex: colorHex, rgb, name: colorName, id: 0 }, reference);
    
    // Reste du texte avec alignement vertical centré - FORCER COULEUR NOIRE ET MÊME STYLE
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    
    // Nom de couleur tronqué selon la largeur disponible
    const maxColorNameWidth = colWidths[1] - 10;
    let displayName = colorName;
    if (pdf.getTextWidth(displayName) > maxColorNameWidth) {
      while (pdf.getTextWidth(displayName + "...") > maxColorNameWidth && displayName.length > 0) {
        displayName = displayName.slice(0, -1);
      }
      displayName += "...";
    }
    
    // Alignement vertical centré pour le texte - MÊME STYLE QUE LES ÉTAPES
    const textY = rightY + 1.5;
    
    pdf.setTextColor(0, 0, 0);
    pdf.text(displayName, colPositions[1] + 5, textY);
    pdf.setTextColor(0, 0, 0);
    pdf.text(legoId, colPositions[2] + 15, textY, { align: "center" });
    pdf.setTextColor(0, 0, 0);
    pdf.text(count.toString(), colPositions[3] + 12, textY, { align: "center" });
    
    rightY += 7;
  });
}

/**
 * Génère la page de couverture avec image complète (sans texte)
 */
function generateCoverPage(
  pdf: jsPDF,
  mosaicResult: MosaicResult,
  colorReferences: Map<string, string>
): void {
  const { pageWidth, pageHeight, margin } = PDF_CONFIG;
  const centerX = pageWidth / 2;
  
  // Titre principal
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.text("Manuel d'Instructions", centerX, 25, { align: "center" });
  
  pdf.setFontSize(18);
  pdf.text("Cubic Art - Mosaïque LEGO", centerX, 35, { align: "center" });
  
  // Image complète de la mosaïque centrée et plus grande
  const maxImageWidth = pageWidth - 2 * margin;
  const maxImageHeight = pageHeight - 80; // Laisser de l'espace pour le titre
  
  const aspectRatio = mosaicResult.config.height / mosaicResult.config.width;
  let imageWidth = maxImageWidth;
  let imageHeight = imageWidth * aspectRatio;
  
  // Ajuster si l'image est trop haute
  if (imageHeight > maxImageHeight) {
    imageHeight = maxImageHeight;
    imageWidth = imageHeight / aspectRatio;
  }
  
  const imageX = centerX - imageWidth / 2;
  const imageY = 50;
  
  drawFullMosaicImage(pdf, mosaicResult, imageX, imageY, imageWidth, imageHeight, colorReferences);
}

/**
 * Génère le manuel d'instructions PDF complet
 */
export async function generateInstructionsPDF(
  mosaicResult: MosaicResult,
  config: MosaicConfig
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  
  // Générer le système de repérage des couleurs
  const colorReferences = generateColorReferences(mosaicResult);
  
  // Page de couverture avec image complète
  generateCoverPage(pdf, mosaicResult, colorReferences);
  
  // Page de récapitulatif
  pdf.addPage();
  generateSummaryPage(pdf, mosaicResult, colorReferences);
  
  // Générer les données des modules
  const modules = generateModulesData(mosaicResult);
  const gridCols = Math.ceil(config.width / 16);
  
  // Générer une page pour chaque module
  modules.forEach((module) => {
    pdf.addPage();
    
    const { margin, titleHeight } = PDF_CONFIG;
    
    // Titre de la page
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(`Étape ${module.moduleNumber}/${modules.length}`, margin, margin + 10);
    
    // Sous-titre avec position
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(
      `Position : Ligne ${Math.floor((module.moduleNumber - 1) / gridCols) + 1}, ` +
      `Colonne ${((module.moduleNumber - 1) % gridCols) + 1}`,
      margin,
      margin + 18
    );
    
    // Structure en 2 colonnes
    const columnWidth = (PDF_CONFIG.pageWidth - 3 * margin) / 2;
    
    // Colonne gauche : Grille du module avec repérage
    const gridSize = Math.min(columnWidth, PDF_CONFIG.imageHeight);
    const gridX = margin;
    const gridY = margin + titleHeight + 10;
    
    drawModuleGrid(pdf, module, gridX, gridY, gridSize, gridSize, colorReferences);
    
    // Colonne droite : Liste des pièces avec repérage
    const listX = margin + columnWidth + margin;
    const listY = gridY;
    
    addPiecesList(pdf, module, config, listX, listY, modules.length, gridCols, colorReferences);
  });
  
  // Retourner le PDF comme Blob
  return new Promise((resolve) => {
    const pdfBlob = pdf.output("blob");
    resolve(pdfBlob);
  });
}

/**
 * Télécharge le manuel d'instructions PDF
 */
export async function downloadInstructionsPDF(
  mosaicResult: MosaicResult,
  config: MosaicConfig
): Promise<void> {
  const pdfBlob = await generateInstructionsPDF(mosaicResult, config);
  
  // Nouveau format de nom de fichier
  const format = `${config.width}x${config.height}`;
  const imageName = mosaicResult.imageData.name.replace(/\.[^/.]+$/, ""); // Retirer l'extension
  const date = new Date().toISOString().slice(0, 10);
  const filename = `cubic-art_manual_${format}_${imageName}_${date}.pdf`;
  
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}