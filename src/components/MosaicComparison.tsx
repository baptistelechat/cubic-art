'use client';

import { useEffect, useRef } from 'react';
import { Trash2, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Comparison, ComparisonItem, ComparisonHandle } from '@/components/ui/kibo-ui/comparison';

interface MosaicComparisonProps {
  // Image source (original)
  originalImage: string;
  
  // Mosaic data - either canvas or image URL
  mosaicCanvas?: HTMLCanvasElement;
  mosaicImageUrl?: string;
  
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
  pieceCount,
  colorCount,
  onDelete,
  showDeleteButton = false,
  className = '',
  aspectRatio = 'aspect-square'
}: MosaicComparisonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Optimized canvas rendering with devicePixelRatio support
  useEffect(() => {
    if (!mosaicCanvas || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get device pixel ratio for sharp rendering
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Calculate display size
    const displayWidth = canvas.offsetWidth;
    const displayHeight = canvas.offsetHeight;
    
    // Calculate actual canvas size
    const canvasWidth = displayWidth * devicePixelRatio;
    const canvasHeight = displayHeight * devicePixelRatio;
    
    // Set actual canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Set CSS size
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    
    // Scale context for high DPI
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;
    
    // Draw the mosaic canvas
    ctx.drawImage(
      mosaicCanvas,
      0,
      0,
      displayWidth,
      displayHeight
    );
  }, [mosaicCanvas]);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {/* Comparison Section */}
        <div className={`relative ${aspectRatio} w-full`}>
          <Comparison className="h-full">
            {/* Mosaic */}
            <ComparisonItem position="left">
              {mosaicCanvas ? (
                <canvas
                  ref={canvasRef}
                  className="h-full w-full object-cover"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : mosaicImageUrl ? (
                <img
                  src={mosaicImageUrl}
                  alt="Mosaïque LEGO"
                  className="h-full w-full object-cover"
                  style={{ imageRendering: 'pixelated' }}
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