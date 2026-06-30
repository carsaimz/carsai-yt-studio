#!/usr/bin/env node
/**
 * build-mobile.mjs
 * Build web para mobile (Capacitor).
 * Garante que dist/client/index.html existe independentemente
 * de onde o Nitro colocou o output.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, cpSync } from "node:fs";
import { join } from "node:path";

const run = (cmd, env = {}) =>
  execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

// 1. Build
run("npm run build", { NITRO_PRESET: "static" });

// 2. Normalizar output para dist/client/
const candidates = [
  "dist/client",
  ".output/public",
  "dist/public",
  ".vercel/output/static",
  "dist",
];

const target = "dist/client";

if (!existsSync(join(target, "index.html"))) {
  const found = candidates.find(
    (c) => c !== target && existsSync(join(c, "index.html"))
  );
  if (found) {
    console.log(`⚙  Copiando ${found} → ${target}`);
    mkdirSync(target, { recursive: true });
    cpSync(found, target, { recursive: true });
  } else {
    console.error("❌ index.html não encontrado após build.");
    process.exit(1);
  }
}

console.log("✅ dist/client/index.html pronto para Capacitor.");
