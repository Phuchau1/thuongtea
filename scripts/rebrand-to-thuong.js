import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'e:/HTML/tra/src/components/FruitTeaHero.tsx',
  'e:/HTML/tra/src/components/AdminPortal.tsx',
  'e:/HTML/tra/src/components/MenuSection.tsx',
  'e:/HTML/tra/src/components/QualityStory.tsx',
  'e:/HTML/tra/src/components/Footer.tsx',
  'e:/HTML/tra/src/components/CartDrawer.tsx',
  'e:/HTML/tra/src/components/TeaCustomizerModal.tsx',
  'e:/HTML/tra/src/components/DiyTeaBuilder.tsx',
  'e:/HTML/tra/src/components/LiveOrderTrackerModal.tsx',
  'e:/HTML/tra/src/components/MemberLoginModal.tsx',
  'e:/HTML/tra/src/components/StaffLoginModal.tsx',
  'e:/HTML/tra/src/components/StaffFormModal.tsx',
  'e:/HTML/tra/src/components/ProductFormModal.tsx',
  'e:/HTML/tra/src/context/OrderContext.tsx',
];

for (const file of filesToUpdate) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Replace colors
  // #164E3D (old green) -> #322821 (brand nâu đen)
  content = content.replaceAll('#164E3D', '#322821');
  content = content.replaceAll('#164e3d', '#322821');
  
  // #0E362A (darker green) -> #211A15 (deep espresso nâu đen)
  content = content.replaceAll('#0E362A', '#211A15');
  content = content.replaceAll('#0e362a', '#211A15');

  // #124032 (footer green) -> #251C16
  content = content.replaceAll('#124032', '#251C16');
  // #1C5B48 -> #3A2D24
  content = content.replaceAll('#1C5B48', '#3A2D24');

  // #247057 -> #4A3B32
  content = content.replaceAll('#247057', '#4A3B32');

  // #EAF3EF (light green subtle) -> #F5EFE9 (warm cream subtle)
  content = content.replaceAll('#EAF3EF', '#F5EFE9');
  content = content.replaceAll('#eaf3ef', '#F5EFE9');

  // Replace Brand Name
  content = content.replaceAll('AN TRÀ POS', 'THƯỢNG POS');
  content = content.replaceAll('AN TRÀ', 'THƯỢNG');
  content = content.replaceAll('An Trà', 'Thượng');
  content = content.replaceAll('antra.com.vn', 'thuongtea.vn');

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated colors & brand in: ${path.basename(file)}`);
}

console.log('--- REBRANDING TO THƯỢNG (NÂU ĐEN #322821) HOÀN TẤT ---');
