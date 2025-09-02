import type {
  LegoColor,
  MosaicConfig,
  MosaicImageData,
  MosaicResult,
} from "@/types";
import { LEGO_COLORS } from "./legoColors";

// Fonction de génération d'UUID compatible avec HTTP (alternative à crypto.randomUUID)
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Fonction utilitaire pour ajuster la luminosité d'une couleur hexadécimale
function adjustBrightness(hex: string, percent: number): string {
  // Supprimer le # si présent
  const cleanHex = hex.replace("#", "");

  // Convertir hex en RGB
  const r = parseInt(cleanHex.substr(0, 2), 16);
  const g = parseInt(cleanHex.substr(2, 2), 16);
  const b = parseInt(cleanHex.substr(4, 2), 16);

  // Ajuster la luminosité
  const adjustedR = Math.max(0, Math.min(255, r + (r * percent) / 100));
  const adjustedG = Math.max(0, Math.min(255, g + (g * percent) / 100));
  const adjustedB = Math.max(0, Math.min(255, b + (b * percent) / 100));

  // Convertir de retour en hex
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");

  return `#${toHex(adjustedR)}${toHex(adjustedG)}${toHex(adjustedB)}`;
}

// Les constantes de grille sont maintenant calculées dynamiquement selon config.size

// Éléments LEGO Technic pour système modulaire
const TECHNIC_BASEPLATE_SIZE = 16; // Taille d'une Plaque de base Technic 16x16
const TECHNIC_BASEPLATE_REF = "65803"; // BRICK 4/3, 16X16 W/ 4.85 HOLE
const CONNECTOR_PEG_REF = "61332"; // CONNECTOR PEG W. FRICTION
const PLATE_1X1_REF = "3024"; // Pièces 1x1 (conservée)

// Calcul du nombre de plaques de base Technic nécessaires
// Les constantes sont maintenant calculées dynamiquement dans processImageToMosaic

// // Fonction utilitaire pour calculer le nombre de connecteurs nécessaires
// Calcule uniquement les arêtes intérieures entre les plaques
// Pour une grille de N×M plaques : (N-1)*M arêtes horizontales + N*(M-1) arêtes verticales
// 3 connecteurs par arête intérieure
function calculateConnectorsNeeded(width: number, height: number): number {
  const horizontalEdges = (width - 1) * height;
  const verticalEdges = width * (height - 1);
  const totalInternalEdges = horizontalEdges + verticalEdges;
  return totalInternalEdges * 3;
}

// Fonction utilitaire pour calculer les éléments modulaires
function calculateModularElements(gridWidth: number, gridHeight: number) {
  const bricksWidth = Math.ceil(gridWidth / TECHNIC_BASEPLATE_SIZE);
  const bricksHeight = Math.ceil(gridHeight / TECHNIC_BASEPLATE_SIZE);
  const totalBricks = bricksWidth * bricksHeight;
  const connectorsNeeded = calculateConnectorsNeeded(bricksWidth, bricksHeight);

  return {
    bricksWidth,
    bricksHeight,
    totalBricks,
    connectorsNeeded,
    configuration: `${bricksWidth}x${bricksHeight} briques Technic pour mosaïque ${gridWidth}x${gridHeight}`,
  };
}

// Fonction pour obtenir les informations de configuration selon la taille
export function getModularConfiguration(gridSize: number) {
  // Validation des tailles supportées
  const supportedSizes = [16, 32, 48, 64];
  if (!supportedSizes.includes(gridSize)) {
    throw new Error(
      `Taille non supportée: ${gridSize}. Tailles supportées: ${supportedSizes.join(
        ", "
      )}`
    );
  }

  const modular = calculateModularElements(gridSize, gridSize);

  return {
    gridSize,
    totalPieces: gridSize * gridSize,
    technicBricks: {
      ref: TECHNIC_BASEPLATE_REF,
      name: "BRICK 4/3, 16X16 W/ 4.85 HOLE",
      quantity: modular.totalBricks,
      arrangement: `${modular.bricksWidth}x${modular.bricksHeight}`,
    },
    connectors: {
      ref: CONNECTOR_PEG_REF,
      name: "CONNECTOR PEG W. FRICTION",
      quantity: modular.connectorsNeeded,
    },
    plates1x1: {
      ref: PLATE_1X1_REF,
      name: "Pièce 1x1",
      quantity: gridSize * gridSize,
    },
    description: modular.configuration,
  };
}
// ================================================

