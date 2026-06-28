#!/usr/bin/env node
/**
 * build-web.mjs — Build universal.
 * Output real do build: .output/public/ (assets) + .output/server/ (SSR)
 * Para Vercel: usa .output/public como outputDirectory + cria index.html que carrega app
 * Para mobile (Capacitor): copia .output/public → dist/client + cria index.html
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync, cpSync } from "node:fs";
import { join } from "node:path";

const forMobile = process.env.BUILD_TARGET === "mobile";
const run = (cmd, env = {}) =>
  execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

console.log(`\n🔨 Build${forMobile ? " [mobile]" : " [web]"}\n`);
run("npm run build");

// Real output location
const SRC_PUBLIC = ".output/public";

if (!existsSync(SRC_PUBLIC)) {
  console.error("❌ .output/public não encontrado após build!");
  process.exit(1);
}

// Find CSS and JS entry files
const assetsDir = join(SRC_PUBLIC, "assets");
let cssFiles = [];
let entryJs = "";

if (existsSync(assetsDir)) {
  const files = readdirSync(assetsDir);
  cssFiles = files.filter(f => f.endsWith(".css") && !f.includes("chunk"));
  entryJs =
    files.find(f => /^index.*\.js$/.test(f)) ??
    files.find(f => /^client.*\.js$/.test(f)) ??
    files.find(f => f.endsWith(".js")) ?? "";
}

// Generate index.html
const cssLinks = cssFiles
  .map(f => `  <link rel="stylesheet" href="/assets/${f}" />`)
  .join("\n");

const indexHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#1a1410" />
  <title>Carsai YT Studio</title>
  <meta name="description" content="Plataforma completa para criadores YouTube com IA." />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
${cssLinks}
</head>
<body style="margin:0;background:#1a1410;">
  <div id="root"></div>
  ${entryJs ? `<script type="module" src="/assets/${entryJs}"></script>` : ""}
</body>
</html>`;

// Always create index.html in .output/public (for Vercel)
writeFileSync(join(SRC_PUBLIC, "index.html"), indexHtml);
console.log(`✅ .output/public/index.html criado (css:${cssFiles.length}, js:${entryJs || "none"})`);

// For mobile: copy .output/public → dist/client with relative paths
if (forMobile) {
  const DEST = "dist/client";
  mkdirSync(DEST, { recursive: true });

  // Copy all assets
  cpSync(SRC_PUBLIC, DEST, { recursive: true, force: true });

  // Overwrite index.html with relative paths for Capacitor
  const mobileHtml = indexHtml
    .replace(/href="\/assets\//g, 'href="./assets/')
    .replace(/src="\/assets\//g, 'src="./assets/')
    .replace(/href="\/favicon/g, 'href="./favicon')
    .replace(/href="\/apple/g, 'href="./apple')
    .replace(/href="\/manifest/g, 'href="./manifest');

  writeFileSync(join(DEST, "index.html"), mobileHtml);
  console.log(`✅ dist/client/ pronto para Capacitor`);
}
