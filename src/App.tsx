import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/sonner";
import { useColorStore } from "@/hooks/useColorStore";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { GalleryPage } from "@/pages/GalleryPage";
import { GeneratorPage } from "@/pages/GeneratorPage";
import { HomePage } from "@/pages/HomePage";
import { clearCSVCache } from "@/services/csvDataService";
import { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { toast } from "sonner";
import "./App.css";

function App() {
  const preloadCommonPalettes = useColorStore(
    (state) => state.preloadCommonPalettes
  );
  const clearCache = useColorStore((state) => state.clearCache);

  // Vider tous les caches et pré-charger les palettes au démarrage de l'app
  useEffect(() => {
    // Forcer le rechargement complet des données
    clearCSVCache();
    clearCache();

    preloadCommonPalettes().catch((error) => {
      toast.error("Erreur lors du pré-chargement des palettes", {
        description: error.message || "Une erreur inattendue s'est produite",
      });
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
        <Toaster position="bottom-right" richColors />
      </div>
    </Router>
  );
}

export default App;
