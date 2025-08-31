import type { LegoColor, MosaicResult, MosaicImageData, MosaicConfig } from '@/types';
import { LEGO_COLORS } from './legoColors';

// ===== VARIABLES DE CONFIGURATION MODULAIRE =====
// Modifiez ces valeurs pour tester différentes tailles de mosaïques
// Configurations supportées :
// - 16x16 : 1 brique Technic (1x1)
// - 32x32 : 4 briques Technic (2x2) + 2 connecteurs
// - 48x48 : 9 briques Technic (3x3) + 6 connecteurs  
// - 64x64 : 16 briques Technic (4x4) + 12 connecteurs
// Les constantes de grille sont maintenant calculées dynamiquement selon config.size

// Éléments LEGO Technic pour système modulaire
const TECHNIC_BRICK_SIZE = 16; // Taille d'une brique Technic 16x16
const TECHNIC_BRICK_REF = '65803'; // BRICK 4/3, 16X16 W/ 4.85 HOLE
const CONNECTOR_PEG_REF = '61332'; // CONNECTOR PEG W. FRICTION
const PLATE_1X1_REF = '3024'; // Plate 1x1 (conservée)

// Calcul du nombre de briques Technic nécessaires
// Les constantes sont maintenant calculées dynamiquement dans processImageToMosaic

// Fonction utilitaire pour calculer le nombre de connecteurs nécessaires
function calculateConnectorsNeeded(technicBricksPerSide: number): number {
  return Math.max(0, (technicBricksPerSide - 1) * technicBricksPerSide * 2);
}

// Fonction utilitaire pour calculer les éléments modulaires
function calculateModularElements(gridSize: number) {
  const bricksPerSide = Math.ceil(gridSize / TECHNIC_BRICK_SIZE);
  const totalBricks = bricksPerSide * bricksPerSide;
  const connectorsNeeded = Math.max(0, (bricksPerSide - 1) * bricksPerSide * 2);
  
  return {
    bricksPerSide,
    totalBricks,
    connectorsNeeded,
    configuration: `${bricksPerSide}x${bricksPerSide} briques Technic pour mosaïque ${gridSize}x${gridSize}`
  };
}

// Fonction pour obtenir les informations de configuration selon la taille
export function getModularConfiguration(gridSize: number) {
  // Validation des tailles supportées
  const supportedSizes = [16, 32, 48, 64];
  if (!supportedSizes.includes(gridSize)) {
    throw new Error(`Taille non supportée: ${gridSize}. Tailles supportées: ${supportedSizes.join(', ')}`);
  }
  
  const modular = calculateModularElements(gridSize);
  
  return {
    gridSize,
    totalPieces: gridSize * gridSize,
    technicBricks: {
      ref: TECHNIC_BRICK_REF,
      name: 'BRICK 4/3, 16X16 W/ 4.85 HOLE',
      quantity: modular.totalBricks,
      arrangement: `${modular.bricksPerSide}x${modular.bricksPerSide}`
    },
    connectors: {
      ref: CONNECTOR_PEG_REF,
      name: 'CONNECTOR PEG W. FRICTION',
      quantity: modular.connectorsNeeded
    },
    plates1x1: {
      ref: PLATE_1X1_REF,
      name: 'Plate 1x1',
      quantity: gridSize * gridSize
    },
    description: modular.configuration
  };
}
// ================================================

// Calcul de la distance Delta E pour le mapping des couleurs
function deltaE(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const [r1, g1, b1] = rgb1;
  const [r2, g2, b2] = rgb2;
  
  // Conversion RGB vers LAB simplifiée pour Delta E
  const deltaR = r1 - r2;
  const deltaG = g1 - g2;
  const deltaB = b1 - b2;
  
  // Formule Delta E simplifiée (approximation)
  return Math.sqrt(
    2 * deltaR * deltaR +
    4 * deltaG * deltaG +
    3 * deltaB * deltaB
  );
}

