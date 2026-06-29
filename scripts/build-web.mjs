#!/usr/bin/env node
/**
 * build-web.mjs
 * Build TanStack Start (preset: "static") and produce assets ready for both
 * the web (Vercel reads .output/public) and mobile/Capacitor (also reads
 * .output/public — webDir aligned in capacitor.config.json).
 *
 * NOTE (fix item 5 — Android black screen):
 *   The previous version overwrote the Nitro-prerendered index.html with an
 *   empty shell. On Capacitor, React's hydrateRoot(document, ...) then ran
 *   against an empty body, producing a black screen. We now KEEP the
 *   prerendered HTML and only patch <script>/<link> paths if a mobile build
 *   needs relative URLs. With androidScheme: "https" + hostname: "app", the
 *   absolute "/assets/..." paths Nitro emits already resolve correctly via
 *   Capacitor's local web server, so no rewrite is required.
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync, writeFileSync, cpSync, readFileSync, mkdirSync } from "node:fs";
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

// ── Safety net: ensure an index.html exists ─────────────────────────────────
// If the Nitro static preset somehow did not produce one (e.g. only nested
// route HTMLs), synthesise a minimal SPA shell that boots the bundled entry.
const indexPath = join(PUB, "index.html");
if (!existsSync(indexPath)) {
  console.warn("⚠️  index.html ausente em .output/public — gerando fallback SPA");
  const assetsDir = join(PUB, "assets");
  let cssFiles = [];
  let entryJs = "";
  if (existsSync(assetsDir)) {
    const files = readdirSync(assetsDir);
    cssFiles = files.filter((f) => f.endsWith(".css"));
    entryJs = files.find((f) => /^index-[^/]+\.js$/.test(f)) ?? "";
  }
  const css = cssFiles.map((f) => `  <link rel="stylesheet" href="/assets/${f}" />`).join("\n");
  const html = `<!DOCTYPE html>
<html lang="pt-BR" class="dark" style="background:#1a1410">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#1a1410" />
  <title>Carsai YT Studio</title>
  <link rel="icon" href="/favicon.ico" />
  <link rel="manifest" href="/manifest.webmanifest" />
${css}
</head>
<body style="margin:0;background:#1a1410;color:#f5f0eb">
  <div id="root"></div>
  <script>window.addEventListener('error',function(e){var d=document.createElement('pre');d.style.cssText='color:#f88;padding:16px;white-space:pre-wrap;font:12px/1.4 monospace';d.textContent='Boot error: '+(e.error?e.error.stack||e.error.message:e.message);document.body.appendChild(d);});</script>
  ${entryJs ? `<script type="module" src="/assets/${entryJs}"></script>` : "<!-- entry JS not found -->"}
</body>
</html>`;
  writeFileSync(indexPath, html);
}

console.log(`✅ .output/public ready (web/mobile)`);

// Keep dist/client populated as a convenience mirror so existing tooling that
// expects it (older docs, Tauri config, etc.) keeps working.
if (forMobile) {
  const DEST = "dist/client";
  mkdirSync(DEST, { recursive: true });
  cpSync(PUB, DEST, { recursive: true, force: true });
  console.log(`✅ dist/client mirror created`);
}
