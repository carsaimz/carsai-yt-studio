#!/usr/bin/env node
/**
 * build-web.mjs
 * Build web universal — Vercel (SSR), Netlify, mobile (Capacitor), desktop (Tauri).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const preset    = process.env.NITRO_PRESET  ?? "node-server";
const forMobile = process.env.BUILD_TARGET  === "mobile";

const run = (cmd, env = {}) =>
  execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

console.log(`\n🔨 Build — preset: ${preset}${forMobile ? " [mobile]" : ""}\n`);
run("npm run build", { NITRO_PRESET: preset });

// ── Mobile: gerar dist/client/index.html ────────────────────────────────────
if (forMobile) {
  const clientDir  = "dist/client";
  const assetsDir  = join(clientDir, "assets");
  mkdirSync(clientDir, { recursive: true });

  if (!existsSync(join(clientDir, "index.html"))) {
    let cssFile = "";
    let jsFile  = "";

    if (existsSync(assetsDir)) {
      const files = readdirSync(assetsDir);

      // Preferir index-*.css e index-*.js (entry points do Vite)
      cssFile = files.find(f => /^index.*\.css$/.test(f)) ?? "";
      jsFile  = files.find(f => /^index.*\.js$/.test(f))  ?? "";

      // Fallback: client-*.js (TanStack Start client entry)
      if (!jsFile) jsFile = files.find(f => /^client.*\.js$/.test(f)) ?? "";

      // Último recurso: qualquer .js
      if (!jsFile) jsFile = files.find(f => f.endsWith(".js")) ?? "";
    }

    console.log(`\n⚙  Gerando index.html  css=${cssFile || "nenhum"}  js=${jsFile || "nenhum"}`);

    // IMPORTANTE: usar caminhos RELATIVOS (./assets/...) para Capacitor
    // Caminhos absolutos (/assets/...) não funcionam com capacitor://localhost
    writeFileSync(join(clientDir, "index.html"), `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#1a1410" />
    <title>Carsai YT Studio</title>
    <meta name="description" content="Gerencie e automatize o seu canal YouTube com IA." />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    ${cssFile ? `<link rel="stylesheet" href="./assets/${cssFile}" />` : ""}
  </head>
  <body style="margin:0;background:#1a1410;">
    <div id="root"></div>
    ${jsFile ? `<script type="module" src="./assets/${jsFile}"></script>` : ""}
  </body>
</html>
`);
    console.log("✅ dist/client/index.html criado.\n");
  } else {
    console.log("✅ dist/client/index.html já existe.\n");
  }
}
