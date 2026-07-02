#!/usr/bin/env node
/**
 * patch-android-manifest.mjs
 * Removes existing <uses-permission> entries and injects the full set
 * Carsai YT Studio needs. Used by android.yml — kept as a standalone script
 * (not an inline heredoc) to avoid YAML/shell indentation fragility.
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = "android/app/src/main/AndroidManifest.xml";
let c = readFileSync(path, "utf8");

c = c.replace(/\s*<uses-permission[^/]*\/>/g, "");

const perms = `
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="29"/>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32"/>
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO"/>
    <uses-permission android:name="android.permission.CAMERA"/>
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
    <uses-permission android:name="android.permission.VIBRATE"/>
    <uses-permission android:name="android.permission.WAKE_LOCK"/>
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>`;

c = c.replace(/(<manifest[^>]*>)/, `$1${perms}`);

writeFileSync(path, c);
console.log("✅ AndroidManifest permissions patched");
