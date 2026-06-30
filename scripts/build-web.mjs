#!/usr/bin/env node
/**
 * build-web.mjs
 * Gera index.html correcto para TanStack Start (hidrata document, não #root).
 * - Web/Vercel: usa .output/public como outputDirectory
 * - Mobile/Capacitor: copia tudo para dist/client com paths relativos
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync, cpSync } from "node:fs";
import { join } from "node:path";

const forMobile = process.env.BUILD_TARGET === "mobile";

function run(cmd) {
  execSync(cmd, { stdio: "inherit", env: { ...process.env } });
}

console.log(`\n🔨 Build ${forMobile ? "[mobile/Capacitor]" : "[web/Vercel]"}\n`);
run("npm run build");

const PUB = ".output/public";
if (!existsSync(PUB)) {
  console.error("❌ .output/public não encontrado!");
  process.exit(1);
}

// Find CSS files
const assetsDir = join(PUB, "assets");
let cssFiles = [];
let entryJs  = "";

if (existsSync(assetsDir)) {
  const files = readdirSync(assetsDir);
  cssFiles = files.filter(f => f.endsWith(".css"));
  // Main entry: index-[hash].js
  entryJs = files.find(f => /^index-[^/]+\.js$/.test(f)) ?? "";
}

/**
 * Generate the HTML shell.
 * TanStack Start calls hydrateRoot(document, ...) — it hydrates the *document* itself.
 * The shell must be a full HTML document with <html class="dark"> so React can
 * adopt the existing DOM nodes. No <div id="root"> needed.
 */
function buildHtml(relative = false) {
  const base = relative ? "." : "";
  const css = cssFiles
    .map(f => `  <link rel="stylesheet" href="${base}/assets/${f}" />`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark" style="background:#1a1410">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#1a1410" />
  <title>Carsai YT Studio</title>
  <meta name="description" content="Plataforma completa para criadores YouTube com IA integrada." />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <link rel="icon" href="${base}/favicon.ico" />
  <link rel="apple-touch-icon" href="${base}/apple-touch-icon.png" />
  <link rel="manifest" href="${base}/manifest.webmanifest" />
${css}
</head>
<body style="margin:0;background:#1a1410;color:#f5f0eb">
  <script>document.documentElement.className="dark"</script>
  ${entryJs
    ? `<script type="module" src="${base}/assets/${entryJs}"></script>`
    : "<!-- entry JS not found -->"}
</body>
</html>`;
}

// Write to .output/public (Vercel reads this)
writeFileSync(join(PUB, "index.html"), buildHtml(false));
console.log(`✅ .output/public/index.html (js:${entryJs}, css:${cssFiles.length})`);

if (forMobile) {
  const DEST = "dist/client";
  mkdirSync(DEST, { recursive: true });
  // Copy all assets from .output/public
  cpSync(PUB, DEST, { recursive: true, force: true });
  // Overwrite with relative-path version for Capacitor (file:// or https://app)
  writeFileSync(join(DEST, "index.html"), buildHtml(true));
  console.log(`✅ dist/client/ ready for Capacitor`);
}
