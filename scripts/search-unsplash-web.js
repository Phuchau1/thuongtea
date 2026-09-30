import fs from 'fs';

async function getUnsplashPhotoIds(query) {
  try {
    const url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) return [];
    const html = await res.text();
    const matches = html.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9_-]+/g) || [];
    return [...new Set(matches)];
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function run() {
  const queries = [
    'thai-iced-tea',
    'taro-boba',
    'iced-tea-lemon',
    'fruit-tea-glass',
    'peach-iced-tea',
    'strawberry-drink-glass',
    'cocktail-orange-glass',
    'matcha-latte-iced'
  ];

  for (const q of queries) {
    const list = await getUnsplashPhotoIds(q);
    console.log(`=== ${q} (${list.length} photos) ===`);
    list.slice(0, 3).forEach(l => console.log('  ', l));
  }
}

run();
