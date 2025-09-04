import { LegoBrick } from "@/components/LegoBrick";
import TechnicConnector from "@/components/TechnicConnector";
import { TechnicPlate16x16 } from "@/components/TechnicPlate16x16";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatBOMForDisplay, generateBOM } from "@/services/bomGenerator";
import { getTechnicPlateColors } from "@/services/csvDataService";
import type { LegoColor, MosaicConfig, MosaicResult } from "@/types";
import { Euro, Palette, Settings, ToyBrick, TrendingUp } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface PiecesBreakdownCardProps {
  mosaicResult: MosaicResult;
  config: MosaicConfig;
}

export const PiecesBreakdownCard: React.FC<PiecesBreakdownCardProps> = ({
  mosaicResult,
  config,
}) => {
  const [isGeneratingBom, setIsGeneratingBom] = useState(false);
  const [bomDisplay, setBomDisplay] = useState<{
    estimatedCost?: {
      min: string;
      avg: string;
      max: string;
    };
    items: Array<{
      colorName: string;
      colorHex: string;
      quantity: number;
      unitPrice: string;
      totalPrice: string;
    }>;
  } | null>(null);
  // État pour les couleurs des plaques Technic (chargées depuis les CSV)
  const [technicColors, setTechnicColors] = useState<LegoColor[]>([]);

  // Charger les couleurs Technic depuis les CSV
  useEffect(() => {
    const loadTechnicColors = async () => {
      try {
        const colors = await getTechnicPlateColors();
        setTechnicColors(colors);
      } catch (error) {
        toast.error("Erreur lors du chargement des couleurs Technic", {
          description: error instanceof Error ? error.message : "Impossible de charger les couleurs des plaques Technic"
        });
        // Couleur par défaut en cas d'erreur
        setTechnicColors([
          {
            id: 0,
            name: "Black",
            hex: "#05131D",
            rgb: [5, 19, 29],
          },
        ]);
      }
    };

    loadTechnicColors();
  }, []);

  // Fonction pour obtenir la première couleur Technic disponible (généralement Black)
  const getDefaultTechnicColor = (): LegoColor => {
    return (
      technicColors[0] || {
        id: 0,
        name: "Black",
        hex: "#05131D",
        rgb: [5, 19, 29],
      }
    );
  };

  const generateBOMAsync = useCallback(async () => {
    if (!mosaicResult) return;

    setIsGeneratingBom(true);
    try {
      const generatedBom = await generateBOM(mosaicResult, true);
      setBomDisplay(formatBOMForDisplay(generatedBom));
    } catch (error) {
      toast.error("Erreur lors de la génération de la BOM", {
        description: error instanceof Error ? error.message : "Impossible de générer la liste des pièces"
      });
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

  if (!mosaicResult.piecesList) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Palette size={24} className="text-purple-600" />
          <span>Décomposition des pièces</span>
        </h3>
      </CardHeader>
      <CardContent>
        <Accordion
          type="multiple"
          defaultValue={["plates-1x1", "cost-estimation"]}
          className="w-full"
        >
          {/* Section Estimation des coûts */}
          {bomDisplay?.estimatedCost && (
            <AccordionItem value="cost-estimation">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center space-x-2">
                  <Euro className="size-4 text-green-600" />
                  <span className="font-medium">Estimation des coûts</span>
                  <span className="text-sm text-green-600 font-medium">
                    {bomDisplay.estimatedCost.avg}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-2 space-y-3">
                  {/* Résumé des coûts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <TrendingUp className="size-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Minimum
                        </span>
                      </div>
                      <div className="text-lg font-bold text-green-900">
                        {bomDisplay.estimatedCost.min}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <Euro className="size-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Moyen
                        </span>
                      </div>
                      <div className="text-lg font-bold text-blue-900">
                        {bomDisplay.estimatedCost.avg}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <TrendingUp className="size-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">
                          Maximum
                        </span>
                      </div>
                      <div className="text-lg font-bold text-orange-900">
                        {bomDisplay.estimatedCost.max}
                      </div>
                    </div>
                  </div>

                  {/* Détails par couleur avec prix */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">
                      Détail par couleur
                    </h5>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {bomDisplay.items
                        .filter((item) => item.unitPrice !== "N/A")
                        .map((item, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: item.colorHex }}
                              />
                              <span className="font-medium">
                                {item.colorName}
                              </span>
                              <span className="text-gray-500">
                                ×{item.quantity}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {item.totalPrice}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.unitPrice}/pièce
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {isGeneratingBom && (
                      <div className="text-center py-4">
                        <div className="text-sm text-gray-500">
                          Récupération des prix en cours...
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-2">
                      💡 Estimation des prix temporairement désactivée. Les prix
                      peuvent varier selon la disponibilité et la condition des
                      pièces.
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          {/* Section Pièces 1x1 par couleur */}
          <AccordionItem value="plates-1x1">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center space-x-2">
                <ToyBrick className="size-4 text-gray-600" />
                <span className="font-medium">Pièces 1x1</span>
                <span className="text-sm text-gray-500">
                  (
                  {
                    Object.entries(mosaicResult.piecesList).filter(
                      ([key]) =>
                        !key.includes("Plaque de base Technic") &&
                        !key.includes("Connecteur") &&
                        !key.includes("Pièce 1x1")
                    ).length
                  }{" "}
                  couleurs)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                {Object.entries(mosaicResult.piecesList)
                  .filter(
                    ([key]) =>
                      !key.includes("Plaque de base Technic") &&
                      !key.includes("Connecteur") &&
                      !key.includes("Pièce 1x1")
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
                    const idA = legoColorA?.id ?? 999999;
                    const idB = legoColorB?.id ?? 999999;
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
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                              #3024 |{" "}
                              {legoColor?.id !== undefined
                                ? legoColor.id
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-900">
                            {count}
                          </div>
                          <div className="text-xs text-gray-500">
                            pièce{count > 1 ? "s" : ""}
                          </div>
                          {/* Afficher le prix si disponible dans la BOM */}
                          {bomDisplay?.items &&
                            (() => {
                              const bomItem = bomDisplay.items.find(
                                (item) =>
                                  item.colorHex === colorHex &&
                                  item.unitPrice !== "N/A"
                              );
                              return bomItem ? (
                                <div className="text-xs text-green-600 font-medium">
                                  {bomItem.totalPrice}
                                </div>
                              ) : null;
                            })()}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Total des pièces 1x1 avec brique LEGO blanche */}
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
                        Total Pièces 1x1
                      </div>
                      <div className="text-xs text-gray-500">#3024</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl">
                      {Object.entries(mosaicResult.piecesList)
                        .filter(
                          ([key]) =>
                            !key.includes("Plaque de base Technic") &&
                            !key.includes("Connecteur") &&
                            !key.includes("Pièce 1x1")
                        )
                        .reduce((sum, [, count]) => sum + count, 0)}
                    </div>
                    <div>pièces</div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Section Éléments techniques */}
          <AccordionItem value="technical-elements">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center space-x-2">
                <Settings className="size-4 text-gray-600" />
                <span className="font-medium">Éléments Technic</span>
                <span className="text-sm text-gray-500">
                  (
                  {
                    Object.entries(mosaicResult.piecesList).filter(
                      ([key]) =>
                        key.includes("Plaque de base Technic") ||
                        key.includes("Connecteur")
                    ).length
                  }{" "}
                  types)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 p-2">
                {Object.entries(mosaicResult.piecesList)
                  .filter(
                    ([key]) =>
                      key.includes("Plaque de base Technic") ||
                      key.includes("Connecteur")
                  )
                  .map(([elementInfo, count]) => {
                    const elementName = elementInfo.split(" (")[0];
                    const elementRef =
                      elementInfo.match(/\(([^)]+)\)/)?.[1] || "N/A";

                    return (
                      <div
                        key={elementInfo}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          {/* Représentation visuelle spécifique */}
                          {elementName.includes("Connecteur") ? (
                            /* Connecteur Technic - Couleur depuis CSV */
                            <TechnicConnector
                              color={getDefaultTechnicColor()}
                              size="md"
                              showTooltip={false}
                            />
                          ) : (
                            /* Plaque de base Technic - Couleur depuis CSV */
                            <TechnicPlate16x16
                              color={getDefaultTechnicColor()}
                              size="md"
                              showTooltip={false}
                            />
                          )}
                          <div className="text-left">
                            <div className="font-medium text-gray-900 text-sm">
                              {elementName}
                            </div>
                            <div className="text-xs text-gray-500">
                              #{elementRef}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-900">
                            {count}
                          </div>
                          <div className="text-xs text-gray-500">pièces</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
