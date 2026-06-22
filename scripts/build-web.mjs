#!/usr/bin/env node
/**
 * build-web.mjs
 * Build web universal — funciona para Vercel, Netlify, mobile e desktop.
 *
 * Uso:
 *   node scripts/build-web.mjs            # preset=static, target=dist/client
 *   NITRO_PRESET=vercel node scripts/build-web.mjs
 *
 * Sempre garante que dist/client/index.html existe no final,
 * copiando do local que o Nitro efectivamente usou.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, cpSync, readdirSync } from "node:fs";
import { join } from "node:path";

const preset = process.env.NITRO_PRESET ?? "static";
const run = (cmd, env = {}) =>
  execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

console.log(`\n🔨 Build — preset: ${preset}\n`);
run("npm run build", { NITRO_PRESET: preset });

// Locais onde o Nitro/TanStack pode colocar os assets estáticos
const candidates = [
  "dist/client",
  ".output/public",
  "dist/public",
  ".vercel/output/static",
  "dist",
  "build",
  "out",
];

const target = "dist/client";

if (!existsSync(join(target, "index.html"))) {
  const found = candidates.find(
    (c) => c !== target && existsSync(join(c, "index.html"))
  );

  if (found) {
    console.log(`\n📂 Output encontrado em "${found}" — a normalizar para "${target}"...`);
    mkdirSync(target, { recursive: true });
    cpSync(found, target, { recursive: true });
  } else {
    // Debug: listar o que foi gerado
    console.error("\n❌ index.html não encontrado. Estrutura gerada:\n");
    const show = (dir, depth = 0) => {
      if (depth > 3 || !existsSync(dir)) return;
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (["node_modules", ".git"].includes(entry.name)) continue;
        console.error("  ".repeat(depth) + (entry.isDirectory() ? "📁 " : "📄 ") + entry.name);
        if (entry.isDirectory()) show(join(dir, entry.name), depth + 1);
      }
    };
    show(".");
    process.exit(1);
  }
}

console.log(`\n✅ dist/client/index.html OK\n`);
