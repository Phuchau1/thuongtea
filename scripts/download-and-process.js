import sharp from 'sharp';
import fs from 'fs';

const REAL_IMAGES = [
  {
    name: 'Trà Sen Vàng Củ Năng Kem Cheese',
    id: 'tra-sen-vang',
    url: 'https://www.highlandscoffee.com.vn/vnt_upload/product/01_2026/TSV_SEN.jpg',
    out: 'e:/HTML/tra/public/teas/tra-sen-vang.png',
    needRemoveBg: true,
  },
  {
    name: 'Trà Sữa Trân Châu Hoàng Gia',
    id: 'tra-sua-tran-chau',
    url: 'https://gongcha.com.vn/wp-content/uploads/2018/02/Tr%C3%A0-s%E1%BB%AFa-Tr%C3%A2n-ch%C3%A2u-%C4%91en-1.png',
    out: 'e:/HTML/tra/public/teas/tra-sua-tran-chau.png',
    needRemoveBg: true,
  },
  {
    name: 'Trà Sữa Khoai Môn Tươi Dẻo',
    id: 'tra-sua-khoai-mon',
    url: 'https://gongcha.com.vn/wp-content/uploads/2025/10/TRA-SUA-KHOAI-MON.png',
    out: 'e:/HTML/tra/public/teas/tra-sua-khoai-mon.png',
    needRemoveBg: true,
  },
  {
    name: 'Trà Sữa Ô Long Nướng Khói',
    id: 'tra-sua-o-long-nuong',
    url: 'https://gongcha.com.vn/wp-content/uploads/2018/02/Tr%C3%A0-s%E1%BB%AFa-Oolong-2.png',
    out: 'e:/HTML/tra/public/teas/tra-sua-o-long-nuong.png',
    needRemoveBg: true,
  },
  {
    name: 'Trà Sữa Matcha Uji Nhật Bản',
    id: 'tra-sua-matcha',
    url: 'https://gongcha.com.vn/wp-content/uploads/2018/02/Tr%C3%A0-s%E1%BB%AFa-tr%C3%A0-xanh-1.png',
    out: 'e:/HTML/tra/public/teas/tra-sua-matcha.png',
    needRemoveBg: true,
  },
  {
    name: 'Trà Sữa Thái Đỏ Kem Cheese',
    id: 'tra-sua-thai-do',
    url: 'https://gongcha.com.vn/wp-content/uploads/2018/02/Tr%C3%A0-s%E1%BB%AFa-Hokkaido-2.png',
    out: 'e:/HTML/tra/public/teas/tra-sua-thai-do.png',
    needRemoveBg: true,
  },
  {
    name: 'Trà Sữa Lài Sữa Tươi Kem Trứng',
    id: 'tra-sua-lai-kem-trung',
    url: 'https://s3-hcmc02.higiocloud.vn/images/2026/03/ts-lai100-20260312081917.jpg',
    out: 'e:/HTML/tra/public/teas/tra-sua-lai-kem-trung.png',
    needRemoveBg: true,
  },
  {
    name: 'Trà Đào Cam Sả Hoàng Gia',
    id: 'tra-dao-cam-sa',
    url: 'https://s3-hcmc02.higiocloud.vn/images/2026/03/tra-dao100-20260312043430.jpg',
    out: 'e:/HTML/tra/public/teas/tra-dao-cam-sa.png',
    needRemoveBg: true,
  },
  {
    name: 'Trà Nhài Vải Thanh Mát',
    id: 'tra-nhai-vai-thanh-mat',
    url: 'https://s3-hcmc02.higiocloud.vn/images/2026/03/tra-vai-lai100-20260312081006.jpg',
    out: 'e:/HTML/tra/public/teas/tra-nhai-vai-thanh-mat.png',
    needRemoveBg: true,
  }
];

// Hàm tách nền trắng / gần trắng với BFS Flood Fill
async function removeWhiteBackground(buf) {
  const image = sharp(buf);
  const metadata = await image.metadata();
  const { width, height } = metadata;

  const raw = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const data = raw.data;

  const visited = new Uint8Array(width * height);
  const queue = [];

  // Thêm tất cả điểm ảnh ở 4 cạnh biên vào hàng đợi
  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    queue.push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const idx = y * width + x;

    if (visited[idx]) continue;
    visited[idx] = 1;

    const p = idx * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];

    const brightness = (r + g + b) / 3;
    const colorDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));

    // Nền trắng hoặc xám nhạt ở ngoài ly
    if (brightness > 230 && colorDiff < 25) {
      data[p + 3] = 0; // Trong suốt hoàn toàn

      if (x > 0 && !visited[idx - 1]) queue.push(x - 1, y);
      if (x < width - 1 && !visited[idx + 1]) queue.push(x + 1, y);
      if (y > 0 && !visited[idx - width]) queue.push(x, y - 1);
      if (y < height - 1 && !visited[idx + width]) queue.push(x, y + 1);
    } else if (brightness > 210 && colorDiff < 30) {
      // Làm mịn rìa viền (antialiasing)
      const alphaFactor = Math.max(0, (230 - brightness) / 20);
      data[p + 3] = Math.round(255 * alphaFactor);
    }
  }

  return sharp(data, {
    raw: { width, height, channels: 4 }
  })
  .trim() // Tự động crop sát ly nước
  .resize(800, 1100, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ quality: 95, compressionLevel: 8 })
  .toBuffer();
}

async function run() {
  console.log('=== BẮT ĐẦU TẢI & TÁCH NỀN ẢNH THẬT CHO TỪNG LOẠI TRÀ ===');
  for (const item of REAL_IMAGES) {
    try {
      console.log(`Đang tải: ${item.name} (${item.url})...`);
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!res.ok) {
        console.warn(`Lỗi HTTP ${res.status} khi tải ${item.name}`);
        continue;
      }
      const rawBuf = Buffer.from(await res.arrayBuffer());
      const processedPng = await removeWhiteBackground(rawBuf);
      fs.writeFileSync(item.out, processedPng);
      console.log(`✓ ĐÃ TÁCH NỀN THÀNH CÔNG: ${item.out}`);
    } catch (e) {
      console.error(`Lỗi xử lý ${item.name}:`, e.message);
    }
  }
}

run();
