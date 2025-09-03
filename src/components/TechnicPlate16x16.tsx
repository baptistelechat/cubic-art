import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LegoColor } from "@/types";
import { createTechnicPlateColor } from "@/utils/defaultConfig";
import { useEffect, useState } from "react";

interface TechnicPlate16x16Props {
  color: LegoColor;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const studSizeClasses = {
  sm: "w-0.5 h-0.5",
  md: "w-0.5 h-0.5",
  lg: "w-0.5 h-0.5",
};

const gridClasses = {
  sm: "grid-cols-3 gap-0.5",
  md: "grid-cols-8 gap-0.5",
  lg: "grid-cols-10 gap-0.5",
};

const studCountBySize = {
  sm: 9, // 3x3
  md: 64, // 7x7
  lg: 100, // 10x10
};

export const TechnicPlate16x16 = ({
  color,
  size = "md",
  showTooltip = false,
  className = "",
}: TechnicPlate16x16Props) => {
  // État pour la couleur de la plaque Technic (chargée depuis les CSV)
  const [plateColor, setPlateColor] = useState<LegoColor>(color);

  // Charger la couleur appropriée depuis les CSV
  useEffect(() => {
    const loadPlateColor = async () => {
      try {
        const technicColor = await createTechnicPlateColor(color);
        setPlateColor(technicColor);
      } catch (error) {
        console.error(
          "Erreur lors du chargement de la couleur Technic:",
          error
        );
        // En cas d'erreur, utiliser la couleur d'origine
        setPlateColor(color);
      }
    };

    loadPlateColor();
  }, [color]);
  const plateElement = (
    <div
      className={`relative cursor-pointer transition-all duration-200 hover:scale-105 group border-2 rounded-xs flex items-center justify-center ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: color.hex,
        borderColor: adjustBrightness(color.hex, -20),
        boxShadow: `
          inset -1px -1px 2px rgba(0,0,0,0.15),
          inset 1px 1px 2px rgba(255,255,255,0.2),
          1px 1px 3px rgba(0,0,0,0.1)
        `,
      }}
    >
      {/* Grille de points Technic */}
      <div className={`grid ${gridClasses[size]}`}>
        {Array.from({ length: studCountBySize[size] }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full ${studSizeClasses[size]}`}
            style={{
              backgroundColor: getStudColor(color.hex),
              boxShadow: `
                inset -0.5px -0.5px 1px rgba(0,0,0,0.3),
                inset 0.5px 0.5px 1px rgba(255,255,255,0.1)
              `,
            }}
          />
        ))}
      </div>

      {/* Effet de brillance sur hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200 bg-white pointer-events-none rounded-xs" />
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{plateElement}</TooltipTrigger>
          <TooltipContent>
            <div className="text-center flex gap-1 items-end">
              <div className="font-medium">{plateColor.name}</div>
              <div className="text-xs opacity-70">#{plateColor.id}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return plateElement;
};

// Fonction utilitaire pour ajuster la luminosité d'une couleur hexadécimale
function adjustBrightness(hex: string, percent: number): string {
  // Convertir hex en RGB
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  // S'assurer que les valeurs restent dans la plage 0-255
  const clampedR = Math.max(0, Math.min(255, R));
  const clampedG = Math.max(0, Math.min(255, G));
  const clampedB = Math.max(0, Math.min(255, B));

  return (
    "#" +
    ((clampedR << 16) | (clampedG << 8) | clampedB)
      .toString(16)
      .padStart(6, "0")
  );
}

// Fonction pour calculer la luminosité relative d'une couleur (0-1)
function getLuminance(hex: string): number {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) / 255;
  const g = ((num >> 8) & 0x00ff) / 255;
  const b = (num & 0x0000ff) / 255;

  // Formule de luminance relative W3C
  const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

// Fonction pour obtenir la couleur des studs adaptée à la luminosité de base
function getStudColor(baseColor: string): string {
  const luminance = getLuminance(baseColor);

  // Si la couleur est très sombre (luminance < 0.1), éclaircir les studs
  if (luminance < 0.1) {
    return adjustBrightness(baseColor, 60); // Éclaircir de 60%
  }
  // Si la couleur est sombre (luminance < 0.3), éclaircir légèrement
  else if (luminance < 0.3) {
    return adjustBrightness(baseColor, 20); // Éclaircir de 20%
  }
  // Pour les couleurs claires, assombrir comme avant
  else {
    return adjustBrightness(baseColor, -40); // Assombrir de 40%
  }
}
