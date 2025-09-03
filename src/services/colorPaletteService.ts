import type { LegoColor } from "@/types";

/**
 * Service pour gérer les palettes de couleurs LEGO
 */

/**
 * Récupère la palette de couleurs par défaut
 * @returns Liste des couleurs LEGO les plus communes
 */
export const getDefaultColorPalette = (): LegoColor[] => {
  const allColors = [
    { id: 1, name: "White", hex: "#FFFFFF", rgb: [255, 255, 255] },
    { id: 5, name: "Red", hex: "#C91A09", rgb: [201, 26, 9] },
    { id: 7, name: "Blue", hex: "#0055BF", rgb: [0, 85, 191] },
    { id: 6, name: "Green", hex: "#237841", rgb: [35, 120, 65] },
    { id: 3, name: "Yellow", hex: "#F2CD37", rgb: [242, 205, 55] },
    { id: 4, name: "Orange", hex: "#FC7C02", rgb: [252, 124, 2] },
    { id: 11, name: "Black", hex: "#05131D", rgb: [5, 19, 29] },
    { id: 85, name: "Dark Bluish Gray", hex: "#6C6E68", rgb: [108, 110, 104] },
    { id: 86, name: "Light Bluish Gray", hex: "#9BA19D", rgb: [155, 161, 157] },
    { id: 88, name: "Reddish Brown", hex: "#582A12", rgb: [88, 42, 18] },
    { id: 2, name: "Tan", hex: "#E4CD9E", rgb: [228, 205, 158] },
    { id: 42, name: "Medium Blue", hex: "#5A93DB", rgb: [90, 147, 219] },
    { id: 63, name: "Dark Blue", hex: "#143044", rgb: [20, 48, 68] },
    { id: 34, name: "Lime", hex: "#A3C312", rgb: [163, 195, 18] },
    { id: 36, name: "Bright Green", hex: "#10CB31", rgb: [16, 203, 49] },
    { id: 80, name: "Dark Green", hex: "#184632", rgb: [24, 70, 50] },
  ];

  return allColors
    .filter((color) => !color.name.startsWith("Trans-"))
    .map((color) => ({
      ...color,
      rgb: [color.rgb[0], color.rgb[1], color.rgb[2]] as [
        number,
        number,
        number
      ],
    }))
    .sort((a, b) => a.id - b.id);
};



/**
 * Trouve la couleur la plus proche dans une palette donnée
 * @param targetColor Couleur cible (RGB)
 * @param palette Palette de couleurs disponibles
 * @returns Couleur la plus proche
 */
export const findClosestColor = (
  targetColor: [number, number, number],
  palette: LegoColor[]
): LegoColor => {
  let closestColor = palette[0];
  let minDistance = Infinity;

  for (const color of palette) {
    const distance = calculateColorDistance(targetColor, color.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }

  return closestColor;
};

/**
 * Convertit une couleur RGB en espace colorimétrique LAB
 */
const rgbToLab = (
  r: number,
  g: number,
  b: number
): [number, number, number] => {
  let rNorm = r / 255;
  let gNorm = g / 255;
  let bNorm = b / 255;

  rNorm =
    rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
  gNorm =
    gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
  bNorm =
    bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;

  const x = rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375;
  const y = rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.072175;
  const z = rNorm * 0.0193339 + gNorm * 0.119192 + bNorm * 0.9503041;

  const xn = x / 0.95047;
  const yn = y / 1.0;
  const zn = z / 1.08883;

  const fx = xn > 0.008856 ? Math.pow(xn, 1 / 3) : 7.787 * xn + 16 / 116;
  const fy = yn > 0.008856 ? Math.pow(yn, 1 / 3) : 7.787 * yn + 16 / 116;
  const fz = zn > 0.008856 ? Math.pow(zn, 1 / 3) : 7.787 * zn + 16 / 116;

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bLab = 200 * (fy - fz);

  return [L, a, bLab];
};

/**
 * Calcule la distance Delta E CIE76 entre deux couleurs dans l'espace LAB
 */
const deltaE76 = (
  lab1: [number, number, number],
  lab2: [number, number, number]
): number => {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;

  return Math.sqrt(
    Math.pow(L2 - L1, 2) + Math.pow(a2 - a1, 2) + Math.pow(b2 - b1, 2)
  );
};

/**
 * Calcule la distance perceptuelle entre deux couleurs RGB en utilisant Delta E
 */
const calculateColorDistance = (
  color1: [number, number, number],
  color2: [number, number, number]
): number => {
  const lab1 = rgbToLab(color1[0], color1[1], color1[2]);
  const lab2 = rgbToLab(color2[0], color2[1], color2[2]);

  return deltaE76(lab1, lab2);
};
