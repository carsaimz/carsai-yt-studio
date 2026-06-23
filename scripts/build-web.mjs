#!/usr/bin/env node
/**
 * build-web.mjs — Build universal para web, mobile e desktop.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const preset    = process.env.NITRO_PRESET ?? "node-server";
const forMobile = process.env.BUILD_TARGET === "mobile";

const run = (cmd, env = {}) =>
  execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

console.log(`\n🔨 Build — preset: ${preset}${forMobile ? " [mobile]" : ""}\n`);
run("npm run build", { NITRO_PRESET: preset });

if (forMobile) {
  const clientDir = "dist/client";
  const assetsDir = join(clientDir, "assets");
  mkdirSync(clientDir, { recursive: true });

  if (!existsSync(join(clientDir, "index.html"))) {
    let cssFiles = [];
    let entryJs  = "";

    if (existsSync(assetsDir)) {
      const files = readdirSync(assetsDir);
      cssFiles = files.filter(f => f.endsWith(".css"));

      // Entry JS: prefer index-*.js, then client-*.js, fallback first .js
      entryJs =
        files.find(f => /^index.*\.js$/.test(f)) ??
        files.find(f => /^client.*\.js$/.test(f)) ??
        files.find(f => f.endsWith(".js")) ?? "";
    }

    console.log(`\n⚙  Gerando index.html`);
    console.log(`   CSS: ${cssFiles.join(", ") || "nenhum"}`);
    console.log(`   JS entry: ${entryJs || "nenhum"}`);

    const cssLinks = cssFiles
      .map(f => `    <link rel="stylesheet" href="./assets/${f}" />`)
      .join("\n");

    // IMPORTANTE: caminhos RELATIVOS (./assets/...) para Capacitor
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
${cssLinks}
  </head>
  <body style="margin:0;padding:0;background:#1a1410;color:#f5f0eb;">
    <div id="root"></div>
    ${entryJs ? `<script type="module" src="./assets/${entryJs}"></script>` : "<!-- JS entry não encontrado -->"}
  </body>
</html>
`);
    console.log("✅ dist/client/index.html criado.\n");
  } else {
    console.log("✅ dist/client/index.html já existe.\n");
  }
}
