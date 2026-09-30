import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const urls = [
  'https://www.pngmart.com/files/16/Kiwi-Fruit-and-Mint-Water-Glass-PNG.png',
  'https://www.pngmart.com/files/16/Mint-and-Lemon-Water-Glass-PNG.png',
  'https://www.pngmart.com/files/15/Pineapple-Juice-Glass-PNG-HD.png',
  'https://www.pngmart.com/files/15/Beet-Juice-Glass-PNG.png',
  'https://www.pngmart.com/files/15/Cold-Pressed-Beet-Juice-PNG.png',
  'https://www.pngmart.com/files/8/Watermelon-Juice-PNG-Photos.png',
  'https://www.pngmart.com/files/19/Strawberry-Smoothie-PNG-HD.png',
  'https://www.pngmart.com/files/5/Iced-Tea-PNG-HD.png',
  'https://www.pngmart.com/files/5/Iced-Tea-PNG-Picture.png',
  'https://www.pngmart.com/files/17/Cold-Bubble-Tea-PNG-HD.png',
  'https://www.pngmart.com/files/17/Cold-Bubble-Tea-PNG-Pic.png'
];

async function run() {
  for (const u of urls) {
    const filename = u.split('/').pop();
    const dest = path.join('temp_drinks', filename);
    const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.log(`Failed ${filename}: ${res.status}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    const meta = await sharp(dest).metadata();
    console.log(`Saved ${filename}: ${meta.width}x${meta.height}, alpha: ${meta.hasAlpha}`);
  }
}

run();
