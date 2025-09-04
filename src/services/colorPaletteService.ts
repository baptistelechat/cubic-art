import type { LegoColor } from "@/types";

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
