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

const assetsDir = join(PUB, "assets");
const assetFiles = existsSync(assetsDir) ? readdirSync(assetsDir) : [];
const cssFiles = assetFiles.filter(f => f.endsWith(".css"));
const entryJs  = assetFiles.find(f => /^index-[^/]+\.js$/.test(f)) ?? "";

/**
 * Inline polyfills for JS features used by the bundle that may be missing
 * on older Android System WebView versions (minSdk 24 = Android 7+, but
 * WebView itself can lag behind on unmaintained devices). Runs BEFORE the
 * module script so nothing throws at first use.
 */
const POLYFILLS = `
<script>
  if (typeof Object.hasOwn !== "function") {
    Object.hasOwn = function (obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    };
  }
  if (typeof String.prototype.replaceAll !== "function") {
    String.prototype.replaceAll = function (search, replace) {
      return this.split(search).join(replace);
    };
  }
  if (typeof globalThis.structuredClone !== "function") {
    globalThis.structuredClone = function (obj) {
      return JSON.parse(JSON.stringify(obj));
    };
  }
</script>`.trim();

/**
 * Visible fallback: if the module script fails to execute for ANY reason
 * (syntax error, unsupported API, network failure loading a chunk), show a
 * legible error screen INSTEAD of a silent blank screen. This makes it
 * possible to diagnose issues directly on a device with no computer/USB
 * debugging available. Also catches global runtime errors after mount.
 */
const CRASH_GUARD = `
<script>
  window.__carsaiBootError = null;
  window.addEventListener("error", function (e) {
    window.__carsaiShowError(e.error || e.message || "Erro desconhecido");
  });
  window.addEventListener("unhandledrejection", function (e) {
    window.__carsaiShowError(e.reason);
  });
  window.__carsaiShowError = function (err) {
    if (document.getElementById("carsai-crash-screen")) return;
    var msg = err && err.stack ? err.stack : String(err);
    var el = document.createElement("div");
    el.id = "carsai-crash-screen";
    el.style.cssText = "position:fixed;inset:0;z-index:99999;background:#1a1410;color:#f5f0eb;padding:24px;font-family:monospace;font-size:13px;overflow:auto;white-space:pre-wrap;line-height:1.5";
    el.innerHTML = "<div style=\\"font-family:sans-serif;font-size:18px;font-weight:700;margin-bottom:12px;color:#ff6b35\\">⚠️ Erro ao carregar a aplicação</div>" +
      "<div style=\\"font-family:sans-serif;font-size:13px;color:#aaa;margin-bottom:16px\\">Tire uma foto desta tela e envie ao suporte.</div>" +
      "<div>" + msg.replace(/</g, "&lt;") + "</div>";
    document.body.innerHTML = "";
    document.body.appendChild(el);
  };
  // If the module script hasn't mounted React within 8s, something silently failed
  // (e.g. unsupported syntax the engine can't even parse, so no error event fires).
  setTimeout(function () {
    if (!window.__carsaiMounted) {
      window.__carsaiShowError("A aplicação não iniciou em 8 segundos. O motor JavaScript pode não suportar algum recurso usado, ou um recurso (CSS/JS) falhou ao carregar. Verifique a ligação à internet e tente novamente.");
    }
  }, 8000);
</script>`.trim();

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
  ${POLYFILLS}
  ${CRASH_GUARD}
</head>
<body style="margin:0;background:#1a1410">
  <script>document.documentElement.className="dark";</script>
  ${entryJs ? `<script type="module" src="${b}/assets/${entryJs}"></script>` : "<!-- no entry JS found -->"}
</body>
</html>`;
}

writeFileSync(join(PUB, "index.html"), makeHtml(false));
console.log(`✅ .output/public/index.html (js:${entryJs || "none"}, css:${cssFiles.length})`);

if (forMobile) {
  const DEST = "dist/client";
  mkdirSync(DEST, { recursive: true });
  cpSync(PUB, DEST, { recursive: true, force: true });
  writeFileSync(join(DEST, "index.html"), makeHtml(true));
  console.log(`✅ dist/client/ ready (Capacitor)`);
}
