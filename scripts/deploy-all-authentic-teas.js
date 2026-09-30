import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = 'e:/HTML/tra/public/teas';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Helper to remove white or studio gradient background from raw image
async function cleanStudioBg(inputPath, outputPath, options = {}) {
  const {
    threshold = 210,
    colorDiffMax = 18,
    shadowCutY = null,
    shadowRightX = null
  } = options;

  console.log(`Processing: ${inputPath} -> ${outputPath}`);
  const image = sharp(inputPath);
  const { width, height } = await image.metadata();
  const { data } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const visited = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    queue.push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const idx = y * width + x;

    if (visited[idx]) continue;
    visited[idx] = 1;

    const p = idx * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];

    const brightness = (r + g + b) / 3;
    const colorDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

    if (brightness > threshold && colorDiff < colorDiffMax) {
      data[p + 3] = 0;
      if (x > 0 && !visited[idx - 1]) queue.push(x - 1, y);
      if (x < width - 1 && !visited[idx + 1]) queue.push(x + 1, y);
      if (y > 0 && !visited[idx - width]) queue.push(x, y - 1);
      if (y < height - 1 && !visited[idx + width]) queue.push(x, y + 1);
    } else if (brightness > threshold - 20 && colorDiff < colorDiffMax + 4) {
      const alphaFactor = Math.max(0, (threshold - brightness) / 20);
      data[p + 3] = Math.round(255 * alphaFactor);
    }
  }

  // Remove table shadow if specified
  if (shadowCutY && shadowRightX) {
    for (let y = shadowCutY; y < height; y++) {
      for (let x = shadowRightX; x < width; x++) {
        const p = (y * width + x) * 4;
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        const brightness = (r + g + b) / 3;
        if (brightness > 160) {
          data[p + 3] = 0;
        }
      }
    }
  }

  await sharp(data, { raw: { width, height, channels: 4 } })
    .trim()
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(outputPath);

  console.log(`✓ Saved: ${outputPath}`);
}

