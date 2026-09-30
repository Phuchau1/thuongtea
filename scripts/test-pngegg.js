async function testPngEgg(query) {
  try {
    const url = `https://www.pngegg.com/en/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!res.ok) {
      console.log(`Failed ${query}: ${res.status}`);
      return [];
    }
    const html = await res.text();
    // match image src: https://e7.pngegg.com/pngimages/...
    const matches = html.match(/https:\/\/[^"']+\.pngegg\.com\/pngimages\/[^"']+\.png/g) || [];
    return [...new Set(matches)];
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function run() {
  const queries = [
    'taro bubble tea glass',
    'thai tea glass',
    'lychee tea glass',
    'dragon fruit tea glass',
    'blueberry iced tea glass',
    'grapefruit iced tea glass'
  ];

  for (const q of queries) {
    const list = await testPngEgg(q);
    console.log(`=== ${q} (${list.length} PNGs) ===`);
    list.slice(0, 4).forEach(l => console.log('  ', l));
  }
}

run();
