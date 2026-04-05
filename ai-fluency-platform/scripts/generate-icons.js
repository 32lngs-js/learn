#!/usr/bin/env node
/**
 * Generate PWA icons from SVG using sharp (with librsvg).
 * Run: node scripts/generate-icons.js
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');

// SVG template — dark background, light P mark
function makeSvg({ size, bg, pFill, counterFill, padding = 0 }) {
  // padding shrinks the inner graphic for maskable safe-zone
  const vbPad = padding; // extra padding in viewBox units
  const totalVB = 110 + vbPad * 2;
  const offset = vbPad;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-5 - offset} ${-5 - offset} ${totalVB} ${totalVB}">
  <rect x="${-5 - offset}" y="${-5 - offset}" width="${totalVB}" height="${totalVB}" fill="${bg}"/>
  <g transform="translate(5, 5)">
    <path d="M 0 90 L 0 0 L 58 0 C 78 0 90 14 90 30 C 90 46 78 60 58 60 L 20 60 L 20 90 Z" fill="${pFill}"/>
    <path d="M 20 12 L 54 12 C 68 12 76 20 76 30 C 76 40 68 48 54 48 L 20 48 Z" fill="${counterFill}"/>
    <polygon points="30,46 47,-4 64,46" fill="#4F46E5"/>
  </g>
</svg>`);
}

const icons = [
  {
    name: 'icon-192x192.png',
    size: 192,
    bg: '#18181B',
    pFill: '#E8E8EC',
    counterFill: '#18181B',
    padding: 0,
  },
  {
    name: 'icon-512x512.png',
    size: 512,
    bg: '#18181B',
    pFill: '#E8E8EC',
    counterFill: '#18181B',
    padding: 0,
  },
  {
    name: 'icon-maskable-192x192.png',
    size: 192,
    bg: '#18181B',
    pFill: '#E8E8EC',
    counterFill: '#18181B',
    padding: 15, // extra padding for maskable safe zone
  },
  {
    name: 'icon-maskable-512x512.png',
    size: 512,
    bg: '#18181B',
    pFill: '#E8E8EC',
    counterFill: '#18181B',
    padding: 15,
  },
  {
    name: 'apple-touch-icon.png',
    size: 180,
    bg: '#FAFAFA',
    pFill: '#18181B',
    counterFill: '#FAFAFA',
    padding: 5,
  },
];

async function main() {
  fs.mkdirSync(ICONS_DIR, { recursive: true });

  for (const icon of icons) {
    const svg = makeSvg(icon);
    const outPath = path.join(ICONS_DIR, icon.name);
    await sharp(svg, { density: 300 })
      .resize(icon.size, icon.size)
      .png()
      .toFile(outPath);

    // Verify
    const meta = await sharp(outPath).metadata();
    console.log(`${icon.name}: ${meta.width}x${meta.height} (${meta.format})`);
  }

  console.log('\nAll icons generated successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
