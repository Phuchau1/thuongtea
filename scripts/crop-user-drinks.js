import sharp from 'sharp';
import fs from 'fs';

const src = 'C:/Users/THIS PC/.gemini/antigravity/brain/c2130ea5-dbc6-491b-bd3c-d0eca29510b3/.user_uploaded/media_1790344737692.png';

async function cropDrinks() {
  const meta = await sharp(src).metadata();
  console.log(`Source dimension: ${meta.width}x${meta.height}`);

  // In media_1790344737692.png (1024x948):
  // 6 cards in 2 rows of 3:
  // Row 1: y ~ 15 to 450
  // Card 1 (Peach): left: 52 to 322
  // Card 2 (Strawberry): left: 342 to 612
  // Card 3 (Mango): left: 632 to 902

  // Row 2: y ~ 490 to 925
  // Card 4 (Guava / Oi Hong): left ~ 52 to 322, cup is located in upper half of card
  // Card 5 (Lychee / Nhai Vai): left ~ 342 to 612, cup in upper half
  // Card 6 (Blueberry / Viet Quat): left ~ 632 to 902, cup in upper half

  // Let's crop candidate regions around the cups in Row 2:
  // Guava cup approx: left: 140, top: 540, width: 140, height: 210
  // Nhai Vai cup approx: left: 430, top: 540, width: 140, height: 210
  // Viet Quat cup approx: left: 720, top: 540, width: 140, height: 210

  const crops = [
    { name: 'crop_guava', left: 120, top: 520, width: 170, height: 210 },
    { name: 'crop_nhai_vai', left: 410, top: 520, width: 170, height: 210 },
    { name: 'crop_viet_quat', left: 700, top: 520, width: 170, height: 210 }
  ];

  for (const c of crops) {
    await sharp(src)
      .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
      .toFile(`temp_drinks/${c.name}.png`);
    console.log(`Saved temp_drinks/${c.name}.png`);
  }
}

cropDrinks();
