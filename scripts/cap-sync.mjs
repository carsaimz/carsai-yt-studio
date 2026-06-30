#!/usr/bin/env node
// Build web + sync into Capacitor native projects (android/ios when present).
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

run("npm run build");
if (!existsSync("node_modules/@capacitor/cli")) {
  run("npm install @capacitor/core @capacitor/cli");
}
if (existsSync("android")) run("npx cap sync android");
if (existsSync("ios")) run("npx cap sync ios");
console.log("\n✓ Capacitor sync complete.");
