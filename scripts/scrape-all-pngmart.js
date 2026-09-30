import fs from 'fs';

async function getPngMartLinks(tag) {
  try {
    const url = `https://www.pngmart.com/image/tag/${tag}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return [];
    const html = await res.text();
    const matches = html.match(/https:\/\/www\.pngmart\.com\/files\/\d+\/[^"']+\.png/g) || [];
    return [...new Set(matches)];
  } catch (e) {
    return [];
  }
}

async function run() {
  const tags = [
    'bubble-tea',
    'iced-tea',
    'tea',
    'juice',
    'orange-juice',
    'apple-juice',
    'lemonade',
    'lime',
    'mojito',
    'cocktail',
    'smoothie',
    'glass',
    'ice-cube'
  ];

  const all = {};
  for (const t of tags) {
    const links = await getPngMartLinks(t);
    all[t] = links;
    console.log(`${t}: ${links.length} PNGs`);
  }

  fs.writeFileSync('temp_drinks/pngmart_all.json', JSON.stringify(all, null, 2));
}

run();
