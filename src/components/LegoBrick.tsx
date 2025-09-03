import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LegoColor } from "@/types";

interface LegoBrickProps {
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
  sm: "w-3 h-3",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export const LegoBrick = ({
  color,
  size = "md",
  showTooltip = false,
  className = "",
}: LegoBrickProps) => {
  const brickElement = (
    <div
      className={`relative cursor-pointer transition-all duration-200 hover:scale-105 group ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: color.hex,
        boxShadow: `
          inset -1px -1px 2px rgba(0,0,0,0.15),
          inset 1px 1px 2px rgba(255,255,255,0.2),
          1px 1px 3px rgba(0,0,0,0.1)
        `,
      }}
    >
      {/* Tenon central de la brique LEGO */}
      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full ${studSizeClasses[size]}`}
        style={{
          backgroundColor: color.hex,
          boxShadow: `
            inset -1px -1px 2px rgba(0,0,0,0.4),
            inset 1px 1px 2px rgba(255,255,255,0.6),
            0 1px 2px rgba(0,0,0,0.3)
          `,
          filter: "brightness(1.1)",
        }}
      />

      {/* Effet de brillance sur hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200 bg-white pointer-events-none" />
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{brickElement}</TooltipTrigger>
          <TooltipContent>
            <div className="text-center flex gap-1 items-end">
              <div className="font-medium">{color.name}</div>
              <div className="text-xs opacity-70">#{color.id}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return brickElement;
};
