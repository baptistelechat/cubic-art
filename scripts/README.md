# Scripts d'automatisation Rebrickable 🤖

Ce dossier contient les scripts Python pour automatiser la récupération des données LEGO depuis Rebrickable.

## 📋 Scripts disponibles

### 1. `download_rebrickable_csv.py`
**Fonction** : Télécharge les fichiers CSV officiels de Rebrickable
- `colors.csv` : Liste des couleurs LEGO
- `elements.csv` : Éléments LEGO avec références
- `inventory_parts_*.csv` : Inventaires des sets par lots

### 2. `colors_table.py`
**Fonction** : Scrape le tableau des couleurs depuis rebrickable.com/colors/
- Utilise Selenium avec Chrome en mode headless (invisible)
- Génère `rebrickable-colors-scraped.csv` avec mapping BrickLink
### 3. `update_all.py`
**Fonction** : Script maître qui lance les deux autres scripts
- Vérifie les dépendances
- Exécute les scripts dans l'ordre
- Affiche un résumé des résultats

## 🚀 Installation

### Prérequis système
- **Python 3.7+** installé
- **Google Chrome** ou **Chromium** installé sur le système
- Connexion internet

### Installation des dépendances Python

```bash
# Installation des packages requis
pip install requests beautifulsoup4 selenium webdriver-manager
```

**Détail des packages :**
- `requests` : Téléchargement HTTP
- `beautifulsoup4` : Parsing HTML
- `selenium` : Automatisation du navigateur
- `webdriver-manager` : Gestion automatique de ChromeDriver

### Installation automatique de ChromeDriver

Le script `colors_table.py` utilise `webdriver-manager` qui télécharge automatiquement ChromeDriver à la première exécution. Aucune configuration manuelle n'est nécessaire.

## 📖 Utilisation

### Exécution complète (recommandée)

```bash
# Depuis le dossier scripts/
python update_all.py
```

Ce script :
1. ✅ Vérifie les dépendances
2. 📥 Télécharge les CSV Rebrickable
3. 🤖 Scrape le tableau des couleurs
4. 📊 Affiche un résumé des résultats

### Exécution individuelle

```bash
# Téléchargement CSV uniquement
python download_rebrickable_csv.py

# Scraping couleurs uniquement
python colors_table.py
```

## 📁 Fichiers générés

Tous les fichiers sont sauvegardés dans `public/data/` :

```
public/data/
├── colors.csv                      # Couleurs officielles Rebrickable
├── elements.csv                    # Éléments LEGO
├── inventory_parts_*.csv           # Inventaires par lots
└── rebrickable-colors-scraped.csv  # Couleurs avec mapping BrickLink
```

## 🔧 Configuration

### Mode navigateur visible (debug)

Pour voir le navigateur Chrome pendant le scraping (utile pour le debug) :

1. Ouvrir `colors_table.py`
2. Commenter la ligne : `# chrome_options.add_argument("--headless")`
3. Sauvegarder et relancer

### Personnalisation des URLs

Les URLs Rebrickable sont configurées dans chaque script :
- `download_rebrickable_csv.py` : URLs des CSV
- `colors_table.py` : URL du tableau des couleurs

## ⚠️ Résolution des erreurs courantes

### Erreur : "ChromeDriver not found"
**Solution** : Le package `webdriver-manager` devrait gérer cela automatiquement. Si l'erreur persiste :
```bash
pip install --upgrade webdriver-manager
```

### Erreur : "Permission denied" ou "WinError 32"
**Cause** : Le fichier HTML temporaire est encore utilisé par Chrome
**Solution** : Le script attend maintenant 2 secondes après fermeture du navigateur

### Erreur : "Timeout" lors du scraping
**Causes possibles** :
- Connexion internet lente
- Site Rebrickable temporairement indisponible
- Structure de la page modifiée

**Solutions** :
1. Réessayer plus tard
2. Vérifier la connexion internet
3. Exécuter en mode navigateur visible pour diagnostiquer

### Erreur : "Module not found"
**Solution** : Installer les dépendances manquantes
```bash
pip install requests beautifulsoup4 selenium webdriver-manager
```

### Erreur : "403 Forbidden"
**Cause** : Rebrickable bloque les requêtes automatisées
**Solution** : Le script Selenium contourne ce problème avec des headers réalistes

## 📊 Statistiques typiques

Après exécution réussie :
- **Couleurs totales** : ~273 (colors.csv)
- **Couleurs scrapées** : ~271 (rebrickable-colors-scraped.csv)
- **Mapping BrickLink** : ~164 couleurs (60.5%)
- **Couverture globale** : 60.5%

## 🔄 Automatisation

### Exécution périodique (Windows)

Pour automatiser l'exécution (ex: hebdomadaire) :

1. **Planificateur de tâches Windows** :
   - Ouvrir "Planificateur de tâches"
   - Créer une tâche de base
   - Programme : `python`
   - Arguments : `C:\chemin\vers\update_all.py`
   - Répertoire : `C:\chemin\vers\scripts`

2. **Script batch** (optionnel) :
```batch
@echo off
cd /d "C:\chemin\vers\scripts"
python update_all.py
pause
```

## 🛠️ Développement

### Structure des scripts

Chaque script suit la même structure :
- Configuration des chemins en haut
- Fonctions utilitaires
- Fonction `main()` principale
- Gestion d'erreurs avec try/catch
- Messages colorés avec emojis

### Ajout de nouvelles fonctionnalités

Pour ajouter un nouveau script :
1. Créer le fichier dans `scripts/`
2. Suivre la structure existante
3. Ajouter l'appel dans `update_all.py`
4. Mettre à jour ce README

## 📞 Support

En cas de problème :
1. Vérifier les prérequis système
2. Consulter les erreurs courantes ci-dessus
3. Exécuter en mode debug (navigateur visible)
4. Vérifier les logs détaillés dans la console

---

*Dernière mise à jour : Septembre 2025*
*Compatibilité : Python 3.7+, Windows 10+*