// Calcul de la distance Delta E pour le mapping des couleurs
function deltaE(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const [r1, g1, b1] = rgb1;
  const [r2, g2, b2] = rgb2;

  // Conversion RGB vers LAB simplifiée pour Delta E
  const deltaR = r1 - r2;
  const deltaG = g1 - g2;
  const deltaB = b1 - b2;

  // Formule Delta E simplifiée (approximation)
  return Math.sqrt(
    2 * deltaR * deltaR + 4 * deltaG * deltaG + 3 * deltaB * deltaB
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
function resizeImageToGrid(
  imageElement: HTMLImageElement,
  gridSize: number
): ImageData {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = gridSize;
  canvas.height = gridSize;

  // Redimensionnement avec interpolation optimisée
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Calcul des dimensions pour le recadrage carré centré
  const { width: imgWidth, height: imgHeight } = imageElement;
  const minDimension = Math.min(imgWidth, imgHeight);

  // Calcul des coordonnées de recadrage pour centrer le carré
  const cropX = (imgWidth - minDimension) / 2;
  const cropY = (imgHeight - minDimension) / 2;

  // Dessiner l'image recadrée et redimensionnée
  ctx.drawImage(
    imageElement,
    cropX,
    cropY,
    minDimension,
    minDimension, // Source (carré centré)
    0,
    0,
    gridSize,
    gridSize // Destination selon la taille configurée
  );

  return ctx.getImageData(0, 0, gridSize, gridSize);
}

// Extrait les couleurs RGB de l'ImageData avec gestion de la transparence
function extractRGBGrid(
  imageData: ImageData,
  backgroundColorForTransparency?: LegoColor
): ([number, number, number] | null)[][] {
  const grid: ([number, number, number] | null)[][] = [];
  const { data, width, height } = imageData;

  // Couleur de fond par défaut (blanc) si aucune couleur n'est spécifiée
  const defaultBackground = backgroundColorForTransparency?.rgb || [
    255, 255, 255,
  ];
  const isEmptyMode = backgroundColorForTransparency?.id === -1;

  for (let y = 0; y < height; y++) {
    const row: ([number, number, number] | null)[] = [];
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const alpha = data[index + 3];

      // Gestion de la transparence
      if (alpha <= 128) {
        // Pixel complètement transparent
        if (isEmptyMode) {
          // Mode "Vide" : retourner null pour les pixels complètement transparents
          row.push(null);
        } else {
          // Remplacer par la couleur de fond
          row.push([
            defaultBackground[0],
            defaultBackground[1],
            defaultBackground[2],
          ]);
        }
      } else if (alpha < 255) {
        // Pixel semi-transparent - toujours mélanger avec la couleur de fond
        const opacity = alpha / 255;

        // Mélange alpha avec la couleur de fond
        const blendedR = Math.round(
          r * opacity + defaultBackground[0] * (1 - opacity)
        );
        const blendedG = Math.round(
          g * opacity + defaultBackground[1] * (1 - opacity)
        );
        const blendedB = Math.round(
          b * opacity + defaultBackground[2] * (1 - opacity)
        );

        row.push([blendedR, blendedG, blendedB]);
      } else {
        // Pixel opaque - utiliser la couleur originale
        row.push([r, g, b]);
      }
    }
    grid.push(row);
  }

  return grid;
}

// Couleur spéciale pour les emplacements vides
const EMPTY_LEGO_COLOR: LegoColor = {
  id: -1,
  name: "Vide",
  hex: "#transparent",
  rgb: [0, 0, 0],
};

// Mappe les couleurs RGB vers les couleurs LEGO
function mapToLegoColors(
  rgbGrid: ([number, number, number] | null)[][]
): LegoColor[][] {
  return rgbGrid.map((row) =>
    row.map((rgb) =>
      rgb === null ? EMPTY_LEGO_COLOR : findClosestLegoColor(rgb)
    )
  );
}

// Génère la liste des pièces nécessaires
function generatePiecesList(legoGrid: LegoColor[][]): Record<string, number> {
  const piecesList: Record<string, number> = {};

  legoGrid.flat().forEach((color) => {
    // Exclure les pièces "Vide" du décompte
    if (color.id === -1) return;

    const key = `${color.name} (${color.hex})`;
    piecesList[key] = (piecesList[key] || 0) + 1;
  });

  return piecesList;
}

// Génère les coordonnées des pièces
function generatePiecesCoordinates(
  legoGrid: LegoColor[][]
): Array<{ x: number; y: number; color: LegoColor }> {
  const pieces: Array<{ x: number; y: number; color: LegoColor }> = [];

  legoGrid.forEach((row, y) => {
    row.forEach((color, x) => {
      // Exclure les pièces "Vide" des coordonnées
      if (color.id !== -1) {
        pieces.push({ x, y, color });
      }
    });
  });

  return pieces;
}

// Fonction principale de traitement d'image
export async function processImageToMosaic(
  imageFile: File,
  config: MosaicConfig,
  backgroundColorForTransparency?: LegoColor
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
        const technicBricksPerSide = Math.ceil(
          gridSize / TECHNIC_BASEPLATE_SIZE
        );
        const totalTechnicBricks = technicBricksPerSide * technicBricksPerSide;
        const connectorsNeeded =
          calculateConnectorsNeeded(technicBricksPerSide, technicBricksPerSide);

        // 1. Redimensionnement selon la taille configurée
        const resizedImageData = resizeImageToGrid(img, gridSize);

        // 2. Extraction de la grille RGB avec gestion de la transparence
        const rgbGrid = extractRGBGrid(
          resizedImageData,
          backgroundColorForTransparency
        );

        // 3. Mapping vers les couleurs LEGO
        const legoGrid = mapToLegoColors(rgbGrid);

        // 4. Génération des données de résultat
        const pieces = generatePiecesCoordinates(legoGrid);
        const piecesList = generatePiecesList(legoGrid);
        const processingTime = performance.now() - startTime;

        // 5. Création de l'objet MosaicImageData
        const imageData: MosaicImageData = {
          id: generateUUID(),
          name: imageFile.name,
          originalUrl: url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          createdAt: new Date(),
        };

        // 6. Calcul des éléments modulaires nécessaires
        const modulePiecesList = {
          [`Plaque de base Technic 16x16 (${TECHNIC_BASEPLATE_REF})`]:
            totalTechnicBricks,
          [`Connecteur Technic (${CONNECTOR_PEG_REF})`]: connectorsNeeded,
          [`Pièce 1x1 (${PLATE_1X1_REF})`]: totalPieces,
        };

        // 7. Résultat final avec système modulaire
        const result: MosaicResult = {
          imageData,
          config,
          grid: legoGrid,
          exportFormats: ["png", "svg", "json"],
          processingTime,
          pieces,
          plaqueDeBase: {
            ref: `${totalTechnicBricks}x Plaque de base Technic ${TECHNIC_BASEPLATE_REF}`,
            size: `${gridSize}x${gridSize} (${technicBricksPerSide}x${technicBricksPerSide} briques)`,
          },
          totalPieces: totalPieces,
          piecesList: { ...piecesList, ...modulePiecesList },
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
      reject(new Error("Erreur lors du chargement de l'image"));
    };

    img.src = url;
  });
}

