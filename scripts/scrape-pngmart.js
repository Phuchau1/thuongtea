async function getPngMartLinks(tag) {
  try {
    const url = `https://www.pngmart.com/image/tag/${tag}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return [];
    const html = await res.text();
    // match image links: https://www.pngmart.com/files/...
    const matches = html.match(/https:\/\/www\.pngmart\.com\/files\/\d+\/[^"']+\.png/g) || [];
    return [...new Set(matches)];
  } catch (e) {
    console.error(`Error ${tag}:`, e);
    return [];
  }
}

async function run() {
  const tags = [
    'peach',
    'strawberry',
    'mango',
    'orange-juice',
    'milkshake',
    'grapefruit',
    'lemon-tea',
    'green-tea',
    'fruit',
    'beverage'
  ];
  for (const tag of tags) {
    const links = await getPngMartLinks(tag);
    console.log(`=== Tag: ${tag} (${links.length} PNGs) ===`);
    links.slice(0, 6).forEach(l => console.log('  ', l));
  }
}

run();
