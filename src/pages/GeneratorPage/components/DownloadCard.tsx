import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  generateBricklinkXMLFromPieces,
  generatePABCSV,
  generatePABJSON,
} from "@/services/bomGenerator";
import type { LegoColor, MosaicConfig, MosaicResult } from "@/types";
import { Copy, Download, Package, ToyBrick } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface DownloadCardProps {
  mosaicResult: MosaicResult | null;
  mosaicCanvas: HTMLCanvasElement | null;
  config: MosaicConfig;
  technicPlateColor?: LegoColor;
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

// Fonction pour formater le XML avec indentation
function formatXML(xml: string): string {
  const PADDING = '  '; // 2 espaces pour l'indentation
  const reg = /(>)(<)(\/*)/g;
  let pad = 0;

  xml = xml.replace(reg, '$1\r\n$2$3');

  return xml.split('\r\n').map((node) => {
    let indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/) && pad > 0) {
      pad -= 1;
    } else if (node.match(/^<\w[^>]*[^/]>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }

    pad += indent;
    return PADDING.repeat(pad - indent) + node;
  }).join('\r\n');
}

export const DownloadCard: React.FC<DownloadCardProps> = ({
  mosaicResult,
  mosaicCanvas,
  config,
  technicPlateColor,
}) => {
  const [isGeneratingBom, setIsGeneratingBom] = useState(false);
  const [xmlContent, setXmlContent] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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

  const generateBricklinkXMLForDisplay = async () => {
    if (!mosaicResult || !mosaicResult.piecesList) return;

    setIsGeneratingBom(true);
    try {
      const xml = await generateBricklinkXMLFromPieces(
        mosaicResult.piecesList,
        config.colorPalette,
        technicPlateColor
      );
      const formattedXml = formatXML(xml);
      setXmlContent(formattedXml);
      setIsDialogOpen(true);
    } catch (error) {
      toast.error("Erreur lors de la génération du XML BrickLink", {
        description:
          error instanceof Error
            ? error.message
            : "Impossible de générer le fichier BrickLink",
      });
    } finally {
      setIsGeneratingBom(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      setIsCopied(true);
      toast.success("Code XML copié dans le presse-papier !");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Erreur lors de la copie", {
        description: "Impossible de copier le code dans le presse-papier",
      });
    }
  };

  const handleTextareaClick = () => {
    if (xmlContent) {
      copyToClipboard();
    }
  };

  const downloadPABCSV = async () => {
    if (!mosaicResult || !mosaicResult.piecesList) return;

    setIsGeneratingBom(true);
    try {
      const csvContent = await generatePABCSV(
        mosaicResult.piecesList,
        config.colorPalette,
        technicPlateColor
      );
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `pab-list-${new Date().toISOString().slice(0, 10)}.csv`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGeneratingBom(false);
    }
  };

  const downloadPABJSON = async () => {
    if (!mosaicResult || !mosaicResult.piecesList) return;

    setIsGeneratingBom(true);
    try {
      const jsonContent = await generatePABJSON(
        mosaicResult.piecesList,
        config.colorPalette,
        technicPlateColor
      );
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `pab-list-${new Date().toISOString().slice(0, 10)}.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGeneratingBom(false);
    }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colonne gauche - Section Images */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Images</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          {/* Colonne droite - Section Commande de pièces */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Commande de pièces
            </h4>
            <div className="flex flex-col gap-3">
              <button
                onClick={downloadPABCSV}
                disabled={!mosaicResult}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 relative w-full"
                title="Format CSV pour Pick-A-Brick"
              >
                <ToyBrick size={20} />
                {isGeneratingBom ? "Génération..." : "Pick a Brick"}
                <span className="absolute bottom-1 right-2 text-xs">CSV</span>
              </button>
              <button
                onClick={downloadPABJSON}
                disabled={!mosaicResult}
                className="bg-red-700 hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 relative w-full"
                title="Format JSON pour Pick-A-Brick"
              >
                <ToyBrick size={20} />
                {isGeneratingBom ? "Génération..." : "Pick a Brick"}
                <span className="absolute bottom-1 right-2 text-xs">JSON</span>
              </button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    onClick={generateBricklinkXMLForDisplay}
                    disabled={!mosaicResult}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 relative"
                    title="Afficher le code XML pour BrickLink"
                  >
                    <Package size={20} />
                    {isGeneratingBom ? "Génération..." : "BrickLink"}
                    <span className="absolute bottom-1 right-2 text-xs">XML</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Code XML BrickLink</DialogTitle>
                    <DialogDescription>
                      Cliquez sur la zone de texte pour copier automatiquement le code dans le presse-papier, puis collez-le dans BrickLink pour importer votre inventaire.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      value={xmlContent}
                      readOnly
                      onClick={handleTextareaClick}
                      autoFocus={false}
                      className="w-full h-96 font-mono text-sm bg-gray-50 resize-none overflow-auto cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      placeholder="Le code XML apparaîtra ici..."
                      title="Cliquez pour copier dans le presse-papier"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Fermer
                      </Button>
                      <Button
                        onClick={copyToClipboard}
                        disabled={!xmlContent}
                        className="flex items-center space-x-2"
                      >
                        <Copy size={16} />
                        <span>{isCopied ? "Copié !" : "Copier"}</span>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
