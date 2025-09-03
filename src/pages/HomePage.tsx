import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Download, Grid3X3, Palette, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-500 via-yellow-400 to-blue-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Transformez vos images en
              <span className="block text-yellow-300">mosaïques LEGO</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Créez des œuvres d'art pixelisées uniques avec notre générateur
              intelligent. Utilisez les couleurs officielles LEGO avec notre système
              modulaire Technic.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/generator">
                <Button asChild variant="cta-primary" size="cta">
                  <Zap size={32} />
                  <span>Commencer maintenant</span>
                  <ArrowRight size={32} />
                </Button>
              </Link>

              <Link to="/gallery">
                <Button
                  asChild
                  variant="cta-outline"
                  size="cta"
                  className="hover:cursor-pointer"
                >
                  <span>Voir des exemples</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Cubic Art ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Notre générateur utilise des algorithmes avancés pour créer des
              mosaïques LEGO parfaites
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center pt-6 space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Palette className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Couleurs LEGO Officielles
              </h3>
              <p className="text-gray-600">
                Palette complète des couleurs officielles LEGO.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center pt-6 space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Grid3X3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Système Modulaire
              </h3>
              <p className="text-gray-600">
                Tailles flexibles (16x16 à 64x64) avec une plaque de base Technic 16x16 pour
                des créations sur mesure.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center pt-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Algorithme ΔE
              </h3>
              <p className="text-gray-600">
                Mapping couleur précis utilisant la formule ΔE pour un rendu
                fidèle.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center pt-6 space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Download className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Export Multiple
              </h3>
              <p className="text-gray-600">
                Téléchargez vos créations en PNG, SVG ou obtenez la liste
                détaillée des pièces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-left">
                Spécifications techniques
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-left">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Plaque de base Technic LEGO 65803
                    </h3>
                    <p className="text-gray-600">
                      Plaque de base 16x16 modulaires pour structures flexibles
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-left">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Connecteurs Technic LEGO 61332
                    </h3>
                    <p className="text-gray-600">
                      Assemblage solide des modules entre eux
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 text-left">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Pièces 1x1 LEGO 3024
                    </h3>
                    <p className="text-gray-600">
                      De 256 à 4096 pièces par mosaïque
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-left">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Algorithme optimisé
                    </h3>
                    <p className="text-gray-600">
                      Redimensionnement intelligent et mapping couleur précis
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-left">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Export complet
                    </h3>
                    <p className="text-gray-600">
                      PNG haute résolution, SVG vectoriel et liste JSON des
                      pièces
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-8">
              <CardContent className="p-0">
                <div className="grid grid-cols-8 gap-1">
                  {/* Simulation d'une grille LEGO 8x8 pour l'exemple */}
                  {Array.from({ length: 64 }, (_, i) => {
                    const colors = [
                      "bg-red-500",
                      "bg-blue-500",
                      "bg-yellow-400",
                      "bg-green-500",
                      "bg-white",
                      "bg-gray-800",
                    ];
                    const color =
                      colors[Math.floor(Math.random() * colors.length)];
                    return (
                      <div
                        key={i}
                        className={`w-4 h-4 ${color} rounded-sm border border-gray-200`}
                      ></div>
                    );
                  })}
                </div>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Exemple de mosaïque 8x8 (tailles réelles : 16x16 à 64x64)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à créer votre première mosaïque LEGO ?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Uploadez votre image et laissez notre algorithme faire le reste. En
            quelques secondes, obtenez votre mosaïque et la liste des pièces
            nécessaires.
          </p>
          <Link to="/generator">
            <Button asChild variant="cta-primary" size="cta">
              <Zap size={32} />
              <span>Commencer maintenant</span>
              <ArrowRight size={32} />
            </Button>
          </Link>
        </div>
      </section>
      
      
    </div>
  );
}
