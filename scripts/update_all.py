#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Script maître pour mettre à jour toutes les données LEGO/Rebrickable

Ce script combine :
1. Le téléchargement des CSV Rebrickable (download_rebrickable_csv.py)
2. Le scraping du tableau des couleurs avec Selenium (colors_table.py)

Utilisation :
    python update_all.py

Prérequis :
- Chrome/Chromium installé sur le système
- Packages Python : requests, beautifulsoup4, selenium, webdriver-manager

Installation des dépendances :
    pip install requests beautifulsoup4 selenium webdriver-manager
"""

import subprocess
import sys
import os
from pathlib import Path

def print_header(title: str):
    """Affiche un en-tête formaté"""
    print(f"\n{'='*60}")
    print(f"🚀 {title}")
    print(f"{'='*60}")

def print_step(step: str):
    """Affiche une étape"""
    print(f"\n📋 {step}")
    print("-" * 40)

def run_script(script_name: str, description: str) -> bool:
    """Exécute un script Python et retourne True si succès"""
    print_step(f"Étape : {description}")
    
    script_path = Path(__file__).parent / script_name
    if not script_path.exists():
        print(f"❌ Erreur : Le script {script_name} n'existe pas")
        print(f"   Chemin recherché : {script_path}")
        return False
    
    try:
        print(f"🔄 Lancement de {script_name}...")
        # Chemin absolu vers le script
        script_path = Path(__file__).parent / script_name
        result = subprocess.run(
            [sys.executable, str(script_path)],
            cwd=Path(__file__).parent,
            check=True,
            capture_output=False  # Affiche la sortie en temps réel
        )
        print(f"✅ {script_name} terminé avec succès")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors de l'exécution de {script_name}")
        print(f"   Code de sortie : {e.returncode}")
        return False
    except Exception as e:
        print(f"❌ Erreur inattendue avec {script_name} : {e}")
        return False

def check_dependencies():
    """Vérifie que les dépendances Python sont installées"""
    print_step("Vérification des dépendances")
    
    required_packages = {
        'requests': 'requests',
        'beautifulsoup4': 'bs4',  # beautifulsoup4 s'importe comme bs4
        'selenium': 'selenium',
        'webdriver-manager': 'webdriver_manager'
    }
    missing_packages = []
    
    for package_name, import_name in required_packages.items():
        try:
            __import__(import_name)
            print(f"✅ {package_name} : installé")
        except ImportError:
            print(f"❌ {package_name} : manquant")
            missing_packages.append(package_name)
    
    if missing_packages:
        print(f"\n⚠️  Packages manquants : {', '.join(missing_packages)}")
        print("💡 Pour les installer :")
        print(f"   pip install {' '.join(missing_packages)}")
        return False
    
    return True

def show_summary(results: dict):
    """Affiche un résumé des résultats"""
    print_header("RÉSUMÉ DE L'EXÉCUTION")
    
    total_scripts = len(results)
    successful_scripts = sum(1 for success in results.values() if success)
    
    print(f"📊 Scripts exécutés : {total_scripts}")
    print(f"✅ Succès : {successful_scripts}")
    print(f"❌ Échecs : {total_scripts - successful_scripts}")
    
    print("\n📋 Détail par script :")
    for script, success in results.items():
        status = "✅ Succès" if success else "❌ Échec"
        print(f"   {script:<20} : {status}")
    
    if successful_scripts == total_scripts:
        print("\n🎉 Toutes les mises à jour ont réussi !")
        print("\n📁 Fichiers générés dans public/data/ :")
        print("   • colors.csv (couleurs LEGO)")
        print("   • elements.csv (éléments LEGO)")
        print("   • inventory_parts_*.csv (inventaires par lots)")
        print("   • colors_mapping.csv (couleurs scrapées avec mapping BrickLink)")
    else:
        print("\n⚠️  Certaines mises à jour ont échoué")
        print("   Consultez les logs ci-dessus pour plus de détails")

def main():
    """Fonction principale"""
    print_header("MISE À JOUR DES DONNÉES LEGO/REBRICKABLE")
    
    # Vérification des dépendances
    if not check_dependencies():
        print("\n❌ Arrêt : dépendances manquantes")
        return 1
    
    # Liste des scripts à exécuter
    scripts = [
        ("download_rebrickable_csv.py", "Téléchargement des CSV Rebrickable"),
        ("colors_table.py", "Scraping du tableau des couleurs")
    ]
    
    results = {}
    
    # Exécution des scripts
    for script_name, description in scripts:
        success = run_script(script_name, description)
        results[script_name] = success
        
        # Si un script critique échoue, on peut continuer mais on le note
        if not success:
            print(f"⚠️  {script_name} a échoué, mais on continue...")
    
    # Affichage du résumé
    show_summary(results)
    
    # Code de sortie
    if all(results.values()):
        return 0  # Succès complet
    else:
        return 1  # Au moins un échec

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️  Interruption par l'utilisateur (Ctrl+C)")
        print("🛑 Arrêt du script")
        sys.exit(130)
    except Exception as e:
        print(f"\n\n💥 Erreur inattendue : {e}")
        print("🛑 Arrêt du script")
        sys.exit(1)