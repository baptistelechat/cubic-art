import type { LegoColor, MosaicResult, MosaicImageData, MosaicConfig } from '@/types';
import { LEGO_COLORS } from './legoColors';

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

// Redimensionne l'image en 32x32 pixels
function resizeImageTo32x32(imageElement: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = 32;
  canvas.height = 32;
  
  // Redimensionnement avec interpolation optimisée
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(imageElement, 0, 0, 32, 32);
  
  return ctx.getImageData(0, 0, 32, 32);
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
        // 1. Redimensionnement en 32x32
        const resizedImageData = resizeImageTo32x32(img);
        
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
        
        // 6. Résultat final
        const result: MosaicResult = {
          imageData,
          config,
          grid: legoGrid,
          exportFormats: ['png', 'svg', 'json'],
          processingTime,
          pieces,
          plaqueDeBase: {
            ref: 'LEGO 3811',
            size: '32x32'
          },
          totalPieces: 1024, // 32 * 32
          piecesList
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

// Génère un canvas de prévisualisation de la mosaïque
export function generateMosaicPreview(result: MosaicResult, scale: number = 10): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = 32 * scale;
  canvas.height = 32 * scale;
  
  result.grid.forEach((row, y) => {
    row.forEach((color, x) => {
      ctx.fillStyle = color.hex;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    });
  });
  
  return canvas;
}