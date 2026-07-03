#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";

const forMobile = process.env.BUILD_TARGET === "mobile";

if (forMobile) {
  execSync("npx vite build --config vite.mobile.config.ts", {
    stdio: "inherit",
    env: { ...process.env },
  });
  const from = "dist/client/index.mobile.html";
  const to = "dist/client/index.html";
  if (existsSync(from)) renameSync(from, to);
  if (!existsSync(to)) {
    console.error("dist/client/index.html not found after mobile build");
    process.exit(1);
  }
} else {
  execSync("npm run build", { stdio: "inherit", env: { ...process.env } });
}
