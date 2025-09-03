import type { LegoColor } from "@/types";

// Palette complète des couleurs LEGO officielles (triée par ID croissant)
export const LEGO_COLORS: LegoColor[] = [
  { id: 302401, name: "White", hex: "#f4f4f4", rgb: [244, 244, 244] },
  { id: 302421, name: "Bright Red", hex: "#b40000", rgb: [180, 0, 0] },
  { id: 302423, name: "Bright Blue", hex: "#1e5aa8", rgb: [30, 90, 168] },
  { id: 302424, name: "Bright Yellow", hex: "#fac80a", rgb: [250, 200, 10] },
  { id: 302426, name: "Black", hex: "#1b2a34", rgb: [27, 42, 52] },
  { id: 302428, name: "Dark Green", hex: "#00852b", rgb: [0, 133, 43] },
  { id: 4159553, name: "Brick Yellow", hex: "#ccb98d", rgb: [204, 185, 141] },
  { id: 4179826, name: "Medium Blue", hex: "#7396c8", rgb: [115, 150, 200] },
  { id: 4184108, name: "Earth Blue", hex: "#19325a", rgb: [25, 50, 90] },
  {
    id: 4210719,
    name: "Dark Stone Grey",
    hex: "#646464",
    rgb: [100, 100, 100],
  },
  {
    id: 4211399,
    name: "Medium Stone Grey",
    hex: "#969696",
    rgb: [150, 150, 150],
  },
  { id: 4221744, name: "Reddish Brown", hex: "#5f3109", rgb: [95, 49, 9] },
  { id: 4524929, name: "Bright Orange", hex: "#d67923", rgb: [214, 121, 35] },
  { id: 4539114, name: "New Dark Red", hex: "#720012", rgb: [114, 0, 18] },
  { id: 4549436, name: "Sand Yellow", hex: "#897d62", rgb: [137, 125, 98] },
  {
    id: 4619521,
    name: "Medium Lavender",
    hex: "#a06eb9",
    rgb: [160, 110, 185],
  },
  {
    id: 4621557,
    name: "Bright Yellowish Green",
    hex: "#a5ca18",
    rgb: [165, 202, 24],
  },
  { id: 6031883, name: "Light Purple", hex: "#ff9ecd", rgb: [255, 158, 205] },
  { id: 6055169, name: "Earth Green", hex: "#00451a", rgb: [0, 69, 26] },
  { id: 6058014, name: "Cool Yellow", hex: "#ffec6c", rgb: [255, 236, 108] },
  { id: 6058016, name: "Aqua", hex: "#d3f2ea", rgb: [211, 242, 234] },
  { id: 6058245, name: "Olive Green", hex: "#77774e", rgb: [119, 119, 78] },
  { id: 6069887, name: "Warm Gold", hex: "#b9953b", rgb: [185, 149, 59] },
  {
    id: 6073040,
    name: "Flame Yellowish Orange",
    hex: "#fcac00",
    rgb: [252, 172, 0],
  },
  {
    id: 6096942,
    name: "Bright Reddish Violet",
    hex: "#901f76",
    rgb: [144, 31, 118],
  },
  { id: 6097493, name: "Medium Azur", hex: "#68c3e2", rgb: [104, 195, 226] },
  { id: 6099189, name: "Sand Green", hex: "#708e7c", rgb: [112, 142, 124] },
  { id: 6099363, name: "Lavender", hex: "#cda4de", rgb: [205, 164, 222] },
  { id: 6151664, name: "Dark Azur", hex: "#469bc3", rgb: [70, 155, 195] },
  { id: 6186012, name: "Dark Orange", hex: "#91501c", rgb: [145, 80, 28] },
  {
    id: 6184484,
    name: "Light Royal Blue",
    hex: "#9dc3f7",
    rgb: [157, 195, 247],
  },
  { id: 6194729, name: "Dark Brown", hex: "#372100", rgb: [55, 33, 0] },
  {
    id: 6213778,
    name: "Bright Bluish Green",
    hex: "#009894",
    rgb: [0, 152, 148],
  },
  { id: 6215606, name: "Medium Nougat", hex: "#aa7d55", rgb: [170, 125, 85] },
  { id: 6217797, name: "Bright Purple", hex: "#c8509b", rgb: [200, 80, 155] },
  { id: 6231376, name: "Medium Lilac", hex: "#441a91", rgb: [68, 26, 145] },
  { id: 6257079, name: "Sand Blue", hex: "#70819a", rgb: [112, 129, 154] },
  { id: 6258091, name: "Vibrant Coral", hex: "#f06d78", rgb: [240, 109, 120] },
  { id: 6330584, name: "Nougat", hex: "#bb805a", rgb: [187, 128, 90] },
  { id: 6357797, name: "Light Nougat", hex: "#e1bea1", rgb: [225, 190, 161] },
  { id: 6401817, name: "Bright Green", hex: "#58ab41", rgb: [88, 171, 65] },
  { id: 6465247, name: "Vibrant Yellow", hex: "#ffff00", rgb: [255, 255, 0] },
  { id: 6469084, name: "Reddish Orange", hex: "#ca4c0b", rgb: [202, 76, 11] },
];

// Note: Les fonctions liées aux plaques Technic ont été déplacées vers defaultConfig.ts
// et utilisent maintenant les données CSV au lieu de mappings en dur

// Configuration par défaut de la mosaïque
export const DEFAULT_MOSAIC_CONFIG = {
  width: 48 as const,
  height: 48 as const,
  colorPalette: LEGO_COLORS,
  brickType: "1x1" as const,
  showModuleGrid: false,
};
