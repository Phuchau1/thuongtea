import fs from 'fs';

async function searchUnsplash(keyword) {
  try {
    const res = await fetch(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(keyword)}&per_page=10`);
    if (!res.ok) {
      console.log(`Failed ${keyword}: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.results.map(r => ({
      id: r.id,
      desc: r.alt_description || r.description,
      raw: r.urls.raw,
      regular: r.urls.regular,
      small: r.urls.small
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function run() {
  const keywords = [
    'taro bubble tea',
    'thai milk tea',
    'iced tea glass',
    'fruit tea glass',
    'lemon iced tea glass',
    'strawberry iced tea glass',
    'passion fruit drink glass',
    'hibiscus iced tea glass',
    'blueberry drink glass',
    'grapefruit iced drink glass'
  ];

  for (const kw of keywords) {
    const photos = await searchUnsplash(kw);
    console.log(`=== ${kw} (${photos.length} photos) ===`);
    photos.slice(0, 3).forEach(p => console.log(`- ${p.desc} => ${p.regular}`));
  }
}

run();
