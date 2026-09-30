import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const items = [
  { name: 'thai_tea', url: 'https://e7.pngegg.com/pngimages/639/413/png-clipart-bubble-tea-oolong-milk-green-tea-iced-tea-tea-juice.png' },
  { name: 'hongkong_pearl', url: 'https://e7.pngegg.com/pngimages/761/167/png-clipart-clear-drinking-glass-and-fruits-hong-kong-style-milk-tea-bubble-tea-pearl-milk-tea-food-tea.png' },
  { name: 'iced_lemon_1', url: 'https://e7.pngegg.com/pngimages/78/932/png-clipart-lemon-flavored-tea-glass-long-island-iced-tea-juice-iced-coffee-lime-ice-tea-orange-tea.png' },
  { name: 'iced_lemon_2', url: 'https://e7.pngegg.com/pngimages/201/761/png-clipart-long-island-iced-tea-juice-lemonade-iced-tea-clear-glass-cup-with-lemon-juice-tea-cocktail.png' },
  { name: 'peach_tea', url: 'https://e7.pngegg.com/pngimages/853/891/png-clipart-tea-juice-fuzzy-navel-caipirinha-orange-drink-peach-lemon-tea-glass-food.png' },
  { name: 'mango_drink', url: 'https://e7.pngegg.com/pngimages/778/508/png-clipart-glass-full-of-juice-ice-cream-orange-juice-smoothie-milkshake-icy-mango-food-health-shake.png' },
  { name: 'watermelon_drink', url: 'https://e7.pngegg.com/pngimages/837/1/png-clipart-clear-glass-cup-filled-with-water-melon-juice-and-ice-orange-juice-smoothie-watermelon-watermelon-juice-s-image-file-formats-food.png' },
  { name: 'matcha_shake', url: 'https://e7.pngegg.com/pngimages/161/616/png-clipart-macha-shake-in-glass-green-tea-ice-cream-matcha-green-tea-ice-cream-latte-green-tea-drink-food-tea.png' },
  { name: 'assam_oolong', url: 'https://e7.pngegg.com/pngimages/875/611/png-clipart-bubble-tea-milk-assam-tea-oolong-tea-glass-tea.png' }
];

async function run() {
  for (const it of items) {
    try {
      const res = await fetch(it.url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.pngegg.com/' } });
      if (!res.ok) {
        console.log(`Failed ${it.name}: ${res.status}`);
        continue;
      }
      const dest = path.join('temp_drinks', `${it.name}.png`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      const meta = await sharp(dest).metadata();
      console.log(`Downloaded ${it.name}: ${meta.width}x${meta.height}, format: ${meta.format}, alpha: ${meta.hasAlpha}`);
    } catch (e) {
      console.error(it.name, e);
    }
  }
}

run();
