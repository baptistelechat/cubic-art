import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  generateBOM,
  generateBrickLinkCSV,
  generatePickABrickCSV,
} from "@/services/bomGenerator";
import type { BillOfMaterials, MosaicConfig, MosaicResult } from "@/types";
import { Download, Package, ToyBrick } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

interface DownloadCardProps {
  mosaicResult: MosaicResult | null;
  mosaicCanvas: HTMLCanvasElement | null;
  config: MosaicConfig;
}

// Fonction pour générer le SVG
function generateSVG(result: MosaicResult): string {
  const size = 10; // Taille de chaque carré
  const width = result.config.width * size;
  const height = result.config.height * size;

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

export const DownloadCard: React.FC<DownloadCardProps> = ({
  mosaicResult,
  mosaicCanvas,
  config,
}) => {
  const [bom, setBom] = useState<BillOfMaterials | null>(null);
  const [isGeneratingBom, setIsGeneratingBom] = useState(false);

  const generateBOMAsync = useCallback(async () => {
    if (!mosaicResult) return;

    setIsGeneratingBom(true);
    try {
      const generatedBom = await generateBOM(mosaicResult, true);
      setBom(generatedBom);
    } catch (error) {
      console.error("Erreur lors de la génération de la BOM:", error);
    } finally {
      setIsGeneratingBom(false);
    }
  }, [mosaicResult]);

  // Générer la BOM automatiquement quand la mosaïque change
  useEffect(() => {
    if (mosaicResult) {
      generateBOMAsync();
    }
  }, [mosaicResult, generateBOMAsync]);
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
          !key.includes("Plaque de base Technic") &&
          !key.includes("Connecteur") &&
          !key.includes("Pièce 1x1")
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

  const downloadPickABrickCSV = () => {
    if (!bom) return;

    const csvContent = generatePickABrickCSV(bom);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `pick-a-brick-${Date.now()}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadBrickLinkCSV = () => {
    if (!bom) return;

    const csvContent = generateBrickLinkCSV(bom);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `bricklink-wanted-list-${Date.now()}.csv`;
    link.click();
  };

  if (!mosaicResult || !mosaicCanvas) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Download size={24} className="text-green-600" />
          <span>Téléchargements</span>
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-left">
          {/* Section Images */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Images</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={downloadPNG}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={20} />
                <span>PNG</span>
              </button>
              <button
                onClick={downloadSVG}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={20} />
                <span>SVG</span>
              </button>
              <button
                onClick={downloadPiecesList}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={20} />
                <span>CSV</span>
              </button>
              <button
                onClick={downloadJSON}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={20} />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Section Commande de pièces */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Commande de pièces LEGO
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={downloadPickABrickCSV}
                disabled={!bom || isGeneratingBom}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                title="Télécharger le CSV pour Pick a Brick (LEGO.com)"
              >
                <ToyBrick size={20} />
                <span>
                  {isGeneratingBom ? "Génération..." : "Pick a Brick"}
                </span>
              </button>
              <button
                onClick={downloadBrickLinkCSV}
                disabled={!bom || isGeneratingBom}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                title="Télécharger le CSV pour BrickLink Wanted List"
              >
                <Package size={20} />
                <span>{isGeneratingBom ? "Génération..." : "BrickLink"}</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
