#!/usr/bin/env node
// Usage: node scripts/version-bump.mjs <patch|minor|major|x.y.z>
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const arg = process.argv[2] ?? "patch";
const pkgPath = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const [maj, min, pat] = (pkg.version ?? "0.0.0").split(".").map(Number);

const next = /^\d+\.\d+\.\d+$/.test(arg)
  ? arg
  : arg === "major" ? `${maj + 1}.0.0`
  : arg === "minor" ? `${maj}.${min + 1}.0`
  : `${maj}.${min}.${pat + 1}`;

pkg.version = next;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

// Propagate to capacitor / android etc.
try {
  execSync("node scripts/sync-version.mjs", { stdio: "inherit" });
} catch (e) {
  console.error("sync-version failed:", e?.message);
}

try { execSync(`git add package.json capacitor.config.json android-template/app/build.gradle 2>/dev/null; git commit -m "chore: release v${next}"`, { stdio: "inherit", shell: "/bin/bash" }); } catch {}
try { execSync(`git tag v${next}`, { stdio: "inherit" }); } catch {}

console.log(`\n✓ Bumped to v${next}. Push with:  git push && git push --tags`);
