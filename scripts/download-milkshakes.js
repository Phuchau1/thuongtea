import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const urls = [
  'https://www.pngmart.com/files/5/Milkshake-PNG-Photos.png',
  'https://www.pngmart.com/files/8/Milkshake-PNG-Transparent-Photo.png',
  'https://www.pngmart.com/files/8/Milkshake-PNG-No-Background.png',
  'https://www.pngmart.com/files/8/Milkshake-PNG-HD-Photo.png',
  'https://www.pngmart.com/files/8/Milkshake-PNG-HD-Quality.png'
];

async function run() {
  for (const u of urls) {
    const fn = u.split('/').pop();
    const dest = path.join('temp_drinks', fn);
    const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) continue;
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    const meta = await sharp(dest).metadata();
    console.log(`Saved ${fn}: ${meta.width}x${meta.height}, alpha: ${meta.hasAlpha}`);
  }
}

run();
