import { Heart, Github, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo et description */}
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
              </div>
              <span className="text-lg font-bold">Cubic Art</span>
            </div>
            <p className="text-gray-400 text-sm">
              Transformez vos images en mosaïques LEGO avec notre générateur intelligent. 
              Créez des œuvres d'art pixelisées uniques avec les couleurs officielles LEGO.
            </p>
          </div>
          
          {/* Liens rapides */}
          <div className="space-y-4 text-left">
            <h3 className="text-lg font-semibold">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/generator" className="text-gray-400 hover:text-white transition-colors">
                  Générateur de mosaïques
                </a>
              </li>
              <li>
                <a href="/gallery" className="text-gray-400 hover:text-white transition-colors">
                  Galerie d'exemples
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition-colors">
                  À propos du projet
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Nous contacter
                </a>
              </li>
            </ul>
          </div>
          
          {/* Informations techniques */}
          <div className="space-y-4 text-left">
            <h3 className="text-lg font-semibold">Spécifications</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Plaque de base 32x32 (LEGO 3811)</li>
              <li>• Pièces 1x1 uniquement (LEGO 3024)</li>
              <li>• Couleurs LEGO officielles</li>
              <li>• Export PNG, SVG, JSON</li>
              <li>• 1024 pièces par mosaïque</li>
            </ul>
          </div>
        </div>
        
        {/* Séparateur */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Fait avec</span>
              <Heart size={16} className="text-red-500" />
              <span>pour la communauté LEGO</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="mailto:contact@cubic-art.com" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>
              © Cubic Art. Projet open source. 
              LEGO® est une marque déposée du groupe LEGO, qui ne parraine, n'autorise 
              ou n'approuve pas ce site.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}