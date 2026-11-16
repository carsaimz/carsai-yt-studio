<div align="center">
  <img src="public/icon.svg" alt="Carsai YT Studio" width="110" height="110" />

  <h1>Carsai YT Studio</h1>

  <p>
    <strong>Plataforma local-first para creadores de YouTube — analíticas, SEO, comunidad, automatización e IA</strong>
  </p>

  <p><strong>Leer en:</strong>
    <a href="README.md">English</a> ·
    <a href="README.pt.md">Português</a> ·
    <a href="README.es.md">Español</a> ·
    <a href="README.fr.md">Français</a> ·
    <a href="README.de.md">Deutsch</a> ·
    <a href="README.it.md">Italiano</a> ·
    <a href="README.zh.md">中文</a>
  </p>

  <p>🌐 <strong><a href="https://carsaiytstudio.vercel.app">Sitio oficial — carsaiytstudio.vercel.app</a></strong></p>
</div>

---

## ¿Qué es?

**Carsai YT Studio v3** es una alternativa a YouTube Studio con superpoderes: analiza tu canal, optimiza el SEO, modera la comunidad, automatiza el trabajo repetitivo, explora **toda la YouTube Data API v3** y usa agentes de IA — todo en una app que funciona en **navegador (PWA), Android/iOS (Capacitor) y escritorio (Electron)**.

La v3 es **local-first**: tus datos y claves de API viven solo en tu dispositivo. Sin Firebase, sin backend obligatorio, sin servidores intermediarios. Open-source bajo licencia **MIT**.

> **Nota sobre la web**: la versión web funciona solo como **prueba y demostración** (datos de ejemplo, sin conexiones reales). La experiencia completa — datos reales, OAuth y automatización — corre en las apps **Electron (escritorio)** y **Capacitor (móvil)**, descargables en [Releases](https://github.com/carsaimz/carsai-yt-studio/releases/latest).

## Funciones

| | Función | Descripción |
|--|---|---|
| 📊 | **Panel y Analíticas** | KPIs con sparklines, gráficos de 28/90 días, fuentes de tráfico, curva de retención, mapa de mejores horarios, exportación CSV |
| 📈 | **Gráficos conmutables** | Cambia el tipo de gráfico en cualquier panel: **línea, área, barras, circular (donut), radar y 3D** |
| 🔐 | **OAuth Google** | OAuth con PKCE — playlists propias, subtítulos y **informes reales de la YouTube Analytics API v2** (métricas diarias + top vídeos + CSV); captura automática loopback en Electron |
| 🎬 | **Biblioteca de contenido** | Búsqueda, filtros, editor de metadatos con puntuación SEO en vivo, capítulos, vista previa de miniatura |
| 🛰️ | **YouTube Hub** | Toda la Data API v3 en un solo lugar: tendencias por región/categoría, búsqueda global (vídeos/canales/playlists), playlists, suscripciones, actividades, transmisiones en vivo y taxonomías oficiales |
| 🔍 | **Estudio SEO** | Optimizador de títulos con checklist, extracción real de tags vía API, investigación de palabras clave (autocompletado público), análisis de competidores |
| 💬 | **Comunidad** | Bandeja de entrada con sentimiento, respuestas sugeridas por IA, plantillas, moderación (aprobar/ocultar/spam) |
| 🤖 | **Estudio IA multi-proveedor** | Chat con contexto del canal, guiones, ideas, respuestas — **Gemini, Groq, OpenRouter, Mistral, Hugging Face, OpenAI, Claude, DeepSeek, Together + locales (Ollama, LM Studio) + proveedores personalizados ilimitados** |
| ⚡ | **Automatización** | Motor de reglas disparador→condiciones→acciones: responder, generar ideas, aplicar tags, notificar, webhooks. Plantillas listas y registro de ejecuciones |
| 🔌 | **Integraciones** | Bóveda de claves local para **16 servicios** públicos/gratuitos (YouTube API, Gemini, Groq, OpenRouter, Mistral, DeepSeek, Together, Ollama, LM Studio, Pexels, Unsplash, Pixabay, webhooks…) |
| 🧰 | **Herramientas** | Test A/B de miniaturas a tamaño real, tendencias por región, planificador de subidas, backup/exportación JSON |
| 🎯 | **Objetivos** | Metas del canal (subs, vistas, horas, vídeos) con progreso en el panel |
| 🎨 | **Temas y acentos** | Tema Obsidian dark/light + **4 acentos personalizables** (Flame, Orchid, Ocean, Volt) |
| 🌍 | **Seis idiomas** | Português · English · Español · Français · Deutsch · Italiano |
| ⌨️ | **Paleta de comandos** | `Cmd/Ctrl+K` para navegar y ejecutar acciones |
| 📲 | **PWA instalable** | Instálala como app nativa — funciona offline tras la primera visita |
| 📱 | **Multiplataforma** | Web · Android/iOS (Capacitor) · Windows/macOS/Linux (Electron) |

## Descargas

Cada release incluye builds para todas las plataformas (ver [CHANGELOG.md](CHANGELOG.md) para novedades):

| Plataforma | Archivo |
|---|---|
| 🤖 Android | `carsai-yt-studio-vX.Y.Z-android.apk` · `.aab` |
| 🪟 Windows | `carsai-yt-studio-X.Y.Z-win-x64.exe` (instalador NSIS) |
| 🍎 macOS | `carsai-yt-studio-X.Y.Z-macos-*.dmg` |
| 🐧 Linux | `carsai-yt-studio-X.Y.Z-linux-x86_64.AppImage` · `.deb` |
| 🌐 Web | `carsai-yt-studio-vX.Y.Z-web.zip` (bundle self-host) |

👉 [Último release](https://github.com/carsaimz/carsai-yt-studio/releases/latest)

## Inicio rápido

```bash
git clone https://github.com/carsaimz/carsai-yt-studio.git
cd carsai-yt-studio
npm install
npm run dev
```

1. Abre `http://localhost:3000`
2. Elige **Explorar en modo Demo** (datos de ejemplo, cero configuración) o conecta tu canal con una clave gratuita de la [YouTube Data API v3](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
3. Opcionalmente añade IA gratuita en **Ajustes → Proveedores de IA** (Gemini / Groq / OpenRouter / Mistral — u Ollama local)

## Seguridad y privacidad

- 🔐 Las claves de API viven en `localStorage` **solo en tu dispositivo**
- 🌐 Las llamadas externas van directo de tu navegador a las APIs oficiales
- 🚫 Sin analíticas, telemetría ni servidores intermediarios
- 🧹 Backup/exportación en **Ajustes**; la zona de riesgo lo restablece todo

## Contribuir

¡Las contribuciones son muy bienvenidas! Lee [CONTRIBUTING.md](CONTRIBUTING.md), únete a las [Discusiones](https://github.com/carsaimz/carsai-yt-studio/discussions) y consulta el [roadmap público](ROADMAP.md). Traductores: los diccionarios i18n en `src/lib/studio/i18n.tsx` son el lugar para añadir un idioma.

## Licencia

MIT — ver [LICENSE](LICENSE).
