import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

const eyeDropSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1976d2" />
      <stop offset="100%" stop-color="#0d47a1" />
    </linearGradient>
    <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#64b5f6" />
      <stop offset="100%" stop-color="#2196f3" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ce93d8" />
      <stop offset="100%" stop-color="#ab47bc" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.25"/>
    </filter>
  </defs>

  <rect width="512" height="512" rx="128" fill="url(#bgGrad)" />

  <g filter="url(#shadow)">
    <path d="M256 140 C140 140 60 256 60 256 C60 256 140 372 256 372 C372 372 452 256 452 256 C452 256 372 140 256 140 Z"
          fill="#ffffff" />

    <circle cx="256" cy="256" r="76" fill="url(#accentGrad)" />
    <circle cx="256" cy="256" r="42" fill="#1a237e" />
    <circle cx="242" cy="242" r="14" fill="#ffffff" opacity="0.9" />

    <path d="M256 60 C256 60 216 130 216 165 C216 187 234 205 256 205 C278 205 296 187 296 165 C296 130 256 60 256 60 Z"
          fill="url(#dropGrad)"
          stroke="#ffffff"
          stroke-width="8" />

    <ellipse cx="248" cy="160" rx="8" ry="18" fill="#ffffff" opacity="0.75" transform="rotate(-20 248 160)" />

    <circle cx="390" cy="380" r="48" fill="#4caf50" stroke="#ffffff" stroke-width="6" />
    <path d="M390 354 V406 M364 380 H416" stroke="#ffffff" stroke-width="10" stroke-linecap="round" />
  </g>
</svg>
`;

const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1976d2" />
      <stop offset="100%" stop-color="#0d47a1" />
    </linearGradient>
    <linearGradient id="dropGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#64b5f6" />
      <stop offset="100%" stop-color="#2196f3" />
    </linearGradient>
    <linearGradient id="accentGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ce93d8" />
      <stop offset="100%" stop-color="#ab47bc" />
    </linearGradient>
  </defs>

  <rect width="512" height="512" fill="url(#bgGrad2)" />

  <g transform="translate(51.2, 51.2) scale(0.8)">
    <path d="M256 140 C140 140 60 256 60 256 C60 256 140 372 256 372 C372 372 452 256 452 256 C452 256 372 140 256 140 Z"
          fill="#ffffff" />
    <circle cx="256" cy="256" r="76" fill="url(#accentGrad2)" />
    <circle cx="256" cy="256" r="42" fill="#1a237e" />
    <circle cx="242" cy="242" r="14" fill="#ffffff" opacity="0.9" />
    <path d="M256 60 C256 60 216 130 216 165 C216 187 234 205 256 205 C278 205 296 187 296 165 C296 130 256 60 256 60 Z"
          fill="url(#dropGrad2)"
          stroke="#ffffff"
          stroke-width="8" />
    <ellipse cx="248" cy="160" rx="8" ry="18" fill="#ffffff" opacity="0.75" transform="rotate(-20 248 160)" />
    <circle cx="390" cy="380" r="48" fill="#4caf50" stroke="#ffffff" stroke-width="6" />
    <path d="M390 354 V406 M364 380 H416" stroke="#ffffff" stroke-width="10" stroke-linecap="round" />
  </g>
</svg>
`;

async function generate() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), eyeDropSvg.trim());
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), eyeDropSvg.trim());

  const svgBuffer = Buffer.from(eyeDropSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'maskable-icon-512x512.png'));
  console.log('Created maskable-icon-512x512.png');

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
