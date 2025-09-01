import { Grid3X3, Palette, Zap, Github, Heart, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
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
          
          <p className="text-gray-700 leading-relaxed mb-6">
            Cubic Art a été créé pour démocratiser l'art des mosaïques LEGO. Notre objectif est de 
            fournir un outil simple, précis et gratuit permettant à chacun de transformer ses images 
            préférées en instructions de construction LEGO authentiques.
          </p>
          
          <p className="text-gray-700 leading-relaxed">
            Que vous soyez un passionné de LEGO, un artiste numérique ou simplement curieux, 
            Cubic Art vous offre la possibilité de créer des œuvres d'art pixelisées uniques 
            en utilisant les spécifications officielles LEGO.
          </p>
        </div>
        
        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <HelpCircle className="text-purple-600" size={32} />
            <h2 className="text-2xl font-bold text-gray-900">Questions fréquemment posées</h2>
          </div>
          
          <p className="text-gray-600 mb-6 text-left">
            Trouvez rapidement des réponses aux questions les plus courantes sur Cubic Art
          </p>
          
          <Accordion type="single" collapsible className="w-full text-left">
            {/* Questions générales sur l'utilisation */}
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                Quels formats d'image sont supportés par Cubic Art ?
              </AccordionTrigger>
              <AccordionContent>
                Cubic Art supporte les formats d'image les plus courants : JPEG, PNG, GIF, BMP et WebP. Pour de meilleurs résultats, nous recommandons d'utiliser des images en haute résolution (minimum 500x500 pixels).
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                Y a-t-il une limite de taille pour les images ?
              </AccordionTrigger>
              <AccordionContent>
                Pour garantir des performances optimales, nous limitons la taille des images à 10 MB et 4000x4000 pixels. Si votre image est plus grande, elle sera automatiquement redimensionnée tout en préservant les proportions.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Cubic Art est-il gratuit ?
              </AccordionTrigger>
              <AccordionContent>
                Oui, Cubic Art est entièrement gratuit ! Vous pouvez convertir autant d'images que vous le souhaitez, exporter vos créations et accéder à toutes les fonctionnalités sans aucun coût.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Puis-je utiliser Cubic Art sur mobile ?
              </AccordionTrigger>
              <AccordionContent>
                Absolument ! Cubic Art est optimisé pour tous les appareils : ordinateurs, tablettes et smartphones. L'interface s'adapte automatiquement à la taille de votre écran pour une expérience utilisateur optimale.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                Mes données sont-elles sécurisées ?
              </AccordionTrigger>
              <AccordionContent>
                Votre confidentialité est notre priorité. Les images sont traitées localement dans votre navigateur et ne sont jamais envoyées sur nos serveurs. Aucune donnée personnelle n'est collectée ou stockée.
              </AccordionContent>
            </AccordionItem>
            
            {/* Questions sur le fonctionnement */}
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left">
                Pourquoi les couleurs de ma mosaïque sont-elles parfois différentes de mon image originale ?
              </AccordionTrigger>
              <AccordionContent>
                Cubic Art utilise un système intelligent qui "traduit" chaque couleur de votre image vers la couleur LEGO la plus ressemblante disponible. Comme LEGO ne fabrique qu'un nombre limité de couleurs, certaines nuances subtiles de votre image originale sont automatiquement remplacées par la couleur LEGO la plus proche visuellement. C'est ce qui donne ce style "pixelisé" caractéristique des mosaïques LEGO !
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left">
                Comment fonctionne la conversion en couleurs LEGO ?
              </AccordionTrigger>
              <AccordionContent>
                Notre algorithme analyse chaque pixel de votre image et le convertit vers la couleur LEGO la plus proche disponible dans notre palette. Nous utilisons la base de données des couleurs LEGO officielles pour garantir un rendu réaliste.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left">
                Quels types d'images donnent les meilleurs résultats ?
              </AccordionTrigger>
              <AccordionContent>
                Les images avec des contrastes marqués, des couleurs vives et des détails bien définis donnent les meilleurs résultats. Les portraits, logos, paysages simples et illustrations fonctionnent particulièrement bien. Évitez les images trop détaillées ou avec des dégradés très subtils qui pourraient se perdre dans la conversion.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-9">
              <AccordionTrigger className="text-left">
                Puis-je créer des mosaïques en noir et blanc ?
              </AccordionTrigger>
              <AccordionContent>
                Absolument ! Cubic Art gère parfaitement les images en noir et blanc ou en niveaux de gris. L'algorithme utilisera automatiquement la gamme des gris disponibles dans la palette LEGO (blanc, gris clair, gris foncé, noir) pour créer des mosaïques monochromes très élégantes.
              </AccordionContent>
            </AccordionItem>
            
            {/* Questions techniques */}
            <AccordionItem value="item-10">
              <AccordionTrigger className="text-left">
                Quelles tailles de mosaïques sont disponibles ?
              </AccordionTrigger>
              <AccordionContent>
                Cubic Art utilise un système modulaire LEGO Technic supportant les tailles 16x16, 32x32, 48x48 et 64x64. Chaque configuration utilise des plaques de base Technic 16x16 (réf. 65803) et des connecteurs (réf. 61332) pour créer une structure modulaire solide et flexible.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-11">
              <AccordionTrigger className="text-left">
                Puis-je exporter mon design en différents formats ?
              </AccordionTrigger>
              <AccordionContent>
                Oui ! Cubic Art permet d'exporter vos créations en plusieurs formats : image PNG ou SVG en haute résolution, liste de pièces détaillée (CSV/JSON), et instructions de montage étape par étape. Vous pouvez également partager directement sur les réseaux sociaux.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-12">
              <AccordionTrigger className="text-left">
                Comment obtenir la liste des pièces LEGO nécessaires ?
              </AccordionTrigger>
              <AccordionContent>
                Après la conversion de votre image, cliquez sur "Exporter" puis sélectionnez "Liste de pièces". Vous obtiendrez un fichier détaillé avec le nombre exact de briques par couleur, leurs références officielles LEGO et une estimation du coût.
              </AccordionContent>
            </AccordionItem>
            
            {/* Questions pratiques */}
            <AccordionItem value="item-13">
              <AccordionTrigger className="text-left">
                Où puis-je acheter les pièces LEGO nécessaires ?
              </AccordionTrigger>
              <AccordionContent>
                Vous pouvez acheter les pièces sur le service "Pick-a-Brick" du site officiel LEGO, sur BrickLink (marketplace de pièces LEGO d'occasion), ou dans les magasins LEGO physiques. La liste générée par Cubic Art inclut les références exactes pour faciliter vos achats.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-14">
              <AccordionTrigger className="text-left">
                Combien coûte en moyenne une mosaïque ?
              </AccordionTrigger>
              <AccordionContent>
                Le coût varie selon la taille et les couleurs utilisées. Une mosaïque 32x32 coûte environ 60-80€ (briques Technic et connecteurs inclus), tandis qu'une 64x64 peut atteindre 300-400€. Les couleurs rares peuvent augmenter le prix. L'estimation de coût dans l'export vous donnera une idée précise selon votre design.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-15">
              <AccordionTrigger className="text-left">
                Puis-je sauvegarder mes créations pour les retrouver plus tard ?
              </AccordionTrigger>
              <AccordionContent>
                Actuellement, les créations sont temporaires et liées à votre session de navigation. Nous recommandons d'exporter vos mosaïques préférées (image + liste de pièces) pour les conserver. Une fonctionnalité de galerie personnelle pourrait être ajoutée dans une future version.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
                <h3 className="font-semibold text-gray-900 mb-1">Plaque de base Technic LEGO 65803</h3>
                <p className="text-gray-600">Plaque de base 16x16 pour structures flexibles</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Connecteurs Technic LEGO 61332</h3>
                <p className="text-gray-600">Assemblage solide des modules entre eux</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Pièces 1x1 LEGO 3024</h3>
                <p className="text-gray-600">De 256 à 4096 pièces par mosaïque</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Couleurs LEGO Officielles</h3>
                <p className="text-gray-600">Palette LEGO officielle</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Algorithme ΔE</h3>
                <p className="text-gray-600">Mapping couleur précis pour un rendu optimal</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Export Multiple</h3>
                <p className="text-gray-600">PNG, SVG et liste CSV/JSON des pièces</p>
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
                  Votre image est automatiquement redimensionnée selon la taille choisie (16x16 à 64x64) avec 
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
              <Link to="/contact">
                <span>Contribuer au projet</span>
              </Link>
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