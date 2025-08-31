import { Grid3X3, Palette, Zap, Github, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            À propos de Cubic Art
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez comment notre générateur transforme vos images en mosaïques LEGO authentiques
          </p>
        </div>
        
        {/* Mission */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-left">
          <div className="flex items-center space-x-3 mb-6">
            <Heart className="text-red-600" size={32} />
            <h2 className="text-2xl font-bold text-gray-900">Notre Mission</h2>
          </div>
          
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Cubic Art a été créé pour démocratiser l'art des mosaïques LEGO. Notre objectif est de 
            fournir un outil simple, précis et gratuit permettant à chacun de transformer ses images 
            préférées en instructions de construction LEGO authentiques.
          </p>
          
          <p className="text-lg text-gray-700 leading-relaxed">
            Que vous soyez un passionné de LEGO, un artiste numérique ou simplement curieux, 
            Cubic Art vous offre la possibilité de créer des œuvres d'art pixelisées uniques 
            en utilisant les spécifications officielles LEGO.
          </p>
        </div>
        
        {/* Technical Specifications */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Grid3X3 className="text-blue-600" size={32} />
            <h2 className="text-2xl font-bold text-gray-900">Spécifications Techniques</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Plaque de base LEGO 3811</h3>
                <p className="text-gray-600">Format fixe 32x32 (25,6 cm × 25,6 cm)</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Pièces 1x1 LEGO 3024</h3>
                <p className="text-gray-600">Exactement 1024 pièces par mosaïque</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Couleurs LEGO Officielles</h3>
                <p className="text-gray-600">Palette LEGO officielle incluant les nouvelles teintes</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Algorithme ΔE</h3>
                <p className="text-gray-600">Mapping couleur précis pour un rendu optimal</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Export Multiple</h3>
                <p className="text-gray-600">PNG, SVG et liste JSON des pièces</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Traitement Local</h3>
                <p className="text-gray-600">Aucune donnée envoyée sur nos serveurs</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* How it Works */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-left">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="text-yellow-600" size={32} />
            <h2 className="text-2xl font-bold text-gray-900">Comment ça fonctionne</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Redimensionnement intelligent</h3>
                <p className="text-gray-600">
                  Votre image est automatiquement redimensionnée en 32x32 pixels avec 
                  interpolation optimisée pour préserver les détails importants.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div  className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Analyse des couleurs</h3>
                <p className="text-gray-600">
                  Chaque pixel est analysé et mappé vers la couleur LEGO la plus proche 
                  en utilisant l'algorithme ΔE pour une précision maximale.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">

              <div  className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Génération de la grille</h3>
                <p className="text-gray-600">
                  La mosaïque finale est générée avec les coordonnées exactes de chaque 
                  plate 1x1 et la liste complète des pièces nécessaires.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div  className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Export et construction</h3>
                <p className="text-gray-600">
                  Téléchargez votre mosaïque en haute résolution et la liste des pièces 
                  pour construire votre création en LEGO physique.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Palette className="text-green-600" size={32} />
            <h2 className="text-2xl font-bold text-gray-900">Fonctionnalités</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Interface intuitive et responsive</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Traitement en temps réel</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Prévisualisation haute qualité</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Export multiple formats</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Galerie personnelle</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Liste détaillée des pièces</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Compatibilité LEGO officielle</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">100% gratuit et open source</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Open Source */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl shadow-lg p-8 text-left">
          <div className="flex items-center space-x-3 mb-6">
            <Github className="text-white" size={32} />
            <h2 className="text-2xl font-bold">Projet Open Source</h2>
          </div>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            Cubic Art est un projet open source développé avec passion pour la communauté LEGO. 
            Le code source est disponible sur GitHub et les contributions sont les bienvenues.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              variant="cta-dark"
              size="cta"
            >
              <a
                href="https://github.com/baptistelechat/cubic-art"
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-2 items-center justify-center"
              >
                <Github size={20} />
                <span>Voir sur GitHub</span>
              </a>
            </Button>
            
            <Button
              asChild
              variant="cta-dark-outline"
              size="cta"
            >
              <a href="/contact">
                <span>Contribuer au projet</span>
              </a>
            </Button>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
          <h3 className="font-semibold text-yellow-800 mb-2">Avertissement</h3>
          <p className="text-yellow-700 text-sm">
            LEGO® est une marque déposée du groupe LEGO, qui ne parraine, n'autorise ou n'approuve pas ce site. 
            Cubic Art est un projet indépendant créé par des passionnés pour la communauté.
          </p>
        </div>
      </div>
    </div>
  );
}