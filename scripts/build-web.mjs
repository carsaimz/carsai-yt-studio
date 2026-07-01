#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync, cpSync } from "node:fs";
import { join } from "node:path";

const forMobile = process.env.BUILD_TARGET === "mobile";
console.log(`\n🔨 Build ${forMobile ? "[mobile/Capacitor]" : "[web/Vercel]"}\n`);

execSync("npm run build", { stdio: "inherit", env: { ...process.env } });

const PUB = ".output/public";
if (!existsSync(PUB)) {
  console.error("❌ .output/public not found after build!");
  process.exit(1);
}

// Find assets
const assetsDir = join(PUB, "assets");
const assetFiles = existsSync(assetsDir) ? readdirSync(assetsDir) : [];
const cssFiles = assetFiles.filter(f => f.endsWith(".css"));
const entryJs  = assetFiles.find(f => /^index-[^/]+\.js$/.test(f)) ?? "";

// Generate proper HTML shell for TanStack Start
// hydrateRoot(document) needs full html/head/body — no #root div needed
function makeHtml(relative = false) {
  const b = relative ? "." : "";
  const css = cssFiles.map(f =>
    `  <link rel="stylesheet" href="${b}/assets/${f}" />`
  ).join("\n");
  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark" style="background:#1a1410;color:#f5f0eb">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
  <meta name="theme-color" content="#1a1410" />
  <title>Carsai YT Studio</title>
  <meta name="description" content="Plataforma completa para criadores YouTube com IA." />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <link rel="icon" href="${b}/favicon.ico" />
  <link rel="apple-touch-icon" href="${b}/apple-touch-icon.png" />
  <link rel="manifest" href="${b}/manifest.webmanifest" />
${css}
</head>
<body style="margin:0;background:#1a1410">
  <script>document.documentElement.className="dark";</script>
  ${entryJs ? `<script type="module" src="${b}/assets/${entryJs}"></script>` : "<!-- no entry JS found -->"}
</body>
</html>`;
}

// Write index.html to .output/public (for Vercel, uses outputDirectory: .output/public)
writeFileSync(join(PUB, "index.html"), makeHtml(false));
console.log(`✅ .output/public/index.html (js:${entryJs || "none"}, css:${cssFiles.length})`);

if (forMobile) {
  const DEST = "dist/client";
  mkdirSync(DEST, { recursive: true });
  cpSync(PUB, DEST, { recursive: true, force: true });
  // Overwrite with relative paths for Capacitor
  writeFileSync(join(DEST, "index.html"), makeHtml(true));
  console.log(`✅ dist/client/ ready (Capacitor)`);
}
