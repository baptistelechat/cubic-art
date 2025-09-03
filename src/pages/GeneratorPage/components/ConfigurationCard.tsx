import { LegoBrick } from "@/components/LegoBrick";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { LegoColor, MosaicConfig } from "@/types";
import { Puzzle, ToyBrick } from "lucide-react";
import React from "react";

interface ConfigurationCardProps {
  config: MosaicConfig;
  updateConfig: (updates: Partial<MosaicConfig>) => void;
  backgroundColorForTransparency: LegoColor;
  setBackgroundColorForTransparency: (color: LegoColor) => void;
  EMPTY_COLOR: LegoColor;
}

export const ConfigurationCard: React.FC<ConfigurationCardProps> = ({
  config,
  updateConfig,
  backgroundColorForTransparency,
  setBackgroundColorForTransparency,
  EMPTY_COLOR,
}) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Puzzle size={24} className="text-green-600" />
          <span>Configuration</span>
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-4 text-left">
            <label className="block text-sm font-medium text-gray-700">
              Dimensions de la mosaïque
            </label>

            <div className="flex items-end space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-end space-x-3">
                {/* Input Largeur */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="width">Largeur</Label>
                  <Select
                    value={config.width.toString()}
                    onValueChange={(value) =>
                      updateConfig({
                        width: parseInt(value) as 16 | 32 | 48 | 64,
                      })
                    }
                  >
                    <SelectTrigger className="w-20 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="16"
                        className="flex items-center space-x-1"
                      >
                        <div className="flex items-center space-x-1">
                          <ToyBrick className="size-4" />
                          <span>16</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="32"
                        className="flex items-center space-x-1"
                      >
                        <div className="flex items-center space-x-1">
                          <ToyBrick className="size-4" />
                          <span>32</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="48"
                        className="flex items-center space-x-1"
                      >
                        <div className="flex items-center space-x-1">
                          <ToyBrick className="size-4" />
                          <span>48</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="64"
                        className="flex items-center space-x-1"
                      >
                        <div className="flex items-center space-x-1">
                          <ToyBrick className="size-4" />
                          <span>64</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Symbole X */}
                <div className="flex items-center h-10 mt-6">
                  <span className="font-medium text-gray-900 text-lg">×</span>
                </div>

                {/* Input Hauteur */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="height">Hauteur</Label>
                  <Select
                    value={config.height.toString()}
                    onValueChange={(value) =>
                      updateConfig({
                        height: parseInt(value) as 16 | 32 | 48 | 64,
                      })
                    }
                  >
                    <SelectTrigger className="w-20 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="16"
                        className="flex items-center space-x-1"
                      >
                        <div className="flex items-center space-x-1">
                          <ToyBrick className="size-4" />
                          <span>16</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="32"
                        className="flex items-center space-x-1"
                      >
                        <div className="flex items-center space-x-1">
                          <ToyBrick className="size-4" />
                          <span>32</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="48"
                        className="flex items-center space-x-1"
                      >
                        <div className="flex items-center space-x-1">
                          <ToyBrick className="size-4" />
                          <span>48</span>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="64"
                        className="flex items-center space-x-1"
                      >
                        <div className="flex items-center space-x-1">
                          <ToyBrick className="size-4" />
                          <span>64</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Symbole = */}
                <div className="flex items-center h-10 mt-6">
                  <span className="font-medium text-gray-900 text-lg">=</span>
                </div>
              </div>

              {/* Comptage de pièces avec le même style que la décomposition */}
              <div className="flex justify-between w-full">
                <div className="flex space-x-2">
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
                  <div className="font-bold text-xl text-gray-900">
                    {config.width * config.height}
                  </div>
                  <div className="text-xs text-gray-500">
                    pièce{config.width * config.height > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>



          <div className="text-left">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur de remplacement de la transparence (Import PNG)
            </label>
            <Select
              value={backgroundColorForTransparency?.id?.toString() || EMPTY_COLOR.id.toString()}
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
                    {(backgroundColorForTransparency?.id ?? EMPTY_COLOR.id) === -1 ? (
                      <div className="w-6 h-6 border-2 border-dashed border-gray-400 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">∅</span>
                      </div>
                    ) : (
                      <LegoBrick
                        color={backgroundColorForTransparency || EMPTY_COLOR}
                        size="sm"
                        showTooltip={false}
                      />
                    )}
                    <span>{backgroundColorForTransparency?.name || EMPTY_COLOR.name}</span>
                    <span className="text-xs text-gray-600">
                      {(backgroundColorForTransparency?.id ?? EMPTY_COLOR.id) !== -1 &&
                        `#${backgroundColorForTransparency?.id ?? EMPTY_COLOR.id}`}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto scroll-smooth overscroll-contain">
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
                {config.colorPalette
                  .sort((a, b) => a.id - b.id)
                  .map((color) => (
                    <SelectItem key={color.id} value={color.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <LegoBrick color={color} size="sm" showTooltip={false} />
                        <span>{color.name}</span>
                        <span className="text-xs text-gray-600">#{color.id}</span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggle pour la grille modulaire */}
          <div className="text-left">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <label htmlFor="showModuleGrid" className="flex-1 cursor-pointer">
                <div
                  className={`text-sm font-medium ${
                    config.width === 16 && config.height === 16
                      ? "text-gray-400"
                      : "text-gray-700"
                  }`}
                >
                  Afficher la grille des modules 16×16
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {config.width === 16 && config.height === 16
                    ? "Désactivé pour les mosaïques 16×16 (grille non nécessaire)"
                    : "Visualise les plaques de base Technic 16×16 sur la mosaïque"}
                </p>
              </label>
              <Switch
                id="showModuleGrid"
                checked={config.showModuleGrid || false}
                disabled={config.width === 16 && config.height === 16}
                onCheckedChange={(checked) => {
                  updateConfig({ showModuleGrid: checked });
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
