#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour scraper le tableau des couleurs LEGO depuis Rebrickable avec Selenium
Auteur: Assistant IA
Date: 2025
"""

import os
import sys
import time
import csv
import re
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager


# Configuration
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent  # Remonte d'un niveau depuis scripts/
DATA_DIR = PROJECT_ROOT / "public" / "data"
URL_COLORS = "https://rebrickable.com/colors/"
OUTPUT_FILE = DATA_DIR / "colors_mapping.csv"
HTML_FILE = DATA_DIR / "rebrickable_colors.html"

def setup_chrome_driver():
    """Configure et lance le driver Chrome avec options anti-détection"""
    chrome_options = Options()
    
    # Options pour éviter la détection
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # User agent réaliste
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    # Mode headless (navigateur invisible)
    chrome_options.add_argument("--headless")
    
    try:
        driver = webdriver.Chrome(service=webdriver.chrome.service.Service(ChromeDriverManager().install()), options=chrome_options)
        
        # Masquer les propriétés webdriver
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        return driver
    except WebDriverException as e:
        print(f"❌ Erreur lors de l'initialisation du driver Chrome : {e}")
        print("💡 Assurez-vous que ChromeDriver est installé et dans le PATH")
        print("💡 Ou installez-le avec : pip install webdriver-manager")
        return None

def scrape_with_selenium():
    """Scrape la page avec Selenium"""
    print("🤖 Lancement du navigateur Chrome...")
    
    driver = setup_chrome_driver()
    if not driver:
        return None
    
    try:
        print(f"🌐 Navigation vers : {URL_COLORS}")
        driver.get(URL_COLORS)
        
        # Attendre que la page se charge
        print("⏱️ Attente du chargement de la page...")
        time.sleep(5)
        
        # Attendre que le tableau soit présent
        wait = WebDriverWait(driver, 20)
        table = wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))
        
        print("✅ Tableau trouvé, récupération du HTML...")
        
        # Récupérer le HTML complet de la page
        html_content = driver.page_source
        
        # Sauvegarder le HTML
        with open(HTML_FILE, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"💾 HTML sauvegardé : {HTML_FILE}")
        
        return html_content
        
    except TimeoutException:
        print("❌ Timeout : Le tableau n'a pas pu être trouvé")
        print("💡 La structure de la page a peut-être changé")
        return None
        
    except Exception as e:
        print(f"❌ Erreur lors du scraping : {e}")
        return None
        
    finally:
        print("🔒 Fermeture du navigateur...")
        driver.quit()
        # Attendre un peu pour s'assurer que le navigateur est complètement fermé
        time.sleep(2)

def parse_colors_from_html(html_content):
    """Parse le HTML pour extraire les données des couleurs"""
    print("🔍 Parsing du HTML...")
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Chercher le tableau des couleurs
    table = soup.find('table')
    if not table:
        print("❌ Aucun tableau trouvé dans le HTML")
        return []
    
    colors_data = []
    rows = table.find_all('tr')
    
    # Ignorer la première ligne (header)
    for row in rows[1:]:
        cells = row.find_all(['td', 'th'])
        if len(cells) >= 10:  # S'assurer qu'il y a assez de colonnes
            try:
                color_data = {
                    'Img': '',  # Pas d'image dans le CSV
                    'ID': cells[0].get_text(strip=True),
                    'Name': cells[1].get_text(strip=True),
                    'RGB': cells[2].get_text(strip=True),
                    'Num Parts': cells[3].get_text(strip=True),
                    'Num Sets': cells[4].get_text(strip=True),
                    'First Year': cells[5].get_text(strip=True),
                    'Last Year': cells[6].get_text(strip=True),
                    'LEGO': cells[7].get_text(strip=True),
                    'LDraw': cells[8].get_text(strip=True),
                    'BrickLink': cells[9].get_text(strip=True),
                    'BrickOwl': cells[10].get_text(strip=True) if len(cells) > 10 else ''
                }
                
                # Nettoyer les données
                for key, value in color_data.items():
                    if value == '-' or value == '':
                        color_data[key] = ''
                
                colors_data.append(color_data)
                
            except Exception as e:
                print(f"⚠️ Erreur lors du parsing d'une ligne : {e}")
                continue
    
    print(f"✅ {len(colors_data)} couleurs extraites")
    return colors_data

def cleanup_html_file():
    """Supprime le fichier HTML temporaire après utilisation"""
    try:
        if HTML_FILE.exists():
            os.remove(HTML_FILE)
            print(f"🗑️ Fichier HTML supprimé : {HTML_FILE}")
        else:
            print("ℹ️ Aucun fichier HTML à supprimer")
    except Exception as e:
        print(f"⚠️ Erreur lors de la suppression du fichier HTML : {e}")

def save_to_csv(colors_data, output_file):
    """Sauvegarde les données en CSV"""
    if not colors_data:
        print("❌ Aucune donnée à sauvegarder")
        return False
    
    print(f"💾 Sauvegarde en CSV : {output_file}")
    
    # Headers du CSV
    headers = ['Img', 'ID', 'Name', 'RGB', 'Num Parts', 'Num Sets', 
               'First Year', 'Last Year', 'LEGO', 'LDraw', 'BrickLink', 'BrickOwl']
    
    try:
        with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=headers)
            writer.writeheader()
            writer.writerows(colors_data)
        
        print(f"✅ {len(colors_data)} couleurs sauvegardées")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la sauvegarde : {e}")
        return False

def main():
    """Fonction principale"""
    print("🎯 Script de scraping Selenium des couleurs Rebrickable")
    print("=" * 60)
    print(f"📁 Dossier de travail : {SCRIPT_DIR}")
    
    # Vérifier si le fichier HTML existe déjà
    if HTML_FILE.exists():
        print(f"📄 Fichier HTML trouvé : {HTML_FILE}")
        print("🔍 Parsing du fichier HTML local...")
        
        try:
            with open(HTML_FILE, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # Vérifier si le fichier contient des données valides
            if len(html_content.strip()) < 1000:
                print("⚠️ Le fichier HTML semble incomplet, nouveau scraping...")
                html_content = scrape_with_selenium()
            else:
                print("✅ Fichier HTML valide trouvé")
                
        except Exception as e:
            print(f"❌ Erreur lors de la lecture du fichier HTML : {e}")
            html_content = scrape_with_selenium()
    else:
        print("📥 Aucun fichier HTML local trouvé, scraping avec Selenium...")
        html_content = scrape_with_selenium()
    
    if not html_content:
        print("❌ Impossible de récupérer le contenu HTML")
        return False
    
    # Parser les données
    colors_data = parse_colors_from_html(html_content)
    
    if not colors_data:
        print("❌ Aucune donnée extraite")
        return False
    
    # Sauvegarder en CSV
    success = save_to_csv(colors_data, OUTPUT_FILE)
    
    if success:
        print("\n📊 Statistiques :")
        print(f"   - Total couleurs : {len(colors_data)}")
        
        # Compter les couleurs avec mapping BrickLink
        bricklink_mapped = sum(1 for color in colors_data if color.get('BrickLink', '').strip())
        print(f"   - Avec mapping BrickLink : {bricklink_mapped}")
        print(f"   - Taux de couverture : {(bricklink_mapped/len(colors_data)*100):.1f}%")
        
        # Aperçu supprimé pour simplifier les logs
        
        # Supprimer le fichier HTML après succès
        cleanup_html_file()
        
        return True
    
    return False

if __name__ == "__main__":
    try:
        success = main()
        
        print("=" * 60)
        if success:
            print("✅ Script Selenium terminé avec succès")
            print("💡 Vous pouvez maintenant utiliser le fichier CSV généré")
        else:
            print("❌ Script Selenium terminé avec des erreurs")
            print("💡 Vérifiez les messages d'erreur ci-dessus")
            
    except KeyboardInterrupt:
        print("\n⏹️ Arrêt demandé par l'utilisateur")
    except Exception as e:
        print(f"💥 Erreur inattendue : {e}")
        import traceback
        print("🔍 Détails de l'erreur :")
        traceback.print_exc()