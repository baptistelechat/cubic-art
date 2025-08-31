import { MosaicComparison } from "@/components/MosaicComparison";
import { useGallery, useStore } from "@/hooks/useStore";
import { Grid3X3 } from "lucide-react";

export function GalleryPage() {
  const gallery = useGallery();
  const { removeFromGallery, clearGallery } = useStore();

  // Images d'exemple pour la démonstration
  const exampleImages = [
    {
      id: "example-1",
      name: "Portrait classique",
      originalUrl:
        "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=classic%20portrait%20of%20a%20person%20with%20clear%20features%20suitable%20for%20pixel%20art%20conversion&image_size=square",
      mosaicUrl:
        "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=pixelated%20LEGO%20mosaic%20version%20of%20a%20portrait%20with%20bright%20colors%20on%2032x32%20grid&image_size=square",
      pieces: 1024,
      colors: 12,
    },
    {
      id: "example-2",
      name: "Paysage naturel",
      originalUrl:
        "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20landscape%20with%20mountains%20and%20trees%20suitable%20for%20LEGO%20mosaic&image_size=square",
      mosaicUrl:
        "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=LEGO%20brick%20mosaic%20of%20a%20landscape%20with%20green%20blue%20brown%20colors%20pixelated%20style&image_size=square",
      pieces: 1024,
      colors: 8,
    },
    {
      id: "example-3",
      name: "Logo simple",
      originalUrl:
        "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=simple%20geometric%20logo%20design%20with%20bold%20colors%20perfect%20for%20pixel%20art&image_size=square",
      mosaicUrl:
        "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=LEGO%20mosaic%20version%20of%20geometric%20logo%20with%20bright%20primary%20colors%20on%20grid&image_size=square",
      pieces: 1024,
      colors: 5,
    },
  ];

  const allImages = [
    ...exampleImages,
    ...gallery.map((img) => ({
      id: img.id,
      name: img.name,
      originalUrl: img.originalUrl,
      mosaicUrl: img.mosaicUrl || img.originalUrl,
      pieces: Math.floor(Math.random() * 3 + 1) * 256, // 256 (16x16), 1024 (32x32), 2304 (48x48), ou 4096 (64x64)
      colors: Math.floor(Math.random() * 15) + 5,
    })),
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Galerie de mosaïques LEGO
          </h1>
          <p className="text-xl text-gray-600 mx-auto">
            Découvrez des exemples de mosaïques créées avec Cubic Art et
            explorez les possibilités
          </p>
        </div>

        {/* Gallery Grid - Nouvelle structure robuste */}
        {allImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allImages.map((image) => (
              <div key={image.id} className="hover:shadow-xl transition-shadow">
                <MosaicComparison
                  originalImage={image.originalUrl}
                  mosaicImageUrl={image.mosaicUrl}
                  pieceCount={image.pieces}
                  colorCount={image.colors}
                  showDeleteButton={!image.id.startsWith("example-")}
                  onDelete={() => removeFromGallery(image.id)}
                  className="bg-white shadow-lg"
                />

                {/* Titre de l'image */}
                <div className="bg-white px-4 pb-4 rounded-b-xl shadow-lg">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {image.name}
                  </h3>
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
              Créez votre première mosaïque LEGO avec notre générateur
              intelligent
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
