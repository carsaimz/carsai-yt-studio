#!/usr/bin/env node
/**
 * build-web.mjs
 * Corre o build e garante que dist/client/ tem conteúdo para deploy/Capacitor.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, cpSync, readdirSync } from "node:fs";
import { join } from "node:path";

const preset = process.env.NITRO_PRESET ?? "node-server";
const run = (cmd, env = {}) =>
  execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

console.log(`\n🔨 Build — preset: ${preset}\n`);
run("npm run build", { NITRO_PRESET: preset });

// Verifica se dist/client/ tem ficheiros (index.html OU assets/)
const target = "dist/client";
const hasContent = existsSync(target) &&
  readdirSync(target).length > 0;

if (hasContent) {
  // Se não tiver index.html mas tiver assets, criar um index.html mínimo
  // para satisfazer o Capacitor (o TanStack Start SSR não gera index.html estático)
  if (!existsSync(join(target, "index.html"))) {
    console.log("⚙  A criar index.html de entrada para Capacitor...");
    import("node:fs").then(({ writeFileSync }) => {
      writeFileSync(
        join(target, "index.html"),
        `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Carsai YT Studio</title>
    <script>
      // Redireciona para o asset JS principal gerado pelo build
      // O TanStack Router trata do routing no cliente
    </script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
      );
    });
  }
  console.log(`\n✅ dist/client/ OK (${readdirSync(target).length} entradas)\n`);
  process.exit(0);
}

// dist/client vazio ou inexistente — tentar locais alternativos do Nitro
const candidates = [
  ".output/public",
  "dist/public",
  ".vercel/output/static",
  "dist",
  "build",
  "out",
];

const found = candidates.find((c) => {
  if (!existsSync(c)) return false;
  try { return readdirSync(c).length > 0; } catch { return false; }
});

if (found) {
  console.log(`\n📂 Output em "${found}" — a copiar para "${target}"...`);
  mkdirSync(target, { recursive: true });
  cpSync(found, target, { recursive: true });
  console.log(`\n✅ dist/client/ OK\n`);
} else {
  console.error("\n❌ Nenhum output encontrado após build. Pastas existentes:\n");
  for (const entry of readdirSync(".", { withFileTypes: true })) {
    if (["node_modules", ".git", "src"].includes(entry.name)) continue;
    console.error((entry.isDirectory() ? "📁 " : "📄 ") + entry.name);
  }
  process.exit(1);
}
