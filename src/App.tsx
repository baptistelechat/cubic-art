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
import './App.css';

function App() {
  const preloadCommonPalettes = useColorStore(state => state.preloadCommonPalettes);

  // Pré-charger les palettes au démarrage de l'app
  useEffect(() => {
    preloadCommonPalettes().catch(error => {
      console.error('❌ Erreur lors du pré-chargement des palettes:', error);
    });
  }, [preloadCommonPalettes]);

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