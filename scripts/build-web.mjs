#!/usr/bin/env node
/**
 * build-web.mjs — gera HTML shell correcto para TanStack Start.
 * TanStack Start usa hydrateRoot(document, ...) — precisa do documento completo.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync, cpSync, readFileSync } from "node:fs";
import { join } from "node:path";

const forMobile = process.env.BUILD_TARGET === "mobile";
const run = (cmd, env = {}) =>
  execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

console.log(`\n🔨 Build${forMobile ? " [mobile]" : " [web]"}\n`);
run("npm run build");

const SRC = ".output/public";
if (!existsSync(SRC)) {
  console.error("❌ .output/public não encontrado!");
  process.exit(1);
}

// Find CSS and JS entry files in assets/
const assetsDir = join(SRC, "assets");
let cssFiles = [];
let entryJs = "";

if (existsSync(assetsDir)) {
  const files = readdirSync(assetsDir);
  // CSS: main stylesheets (not chunk files)
  cssFiles = files
    .filter(f => f.endsWith(".css"))
    .sort((a, b) => {
      // Prioritise index.css and styles.css
      const score = f => f.startsWith("index") ? 0 : f.startsWith("styles") ? 1 : 2;
      return score(a) - score(b);
    });
  // JS: the main entry (index-*.js)
  entryJs = files.find(f => /^index-[^/]+\.js$/.test(f)) ?? "";
}

// Build the HTML shell TanStack Start expects.
// TanStack uses hydrateRoot(document,...) so it hydrates the full document tree.
// The shell must include html/head/body exactly as shellComponent renders.
const buildHtml = (relative = false) => {
  const base = relative ? "." : "";
  const cssLinks = cssFiles.map(f =>
    `  <link rel="stylesheet" href="${base}/assets/${f}" crossorigin />`
  ).join("\n");

  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
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
${cssLinks}
</head>
<body style="margin:0;padding:0;background:#1a1410;color:#e8e3dc;">
${entryJs ? `  <script type="module" src="${base}/assets/${entryJs}" crossorigin></script>` : "<!-- no entry JS found -->"}
</body>
</html>`;
};

// Write index.html to .output/public (for Vercel)
writeFileSync(join(SRC, "index.html"), buildHtml(false));
console.log(`✅ .output/public/index.html (entry: ${entryJs}, css: ${cssFiles.length})`);

// For mobile: copy everything to dist/client with relative paths
if (forMobile) {
  const DEST = "dist/client";
  mkdirSync(DEST, { recursive: true });
  cpSync(SRC, DEST, { recursive: true, force: true });
  // Overwrite with relative-path version
  writeFileSync(join(DEST, "index.html"), buildHtml(true));
  console.log(`✅ dist/client/ ready (Capacitor)`);
}