// Trouve la couleur LEGO la plus proche
function findClosestLegoColor(rgb: [number, number, number]): LegoColor {
  let closestColor = LEGO_COLORS[0];
  let minDistance = deltaE(rgb, closestColor.rgb);
  
  for (const color of LEGO_COLORS) {
    const distance = deltaE(rgb, color.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }
  
  return closestColor;
}

// Redimensionne l'image selon la taille de grille configurée avec recadrage carré centré
function resizeImageToGrid(imageElement: HTMLImageElement, gridSize: number): ImageData {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = gridSize;
  canvas.height = gridSize;
  
  // Redimensionnement avec interpolation optimisée
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Calcul des dimensions pour le recadrage carré centré
  const { width: imgWidth, height: imgHeight } = imageElement;
  const minDimension = Math.min(imgWidth, imgHeight);
  
  // Calcul des coordonnées de recadrage pour centrer le carré
  const cropX = (imgWidth - minDimension) / 2;
  const cropY = (imgHeight - minDimension) / 2;
  
  // Dessiner l'image recadrée et redimensionnée
  ctx.drawImage(
    imageElement,
    cropX, cropY, minDimension, minDimension, // Source (carré centré)
    0, 0, gridSize, gridSize // Destination selon la taille configurée
  );
  
  return ctx.getImageData(0, 0, gridSize, gridSize);
}

// Extrait les couleurs RGB de l'ImageData
function extractRGBGrid(imageData: ImageData): [number, number, number][][] {
  const grid: [number, number, number][][] = [];
  const { data, width, height } = imageData;
  
  for (let y = 0; y < height; y++) {
    const row: [number, number, number][] = [];
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      row.push([r, g, b]);
    }
    grid.push(row);
  }
  
  return grid;
}

// Mappe les couleurs RGB vers les couleurs LEGO
function mapToLegoColors(rgbGrid: [number, number, number][][]): LegoColor[][] {
  return rgbGrid.map(row => 
    row.map(rgb => findClosestLegoColor(rgb))
  );
}

// Génère la liste des pièces nécessaires
function generatePiecesList(legoGrid: LegoColor[][]): Record<string, number> {
  const piecesList: Record<string, number> = {};
  
  legoGrid.flat().forEach(color => {
    const key = `${color.name} (${color.hex})`;
    piecesList[key] = (piecesList[key] || 0) + 1;
  });
  
  return piecesList;
}

// Génère les coordonnées des pièces
function generatePiecesCoordinates(legoGrid: LegoColor[][]): Array<{x: number, y: number, color: LegoColor}> {
  const pieces: Array<{x: number, y: number, color: LegoColor}> = [];
  
  legoGrid.forEach((row, y) => {
    row.forEach((color, x) => {
      pieces.push({ x, y, color });
    });
  });
  
  return pieces;
}

// Fonction principale de traitement d'image
export async function processImageToMosaic(
  imageFile: File,
  config: MosaicConfig
): Promise<MosaicResult> {
  const startTime = performance.now();
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    
    img.onload = () => {
      try {
        // Calcul des constantes selon la taille configurée
        const gridSize = config.size;
        const totalPieces = gridSize * gridSize;
        const technicBricksPerSide = Math.ceil(gridSize / TECHNIC_BRICK_SIZE);
        const totalTechnicBricks = technicBricksPerSide * technicBricksPerSide;
        const connectorsNeeded = calculateConnectorsNeeded(technicBricksPerSide);
        
        // 1. Redimensionnement selon la taille configurée
        const resizedImageData = resizeImageToGrid(img, gridSize);
        
        // 2. Extraction de la grille RGB
        const rgbGrid = extractRGBGrid(resizedImageData);
        
        // 3. Mapping vers les couleurs LEGO
        const legoGrid = mapToLegoColors(rgbGrid);
        
        // 4. Génération des données de résultat
        const pieces = generatePiecesCoordinates(legoGrid);
        const piecesList = generatePiecesList(legoGrid);
        const processingTime = performance.now() - startTime;
        
        // 5. Création de l'objet MosaicImageData
        const imageData: MosaicImageData = {
          id: crypto.randomUUID(),
          name: imageFile.name,
          originalUrl: url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          createdAt: new Date()
        };
        
        // 6. Calcul des éléments modulaires nécessaires
        const modulePiecesList = {
          [`Brique Technic 16x16 (${TECHNIC_BRICK_REF})`]: totalTechnicBricks,
          [`Connecteur Technic (${CONNECTOR_PEG_REF})`]: connectorsNeeded,
          [`Plates 1x1 (${PLATE_1X1_REF})`]: totalPieces
        };

        // 7. Résultat final avec système modulaire
        const result: MosaicResult = {
          imageData,
          config,
          grid: legoGrid,
          exportFormats: ['png', 'svg', 'json'],
          processingTime,
          pieces,
          plaqueDeBase: {
            ref: `${totalTechnicBricks}x Brique Technic ${TECHNIC_BRICK_REF}`,
            size: `${gridSize}x${gridSize} (${technicBricksPerSide}x${technicBricksPerSide} briques)`
          },
          totalPieces: totalPieces,
          piecesList: { ...piecesList, ...modulePiecesList }
        };
        
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Erreur lors du chargement de l\'image'));
    };
    
    img.src = url;
  });
}

