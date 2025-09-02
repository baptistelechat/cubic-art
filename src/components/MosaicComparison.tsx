"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Comparison,
  ComparisonHandle,
  ComparisonItem,
} from "@/components/ui/kibo-ui/comparison";
import type { MosaicConfig } from "@/types";
import { Grid3X3, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface MosaicComparisonProps {
  // Image source (original)
  originalImage: string;

  // Mosaic data - either canvas or image URL
  mosaicCanvas?: HTMLCanvasElement;
  mosaicImageUrl?: string;

  // Mosaic configuration for aspect ratio calculation
  mosaicConfig?: MosaicConfig;

  // Statistics
  pieceCount?: number;
  colorCount?: number;

  // Optional actions
  onDelete?: () => void;
  showDeleteButton?: boolean;

  // Custom styling
  className?: string;
  aspectRatio?: string;
}

export function MosaicComparison({
  originalImage,
  mosaicCanvas,
  mosaicImageUrl,
  mosaicConfig,
  pieceCount,
  colorCount,
  onDelete,
  showDeleteButton = false,
  className = "",
  aspectRatio,
}: MosaicComparisonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Optimized canvas rendering with devicePixelRatio support
  useEffect(() => {
    if (!mosaicCanvas || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Wait for DOM to update with new dimensions
    requestAnimationFrame(() => {
      // Get device pixel ratio for sharp rendering
      const devicePixelRatio = window.devicePixelRatio || 1;

      // Get the container dimensions
      const containerWidth = canvas.offsetWidth;
      const containerHeight = canvas.offsetHeight;

      // Skip if container doesn't have dimensions yet
      if (containerWidth === 0 || containerHeight === 0) return;

      // Use full container dimensions - let CSS handle aspect ratio
      const displayWidth = containerWidth;
      const displayHeight = containerHeight;

      // Calculate actual canvas size
      const canvasWidth = displayWidth * devicePixelRatio;
      const canvasHeight = displayHeight * devicePixelRatio;

      // Set actual canvas size
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Remove explicit CSS sizing - let CSS classes handle it
      canvas.style.width = "";
      canvas.style.height = "";

      // Scale context for high DPI
      ctx.scale(devicePixelRatio, devicePixelRatio);

      // Disable image smoothing for crisp pixel art
      ctx.imageSmoothingEnabled = false;

      // Draw the mosaic canvas to fill the entire display area
      ctx.drawImage(mosaicCanvas, 0, 0, displayWidth, displayHeight);

      // Draw module grid if enabled
      if (mosaicConfig?.showModuleGrid) {
        const moduleSize = 16; // Taille d'un module en pixels
        const gridCols = Math.ceil(mosaicConfig.width / moduleSize);
        const gridRows = Math.ceil(mosaicConfig.height / moduleSize);

        // Calculer la taille d'un module sur le canvas affiché
        const moduleDisplayWidth = displayWidth / gridCols;
        const moduleDisplayHeight = displayHeight / gridRows;

        // Style de la grille
        ctx.strokeStyle = "rgba(255, 0, 0, 0.6)"; // Rouge semi-transparent
        ctx.lineWidth = 2;

        // Dessiner les lignes verticales
        for (let i = 1; i < gridCols; i++) {
          const x = i * moduleDisplayWidth;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, displayHeight);
          ctx.stroke();
        }

        // Dessiner les lignes horizontales
        for (let i = 1; i < gridRows; i++) {
          const y = i * moduleDisplayHeight;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(displayWidth, y);
          ctx.stroke();
        }

        // Draw module numbers
        let moduleNumber = 1;
        const fontSize =
          Math.min(moduleDisplayWidth, moduleDisplayHeight) * 0.15; // Réduction de 0.2 à 0.15

        for (let row = 0; row < gridRows; row++) {
          for (let col = 0; col < gridCols; col++) {
            // Calcul plus précis du centre avec arrondi pour éviter les décalages
            const centerX = Math.round(
              col * moduleDisplayWidth + moduleDisplayWidth / 2
            );
            const centerY = Math.round(
              row * moduleDisplayHeight + moduleDisplayHeight / 2
            );

            // Draw semi-transparent white background circle (taille réduite)
            const bubbleRadius = fontSize * 1.0; // Réduction de 1.2 à 1.0
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.beginPath();
            ctx.arc(centerX, centerY, bubbleRadius, 0, 2 * Math.PI);
            ctx.fill();

            // Add subtle border
            ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw module number avec un meilleur centrage
            ctx.fillStyle = "#333";
            ctx.font = `bold ${Math.round(fontSize)}px Arial`; // Arrondi de la taille de police
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Ajustement fin du centrage vertical
            const textY = centerY + 1; // Léger ajustement pour compenser l'alignement baseline

            ctx.fillText(moduleNumber.toString(), centerX, textY);

            moduleNumber++;
          }
        }
      }
    });
  }, [mosaicCanvas, mosaicConfig]);

  // Calculate dynamic aspect ratio based on mosaic config
  const dynamicAspectRatio = mosaicConfig
    ? { aspectRatio: `${mosaicConfig.width}/${mosaicConfig.height}` }
    : {};
  const fallbackClass = mosaicConfig ? "" : aspectRatio || "aspect-square";

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {/* Comparison Section */}
        <div
          className={`relative w-full ${fallbackClass}`}
          style={dynamicAspectRatio}
        >
          <Comparison className="h-full">
            {/* Mosaic */}
            <ComparisonItem position="left">
              {mosaicCanvas ? (
                <canvas
                  ref={canvasRef}
                  className="h-full w-full object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : mosaicImageUrl ? (
                <img
                  src={mosaicImageUrl}
                  alt="Mosaïque LEGO"
                  className="h-full w-full object-cover"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-muted-foreground">Aucune mosaïque</span>
                </div>
              )}
            </ComparisonItem>

            {/* Original Image */}
            <ComparisonItem position="right">
              <img
                src={originalImage}
                alt="Image originale"
                className="h-full w-full object-cover"
              />
            </ComparisonItem>

            <ComparisonHandle />
          </Comparison>

          {/* Delete Button */}
          {showDeleteButton && onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 z-10"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Statistics Section */}
        {(pieceCount !== undefined || colorCount !== undefined) && (
          <div className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              {pieceCount !== undefined && (
                <div className="flex items-center space-x-1">
                  <Grid3X3 size={16} className="text-gray-900" />
                  <span className="font-medium">{pieceCount} pièces</span>
                </div>
              )}
              {colorCount !== undefined && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-full"></div>
                  <span className="font-medium">{colorCount} couleurs</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
