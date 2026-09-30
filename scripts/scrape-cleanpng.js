async function searchCleanPng(query) {
  try {
    const url = `https://www.cleanpng.com/free/${query}.html`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    if (!res.ok) {
      console.log(`Failed ${query}: ${res.status}`);
      return [];
    }
    const html = await res.text();
    // match image preview links: https://banner2.cleanpng.com/...
    const matches = html.match(/https:\/\/[^"']+\.cleanpng\.com\/[^"']+\.jpg/g) || [];
    return [...new Set(matches)];
  } catch (e) {
    console.error(`Error ${query}:`, e);
    return [];
  }
}

async function run() {
  const queries = ['taro-bubble-tea', 'thai-tea', 'bubble-tea', 'matcha-latte', 'iced-tea', 'fruit-tea'];
  for (const q of queries) {
    const links = await searchCleanPng(q);
    console.log(`=== ${q} (${links.length} images) ===`);
    links.slice(0, 5).forEach(l => console.log('  ', l));
  }
}

run();
