import sharp from "sharp";
import { readFileSync } from "fs";

const svg = readFileSync("public/icon.svg", "utf-8");
const png = Buffer.from(`<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">${svg.replace('<svg xmlns="http://www.w3.org/2000/svg"', "").replace("</svg>", "")}</svg>`);

// simpler: render icon.svg directly at sizes
await sharp("public/icon.svg", { density: 384 }).resize(512, 512).png().toFile("public/icon-512.png");
await sharp("public/icon.svg", { density: 144 }).resize(192, 192).png().toFile("public/icon-192.png");
await sharp("public/icon.svg", { density: 384 }).resize(180, 180).png().toFile("public/apple-touch-icon.png");

// maskable: place icon on dark rounded background with padding
const maskable = Buffer.from(`<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#0b0d12"/>
  <g transform="translate(96,96) scale(0.625)">${svg.replace(/<svg[^>]*>/, "").replace("</svg>", "")}</g>
</svg>`);
await sharp(maskable).png().toFile("public/icon-maskable-512.png");
const maskable192 = Buffer.from(maskable.toString().replace('width="512" height="512"', 'width="192" height="192"').replace('rx="96"', 'rx="36"').replace("translate(96,96) scale(0.625)", "translate(36,36) scale(0.625)"));
await sharp(maskable192).png().toFile("public/icon-maskable-192.png");
console.log("icons done");