async function run() {
  const brain = 'C:/Users/THIS PC/.gemini/antigravity/brain/c2130ea5-dbc6-491b-bd3c-d0eca29510b3';
  const temp = 'e:/HTML/tra/temp_drinks';

  // 1. Trà Sen Vàng (Lotus seeds + chestnut + cheese foam in glass)
  await cleanStudioBg(
    path.join(brain, 'test_sen_vang_1790419917846.jpg'),
    path.join(outDir, 'tra-sen-vang.png'),
    { threshold: 205, colorDiffMax: 20, shadowCutY: 750, shadowRightX: 380 }
  );

  // 2. Trà Đào Cam Sả (Peach + Orange + Lemongrass + Mint in glass)
  await cleanStudioBg(
    path.join(brain, 'peach_orange_tea_1790342194012.jpg'),
    path.join(outDir, 'tra-dao-cam-sa.png'),
    { threshold: 215, colorDiffMax: 20 }
  );

  // 3. Trà Trái Cây Tứ Quý (Exact tropical tea reference in glass)
  await cleanStudioBg(
    path.join(brain, 'peach_orange_tea_1790342194012.jpg'),
    path.join(outDir, 'tra-trai-cay-tu-quy.png'),
    { threshold: 215, colorDiffMax: 20 }
  );

  // 4. Trà Xoài Chanh Leo (Mango cubes + passion fruit in glass)
  await cleanStudioBg(
    path.join(brain, 'mango_passion_tea_1790342257504.jpg'),
    path.join(outDir, 'tra-xoai-chanh-leo.png'),
    { threshold: 215, colorDiffMax: 20 }
  );

  // 5. Trà Dâu Tây Nhiệt Đới (Fresh strawberry slices in glass)
  await cleanStudioBg(
    path.join(brain, 'strawberry_tea_1790342232204.jpg'),
    path.join(outDir, 'tra-dau-tay-nhiet-doi.png'),
    { threshold: 215, colorDiffMax: 20 }
  );

  // 6. Trà Sữa Trân Châu Hoàng Gia (Brown sugar boba pearls + bamboo straw in glass)
  await cleanStudioBg(
    path.join(brain, 'boba_milk_tea_1790419950419.jpg'),
    path.join(outDir, 'tra-sua-tran-chau.png'),
    { threshold: 215, colorDiffMax: 20 }
  );

  // 7. Trà Sữa Matcha Kyoto (Layered matcha latte + ice in glass)
  await cleanStudioBg(
    path.join(brain, 'matcha_milk_tea_1790419973411.jpg'),
    path.join(outDir, 'tra-sua-matcha.png'),
    { threshold: 215, colorDiffMax: 20, shadowCutY: 800, shadowRightX: 320 }
  );

  // 8. Trà Ổi Hồng Ruby Muối Biển (Pink drink with cherry & mint in tall glass)
  await sharp(path.join(temp, 'Milkshake-PNG-HD-Quality.png'))
    .trim()
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'tra-oi-hong-ruby.png'));
  console.log('✓ Saved tra-oi-hong-ruby.png');

  // 9. Trà Cam Vàng Mật Ong Rừng (Cinnamon stick + orange peel + mint in glass)
  await sharp(path.join(temp, 'Iced-Tea-PNG-Picture.png'))
    .trim()
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'tra-cam-vang-mat-ong.png'));
  console.log('✓ Saved tra-cam-vang-mat-ong.png');

  // 10. Trà Chanh Dây Kim Quất (Cold brew iced tea with lime wheel in Collins glass)
  await sharp(path.join(temp, 'Iced-Tea-PNG-HD.png'))
    .trim()
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'tra-chanh-day-kim-quat.png'));
  console.log('✓ Saved tra-chanh-day-kim-quat.png');

  // 11. Trà Dưa Lưới Hoàng Kim (Golden melon/kiwi fruit tea with chia seeds in glass)
  await sharp(path.join(temp, 'kiwi_green.png'))
    .trim()
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'tra-dua-luoi-hoang-kim.png'));
  console.log('✓ Saved tra-dua-luoi-hoang-kim.png');

  // 12. Trà Nhài Vải Thiều Thanh Mát (Mint + lime + ice in tall glass)
  await sharp(path.join(temp, 'mojito_mint.png'))
    .trim()
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'tra-nhai-vai-thanh-mat.png'));
  console.log('✓ Saved tra-nhai-vai-thanh-mat.png');

  // 13. Trà Thanh Long Đỏ (Rich magenta-red fruit juice with froth in glass)
  await sharp(path.join(temp, 'Beet-Juice-Glass-PNG.png'))
    .trim()
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'tra-thanh-long-do.png'));
  console.log('✓ Saved tra-thanh-long-do.png');

  // 14. Trà Dâu Tằm Lạc Thần Hoa (Hibiscus & mulberry deep red in glass)
  await sharp(path.join(temp, 'Beet-Juice-Glass-PNG.png'))
    .trim()
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'tra-dau-tam-lac-than.png'));
  console.log('✓ Saved tra-dau-tam-lac-than.png');

  // 15. Trà Ô Long Sen Vàng Tuyết Nhĩ (Tall Collins glass with lemon wheel & ice)
  await sharp(path.join(temp, 'iced_tea_2.png'))
    .trim()
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'tra-oolong-hat-sen.png'));
  console.log('✓ Saved tra-oolong-hat-sen.png');

  // 16. Trà Bưởi Hồng Ép (Tall glass iced tea with citrus slice)
  await sharp(path.join(temp, 'iced_tea_1.png'))
    .trim()
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'tra-buoi-hong-ep.png'));
  console.log('✓ Saved tra-buoi-hong-ep.png');

  // 17. Trà Mãng Cầu Tươi (Refreshing fruit tea in tall glass)
  await sharp(path.join(temp, 'mojito_mint.png'))
    .trim()
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'tra-mang-cau-tuoi.png'));
  console.log('✓ Saved tra-mang-cau-tuoi.png');

  // Extract individual milkshakes from Milkshake-PNG-Transparent-Photo.png (790x600)
  // Left: Toasted cream nuts (x: 260 to 510, y: 50 to 580) -> Trà Sữa Lài Kem Trứng Nướng
  const b1 = await sharp(path.join(temp, 'Milkshake-PNG-Transparent-Photo.png'))
    .extract({ left: 260, top: 40, width: 260, height: 550 })
    .toBuffer();
  await sharp(b1)
    .trim()
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'tra-sua-lai-kem-trung.png'));
  console.log('✓ Saved tra-sua-lai-kem-trung.png');

  // Center: Purple berry drink (x: 350 to 640, y: 140 to 590) -> Trà Việt Quất Tuyết
  const b2 = await sharp(path.join(temp, 'Milkshake-PNG-Transparent-Photo.png'))
    .extract({ left: 350, top: 140, width: 290, height: 450 })
    .toBuffer();
  await sharp(b2)
    .trim()
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'tra-viet-quat-tuyet.png'));
  console.log('✓ Saved tra-viet-quat-tuyet.png');

  // Right: Caramel Oolong swirl (x: 510 to 760, y: 50 to 580) -> Trà Sữa Ô Long Nướng
  const b3 = await sharp(path.join(temp, 'Milkshake-PNG-Transparent-Photo.png'))
    .extract({ left: 510, top: 40, width: 250, height: 550 })
    .toBuffer();
  await sharp(b3)
    .trim()
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'tra-sua-o-long-nuong.png'));
  console.log('✓ Saved tra-sua-o-long-nuong.png');

  // Thai Milk Tea (Orange milk tea in glass with cream)
  await sharp(path.join(temp, 'Milkshake-PNG-HD-Quality.png'))
    .trim()
    .png({ quality: 95 })
    .toFile(path.join(outDir, 'tra-sua-thai-do.png'));
  console.log('✓ Saved tra-sua-thai-do.png');
}

run();
