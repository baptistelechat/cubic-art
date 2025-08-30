import { useState } from 'react';
import { Grid3X3, Download, Eye, Trash2 } from 'lucide-react';
import { useGallery, useStore } from '@/hooks/useStore';

export function GalleryPage() {
  const gallery = useGallery();
  const { removeFromGallery, clearGallery } = useStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Images d'exemple pour la démonstration
  const exampleImages = [
    {
      id: 'example-1',
      name: 'Portrait classique',
      originalUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=classic%20portrait%20of%20a%20person%20with%20clear%20features%20suitable%20for%20pixel%20art%20conversion&image_size=square',
      mosaicUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pixelated%20LEGO%20mosaic%20version%20of%20a%20portrait%20with%20bright%20colors%20on%2032x32%20grid&image_size=square',
      pieces: 1024,
      colors: 12
    },
    {
      id: 'example-2',
      name: 'Paysage naturel',
      originalUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20landscape%20with%20mountains%20and%20trees%20suitable%20for%20LEGO%20mosaic&image_size=square',
      mosaicUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=LEGO%20brick%20mosaic%20of%20a%20landscape%20with%20green%20blue%20brown%20colors%20pixelated%20style&image_size=square',
      pieces: 1024,
      colors: 8
    },
    {
      id: 'example-3',
      name: 'Logo simple',
      originalUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=simple%20geometric%20logo%20design%20with%20bold%20colors%20perfect%20for%20pixel%20art&image_size=square',
      mosaicUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=LEGO%20mosaic%20version%20of%20geometric%20logo%20with%20bright%20primary%20colors%20on%20grid&image_size=square',
      pieces: 1024,
      colors: 5
    }
  ];
  
  const allImages = [...exampleImages, ...gallery.map(img => ({
    id: img.id,
    name: img.name,
    originalUrl: img.originalUrl,
    mosaicUrl: img.mosaicUrl || img.originalUrl,
    pieces: 1024,
    colors: Math.floor(Math.random() * 15) + 5
  }))];
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Galerie de mosaïques LEGO
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez des exemples de mosaïques créées avec Cubic Art et explorez les possibilités
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{allImages.length}</div>
            <div className="text-gray-600">Mosaïques créées</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">47</div>
            <div className="text-gray-600">Couleurs LEGO</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">32×32</div>
            <div className="text-gray-600">Format standard</div>
          </div>
        </div>
        
        {/* Gallery Grid */}
        {allImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allImages.map((image) => (
              <div key={image.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-square bg-gray-100 relative group">
                  <img
                    src={image.mosaicUrl}
                    alt={image.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-3">
                      <button
                        onClick={() => setSelectedImage(image.mosaicUrl)}
                        className="bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors"
                        title="Voir en grand"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
                        title="Télécharger"
                      >
                        <Download size={20} />
                      </button>
                      {!image.id.startsWith('example-') && (
                        <button
                          onClick={() => removeFromGallery(image.id)}
                          className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{image.name}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Grid3X3 size={16} />
                      <span>{image.pieces} pièces</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-blue-500 rounded-full"></div>
                      <span>{image.colors} couleurs</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Grid3X3 size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune mosaïque dans votre galerie
            </h3>
            <p className="text-gray-600 mb-6">
              Créez votre première mosaïque LEGO avec le générateur
            </p>
            <a
              href="/generator"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Créer une mosaïque</span>
            </a>
          </div>
        )}
        
        {/* Clear Gallery Button */}
        {gallery.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={clearGallery}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Vider la galerie
            </button>
          </div>
        )}
      </div>
      
      {/* Modal pour voir l'image en grand */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Mosaïque en grand"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}