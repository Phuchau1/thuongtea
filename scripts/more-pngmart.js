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
    'mojito',
    'latte',
    'iced-coffee',
    'cold-coffee',
    'pomegranate',
    'watermelon',
    'berry',
    'cocktail',
    'drink'
  ];
  for (const t of tags) {
    const links = await getPngMartLinks(t);
    console.log(`=== ${t} (${links.length} PNGs) ===`);
    links.slice(0, 5).forEach(l => console.log('  ', l));
  }
}

run();
