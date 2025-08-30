import type { LegoColor } from '@/types';

// Palette complète des 47 couleurs LEGO officielles (2024)
export const LEGO_COLORS: LegoColor[] = [
  // Couleurs neutres
  { id: 1, name: 'White', hex: '#FFFFFF', rgb: [255, 255, 255] },
  { id: 11, name: 'Black', hex: '#05131D', rgb: [5, 19, 29] },
  { id: 85, name: 'Dark Bluish Gray', hex: '#6C6E68', rgb: [108, 110, 104] },
  { id: 86, name: 'Light Bluish Gray', hex: '#9BA19D', rgb: [155, 161, 157] },
  
  // Couleurs primaires
  { id: 5, name: 'Red', hex: '#C91A09', rgb: [201, 26, 9] },
  { id: 7, name: 'Blue', hex: '#0055BF', rgb: [0, 85, 191] },
  { id: 6, name: 'Green', hex: '#237841', rgb: [35, 120, 65] },
  { id: 3, name: 'Yellow', hex: '#F2CD37', rgb: [242, 205, 55] },
  { id: 4, name: 'Orange', hex: '#FC7C02', rgb: [252, 124, 2] },
  
  // Couleurs brunes et tan
  { id: 88, name: 'Reddish Brown', hex: '#582A12', rgb: [88, 42, 18] },
  { id: 120, name: 'Dark Brown', hex: '#5F3109', rgb: [95, 49, 9] },
  { id: 2, name: 'Tan', hex: '#E4CD9E', rgb: [228, 205, 158] },
  { id: 90, name: 'Light Nougat', hex: '#F6D7B3', rgb: [246, 215, 179] },
  { id: 28, name: 'Nougat', hex: '#D09168', rgb: [208, 145, 104] },
  { id: 150, name: 'Medium Nougat', hex: '#AA7D55', rgb: [170, 125, 85] },
  { id: 69, name: 'Dark Tan', hex: '#958A73', rgb: [149, 138, 115] },
  { id: 240, name: 'Medium Brown', hex: '#897D62', rgb: [137, 125, 98] },
  { id: 241, name: 'Medium Tan', hex: '#CC9C2B', rgb: [204, 156, 43] },
  { id: 168, name: 'Umber', hex: '#6A4C36', rgb: [106, 76, 54] },
  { id: 169, name: 'Sienna', hex: '#915C3C', rgb: [145, 92, 60] },
  
  // Nouvelles couleurs 2024
  { id: 167, name: 'Reddish Orange', hex: '#CA4C0B', rgb: [202, 76, 11] },
  
  // Couleurs vertes
  { id: 34, name: 'Lime', hex: '#A3C312', rgb: [163, 195, 18] },
  { id: 36, name: 'Bright Green', hex: '#10CB31', rgb: [16, 203, 49] },
  { id: 48, name: 'Sand Green', hex: '#819E87', rgb: [129, 158, 135] },
  { id: 80, name: 'Dark Green', hex: '#184632', rgb: [24, 70, 50] },
  { id: 155, name: 'Olive Green', hex: '#9B9A5A', rgb: [155, 154, 90] },
  { id: 158, name: 'Yellowish Green', hex: '#DFEEA5', rgb: [223, 238, 165] },
  
  // Couleurs bleues
  { id: 42, name: 'Medium Blue', hex: '#5A93DB', rgb: [90, 147, 219] },
  { id: 63, name: 'Dark Blue', hex: '#143044', rgb: [20, 48, 68] },
  { id: 55, name: 'Sand Blue', hex: '#6074A1', rgb: [96, 116, 161] },
  { id: 105, name: 'Bright Light Blue', hex: '#9FC3E9', rgb: [159, 195, 233] },
  { id: 153, name: 'Dark Azure', hex: '#3592C3', rgb: [53, 146, 195] },
  { id: 156, name: 'Medium Azure', hex: '#36AEBF', rgb: [54, 174, 191] },
  { id: 152, name: 'Light Aqua', hex: '#B3D7D1', rgb: [179, 215, 209] },
  { id: 39, name: 'Dark Turquoise', hex: '#008F9B', rgb: [0, 143, 155] },
  
  // Couleurs violettes et roses
  { id: 220, name: 'Coral', hex: '#FF698F', rgb: [255, 105, 143] },
  { id: 59, name: 'Dark Red', hex: '#720E0F', rgb: [114, 14, 15] },
  
  // Couleurs jaunes spéciales
  { id: 103, name: 'Bright Light Yellow', hex: '#FFF03A', rgb: [255, 240, 58] },
  { id: 110, name: 'Bright Light Orange', hex: '#F8BB3D', rgb: [248, 187, 61] },
  { id: 236, name: 'Neon Yellow', hex: '#FFFF00', rgb: [255, 255, 0] },
  
  // Couleurs spéciales récentes
  { id: 68, name: 'Dark Orange', hex: '#A95500', rgb: [169, 85, 0] },
];

// Configuration par défaut de la mosaïque
export const DEFAULT_MOSAIC_CONFIG = {
  size: 32 as const,
  colorPalette: LEGO_COLORS,
  brickType: '1x1' as const
};