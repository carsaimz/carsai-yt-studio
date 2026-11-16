<div align="center">
  <img src="public/icon.svg" alt="Carsai YT Studio" width="110" height="110" />

  <h1>Carsai YT Studio</h1>

  <p>
    <strong>Plateforme local-first pour créateurs YouTube — statistiques, SEO, communauté, automatisation et IA</strong>
  </p>

  <p><strong>Lire en :</strong>
    <a href="README.md">English</a> ·
    <a href="README.pt.md">Português</a> ·
    <a href="README.es.md">Español</a> ·
    <a href="README.fr.md">Français</a> ·
    <a href="README.de.md">Deutsch</a> ·
    <a href="README.it.md">Italiano</a> ·
    <a href="README.zh.md">中文</a>
  </p>

  <p>🌐 <strong><a href="https://carsaiytstudio.vercel.app">Site officiel — carsaiytstudio.vercel.app</a></strong></p>
</div>

---

## Qu'est-ce que c'est ?

**Carsai YT Studio v3** est une alternative à YouTube Studio avec des super-pouvoirs : analysez votre chaîne, optimisez le SEO, modérez votre communauté, automatisez les tâches répétitives, explorez **toute l'API YouTube Data v3** et utilisez des agents d'IA — le tout dans une seule app qui fonctionne sur **navigateur (PWA), Android/iOS (Capacitor) et ordinateur (Electron)**.

La v3 est **local-first** : vos données et clés d'API restent uniquement sur votre appareil. Pas de Firebase, pas de backend obligatoire, pas de serveurs intermédiaires. Open-source sous licence **MIT**.

> **Note sur le web** : la version web sert uniquement de **test et démonstration** (données d'exemple, sans connexions réelles). L'expérience complète — données réelles, OAuth et automatisation — s'exécute dans les apps **Electron (ordinateur)** et **Capacitor (mobile)**, téléchargeables depuis les [Releases](https://github.com/carsaimz/carsai-yt-studio/releases/latest).

## Fonctionnalités

| | Fonctionnalité | Description |
|--|---|---|
| 📊 | **Tableau de bord et statistiques** | KPI avec sparklines, graphiques 28/90 jours, sources de trafic, courbe de rétention, carte des meilleurs horaires, export CSV |
| 📈 | **Graphiques remplaçables** | Changez le type de graphique sur n'importe quel panneau : **ligne, aire, barres, camembert (donut), radar et 3D** |
| 🔐 | **OAuth Google** | OAuth avec PKCE — playlists personnelles, sous-titres et **rapports réels de l'API YouTube Analytics v2** (métriques quotidiennes + top vidéos + CSV) ; capture loopback automatique sur Electron |
| 🎬 | **Bibliothèque de contenu** | Recherche, filtres, éditeur de métadonnées avec score SEO en direct, chapitres, aperçu de miniature |
| 🛰️ | **Hub YouTube** | Toute l'API Data v3 au même endroit : tendances par région/catégorie, recherche globale (vidéos/chaînes/playlists), playlists, abonnements, activités, diffusions en direct et taxonomies officielles |
| 🔍 | **Studio SEO** | Optimiseur de titres avec liste de contrôle, extraction réelle de tags via API, recherche de mots-clés (autocomplétion publique), analyse de concurrents |
| 💬 | **Communauté** | Boîte de réception avec sentiment, réponses suggérées par IA, modèles, modération (approuver/masquer/spam) |
| 🤖 | **Studio IA multi-fournisseurs** | Chat avec contexte de la chaîne, scripts, idées, réponses — **Gemini, Groq, OpenRouter, Mistral, Hugging Face, OpenAI, Claude, DeepSeek, Together + locaux (Ollama, LM Studio) + fournisseurs personnalisés illimités** |
| ⚡ | **Automatisation** | Moteur de règles déclencheur→conditions→actions : répondre, générer des idées, appliquer des tags, notifier, webhooks. Modèles prêts à l'emploi et journal d'exécution |
| 🔌 | **Intégrations** | Coffre à clés local pour **16 services** publics/gratuits (API YouTube, Gemini, Groq, OpenRouter, Mistral, DeepSeek, Together, Ollama, LM Studio, Pexels, Unsplash, Pixabay, webhooks…) |
| 🧰 | **Outils** | Test A/B de miniatures en taille réelle, tendances par région, planificateur de publications, sauvegarde/export JSON |
| 🎯 | **Objectifs** | Objectifs de chaîne (abonnés, vues, heures, vidéos) avec progression sur le tableau de bord |
| 🎨 | **Thèmes et accents** | Thème Obsidian sombre/clair + **4 accents personnalisables** (Flame, Orchid, Ocean, Volt) |
| 🌍 | **Six langues** | Português · English · Español · Français · Deutsch · Italiano |
| ⌨️ | **Palette de commandes** | `Cmd/Ctrl+K` pour naviguer et exécuter des actions |
| 📲 | **PWA installable** | Installez comme app native — fonctionne hors ligne après la première visite |
| 📱 | **Multi-plateforme** | Web · Android/iOS (Capacitor) · Windows/macOS/Linux (Electron) |

## Téléchargements

Chaque version inclut des builds pour toutes les plateformes (voir [CHANGELOG.md](CHANGELOG.md) pour les nouveautés) :

| Plateforme | Fichier |
|---|---|
| 🤖 Android | `carsai-yt-studio-vX.Y.Z-android.apk` · `.aab` |
| 🪟 Windows | `carsai-yt-studio-X.Y.Z-win-x64.exe` (installateur NSIS) |
| 🍎 macOS | `carsai-yt-studio-X.Y.Z-macos-*.dmg` |
| 🐧 Linux | `carsai-yt-studio-X.Y.Z-linux-x86_64.AppImage` · `.deb` |
| 🌐 Web | `carsai-yt-studio-vX.Y.Z-web.zip` (bundle auto-hébergé) |

👉 [Dernière version](https://github.com/carsaimz/carsai-yt-studio/releases/latest)

## Démarrage rapide

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev
```

1. Ouvrez `http://localhost:3000`
2. Choisissez **Explorer en mode Démo** (données d'exemple, aucune configuration) ou connectez votre chaîne avec une clé gratuite de l'[API YouTube Data v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
3. Ajoutez optionnellement une IA gratuite dans **Paramètres → Fournisseurs IA** (Gemini / Groq / OpenRouter / Mistral — ou Ollama local)

## Sécurité et confidentialité

- 🔐 Les clés d'API restent dans `localStorage` **uniquement sur votre appareil**
- 🌐 Les appels externes vont directement de votre navigateur vers les API officielles
- 🚫 Aucune télémétrie, aucun serveur intermédiaire
- 🧹 Sauvegarde/export dans **Paramètres** ; la zone de danger réinitialise tout

## Contribuer

Les contributions sont très bienvenues ! Lisez [CONTRIBUTING.md](CONTRIBUTING.md), rejoignez les [Discussions](https://github.com/carsaimz/carsai-yt-studio/discussions) et consultez la [feuille de route publique](ROADMAP.md). Traducteurs : les dictionnaires i18n dans `src/lib/studio/i18n.tsx` sont l'endroit où ajouter une langue.

## Licence

MIT — voir [LICENSE](LICENSE).
