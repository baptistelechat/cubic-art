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
  y1?: number; // Première année de production
  y2?: number; // Dernière année de production
}

// Configuration de la mosaïque
export interface MosaicConfig {
  width: 16 | 32 | 48 | 64; // Largeur modulaire supportée
  height: 16 | 32 | 48 | 64; // Hauteur modulaire supportée
  colorPalette: LegoColor[]; // Couleurs LEGO officielles
  brickType: "1x1"; // Type de brique LEGO pour les pixels
  showModuleGrid?: boolean; // Afficher la grille de découpage des modules 16x16
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

// Types BrickLink supprimés (plus utilisés)

// Types supprimés : Rebrickable API (plus utilisés - données CSV locales)

// Types pour la Bill of Materials (BOM)
export interface BOMItem {
  part_num: string;
  color_id: number;
  quantity: number;
  color_name?: string;
  color_hex?: string;
  element_id?: string; // Pour Pick a Brick
  avg_price?: number; // Prix moyen (source externe)
  min_price?: number; // Prix minimum (source externe)
  max_price?: number; // Prix maximum (source externe)
}

export interface BillOfMaterials {
  items: BOMItem[];
  total_pieces: number;
  estimated_cost?: {
    min: number;
    avg: number;
    max: number;
    currency: string;
  };
  generated_at: Date;
}

// Types pour l'export CSV
export interface PickABrickCSVRow {
  element_id: string;
  quantity: number;
}

export interface BrickLinkCSVRow {
  ITEMID: string;
  COLOR: number;
  QUANTITY: number;
}

// Types pour les services API
export interface APIResponse<T> {
  data: T;
  meta?: {
    description: string;
    message: string;
  };
}

export interface APIError {
  type: string;
  message: string;
  details?: unknown;
}
