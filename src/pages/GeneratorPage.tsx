import React, { useRef, useState } from 'react';
import { Upload, Download, Image as ImageIcon, Palette, Grid3X3, Clock } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { processImageToMosaic, generateMosaicPreview } from '@/utils/imageProcessor';
import type { MosaicResult } from '@/types';

// Fonction pour générer le SVG
function generateSVG(result: MosaicResult): string {
  const size = 10; // Taille de chaque carré
  const width = 32 * size;
  const height = 32 * size;
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  result.grid.forEach((row, y) => {
    row.forEach((color, x) => {
      svg += `<rect x="${x * size}" y="${y * size}" width="${size}" height="${size}" fill="${color.hex}" />`;
    });
  });
  
  svg += '</svg>';
  return svg;
}

export function GeneratorPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mosaicCanvas, setMosaicCanvas] = useState<HTMLCanvasElement | null>(null);
  
  const { config, isProcessing, mosaicResult, setIsProcessing, setMosaicResult } = useStore();
  
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide.');
      return;
    }
    
    // Prévisualisation de l'image originale
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    try {
      // Démarrer le traitement
      setIsProcessing(true);
      
      // Traitement de l'image
      const result = await processImageToMosaic(file, config);
      
      // Génération du canvas de prévisualisation
      const canvas = generateMosaicPreview(result, 10);
      setMosaicCanvas(canvas);
      
      setMosaicResult(result);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      alert('Erreur lors du traitement de l\'image. Veuillez réessayer.');
      setIsProcessing(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  const downloadPNG = () => {
    if (!mosaicCanvas) return;
    
    const link = document.createElement('a');
    link.download = `mosaic-${Date.now()}.png`;
    link.href = mosaicCanvas.toDataURL();
    link.click();
  };
  
  const downloadSVG = () => {
    if (!mosaicResult) return;
    
    const svg = generateSVG(mosaicResult);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `mosaic-${Date.now()}.svg`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  };
  
  const downloadJSON = () => {
    if (!mosaicResult) return;
    
    const data = {
      baseplate: mosaicResult.baseplate,
      totalPieces: mosaicResult.totalPieces,
      piecesList: mosaicResult.piecesList,
      grid: mosaicResult.grid.map(row => 
        row.map(color => ({ name: color.name, hex: color.hex }))
      )
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `mosaic-pieces-${Date.now()}.json`;
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
            Uploadez votre image et transformez-la en mosaïque LEGO 32x32 avec les 47 couleurs officielles
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Upload size={24} className="text-blue-600" />
                <span>Sélectionner une image</span>
              </h2>
              
              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
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
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Choisir un fichier
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
            
            {/* Original Image Preview */}
            {previewUrl && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Image originale</h3>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Image originale"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Result Section */}
          <div className="space-y-6">
            {isProcessing && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock size={24} className="text-blue-600 animate-spin" />
                  <h3 className="text-lg font-semibold text-gray-900">Traitement en cours...</h3>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Redimensionnement et mapping des couleurs LEGO...
                </p>
              </div>
            )}
            
            {mosaicResult && mosaicCanvas && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Grid3X3 size={24} className="text-green-600" />
                  <span>Mosaïque LEGO 32x32</span>
                </h3>
                
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <canvas
                    ref={(canvas) => {
                      if (canvas && mosaicCanvas) {
                        const ctx = canvas.getContext('2d')!;
                        canvas.width = mosaicCanvas.width;
                        canvas.height = mosaicCanvas.height;
                        ctx.drawImage(mosaicCanvas, 0, 0);
                      }
                    }}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{mosaicResult.totalPieces}</div>
                    <div className="text-sm text-gray-600">Pièces totales</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {Object.keys(mosaicResult.piecesList).length}
                    </div>
                    <div className="text-sm text-gray-600">Couleurs utilisées</div>
                  </div>
                </div>
                
                {/* Download Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={downloadPNG}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download size={20} />
                    <span>Télécharger PNG</span>
                  </button>
                  
                  <button
                    onClick={downloadSVG}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download size={20} />
                    <span>Télécharger SVG</span>
                  </button>
                  
                  <button
                    onClick={downloadJSON}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download size={20} />
                    <span>Liste des pièces (JSON)</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Color Palette Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Palette size={24} className="text-red-600" />
                <span>Palette LEGO (47 couleurs)</span>
              </h3>
              
              <div className="grid grid-cols-8 gap-2">
                {config.colorPalette.slice(0, 32).map((color) => (
                  <div
                    key={color.id}
                    className="w-8 h-8 rounded border border-gray-200"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  ></div>
                ))}
              </div>
              
              <p className="text-sm text-gray-600 mt-3">
                Affichage des 32 premières couleurs. La palette complète de 47 couleurs 
                est utilisée pour le mapping optimal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}