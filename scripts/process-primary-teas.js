import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function removeWhiteBg(inputPath, outputPath) {
  console.log(`Processing: ${inputPath} -> ${outputPath}`);
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width, height } = metadata;

  const raw = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const data = raw.data;

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

    // Outer white/off-white background and light grey studio gradient
    if (brightness > 208 && colorDiff < 18) {
      data[p + 3] = 0;

      if (x > 0 && !visited[idx - 1]) queue.push(x - 1, y);
      if (x < width - 1 && !visited[idx + 1]) queue.push(x + 1, y);
      if (y > 0 && !visited[idx - width]) queue.push(x, y - 1);
      if (y < height - 1 && !visited[idx + width]) queue.push(x, y + 1);
    } else if (brightness > 190 && colorDiff < 20) {
      const alphaFactor = Math.max(0, (brightness - 190) / 18);
      data[p + 3] = Math.round(255 * (1 - alphaFactor));
    }
  }

  // Trim transparent edges
  const trimmed = await sharp(data, {
    raw: { width, height, channels: 4 }
  })
  .trim()
  .png({ quality: 95, compressionLevel: 8 })
  .toFile(outputPath);

  console.log(`Saved: ${outputPath} (${trimmed.width}x${trimmed.height})`);
}

async function run() {
  const brainDir = 'C:/Users/THIS PC/.gemini/antigravity/brain/c2130ea5-dbc6-491b-bd3c-d0eca29510b3';
  
  await removeWhiteBg(
    path.join(brainDir, 'test_sen_vang_1790419917846.jpg'),
    'e:/HTML/tra/public/teas/tra-sen-vang.png'
  );

  await removeWhiteBg(
    path.join(brainDir, 'boba_milk_tea_1790419950419.jpg'),
    'e:/HTML/tra/public/teas/tra-sua-tran-chau.png'
  );

  await removeWhiteBg(
    path.join(brainDir, 'matcha_milk_tea_1790419973411.jpg'),
    'e:/HTML/tra/public/teas/tra-sua-matcha.png'
  );

  await removeWhiteBg(
    path.join(brainDir, 'peach_orange_tea_1790342194012.jpg'),
    'e:/HTML/tra/public/teas/tra-dao-cam-sa.png'
  );

  await removeWhiteBg(
    path.join(brainDir, 'peach_orange_tea_1790342194012.jpg'),
    'e:/HTML/tra/public/teas/tra-trai-cay-tu-quy.png'
  );

  await removeWhiteBg(
    path.join(brainDir, 'mango_passion_tea_1790342257504.jpg'),
    'e:/HTML/tra/public/teas/tra-xoai-chanh-leo.png'
  );

  await removeWhiteBg(
    path.join(brainDir, 'strawberry_tea_1790342232204.jpg'),
    'e:/HTML/tra/public/teas/tra-dau-tay-nhiet-doi.png'
  );
}

run();
