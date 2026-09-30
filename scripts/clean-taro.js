import sharp from 'sharp';
import fs from 'fs';

async function removeCheckerboard(inputPath, outputPath) {
  const image = sharp(inputPath);
  const { width, height } = await image.metadata();
  const { data } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const visited = new Uint8Array(width * height);
  const queue = [];

  // Seed borders and interior margins (10px from edge)
  for (let x = 0; x < width; x += 5) {
    queue.push(x, 10);
    queue.push(x, height - 10);
  }
  for (let y = 0; y < height; y += 5) {
    queue.push(10, y);
    queue.push(width - 10, y);
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

    const isGrayOrWhite = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b)) <= 5;
    const isCheckerPixel = isGrayOrWhite && (r >= 225 || r === 255);

    if (isCheckerPixel) {
      data[p + 3] = 0; // Transparent

      if (x > 0 && !visited[idx - 1]) queue.push(x - 1, y);
      if (x < width - 1 && !visited[idx + 1]) queue.push(x + 1, y);
      if (y > 0 && !visited[idx - width]) queue.push(x, y - 1);
      if (y < height - 1 && !visited[idx + width]) queue.push(x, y + 1);
    }
  }

  await sharp(data, { raw: { width, height, channels: 4 } })
    .trim()
    .png({ quality: 95 })
    .toFile(outputPath);

  console.log(`Saved transparent: ${outputPath}`);
}

removeCheckerboard('temp_drinks/test_taro.png', 'e:/HTML/tra/public/teas/tra-sua-khoai-mon.png');
