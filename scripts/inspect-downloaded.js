import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const urls = [
  { name: 'boba_1', url: 'https://www.pngmart.com/files/17/Bubble-Tea-PNG-HD.png' },
  { name: 'boba_2', url: 'https://www.pngmart.com/files/17/Cold-Bubble-Tea-PNG-Image.png' },
  { name: 'boba_3', url: 'https://www.pngmart.com/files/17/Cold-Bubble-Tea-PNG-Transparent-Image.png' },
  { name: 'iced_tea_1', url: 'https://www.pngmart.com/files/5/Iced-Tea-PNG-Transparent-Image.png' },
  { name: 'iced_tea_2', url: 'https://www.pngmart.com/files/5/Iced-Tea-PNG-Free-Download.png' },
  { name: 'orange_juice', url: 'https://www.pngmart.com/files/22/Orange-juice-PNG-Isolated-HD.png' },
  { name: 'beet_ruby', url: 'https://www.pngmart.com/files/15/Fresh-Red-Beet-Juice-Transparent-PNG.png' },
  { name: 'kiwi_green', url: 'https://www.pngmart.com/files/16/Kiwi-Cocktail-PNG-Pic.png' },
  { name: 'mimosa_peach', url: 'https://www.pngmart.com/files/4/Mimosa-PNG-Image.png' },
  { name: 'lemonade', url: 'https://www.pngmart.com/files/23/Lemonade-PNG-HD.png' }
];

if (!fs.existsSync('temp_drinks')) {
  fs.mkdirSync('temp_drinks', { recursive: true });
}

async function run() {
  for (const item of urls) {
    const dest = path.join('temp_drinks', `${item.name}.png`);
    const res = await fetch(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buffer);
    const meta = await sharp(dest).metadata();
    console.log(`Saved ${item.name}: ${meta.width}x${meta.height}, format: ${meta.format}, hasAlpha: ${meta.hasAlpha}`);
  }
}

run();
