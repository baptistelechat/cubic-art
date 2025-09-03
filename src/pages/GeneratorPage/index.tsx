import { ConfigurationCard } from "./components/ConfigurationCard";
import { DownloadCard } from "./components/DownloadCard";
import { LegoBrick } from "@/components/LegoBrick";
import { MosaicComparison } from "@/components/MosaicComparison";
import { PiecesBreakdownCard } from "./components/PiecesBreakdownCard";
import { ProcessingCard } from "./components/ProcessingCard";
import TechnicConnector from "@/components/TechnicConnector";
import { TechnicPlate16x16 } from "@/components/TechnicPlate16x16";
import { UploadCard } from "./components/UploadCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/hooks/useStore";
import type { LegoColor, MosaicResult } from "@/types";
import {
  generateMosaicPreview,
  processImageToMosaic,
} from "@/utils/imageProcessor";
import { Palette } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function GeneratorPage() {
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
  // const MAX_IMAGE_DIMENSION = 4000; // 4000x4000 pixels - Limite supprimée

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

    // Validation des dimensions de l'image supprimée - Aucune limite de taille
    return { isValid: true };
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

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* En-tête */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Générateur de Mosaïque LEGO
            </h1>
            <p className="text-lg text-gray-600">
              Transformez vos images en mosaïques LEGO avec les couleurs
              officielles
            </p>
          </div>

          {/* Première section : 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche : Upload et Configuration */}
            <div className="space-y-6">
              {/* Upload Area */}
              <UploadCard
                onFileSelect={handleFileSelect}
                error={error}
                setError={setError}
              />

              {/* Configuration */}
              <ConfigurationCard
                config={config}
                updateConfig={updateConfig}
                backgroundColorForTransparency={backgroundColorForTransparency}
                setBackgroundColorForTransparency={
                  setBackgroundColorForTransparency
                }
                EMPTY_COLOR={EMPTY_COLOR}
              />
            </div>

            {/* Colonne droite - Palette LEGO officielle */}
            <div className="h-full flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Palette size={24} className="text-red-600" />
                    <span>Palette LEGO officielle complète</span>
                  </h3>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-6">
                  {/* Titre Pièce 1x1 #3024 */}
                  <div className="flex items-end gap-2 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Pièce 1x1
                    </p>
                    <p className="text-xs text-gray-500">#3024</p>
                  </div>

                  {/* Grille de couleurs LEGO */}
                  <TooltipProvider>
                    <div className="grid grid-cols-8 gap-3">
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

                  {/* Titre Plaque de base 16x16 Technic */}
                  <div className="flex items-end gap-2 text-left pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      Plaque de base 16x16 Technic
                    </p>
                    <p className="text-xs text-gray-500">#65803</p>
                  </div>

                  {/* Grille de couleurs pour plaques Technic */}
                  <TooltipProvider>
                    <div className="grid grid-cols-8 gap-3">
                      {/* Black */}
                      <TechnicPlate16x16
                        color={{
                          id: 6302092,
                          name: "Black",
                          hex: "#1b2a34",
                          rgb: [27, 42, 52],
                        }}
                        size="md"
                        showTooltip={true}
                      />

                      {/* Light Nougat */}
                      <TechnicPlate16x16
                        color={{
                          id: 6421617,
                          name: "Light Nougat",
                          hex: "#e1bea1",
                          rgb: [225, 190, 161],
                        }}
                        size="md"
                        showTooltip={true}
                      />
                    </div>
                  </TooltipProvider>

                  {/* Titre Connecteur Technic */}
                  <div className="flex items-end gap-2 text-left pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      Connecteur Technic
                    </p>
                    <p className="text-xs text-gray-500">#61332</p>
                  </div>

                  {/* Grille de couleurs pour connecteurs Technic */}
                  <TooltipProvider>
                    <div className="grid grid-cols-8 gap-3">
                      {/* Black */}
                      <TechnicConnector
                        color={{
                          id: 6279875,
                          name: "Black",
                          hex: "#1b2a34",
                          rgb: [27, 42, 52],
                        }}
                        size="md"
                        showTooltip={true}
                      />
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Deuxième section : Résultats et actions */}
          <div className="space-y-6">
            {/* Message d'erreur */}
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

            {/* Indicateur de traitement */}
            <ProcessingCard isProcessing={isProcessing} />

            {/* Troisième section : Preview et Décomposition en 2 colonnes */}
            {mosaicResult &&
              mosaicCanvas &&
              previewUrl &&
              mosaicResult.piecesList && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Colonne gauche : Aperçu de la mosaïque + Téléchargements */}
                  <div className="space-y-6">
                    <MosaicComparison
                      originalImage={previewUrl}
                      mosaicCanvas={mosaicCanvas}
                      mosaicConfig={mosaicResult.config}
                      pieceCount={mosaicResult.totalPieces}
                      colorCount={
                        mosaicResult.piecesList
                          ? Object.keys(mosaicResult.piecesList).filter(
                              (key) =>
                                !key.includes("Plaque de base Technic") &&
                                !key.includes("Connecteur") &&
                                !key.includes("Pièce 1x1")
                            ).length
                          : 0
                      }
                      className="bg-white shadow-lg"
                    />

                    {/* Téléchargements - 4 boutons sur une ligne */}
                    <DownloadCard
                      mosaicResult={mosaicResult}
                      mosaicCanvas={mosaicCanvas}
                      config={config}
                    />
                  </div>

                  {/* Colonne droite : Décomposition des pièces organisée */}
                  <div>
                    <PiecesBreakdownCard
                      mosaicResult={mosaicResult}
                      config={config}
                    />
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}
