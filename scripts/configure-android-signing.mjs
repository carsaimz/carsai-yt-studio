#!/usr/bin/env node
/**
 * configure-android-signing.mjs
 * Appends the release signingConfig block to android/app/build.gradle.
 * Kept as a standalone script (not an inline heredoc) to avoid YAML/shell
 * indentation fragility across runners.
 */
import { appendFileSync } from "node:fs";

const block = `

android {
    signingConfigs {
        release {
            storeFile file('carsai.keystore')
            storePassword "carsaidev"
            keyAlias "carsaidev"
            keyPassword "carsaidev"
        }
    }
    buildTypes {
        release { signingConfig signingConfigs.release }
    }
}
`;

appendFileSync("android/app/build.gradle", block);
console.log("✅ build.gradle signing configured");
