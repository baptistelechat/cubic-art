// Types pour les données d'image
export interface MosaicImageData {
  id: string;
  name: string;
  originalUrl: string;
  mosaicUrl?: string;
  width: number;
  height: number;
  createdAt: Date;
}

// Couleurs LEGO disponibles
export interface LegoColor {
  id: number;
  name: string;
  hex: string;
  rgb: [number, number, number];
}

// Configuration de la mosaïque
export interface MosaicConfig {
  size: 16 | 32 | 48 | 64; // Tailles modulaires supportées
  colorPalette: LegoColor[]; // Couleurs LEGO officielles
  brickType: "1x1"; // Type de brique LEGO pour les pixels
}

// Résultat de la transformation
export interface MosaicResult {
  imageData: MosaicImageData;
  config: MosaicConfig;
  grid: LegoColor[][];
  exportFormats: ("png" | "svg" | "json")[];
  processingTime: number;
  pieces: Array<{ x: number; y: number; color: LegoColor }>;
  colors?: LegoColor[];
  colorCount?: Record<string, number>;
  modularElements?: {
    brickTechnic16x16: {
      reference: string; // LEGO Technic Brick 16x16 (réf. 65803)
      quantity: number;
    };
    connectorTechnic: {
      reference: string; // LEGO Technic Connector Peg (réf. 61332)
      quantity: number;
    };
    plates1x1: {
      reference: string; // LEGO Pièces 1x1 (réf. 3024)
      quantity: number;
    };
  };
  plaqueDeBase?: {
    ref: string;
    size: string;
  };
  totalPieces: number;
  piecesList?: Record<string, number>;
  gridSize?: number;
}

// État de l'application
export interface AppState {
  currentImage: MosaicImageData | null;
  mosaicResult: MosaicResult | null;
  isProcessing: boolean;
  config: MosaicConfig;
  gallery: MosaicImageData[];
}

// Structure de stockage local
export interface LocalStorageData {
  userPreferences: {
    defaultConfig: MosaicConfig;
    theme: "light" | "dark";
    language: "fr" | "en";
  };
  recentImages: MosaicImageData[];
  favoriteResults: MosaicResult[];
  appVersion: string;
}

// Pipeline de traitement
export interface ProcessingPipeline {
  1: "imageResize";
  2: "colorQuantization";
  3: "gridMapping";
  4: "brickPlacement";
  5: "renderGeneration";
}

// Types RGB
export type RGB = [number, number, number];
