#!/usr/bin/env node
/**
 * Sync version across:
 *  - package.json            (source of truth)
 *  - capacitor.config.json   (appVersion + appVersionCode auto-incremented)
 *  - android-template (Gradle versionName / versionCode) if present
 *
 * Usage:
 *   node scripts/sync-version.mjs            # sync existing package.json version
 *   node scripts/sync-version.mjs --check    # fail with non-zero if out of sync
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");

const pkgPath = join(ROOT, "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const version = pkg.version;
if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
  console.error(`✗ package.json has no valid "version" field (found: ${version})`);
  process.exit(1);
}

let changed = false;
const log = (msg) => console.log(`[sync-version] ${msg}`);

// ── Capacitor ────────────────────────────────────────────────────────────────
const capPath = join(ROOT, "capacitor.config.json");
if (existsSync(capPath)) {
  const cap = JSON.parse(readFileSync(capPath, "utf8"));
  const prevVer = cap.appVersion;
  const prevCode = Number(cap.appVersionCode) || 0;
  if (prevVer !== version) {
    if (check) {
      console.error(`✗ capacitor.config.json appVersion (${prevVer}) != package.json (${version})`);
      process.exit(2);
    }
    cap.appVersion = version;
    cap.appVersionCode = prevCode + 1;
    writeFileSync(capPath, JSON.stringify(cap, null, 2) + "\n");
    log(`capacitor.config.json: ${prevVer} → ${version} (code ${prevCode} → ${cap.appVersionCode})`);
    changed = true;
  }
}

// ── Android Gradle (optional) ────────────────────────────────────────────────
const gradlePath = join(ROOT, "android-template", "app", "build.gradle");
if (existsSync(gradlePath)) {
  const src = readFileSync(gradlePath, "utf8");
  let out = src.replace(/versionName\s+"[^"]+"/g, `versionName "${version}"`);
  if (out !== src) {
    if (check) {
      console.error("✗ android-template/app/build.gradle versionName out of sync");
      process.exit(2);
    }
    writeFileSync(gradlePath, out);
    log("android-template/app/build.gradle: versionName updated");
    changed = true;
  }
}

if (!changed) log(`already in sync at v${version}`);
