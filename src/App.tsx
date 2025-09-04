import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { HomePage } from '@/pages/HomePage';
import { GeneratorPage } from '@/pages/GeneratorPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';
import { useColorStore } from '@/hooks/useColorStore';
import { clearCSVCache } from '@/services/csvDataService';
import './App.css';

function App() {
  const preloadCommonPalettes = useColorStore(state => state.preloadCommonPalettes);
  const clearCache = useColorStore(state => state.clearCache);

  // Vider tous les caches et pré-charger les palettes au démarrage de l'app
  useEffect(() => {
    // Forcer le rechargement complet des données
    clearCSVCache();
    clearCache();
    
    preloadCommonPalettes().catch(error => {
      console.error('❌ Erreur lors du pré-chargement des palettes:', error);
    });
  }, [preloadCommonPalettes, clearCache]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/generator" element={<GeneratorPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;