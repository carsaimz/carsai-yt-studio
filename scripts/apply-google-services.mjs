#!/usr/bin/env node
import { copyFileSync, existsSync } from "node:fs";

if (!existsSync("google-services.json")) {
  console.log("google-services.json not found at repo root, skipping");
  process.exit(0);
}

copyFileSync("google-services.json", "android/app/google-services.json");
console.log("google-services.json copied to android/app/");
