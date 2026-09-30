import fs from 'fs';
import sharp from 'sharp';

// Authentic Vietnamese Tea Leaf Emblem (Two organic tea leaves meeting inside circle)
const teaIconSvg = `
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <circle cx="200" cy="200" r="190" fill="#322821"/>
  <!-- Main Tea Leaf -->
  <path d="M200,75 C275,130 280,240 200,315 C195,270 195,215 200,75 Z" fill="#E5C07B"/>
  <!-- Second Leaf Swirl -->
  <path d="M200,315 C120,245 125,150 195,90 C190,140 185,210 200,315 Z" fill="#FFFFFF" opacity="0.95"/>
  <!-- Stem & Center Vein -->
  <path d="M200,315 Q196,200 200,85" stroke="#322821" stroke-width="7" stroke-linecap="round" fill="none"/>
</svg>
`;

const teaIconWhiteSvg = `
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <circle cx="200" cy="200" r="190" fill="#FFFFFF"/>
  <path d="M200,75 C275,130 280,240 200,315 C195,270 195,215 200,75 Z" fill="#322821"/>
  <path d="M200,315 C120,245 125,150 195,90 C190,140 185,210 200,315 Z" fill="#8B5E3C" opacity="0.95"/>
  <path d="M200,315 Q196,200 200,85" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" fill="none"/>
</svg>
`;

const teaLogoSvg = `
<svg width="800" height="220" viewBox="0 0 800 220" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(30, 20) scale(0.45)">
    <circle cx="200" cy="200" r="190" fill="#322821"/>
    <path d="M200,75 C275,130 280,240 200,315 C195,270 195,215 200,75 Z" fill="#E5C07B"/>
    <path d="M200,315 C120,245 125,150 195,90 C190,140 185,210 200,315 Z" fill="#FFFFFF" opacity="0.95"/>
    <path d="M200,315 Q196,200 200,85" stroke="#322821" stroke-width="7" stroke-linecap="round" fill="none"/>
  </g>
  <text x="240" y="115" font-family="system-ui, -apple-system, sans-serif" font-size="76" font-weight="900" fill="#322821" letter-spacing="6">THƯỢNG</text>
  <text x="245" y="160" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#8B5E3C" letter-spacing="7">TRÀ &amp; TRÀ SỮA • EST 2026</text>
</svg>
`;

const teaLogoWhiteSvg = `
<svg width="800" height="220" viewBox="0 0 800 220" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(30, 20) scale(0.45)">
    <circle cx="200" cy="200" r="190" fill="#FFFFFF"/>
    <path d="M200,75 C275,130 280,240 200,315 C195,270 195,215 200,75 Z" fill="#322821"/>
    <path d="M200,315 C120,245 125,150 195,90 C190,140 185,210 200,315 Z" fill="#E5C07B" opacity="0.95"/>
    <path d="M200,315 Q196,200 200,85" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" fill="none"/>
  </g>
  <text x="240" y="115" font-family="system-ui, -apple-system, sans-serif" font-size="76" font-weight="900" fill="#FFFFFF" letter-spacing="6">THƯỢNG</text>
  <text x="245" y="160" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#E5C07B" letter-spacing="7">TRÀ &amp; TRÀ SỮA • EST 2026</text>
</svg>
`;

async function run() {
  await sharp(Buffer.from(teaIconSvg)).png().toFile('public/logo-icon.png');
  await sharp(Buffer.from(teaIconWhiteSvg)).png().toFile('public/logo-icon-white.png');
  await sharp(Buffer.from(teaLogoSvg)).png().toFile('public/logo.png');
  await sharp(Buffer.from(teaLogoWhiteSvg)).png().toFile('public/logo-white.png');
  console.log('✓ Successfully generated authentic Tea Leaf Logos (NO AI Sparkles)!');
}

run();
