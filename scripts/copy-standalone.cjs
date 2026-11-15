/**
 * Copies static assets into the Next.js standalone output, wherever it is.
 *
 * When the repo sits inside a parent workspace (monorepo, or a parent
 * directory with its own lockfile), `output: "standalone"` nests the server
 * under `.next/standalone/<relative-path>/server.js` instead of
 * `.next/standalone/server.js`. This script finds the real location and
 * copies `.next/static` + `public` next to the entrypoint, so the
 * production server and the Electron shell always find them.
 */
const fs = require("node:fs");
const path = require("node:path");

function findServerJs(dir, depth = 0) {
  if (depth > 6) return null;
  const candidate = path.join(dir, "server.js");
  if (fs.existsSync(candidate)) return candidate;
  let found = null;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (["node_modules", ".next", "static"].includes(entry.name)) continue;
    found = findServerJs(path.join(dir, entry.name), depth + 1);
    if (found) break;
  }
  return found;
}

function copySync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, dest, { recursive: true, force: true });
}

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");

const serverJs = findServerJs(standalone);
if (!serverJs) {
  console.error("[copy-standalone] server.js not found under .next/standalone");
  process.exit(1);
}

const serverDir = path.dirname(serverJs);
copySync(path.join(root, ".next", "static"), path.join(serverDir, ".next", "static"));
copySync(path.join(root, "public"), path.join(serverDir, "public"));

console.log(
  `[copy-standalone] static + public copied next to ${path.relative(root, serverJs)}`
);