// Génère un canvas de prévisualisation de la mosaïque avec effet de tenon LEGO
export function generateMosaicPreview(result: MosaicResult, scale: number = 10): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Gestion des écrans haute résolution pour éviter le flou
  const devicePixelRatio = window.devicePixelRatio || 1;
  const gridSize = result.config.size;
  
  // Taille d'affichage
  const displayWidth = gridSize * scale;
  const displayHeight = gridSize * scale;
  
  // Taille réelle du canvas (avec devicePixelRatio)
  canvas.width = displayWidth * devicePixelRatio;
  canvas.height = displayHeight * devicePixelRatio;
  
  // Taille CSS d'affichage
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';
  
  // Mise à l'échelle du contexte pour les écrans haute résolution
  ctx.scale(devicePixelRatio, devicePixelRatio);
  
  // Désactiver l'antialiasing pour un rendu net et pixelisé
  ctx.imageSmoothingEnabled = false;
  
  // Ajuster le scale pour le devicePixelRatio
  const adjustedScale = scale;
  
  result.grid.forEach((row, y) => {
    row.forEach((color, x) => {
      if (color) {
        // Position et taille de la brique
        const brickX = x * adjustedScale;
        const brickY = y * adjustedScale;
        const brickSize = adjustedScale;
        
        // Dessiner la brique avec effet 3D
        // Base de la brique
        ctx.fillStyle = color.hex;
        ctx.fillRect(brickX, brickY, brickSize, brickSize);
        
        // Ombre en bas et à droite pour l'effet 3D
        const shadowOffset = Math.max(1, adjustedScale * 0.1);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(brickX + shadowOffset, brickY + brickSize - shadowOffset, brickSize - shadowOffset, shadowOffset);
        ctx.fillRect(brickX + brickSize - shadowOffset, brickY + shadowOffset, shadowOffset, brickSize - shadowOffset);
        
        // Dessiner le tenon central
        const studRadius = Math.max(2, adjustedScale * 0.15);
        const studCenterX = brickX + brickSize / 2;
        const studCenterY = brickY + brickSize / 2;
        
        // Ombre du tenon
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(studCenterX + 1, studCenterY + 1, studRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Base du tenon (même couleur que la brique)
        ctx.fillStyle = color.hex;
        ctx.beginPath();
        ctx.arc(studCenterX, studCenterY, studRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Effet de relief avec gradient radial
        const gradient = ctx.createRadialGradient(
          studCenterX - studRadius * 0.3, studCenterY - studRadius * 0.3, 0,
          studCenterX, studCenterY, studRadius
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, 0.6)`);
        gradient.addColorStop(0.7, `rgba(255, 255, 255, 0.1)`);
        gradient.addColorStop(1, `rgba(0, 0, 0, 0.4)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(studCenterX, studCenterY, studRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Brillance sur le tenon
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(studCenterX - studRadius * 0.3, studCenterY - studRadius * 0.3, studRadius * 0.4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  });
  
  return canvas;
}