// Génère un canvas de prévisualisation de la mosaïque avec effet de tenon LEGO
export function generateMosaicPreview(
  result: MosaicResult,
  scale: number = 10
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Amélioration pour éviter le flou et la pixelisation
  const devicePixelRatio = window.devicePixelRatio || 1;
  const gridSize = result.config.size;

  // Calcul optimisé des dimensions pour un rendu ultra-net
  const baseScale = Math.max(scale, 16); // Scale minimum augmenté pour éviter la pixelisation
  const displayWidth = gridSize * baseScale;
  const displayHeight = gridSize * baseScale;

  // Configuration du canvas avec ratio optimal pour haute qualité
  const canvasScale = Math.max(devicePixelRatio, 3); // Minimum 3x pour une netteté maximale
  canvas.width = displayWidth * canvasScale;
  canvas.height = displayHeight * canvasScale;

  // Taille CSS d'affichage
  canvas.style.width = displayWidth + "px";
  canvas.style.height = displayHeight + "px";

  // Configuration du contexte pour un rendu optimal
  ctx.scale(canvasScale, canvasScale);

  // Activation de l'antialiasing maximal pour un rendu ultra-lisse
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Optimisations supplémentaires pour la netteté
  ctx.lineWidth = 0.5; // Lignes plus fines pour plus de précision

  // Scale ajusté pour le rendu
  const adjustedScale = baseScale;

  result.grid.forEach((row, y) => {
    row.forEach((color, x) => {
      // Position et taille de la brique
      const brickX = x * adjustedScale;
      const brickY = y * adjustedScale;
      const brickSize = adjustedScale;

      if (color && color.id === -1) {
        // Dessiner les emplacements "Vide" avec transparence alpha à 0
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fillRect(brickX, brickY, brickSize, brickSize);

        // Ajouter une bordure visible pour les cases vides
        ctx.strokeStyle = "rgba(220, 220, 220, 0.7)"; // Gris très clair pour meilleure visibilité
        // Calcul adaptatif pour les hautes résolutions (64x64)
        const minLineWidth = gridSize >= 64 ? 2 : 1;
        ctx.lineWidth = Math.max(minLineWidth, adjustedScale * 0.08); // Épaisseur augmentée
        ctx.strokeRect(brickX, brickY, brickSize, brickSize);
      } else if (color && color.id !== -1) {
        // Dessiner la brique avec effet 3D
        // Base de la brique
        ctx.fillStyle = color.hex;
        ctx.fillRect(brickX, brickY, brickSize, brickSize);

        // Ombre en bas et à droite pour l'effet 3D plus doux
        const brickShadowOffset = Math.max(1, adjustedScale * 0.08);
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)"; // Ombre plus douce et subtile
        ctx.fillRect(
          brickX + brickShadowOffset,
          brickY + brickSize - brickShadowOffset,
          brickSize - brickShadowOffset,
          brickShadowOffset
        );
        ctx.fillRect(
          brickX + brickSize - brickShadowOffset,
          brickY + brickShadowOffset,
          brickShadowOffset,
          brickSize - brickShadowOffset
        );

        // Dessiner le tenon LEGO avec taille augmentée pour meilleure visibilité
        const studRadius = Math.max(4, adjustedScale * 0.22); // Tenon plus grand pour correspondre à la palette
        // Calcul mathématiquement exact du centre pour un centrage parfait
        const studCenterX = brickX + brickSize / 2;
        const studCenterY = brickY + brickSize / 2;

        // Ombre portée du tenon plus douce
        const shadowOffset = Math.max(0.5, adjustedScale * 0.05); // Ombre plus subtile
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Ombre douce pour harmonie avec les carrés
        ctx.beginPath();
        ctx.arc(
          studCenterX + shadowOffset,
          studCenterY + shadowOffset,
          studRadius,
          0,
          2 * Math.PI
        );
        ctx.fill();

        // Tenon principal avec couleur plus fidèle à la palette LEGO
        const lighterColor = adjustBrightness(color.hex, 15); // Moins de variation pour rester fidèle
        ctx.fillStyle = lighterColor;
        ctx.beginPath();
        ctx.arc(studCenterX, studCenterY, studRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  });

  return canvas;
}
