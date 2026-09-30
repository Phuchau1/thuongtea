import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const urls = [
  { name: 'mojito_mint', url: 'https://www.pngmart.com/files/4/Mojito-PNG-Transparent-Image.png' },
  { name: 'berry_mix_juice', url: 'https://www.pngmart.com/files/15/Berry-Mix-Juice-PNG.png' },
  { name: 'latte_layer', url: 'https://www.pngmart.com/files/23/Latte-PNG-File.png' },
  { name: 'cocktail_orange', url: 'https://www.pngmart.com/files/1/Cocktail.png' },
  { name: 'drink_photo', url: 'https://www.pngmart.com/files/8/Drink-PNG-Transparent-Photo.png' }
];

async function run() {
  for (const item of urls) {
    const dest = path.join('temp_drinks', `${item.name}.png`);
    const res = await fetch(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.log(`Failed ${item.name}: ${res.status}`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    const meta = await sharp(dest).metadata();
    console.log(`Saved ${item.name}: ${meta.width}x${meta.height}, format: ${meta.format}, alpha: ${meta.hasAlpha}`);
  }
}

run();
