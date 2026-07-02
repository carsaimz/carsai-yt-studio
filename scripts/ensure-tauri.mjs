#!/usr/bin/env node
/**
 * ensure-tauri.mjs
 * Scaffolds src-tauri/ if it doesn't exist yet. Used by desktop.yml so we
 * never rely on fragile inline shell heredocs inside YAML (which break under
 * re-indentation across platforms/shells, especially Windows Git Bash).
 */
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";

if (existsSync("src-tauri")) {
  console.log("✅ src-tauri already exists — skipping scaffold");
  process.exit(0);
}

mkdirSync("src-tauri/icons", { recursive: true });
mkdirSync("src-tauri/src", { recursive: true });

const iconMap = [
  ["public/tauri-icons/32x32.png",     "src-tauri/icons/32x32.png"],
  ["public/tauri-icons/128x128.png",   "src-tauri/icons/128x128.png"],
  ["public/tauri-icons/128x128@2x.png","src-tauri/icons/128x128@2x.png"],
  ["public/tauri-icons/icon.ico",      "src-tauri/icons/icon.ico"],
  ["public/tauri-icons/icon.png",      "src-tauri/icons/icon.png"],
  ["public/tauri-icons/icon.icns",     "src-tauri/icons/icon.icns"],
];
for (const [src, dest] of iconMap) {
  try { copyFileSync(src, dest); } catch { /* optional, ignore if missing */ }
}

writeFileSync("src-tauri/Cargo.toml", `[package]
name = "carsai-yt-studio"
version = "0.1.0"
edition = "2021"
rust-version = "1.77.2"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
`);

writeFileSync("src-tauri/build.rs", `fn main() {
    tauri_build::build()
}
`);

writeFileSync("src-tauri/src/main.rs", `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    carsai_yt_studio::run()
}
`);

writeFileSync("src-tauri/src/lib.rs", `#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
`);

const tauriConf = {
  "$schema": "https://schema.tauri.app/config/2",
  productName: "Carsai YT Studio",
  version: "0.1.0",
  identifier: "com.carsai.ytstudio",
  build: {
    frontendDist: "../dist/client",
    devUrl: "http://localhost:3000",
  },
  app: {
    windows: [
      { title: "Carsai YT Studio", width: 1280, height: 800, minWidth: 960, minHeight: 600 },
    ],
    security: { csp: null },
  },
  bundle: {
    active: true,
    targets: "all",
    icon: [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.ico",
      "icons/icon.png",
    ],
    windows: {
      certificateThumbprint: null,
      digestAlgorithm: "sha256",
      timestampUrl: "",
    },
  },
};
writeFileSync("src-tauri/tauri.conf.json", JSON.stringify(tauriConf, null, 2) + "\n");

console.log("✅ src-tauri/ scaffolded");
