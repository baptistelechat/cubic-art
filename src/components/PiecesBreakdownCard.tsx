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
import type { MosaicConfig, MosaicResult } from "@/types";
import { Palette, Settings, ToyBrick } from "lucide-react";
import React from "react";

interface PiecesBreakdownCardProps {
  mosaicResult: MosaicResult;
  config: MosaicConfig;
}

export const PiecesBreakdownCard: React.FC<PiecesBreakdownCardProps> = ({
  mosaicResult,
  config,
}) => {
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
          defaultValue={["plates-1x1"]}
          className="w-full"
        >
          {/* Section Pièces 1x1 par couleur */}
          <AccordionItem value="plates-1x1">
            <AccordionTrigger className="text-left hover:no-underline">
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
                              #3024 | {legoColor?.id || "N/A"}
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
            <AccordionTrigger className="text-left hover:no-underline">
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
                            /* Connecteur Technic - Composant réutilisable */
                            <TechnicConnector
                              color={{
                                id: 6279875,
                                name: "Black",
                                hex: "#1b2a34",
                                rgb: [27, 42, 52],
                              }}
                              size="md"
                              showTooltip={false}
                            />
                          ) : (
                            /* Plaque de base Technic - Composant réutilisable */
                            <TechnicPlate16x16
                              color={{
                                id: 6302092,
                                name: "Black",
                                hex: "#1b2a34",
                                rgb: [27, 42, 52],
                              }}
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