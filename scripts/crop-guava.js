import sharp from 'sharp';

const src = 'C:/Users/THIS PC/.gemini/antigravity/brain/c2130ea5-dbc6-491b-bd3c-d0eca29510b3/.user_uploaded/media_1790344737692.png';

async function cropGuava() {
  // Let's extract the exact region around the Guava glass
  // From our previous crop:
  // left: 140, top: 510, width: 130, height: 200
  await sharp(src)
    .extract({ left: 142, top: 508, width: 125, height: 198 })
    .toFile('temp_drinks/guava_exact.png');
  console.log('Saved temp_drinks/guava_exact.png');
}

cropGuava();
