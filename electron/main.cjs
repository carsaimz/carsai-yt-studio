/**
 * Carsai YT Studio — Electron main process.
 *
 * Modes:
 *  - APP_URL set: loads the deployed web app (recommended; always up to date).
 *  - otherwise: spawns the local Next.js standalone server (`.next/standalone`)
 *    and loads http://localhost:3000.
 */
const { app, BrowserWindow, shell, Menu, nativeTheme, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const http = require("node:http");

const APP_URL = process.env.APP_URL || "";
const PORT = Number(process.env.PORT || 3000);
const LOCAL_URL = `http://localhost:${PORT}`;

let win = null;
let serverProc = null;

/* ------------------------------------------------------------------ */
/* Google OAuth loopback capture                                       */
/*                                                                     */
/* Opens the consent URL in the system browser, listens on the         */
/* registered loopback redirect port and resolves with the auth code.  */
/* ------------------------------------------------------------------ */
let oauthServer = null;

ipcMain.handle("carsai:oauth-loopback", (event, consentUrl, port = 8765, timeoutMs = 5 * 60 * 1000) => {
  return new Promise((resolve, reject) => {
    if (typeof consentUrl !== "string" || !/^https:\/\/(accounts\.google\.com|.*\.google\.com)\//.test(consentUrl)) {
      reject(new Error("Consent URL inválido"));
      return;
    }
    if (oauthServer) oauthServer.close();

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Tempo esgotado à espera da autorização"));
    }, timeoutMs);

    const srv = http.createServer((req, res) => {
      const url = new URL(req.url || "/", `http://localhost:${port}`);
      const code = url.searchParams.get("code");
      const err = url.searchParams.get("error");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(
        `<!doctype html><html><head><meta charset="utf-8"><title>Carsai YT Studio</title>
         <style>body{font-family:system-ui;background:#0b0d12;color:#f7f6f4;display:grid;place-items:center;height:100vh;margin:0}
         .c{text-align:center;max-width:34rem;padding:2rem}h1{font-size:1.2rem}</style></head>
         <body><div class="c"><h1>${code ? "Autorização concluída ✔" : "Autorização falhou ✖"}</h1>
         <p style="opacity:.7">${code ? "Já podes voltar à aplicação." : "Volta à aplicação e tenta novamente."}</p></div></body></html>`
      );
      if (code) {
        resolve({ code });
        cleanup();
      } else {
        cleanup();
        reject(new Error(err || "Autorização cancelada"));
      }
    });

    function cleanup() {
      clearTimeout(timer);
      srv.close();
      if (oauthServer === srv) oauthServer = null;
    }

    srv.on("error", (e) => {
      cleanup();
      reject(new Error(`Loopback ${port} indisponível: ${e.message}`));
    });

    srv.listen(port, "127.0.0.1", () => {
      oauthServer = srv;
      shell.openExternal(consentUrl);
    });
  });
});


function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const probe = () => {
      http
        .get(url, (res) => {
          res.resume();
          if (res.statusCode && res.statusCode < 500) return resolve(true);
          retry();
        })
        .on("error", retry);
    };
    const retry = () => {
      if (Date.now() - started > timeoutMs) return reject(new Error("Next.js server did not start"));
      setTimeout(probe, 400);
    };
    probe();
  });
}

/**
 * Finds the standalone server entry, handling the nested layout that appears
 * when the repo lives inside a parent workspace (monorepo / parent lockfile):
 *   .next/standalone/server.js                        (normal)
 *   .next/standalone/<relative-path>/server.js        (nested)
 */
function findStandaloneServer() {
  const standaloneRoot = path.join(__dirname, "..", ".next", "standalone");
  const direct = path.join(standaloneRoot, "server.js");
  if (fs.existsSync(direct)) return direct;
  const stack = [standaloneRoot];
  while (stack.length) {
    const dir = stack.shift();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      if (["node_modules", ".next", "static"].includes(e.name)) continue;
      const candidate = path.join(dir, e.name, "server.js");
      if (fs.existsSync(candidate)) return candidate;
      stack.push(path.join(dir, e.name));
    }
  }
  return direct; // fall back to the default path (error will surface on spawn)
}

function startLocalServer() {
  const standalone = findStandaloneServer();
  serverProc = spawn(process.execPath, [standalone], {
    env: { ...process.env, PORT: String(PORT), HOSTNAME: "127.0.0.1", ELECTRON_RUN_AS_NODE: "1" },
    stdio: "inherit",
  });
  return waitForServer(LOCAL_URL);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#0b0d12" : "#f7f6f4",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.loadURL(APP_URL || LOCAL_URL);
}

Menu.setApplicationMenu(
  Menu.buildFromTemplate([
    {
      label: "Carsai YT Studio",
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "reload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    { role: "editMenu" },
    { role: "viewMenu" },
  ])
);

app.whenReady().then(async () => {
  if (!APP_URL) {
    try {
      await startLocalServer();
    } catch (err) {
      console.error("[electron] local server failed:", err);
    }
  }
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (serverProc) serverProc.kill();
  if (process.platform !== "darwin") app.quit();
});
