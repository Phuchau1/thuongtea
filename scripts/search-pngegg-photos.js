async function searchPngEgg(query) {
  try {
    const url = `https://www.pngegg.com/en/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!res.ok) return [];
    const html = await res.text();
    // match: <img ... alt="..." data-src="..." or src="..."
    const regex = /<img[^>]+alt="([^"]+)"[^>]+(?:data-)?src="(https:\/\/e7\.pngegg\.com\/pngimages\/[^"]+)"/g;
    const items = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      const alt = match[1];
      const src = match[2].replace('-thumbnail', '');
      // Filter out illustrations/drawings/cartoons/vectors
      if (!alt.toLowerCase().includes('illustration') && 
          !alt.toLowerCase().includes('drawing') && 
          !alt.toLowerCase().includes('vector') &&
          !alt.toLowerCase().includes('cartoon')) {
        items.push({ alt, src });
      }
    }
    return items;
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function run() {
  const queries = [
    'thai iced tea glass',
    'bubble tea glass',
    'iced tea lemon glass',
    'fruit iced tea glass',
    'peach iced tea glass',
    'orange juice glass ice',
    'matcha latte glass ice',
    'milk tea glass boba'
  ];

  for (const q of queries) {
    const results = await searchPngEgg(q);
    console.log(`=== ${q} (${results.length} photo matches) ===`);
    results.slice(0, 3).forEach(r => console.log(`  [${r.alt.slice(0, 50)}] => ${r.src}`));
  }
}

run();
