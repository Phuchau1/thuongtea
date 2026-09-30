import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputFiles = [
  {
    src: 'C:/Users/THIS PC/.gemini/antigravity/brain/c2130ea5-dbc6-491b-bd3c-d0eca29510b3/peach_orange_tea_1790342194012.jpg',
    out: 'e:/HTML/tra/public/teas/tra-dao-cam-sa.png'
  },
  {
    src: 'C:/Users/THIS PC/.gemini/antigravity/brain/c2130ea5-dbc6-491b-bd3c-d0eca29510b3/strawberry_tea_1790342232204.jpg',
    out: 'e:/HTML/tra/public/teas/tra-dau-tay-nhiet-doi.png'
  },
  {
    src: 'C:/Users/THIS PC/.gemini/antigravity/brain/c2130ea5-dbc6-491b-bd3c-d0eca29510b3/mango_passion_tea_1790342257504.jpg',
    out: 'e:/HTML/tra/public/teas/tra-xoai-chanh-leo.png'
  }
];

// Ensure public/teas exists
if (!fs.existsSync('e:/HTML/tra/public/teas')) {
  fs.mkdirSync('e:/HTML/tra/public/teas', { recursive: true });
}

async function removeWhiteBg(inputPath, outputPath) {
  console.log(`Processing: ${inputPath} -> ${outputPath}`);
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width, height } = metadata;

  // Get raw RGBA buffer
  const raw = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const data = raw.data; // Uint8Array of r,g,b,a

  // Flood fill from outer border pixels
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Add top & bottom border pixels
  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    queue.push(x, height - 1);
  }
  // Add left & right border pixels
  for (let y = 0; y < height; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
  }

  // BFS
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

    // Check if pixel is white or near-white background
    // Pure white is (255, 255, 255), background usually > 235
    const brightness = (r + g + b) / 3;
    const colorDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

    // If it's near-white and low saturation (background)
    if (brightness > 232 && colorDiff < 20) {
      data[p + 3] = 0; // Fully transparent

      // Expand to neighbors
      if (x > 0 && !visited[idx - 1]) queue.push(x - 1, y);
      if (x < width - 1 && !visited[idx + 1]) queue.push(x + 1, y);
      if (y > 0 && !visited[idx - width]) queue.push(x, y - 1);
      if (y < height - 1 && !visited[idx + width]) queue.push(x, y + 1);
    } else if (brightness > 215 && colorDiff < 25) {
      // Soft antialiased edge
      const alphaFactor = Math.max(0, (235 - brightness) / 20);
      data[p + 3] = Math.round(255 * alphaFactor);
    }
  }

  // Save transparent PNG
  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4
    }
  })
  .png({ quality: 95, compressionLevel: 8 })
  .toFile(outputPath);

  console.log(`Saved: ${outputPath}`);
}

async function run() {
  for (const item of inputFiles) {
    await removeWhiteBg(item.src, item.out);
  }

  // Also create a 4th variant: "Trà Ổi Hồng Thanh Long" (Pink Guava Dragonfruit)
  // by hue-shifting and enhancing the strawberry tea!
  console.log('Generating 4th tea: Trà Ổi Hồng Ruby...');
  await sharp('e:/HTML/tra/public/teas/tra-dau-tay-nhiet-doi.png')
    .modulate({
      hue: -25, // Shift towards soft coral magenta/pink
      saturation: 1.15,
      brightness: 1.05
    })
    .toFile('e:/HTML/tra/public/teas/tra-oi-hong-ruby.png');
  console.log('Saved: e:/HTML/tra/public/teas/tra-oi-hong-ruby.png');

  // Also create a 5th variant: "Trà Xanh Hoa Nhài Vải Thiều" (Lychee Jasmine Green Tea)
  console.log('Generating 5th tea: Trà Nhài Vải Thanh Mát...');
  await sharp('e:/HTML/tra/public/teas/tra-dao-cam-sa.png')
    .modulate({
      hue: 55, // Shift towards jade golden green tea
      saturation: 0.9,
      brightness: 1.1
    })
    .toFile('e:/HTML/tra/public/teas/tra-nhai-vai-thanh-mat.png');
  console.log('Saved: e:/HTML/tra/public/teas/tra-nhai-vai-thanh-mat.png');

  // Also create a 6th variant: "Trà Việt Quất Bạc Hà" (Blueberry Mint Iced Tea)
  console.log('Generating 6th tea: Trà Việt Quất Tuyết...');
  await sharp('e:/HTML/tra/public/teas/tra-dau-tay-nhiet-doi.png')
    .modulate({
      hue: 240, // Shift to deep violet blueberry
      saturation: 1.2,
      brightness: 0.95
    })
    .toFile('e:/HTML/tra/public/teas/tra-viet-quat-tuyet.png');
  console.log('Saved: e:/HTML/tra/public/teas/tra-viet-quat-tuyet.png');

  console.log('ALL 6 TRANSPARENT FRUIT TEA IMAGES CREATED SUCCESSFULLY!');
}

run().catch(console.error);
