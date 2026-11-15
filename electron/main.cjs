/**
 * Carsai YT Studio — Electron main process.
 *
 * Modes:
 *  - APP_URL set: loads the deployed web app (recommended; always up to date).
 *  - otherwise: spawns the local Next.js standalone server (`.next/standalone`)
 *    and loads http://localhost:3000.
 */
const { app, BrowserWindow, shell, Menu, nativeTheme } = require("electron");
const path = require("node:path");
const { spawn } = require("node:child_process");
const http = require("node:http");

const APP_URL = process.env.APP_URL || "";
const PORT = Number(process.env.PORT || 3000);
const LOCAL_URL = `http://localhost:${PORT}`;

let win = null;
let serverProc = null;

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

function startLocalServer() {
  const standalone = path.join(__dirname, "..", ".next", "standalone", "server.js");
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
