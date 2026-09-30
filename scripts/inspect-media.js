import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = 'C:/Users/THIS PC/.gemini/antigravity/brain/c2130ea5-dbc6-491b-bd3c-d0eca29510b3/.user_uploaded';

async function run() {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const meta = await sharp(full).metadata();
    console.log(`${f}: ${meta.width}x${meta.height}, format: ${meta.format}, alpha: ${meta.hasAlpha}`);
  }
}

run();
