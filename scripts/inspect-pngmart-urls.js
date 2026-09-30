import fs from 'fs';

const data = JSON.parse(fs.readFileSync('temp_drinks/pngmart_all.json', 'utf8'));

for (const [tag, urls] of Object.entries(data)) {
  console.log(`=== ${tag} ===`);
  urls.forEach(u => {
    const filename = u.split('/').pop();
    console.log('  ', filename);
  });
}
