import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

interface LegoColor {
  id: number;
  name: string;
  hex: string;
  rgb: [number, number, number];
}

interface TechnicConnectorProps {
  color: LegoColor;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

const TechnicConnector: React.FC<TechnicConnectorProps> = ({
  color,
  size = "md",
  showTooltip = true,
  className = "",
}) => {
  // Définir les tailles pour le connecteur
  const sizeClasses = {
    sm: "size-6", // 24px
    md: "size-10", // 40px
    lg: "size-14", // 56px
  };

  // Définir les tailles du cercle intérieur
  const circleSizes = {
    sm: "w-5 h-5", // 20px
    md: "w-8 h-8", // 32px
    lg: "w-11 h-11", // 44px
  };

  // Définir les tailles de la ligne
  const lineSizes = {
    sm: "w-7 h-1", // 28px x 4px
    md: "w-10 h-2", // 40px x 8px
    lg: "w-14 h-3", // 56px x 12px
  };

  // Définir l'épaisseur de la bordure
  const borderSizes = {
    sm: "border-2",
    md: "border-4",
    lg: "border-[6px]",
  };

  // Style avec couleur LEGO dynamique

  const connectorElement = (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center cursor-pointer hover:scale-110 transition-transform ${className}`}
    >
      {/* Cercle avec ligne - Couleur dynamique basée sur la couleur LEGO */}
      <div className={`relative ${circleSizes[size]}`}>
        <div
          className={`${circleSizes[size]} ${borderSizes[size]} rounded-full`}
          style={{ borderColor: color.hex }}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${lineSizes[size]} bg-white`}
        ></div>
      </div>
    </div>
  );

  if (!showTooltip) {
    return connectorElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{connectorElement}</TooltipTrigger>
        <TooltipContent>
          <div className="text-center flex gap-1 items-end">
            <p className="font-medium">{color.name}</p>
            <p className="text-xs opacity-75">#{color.id}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TechnicConnector;
