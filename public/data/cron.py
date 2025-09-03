import os
import requests
import zipfile
import shutil
from pathlib import Path

# --- CONFIG ---
DOWNLOAD_LIST = [
    "https://cdn.rebrickable.com/media/downloads/colors.csv.zip",
    "https://cdn.rebrickable.com/media/downloads/elements.csv.zip",
    "https://cdn.rebrickable.com/media/downloads/inventory_parts.csv.zip"
]

# Le dossier de travail sera le dossier où se trouve ce script
SCRIPT_DIR = Path(__file__).resolve().parent
WORK_DIR = SCRIPT_DIR
MAX_SIZE = 100 * 1024 * 1024  # 100 Mo

# --- FONCTIONS ---
def download_file(url, dest):
    local_path = os.path.join(dest, os.path.basename(url))
    print("")
    print(f"⬇️ Téléchargement : {url}")
    r = requests.get(url, stream=True)
    r.raise_for_status()
    with open(local_path, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
    return local_path

def extract_zip(zip_path, extract_to):
    print(f"📦 Extraction : {zip_path}")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)

def split_file(file_path, max_size=MAX_SIZE):
    """Divise le fichier en 2 parties égales si > max_size, sinon retourne le fichier"""
    file_size = os.path.getsize(file_path)
    if file_size <= max_size:
        return [file_path]

    print(f"✂️ Split du fichier en 2 parties : {file_path}")
    parts = []

    base, ext = os.path.splitext(file_path)

    # Lire toutes les lignes du fichier CSV
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    if len(lines) <= 1:
        return [file_path]  # Pas assez de lignes pour splitter
    
    header = lines[0]  # Première ligne = en-tête CSV
    data_lines = lines[1:]  # Reste = données
    
    # Diviser les données en 2 parties égales
    mid_point = len(data_lines) // 2
    
    # Créer les fichiers avec en-têtes
    for i, chunk in enumerate([data_lines[:mid_point], data_lines[mid_point:]], 1):
        part_path = f"{base}_{i}{ext}"
        with open(part_path, 'w', encoding='utf-8') as part_file:
            part_file.write(header)  # Écrire l'en-tête
            part_file.writelines(chunk)  # Écrire les données
        parts.append(part_path)

    os.remove(file_path)
    return parts

def move_with_overwrite(src, dst_dir):
    dest_path = os.path.join(dst_dir, os.path.basename(src))
    if os.path.exists(dest_path):
        os.remove(dest_path)  # supprime l’ancien fichier
    shutil.move(src, dest_path)
    print(f"✅ Fichier déplacé : {dest_path}")

# --- MAIN ---
def main():
    os.makedirs(WORK_DIR, exist_ok=True)

    for url in DOWNLOAD_LIST:
        # 1. Téléchargement
        zip_path = download_file(url, WORK_DIR)

        # 2. Extraction dans un dossier temporaire
        extract_dir = os.path.join(WORK_DIR, "tmp_extract")
        os.makedirs(extract_dir, exist_ok=True)
        extract_zip(zip_path, extract_dir)

        # 3. Récupération des CSV et split si >100Mo
        for root, _, files in os.walk(extract_dir):
            for file in files:
                if file.endswith(".csv"):
                    file_path = os.path.join(root, file)
                    parts = split_file(file_path)
                    for p in parts:
                        move_with_overwrite(p, WORK_DIR)  # directement dans le dossier du script

        # Nettoyage
        shutil.rmtree(extract_dir)
        os.remove(zip_path)

    print("")
    print("🎉 Tous les fichiers CSV sont prêts dans :", WORK_DIR)

if __name__ == "__main__":
    main()
