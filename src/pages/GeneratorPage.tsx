import { LegoBrick } from "@/components/LegoBrick";
import { MosaicComparison } from "@/components/MosaicComparison";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/hooks/useStore";
import type { LegoColor, MosaicResult } from "@/types";
import {
  generateMosaicPreview,
  processImageToMosaic,
} from "@/utils/imageProcessor";
import {
  Clock,
  Download,
  Grid3X3,
  Image as ImageIcon,
  Palette,
  Puzzle,
  Upload,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Fonction pour générer le SVG
function generateSVG(result: MosaicResult): string {
  const size = 10; // Taille de chaque carré
  const width = 32 * size;
  const height = 32 * size;

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  result.grid.forEach((row, y) => {
    row.forEach((color, x) => {
      svg += `<rect x="${x * size}" y="${
        y * size
      }" width="${size}" height="${size}" fill="${color.hex}" />`;
    });
  });

  svg += "</svg>";
  return svg;
}

export function GeneratorPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mosaicCanvas, setMosaicCanvas] = useState<HTMLCanvasElement | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const {
    config,
    isProcessing,
    mosaicResult,
    setIsProcessing,
    setMosaicResult,
    updateConfig,
  } = useStore();

  // État pour stocker le fichier actuel
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // Couleur spéciale "Vide" pour ne placer aucune pièce
  const EMPTY_COLOR: LegoColor = {
    id: -1,
    name: "Vide",
    hex: "#transparent",
    rgb: [0, 0, 0],
  };

  // État pour la couleur de fond de remplacement pour la transparence
  const [backgroundColorForTransparency, setBackgroundColorForTransparency] =
    useState<LegoColor>(
      config.colorPalette.find((color) => color.name === "White") ||
        config.colorPalette[0]
    );

  // Fonctions stabilisées avec useCallback pour éviter les boucles infinies
  const stableSetIsProcessing = useCallback(
    (processing: boolean) => {
      setIsProcessing(processing);
    },
    [setIsProcessing]
  );

  const stableSetMosaicResult = useCallback(
    (result: MosaicResult) => {
      setMosaicResult(result);
    },
    [setMosaicResult]
  );

  // Régénération automatique lors du changement de taille de grille
  useEffect(() => {
    const regenerateMosaic = async () => {
      if (currentFile && !isProcessing) {
        try {
          stableSetIsProcessing(true);
          setError(null);

          // Traitement de l'image avec la nouvelle configuration
          const result = await processImageToMosaic(
            currentFile,
            config,
            backgroundColorForTransparency
          );

          // Génération du canvas de prévisualisation
          const canvas = generateMosaicPreview(result, 10);
          setMosaicCanvas(canvas);

          stableSetMosaicResult(result);
          stableSetIsProcessing(false);
        } catch (error) {
          console.error("Erreur lors de la régénération:", error);
          setError(
            "Erreur lors de la régénération de la mosaïque. Veuillez réessayer."
          );
          stableSetIsProcessing(false);
        }
      }
    };

    regenerateMosaic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config,
    currentFile,
    backgroundColorForTransparency,
    stableSetIsProcessing,
    stableSetMosaicResult,
  ]); // Dépendances sans isProcessing pour éviter la boucle infinie

  // Constantes pour les limites
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo en bytes
  const MAX_IMAGE_DIMENSION = 4000; // 4000x4000 pixels

  // Fonction de validation des fichiers
  const validateFile = async (
    file: File
  ): Promise<{ isValid: boolean; error?: string }> => {
    // Validation du type de fichier
    if (!file.type.startsWith("image/")) {
      return {
        isValid: false,
        error: "Veuillez sélectionner un fichier image valide.",
      };
    }

    // Validation de la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        isValid: false,
        error: `Le fichier est trop volumineux (${sizeMB} Mo). La taille maximale autorisée est de 10 Mo.`,
      };
    }

    // Validation des dimensions de l'image
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (
          img.width > MAX_IMAGE_DIMENSION ||
          img.height > MAX_IMAGE_DIMENSION
        ) {
          resolve({
            isValid: false,
            error: `Les dimensions de l'image sont trop importantes (${img.width}x${img.height}). Les dimensions maximales autorisées sont de ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION} pixels.`,
          });
        } else {
          resolve({ isValid: true });
        }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve({
          isValid: false,
          error: "Impossible de lire les dimensions de l'image.",
        });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    // Réinitialiser l'erreur précédente
    setError(null);

    // Validation du fichier
    const validation = await validateFile(file);
    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }

    // Prévisualisation de l'image originale
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Stocker le fichier pour la régénération automatique
    setCurrentFile(file);

    try {
      // Démarrer le traitement
      setIsProcessing(true);

      // Traitement de l'image
      const result = await processImageToMosaic(
        file,
        config,
        backgroundColorForTransparency
      );

      // Génération du canvas de prévisualisation
      const canvas = generateMosaicPreview(result, 10);
      setMosaicCanvas(canvas);

      setMosaicResult(result);
      setIsProcessing(false);
    } catch (error) {
      console.error("Erreur lors du traitement:", error);
      setError(
        "Erreur lors du traitement de l'image. Veuillez réessayer avec une autre image."
      );
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const downloadPNG = () => {
    if (!mosaicCanvas) return;

    const link = document.createElement("a");
    link.download = `mosaic-${Date.now()}.png`;
    link.href = mosaicCanvas.toDataURL();
    link.click();
  };

  const downloadSVG = () => {
    if (!mosaicResult) return;

    const svgContent = generateSVG(mosaicResult);
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `mosaic-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (!mosaicResult) return;

    const data = {
      plaqueDeBase: mosaicResult.plaqueDeBase,
      totalPieces: mosaicResult.totalPieces,
      piecesList: mosaicResult.piecesList,
      grid: mosaicResult.grid.map((row) =>
        row.map((color) => ({ name: color.name, hex: color.hex }))
      ),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `mosaic-pieces-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPiecesList = () => {
    if (!mosaicResult || !mosaicResult.piecesList) return;

    // Créer le contenu CSV
    let csvContent = "Couleur,Code LEGO,Hex,Quantité\n";
    
    Object.entries(mosaicResult.piecesList)
      .filter(
        ([key]) =>
          !key.includes("Brique Technic") &&
          !key.includes("Connecteur") &&
          !key.includes("Plates 1x1")
      )
      .sort(([colorInfoA], [colorInfoB]) => {
        const colorHexA = colorInfoA.match(/\(([^)]+)\)/)?.[1] || "#000000";
        const colorHexB = colorInfoB.match(/\(([^)]+)\)/)?.[1] || "#000000";
        const legoColorA = config.colorPalette.find((c) => c.hex === colorHexA);
        const legoColorB = config.colorPalette.find((c) => c.hex === colorHexB);
        const idA = legoColorA?.id || 999999;
        const idB = legoColorB?.id || 999999;
        return idA - idB;
      })
      .forEach(([colorInfo, count]) => {
        const colorName = colorInfo.split(" (")[0];
        const colorHex = colorInfo.match(/\(([^)]+)\)/)?.[1] || "#000000";
        const legoColor = config.colorPalette.find((c) => c.hex === colorHex);
        const legoId = legoColor?.id || "N/A";
        
        csvContent += `"${colorName}","${legoId}","${colorHex}",${count}\n`;
      });

    // Créer et télécharger le fichier CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `mosaic-pieces-list-${Date.now()}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Générateur de mosaïques LEGO
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Uploadez votre image et transformez-la en mosaïque LEGO modulaire
            avec les couleurs officielles LEGO
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Configuration */}
          <div className="space-y-6">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Upload size={24} className="text-blue-600" />
                  <span>Uploader votre image</span>
                </h3>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Glissez-déposez votre image ici
                  </p>
                  <p className="text-gray-500 mb-4">
                    ou cliquez pour parcourir vos fichiers
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Choisir un fichier
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Configuration */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Grid3X3 size={24} className="text-green-600" />
                  <span>Configuration</span>
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taille de la grille
                    </label>
                    <Select
                      value={config.size.toString()}
                      onValueChange={(value) =>
                        updateConfig({
                          size: parseInt(value) as 16 | 32 | 48 | 64,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionnez une taille" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16">
                          <div className="flex items-center space-x-1">
                            <Puzzle className="size-4 text-gray-900" />
                            <span className="text-sm text-gray-900 font-medium">
                              16x16
                            </span>
                            <span className="text-xs text-gray-600">
                              (256 pièces)
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="32">
                          <div className="flex items-center space-x-1">
                            <Puzzle className="size-4 text-gray-900" />
                            <span className="text-sm text-gray-900 font-medium">
                              32x32
                            </span>
                            <span className="text-xs text-gray-600">
                              (1024 pièces)
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="48">
                          <div className="flex items-center space-x-1">
                            <Puzzle className="size-4 text-gray-900" />
                            <span className="text-sm text-gray-900 font-medium">
                              48x48
                            </span>
                            <span className="text-xs text-gray-600">
                              (2304 pièces)
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="64">
                          <div className="flex items-center space-x-1">
                            <Puzzle className="size-4 text-gray-900" />
                            <span className="text-sm text-gray-900 font-medium">
                              64x64
                            </span>
                            <span className="text-xs text-gray-600">
                              (4096 pièces)
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur de remplacement de la transparence (Import PNG)
                    </label>
                    <Select
                      value={backgroundColorForTransparency.id.toString()}
                      onValueChange={(value) => {
                        if (value === "-1") {
                          setBackgroundColorForTransparency(EMPTY_COLOR);
                        } else {
                          const selectedColor = config.colorPalette.find(
                            (color) => color.id.toString() === value
                          );
                          if (selectedColor) {
                            setBackgroundColorForTransparency(selectedColor);
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          <div className="flex items-center space-x-2">
                            {backgroundColorForTransparency.id === -1 ? (
                              <div className="w-6 h-6 border-2 border-dashed border-gray-400 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-500">∅</span>
                              </div>
                            ) : (
                              <LegoBrick
                                color={backgroundColorForTransparency}
                                size="sm"
                                showTooltip={false}
                              />
                            )}
                            <span className="text-sm text-gray-900 font-medium">
                              {backgroundColorForTransparency.name}
                            </span>
                            <span className="text-xs text-gray-600">
                              {backgroundColorForTransparency.id !== -1 &&
                                `#${backgroundColorForTransparency.id}`}
                            </span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem
                          key={EMPTY_COLOR.id}
                          value={EMPTY_COLOR.id.toString()}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 border-2 border-dashed border-gray-400 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500">∅</span>
                            </div>
                            <span className="text-sm">{EMPTY_COLOR.name}</span>
                          </div>
                        </SelectItem>
                        {config.colorPalette.map((color) => (
                          <SelectItem
                            key={color.id}
                            value={color.id.toString()}
                          >
                            <div className="flex items-center space-x-2">
                              <LegoBrick
                                color={color}
                                size="sm"
                                showTooltip={false}
                              />
                              <span className="text-sm text-gray-900 font-medium">
                                {color.name}
                              </span>
                              <span className="text-xs text-gray-600">
                                #{color.id}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                        onClick={() => setError(null)}
                      >
                        <span className="sr-only">Fermer</span>
                        <svg
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Aperçu de la mosaïque */}
            {mosaicResult && mosaicCanvas && previewUrl && (
              <MosaicComparison
                originalImage={previewUrl}
                mosaicCanvas={mosaicCanvas}
                pieceCount={mosaicResult.totalPieces}
                colorCount={
                  mosaicResult.piecesList
                    ? Object.keys(mosaicResult.piecesList).filter(
                        (key) =>
                          !key.includes("Brique Technic") &&
                          !key.includes("Connecteur") &&
                          !key.includes("Plates 1x1")
                      ).length
                    : 0
                }
                className="bg-white shadow-lg"
              />
            )}

            {/* Téléchargements */}
            {mosaicResult && mosaicCanvas && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Download size={24} className="text-green-600" />
                    <span>Téléchargements</span>
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button
                    onClick={downloadPNG}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download size={20} />
                    <span>Télécharger PNG</span>
                  </button>
                  <button
                    onClick={downloadSVG}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download size={20} />
                    <span>Télécharger SVG</span>
                  </button>
                  <button
                    onClick={downloadPiecesList}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download size={20} />
                    <span>Liste des pièces (CSV)</span>
                  </button>
                  <button
                    onClick={downloadJSON}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download size={20} />
                    <span>Données JSON</span>
                  </button>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Result Section */}
          <div className="space-y-6">
            {isProcessing && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock size={24} className="text-blue-600 animate-spin" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Traitement en cours...
                    </h3>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full animate-pulse"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Redimensionnement et mapping des couleurs LEGO...
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Palette LEGO officielle complète */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Palette size={24} className="text-red-600" />
                  <span>Palette LEGO officielle complète</span>
                </h3>
              </CardHeader>
              <CardContent>
                <TooltipProvider>
                  <div className="grid grid-cols-10 gap-3 mb-4">
                    {config.colorPalette.map((color) => (
                      <LegoBrick
                        key={color.id}
                        color={color}
                        size="md"
                        showTooltip={true}
                      />
                    ))}
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>

            {/* Décomposition des pièces par couleurs */}
            {mosaicResult && mosaicResult.piecesList && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Palette size={24} className="text-purple-600" />
                    <span>Décomposition des pièces par couleurs</span>
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(mosaicResult.piecesList)
                      .filter(
                        ([key]) =>
                          !key.includes("Brique Technic") &&
                          !key.includes("Connecteur") &&
                          !key.includes("Plates 1x1")
                      )
                      .sort(([colorInfoA], [colorInfoB]) => {
                        const colorHexA =
                          colorInfoA.match(/\(([^)]+)\)/)?.[1] || "#000000";
                        const colorHexB =
                          colorInfoB.match(/\(([^)]+)\)/)?.[1] || "#000000";
                        const legoColorA = config.colorPalette.find(
                          (c) => c.hex === colorHexA
                        );
                        const legoColorB = config.colorPalette.find(
                          (c) => c.hex === colorHexB
                        );
                        const idA = legoColorA?.id || 999999;
                        const idB = legoColorB?.id || 999999;
                        return idA - idB;
                      })
                      .map(([colorInfo, count]) => {
                        const colorName = colorInfo.split(" (")[0];
                        const colorHex =
                          colorInfo.match(/\(([^)]+)\)/)?.[1] || "#000000";
                        const legoColor = config.colorPalette.find(
                          (c) => c.hex === colorHex
                        );

                        return (
                          <div
                            key={colorInfo}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              {legoColor && (
                                <LegoBrick
                                  color={legoColor}
                                  size="md"
                                  showTooltip={false}
                                />
                              )}
                              <div className="text-left">
                                <div className="font-medium text-gray-900 text-sm">
                                  {colorName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  #{legoColor?.id || "N/A"}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-gray-900">
                                {count}
                              </div>
                              <div className="text-xs text-gray-500">
                                pièces
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Total des pièces colorées avec brique LEGO blanche */}
                  <div className="border-t mt-3">
                    <div className="flex items-center justify-between p-3 rounded-lg text-gray-900">
                      <div className="flex items-center space-x-3">
                        <LegoBrick
                          color={{
                            id: 302401,
                            name: "White",
                            hex: "#f4f4f4",
                            rgb: [244, 244, 244],
                          }}
                          size="md"
                          showTooltip={false}
                        />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 text-sm">
                            Pièces 1x1
                          </div>
                          <div className="text-xs text-gray-500">#3024</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl">
                          {Object.entries(mosaicResult.piecesList)
                            .filter(
                              ([key]) =>
                                !key.includes("Brique Technic") &&
                                !key.includes("Connecteur") &&
                                !key.includes("Plates 1x1")
                            )
                            .reduce((sum, [, count]) => sum + count, 0)}
                        </div>
                        <div className="text-sm text-gray-600">pièces</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
