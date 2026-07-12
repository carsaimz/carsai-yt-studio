#!/usr/bin/env node
/**
 * sync-tauri-version.mjs
 * Updates the version field in src-tauri/tauri.conf.json and
 * src-tauri/Cargo.toml to match the version passed as argv[2] (or
 * package.json's version if omitted). Runs AFTER ensure-tauri.mjs, so it
 * works whether src-tauri/ was just scaffolded or already existed in the
 * repo (ensure-tauri.mjs skips re-scaffolding, so its hardcoded "0.1.0"
 * would otherwise never update on subsequent builds).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const version = process.argv[2] || JSON.parse(readFileSync("package.json", "utf8")).version;

const confPath = "src-tauri/tauri.conf.json";
if (existsSync(confPath)) {
  const conf = JSON.parse(readFileSync(confPath, "utf8"));
  conf.version = version;
  writeFileSync(confPath, JSON.stringify(conf, null, 2) + "\n");
}

const cargoPath = "src-tauri/Cargo.toml";
if (existsSync(cargoPath)) {
  let cargo = readFileSync(cargoPath, "utf8");
  cargo = cargo.replace(/^version = "[^"]*"/m, `version = "${version}"`);
  writeFileSync(cargoPath, cargo);
}

console.log(`✅ src-tauri version synced to ${version}`);
