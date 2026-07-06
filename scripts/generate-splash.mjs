#!/usr/bin/env node
import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("resources", { recursive: true });

const BG = "#1a1410";
const LOGO_SIZE = 640;
const CANVAS_SIZE = 2732;

await sharp(Buffer.from(
  `<svg width="${CANVAS_SIZE}" height="${CANVAS_SIZE}"><rect width="100%" height="100%" fill="${BG}"/></svg>`
))
  .composite([
    {
      input: await sharp("public/icon-512.png").resize(LOGO_SIZE, LOGO_SIZE).toBuffer(),
      gravity: "center",
    },
  ])
  .png()
  .toFile("resources/splash.png");

console.log("resources/splash.png generated");
