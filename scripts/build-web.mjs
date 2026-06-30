#!/usr/bin/env node
/**
 * build-web.mjs
 * Gera index.html correcto para TanStack Start (hidrata document, não #root).
 * - Web/Vercel: usa .output/public como outputDirectory
 * - Mobile/Capacitor: copia tudo para dist/client com paths relativos
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, cpSync } from "node:fs";
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

console.log("✅ .output/public ready (TanStack Start index.html preserved)");

if (forMobile) {
  const DEST = "dist/client";
  mkdirSync(DEST, { recursive: true });
  // Copy all assets from .output/public
  cpSync(PUB, DEST, { recursive: true, force: true });
  // Keep TanStack Start's HTML shell intact; only make root-absolute static paths relative.
  const indexPath = join(DEST, "index.html");
  const html = readFileSync(indexPath, "utf8")
    .replaceAll('href="/assets/', 'href="./assets/')
    .replaceAll('src="/assets/', 'src="./assets/')
    .replaceAll('href="/manifest.webmanifest"', 'href="./manifest.webmanifest"')
    .replaceAll('href="/favicon.ico"', 'href="./favicon.ico"')
    .replaceAll('href="/apple-touch-icon.png"', 'href="./apple-touch-icon.png"');
  writeFileSync(indexPath, html);
  console.log(`✅ dist/client/ ready for Capacitor`);
}
