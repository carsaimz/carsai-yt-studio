#!/usr/bin/env bash
# Prepares the native Android project for a CI release build.
#
# 1. Ensures a static web export exists (out/)
# 2. Adds the Capacitor android platform (generated, not committed)
# 3. Patches the release build type to be signed with the debug keystore so
#    the APK/AAB produced by CI are directly installable (no store signing).
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f out/index.html ]; then
  echo "ERROR: out/index.html not found — run 'bun run build:mobile' first" >&2
  exit 1
fi

# Add the android platform if it is not there yet.
if [ ! -d android ]; then
  echo "[prepare-android] adding Capacitor android platform..."
  npx cap add android
fi

echo "[prepare-android] syncing web assets..."
npx cap sync android

# Patch app/build.gradle: sign release with the debug keystore + disable minify
# (R8 keep rules for Capacitor are included, but minify is off to keep CI
# deterministic and the resulting stack traces readable).
GRADLE_FILE="android/app/build.gradle"
python3 - "$GRADLE_FILE" <<'PYEOF'
import re, sys

path = sys.argv[1]
src = open(path).read()

def patch(m):
    block = m.group(0)
    if "signingConfig" in block:
        return block
    inject = "            signingConfig signingConfigs.debug"
    if "minifyEnabled" not in block:
        inject += "\n            minifyEnabled false"
    return block.replace("release {", "release {\n" + inject, 1)

new = re.sub(r"release\s*\{[^}]*\}", patch, src, count=1)
if new == src:
    print("[prepare-android] release block already patched or not found")
else:
    open(path, "w").write(new)
    print("[prepare-android] patched release build type (debug signing, no minify)")
PYEOF

echo "[prepare-android] done"
