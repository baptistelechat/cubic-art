import { Grid3X3, Trash2 } from 'lucide-react';
import { useGallery, useStore } from '@/hooks/useStore';
import { Comparison, ComparisonItem, ComparisonHandle } from '@/components/ui/kibo-ui/comparison';

export function GalleryPage() {
  const gallery = useGallery();
  const { removeFromGallery, clearGallery } = useStore();
  
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
          <p className="text-xl text-gray-600 mx-auto">
            Découvrez des exemples de mosaïques créées avec Cubic Art et explorez les possibilités
          </p>
        </div>
        

        
        {/* Gallery Grid - Nouvelle structure robuste */}
        {allImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allImages.map((image) => (
              <div key={image.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Comparison Container */}
                <div className="aspect-square bg-gray-100 relative group">
                  <Comparison className="w-full h-full rounded-t-xl overflow-hidden">
                    <ComparisonItem position="left">
                      <img
                        src={image.mosaicUrl}
                        alt={`Mosaïque - ${image.name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('❌ Erreur chargement mosaïque:', image.mosaicUrl);
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.backgroundColor = '#ef4444';
                          target.style.color = 'white';
                          target.style.display = 'flex';
                          target.style.alignItems = 'center';
                          target.style.justifyContent = 'center';
                          target.style.fontSize = '12px';
                          target.style.fontWeight = 'bold';
                          target.innerHTML = '❌ MOSAÏQUE';
                        }}
                      />
                    </ComparisonItem>
                    <ComparisonItem position="right">
                      <img
                        src={image.originalUrl}
                        alt={`Image originale - ${image.name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('❌ Erreur chargement image originale:', image.originalUrl);
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.backgroundColor = '#ef4444';
                          target.style.color = 'white';
                          target.style.display = 'flex';
                          target.style.alignItems = 'center';
                          target.style.justifyContent = 'center';
                          target.style.fontSize = '12px';
                          target.style.fontWeight = 'bold';
                          target.innerHTML = '❌ ORIGINAL';
                        }}
                      />
                    </ComparisonItem>
                    <ComparisonHandle />
                  </Comparison>
                  
                  {/* Bouton de suppression pour les images non-exemples */}
                  {!image.id.startsWith('example-') && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => removeFromGallery(image.id)}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Informations de la mosaïque */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{image.name}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Grid3X3 size={16} className="text-gray-900" />
                      <span className="font-medium">{image.pieces} pièces</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-full"></div>
                      <span className="font-medium">{image.colors} couleurs</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <Grid3X3 size={80} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Aucune mosaïque dans votre galerie
            </h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Créez votre première mosaïque LEGO avec notre générateur intelligent
            </p>
            <a
              href="/generator"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Grid3X3 size={20} />
              <span className="font-semibold">Créer une mosaïque</span>
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
      

    </div>
  );
}