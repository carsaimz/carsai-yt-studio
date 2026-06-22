#!/usr/bin/env node
/**
 * build-web.mjs
 * Build web universal — Vercel (SSR), Netlify, mobile (Capacitor), desktop.
 *
 * Para mobile/desktop é criado um index.html em dist/client/ que carrega
 * os assets gerados pelo build SSR — o TanStack Router faz o routing no cliente.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const preset   = process.env.NITRO_PRESET   ?? "node-server";
const forMobile = process.env.BUILD_TARGET  === "mobile";

const run = (cmd, env = {}) =>
  execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

console.log(`\n🔨 Build — preset: ${preset}${forMobile ? " (mobile)" : ""}\n`);
run("npm run build", { NITRO_PRESET: preset });

// ── Para mobile: garantir dist/client/index.html ────────────────────────────
if (forMobile) {
  const clientDir = "dist/client";
  mkdirSync(clientDir, { recursive: true });

  if (!existsSync(join(clientDir, "index.html"))) {
    // Descobrir o ficheiro CSS e JS principal gerados pelo Vite
    const assetsDir = join(clientDir, "assets");
    let cssFile = "";
    let jsFile  = "";

    if (existsSync(assetsDir)) {
      for (const f of readdirSync(assetsDir)) {
        if (!cssFile && f.match(/^index.*\.css$/)) cssFile = `assets/${f}`;
        if (!jsFile  && f.match(/^index.*\.js$/))  jsFile  = `assets/${f}`;
      }
      // fallback: primeiro .js encontrado
      if (!jsFile) {
        const js = readdirSync(assetsDir).find(f => f.endsWith(".js"));
        if (js) jsFile = `assets/${js}`;
      }
    }

    console.log(`\n⚙  A gerar dist/client/index.html (css=${cssFile}, js=${jsFile})...`);

    writeFileSync(join(clientDir, "index.html"), `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#1a1410" />
    <title>Carsai YT Studio</title>
    <meta name="description" content="Gerencie e automatize o seu canal YouTube com IA." />
    ${cssFile ? `<link rel="stylesheet" href="/${cssFile}" />` : ""}
  </head>
  <body>
    <div id="root"></div>
    ${jsFile ? `<script type="module" src="/${jsFile}"></script>` : ""}
  </body>
</html>
`);
    console.log("✅ dist/client/index.html criado.\n");
  } else {
    console.log("✅ dist/client/index.html já existe.\n");
  }
}
