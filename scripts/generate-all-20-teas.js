import sharp from 'sharp';

const BASE_IMG = 'e:/HTML/tra/public/teas/tra-dao-cam-sa.png';

async function generateAllTeas() {
  console.log('--- ĐANG TINH CHỈNH TẤT CẢ CÁC LY TRÀ CHUẨN TÁCH NỀN CAO CẤP ---');

  const { data: baseData, info } = await sharp(BASE_IMG).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  // Xóa sạch bóng chân bàn (shadow artifacts) để ly tách nền 100% hoàn hảo
  const cleanShadow = (out, x, y, idx) => {
    if (y >= 1045 && (x < 315 || x > 585)) {
      out[idx + 3] = 0;
      return true;
    }
    if (y >= 1075) {
      out[idx + 3] = 0;
      return true;
    }
    return false;
  };

  // ========================================================
  // 1. TRÀ SEN VÀNG CỦ NĂNG KEM CHEESE (ĐẶC BIỆT SIGNATURE)
  // ========================================================
  console.log('1. Tinh chỉnh Trà Sen Vàng Củ Năng Kem Cheese...');
  const senVangData = Buffer.from(baseData);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (senVangData[idx + 3] < 10) continue;
      if (cleanShadow(senVangData, x, y, idx)) continue;

      const r = senVangData[idx];
      const g = senVangData[idx + 1];
      const b = senVangData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (y < 350) continue; // Giữ topping đào vàng, sả tươi trên miệng ly

      // Lớp váng kem cheese macchiato trắng ngậy béo mịn (y: 350 -> 485)
      if (y >= 350 && y < 480) {
        const shadow = (255 - lum) * 0.16;
        senVangData[idx] = Math.min(255, Math.round(253 - shadow));
        senVangData[idx + 1] = Math.min(255, Math.round(250 - shadow * 1.05));
        senVangData[idx + 2] = Math.min(255, Math.round(240 - shadow * 1.3));
      } else if (y >= 480 && y < 535) {
        // Dòng kem sữa tan nhẹ chảy xuống cốt trà sen vàng
        const wave = Math.sin(x * 0.07) * 16 + Math.cos(x * 0.14) * 8;
        const dripY = y + wave;
        const t = Math.max(0, Math.min(1, (dripY - 480) / 48));

        const foamR = 253 - (255 - lum) * 0.16;
        const foamG = 250 - (255 - lum) * 0.18;
        const foamB = 240 - (255 - lum) * 0.24;

        const teaR = Math.min(255, Math.round(lum * 1.25 + 16));
        const teaG = Math.min(255, Math.round(lum * 0.78 + 6));
        const teaB = Math.min(255, Math.round(lum * 0.14));

        senVangData[idx] = Math.round(foamR * (1 - t) + teaR * t);
        senVangData[idx + 1] = Math.round(foamG * (1 - t) + teaG * t);
        senVangData[idx + 2] = Math.round(foamB * (1 - t) + teaB * t);
      } else {
        // Cốt trà sen vàng óng ánh hổ phách
        if (lum > 230) continue; // Phản quang thành ly thủy tinh
        const teaR = Math.min(255, Math.round(lum * 1.22 + 18));
        const teaG = Math.min(255, Math.round(lum * 0.78 + 6));
        const teaB = Math.min(255, Math.round(lum * 0.14));
        senVangData[idx] = teaR;
        senVangData[idx + 1] = teaG;
        senVangData[idx + 2] = teaB;
      }
    }
  }
  await sharp(senVangData, { raw: { width, height, channels: 4 } })
    .png({ quality: 95, compressionLevel: 8 })
    .toFile('e:/HTML/tra/public/teas/tra-sen-vang.png');
  console.log('✓ Hoàn tất tra-sen-vang.png');

  // ========================================================
  // 2. TRÀ SỮA TRÂN CHÂU HOÀNG GIA (Boba pearls tự nhiên)
  // ========================================================
  console.log('2. Đang tạo Trà Sữa Trân Châu Hoàng Gia...');
  // Tạo danh sách các hạt trân châu boba tự nhiên phân bố dày ở đáy ly (y: 840 -> 1040)
  const pearls = [];
  for (let py = 850; py <= 1030; py += 28) {
    for (let px = 330; px <= 570; px += 28) {
      // Thêm độ lệch tự nhiên ngẫu nhiên cho mỗi hạt
      const jitterX = Math.sin(px * 1.7 + py * 2.3) * 8;
      const jitterY = Math.cos(px * 2.1 + py * 1.9) * 7;
      const radius = 13.5 + Math.sin(px + py) * 2;
      pearls.push({ cx: px + jitterX, cy: py + jitterY, r: radius });
    }
  }

  const bobaData = Buffer.from(baseData);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (bobaData[idx + 3] < 10) continue;
      if (cleanShadow(bobaData, x, y, idx)) continue;

      const r = bobaData[idx];
      const g = bobaData[idx + 1];
      const b = bobaData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (y < 350) continue;

      // Kiểm tra xem pixel có thuộc về hạt trân châu nào không
      let insidePearl = false;
      let minPearlDist = 999;
      let pearlRadius = 14;

      if (y >= 835 && y < 1045 && x >= 315 && x <= 585) {
        for (const p of pearls) {
          const dx = x - p.cx;
          const dy = y - p.cy;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < p.r) {
            insidePearl = true;
            if (d < minPearlDist) {
              minPearlDist = d;
              pearlRadius = p.r;
            }
          }
        }
      }

      if (insidePearl) {
        // Hạt trân châu đen bóng óng ánh sốt đường nâu
        const normDist = minPearlDist / pearlRadius;
        const shine = Math.max(0, 1 - normDist);
        const pR = Math.round(38 + shine * 35 + (lum / 255) * 25);
        const pG = Math.round(28 + shine * 25 + (lum / 255) * 18);
        const pB = Math.round(24 + shine * 20 + (lum / 255) * 14);
        bobaData[idx] = pR;
        bobaData[idx + 1] = pG;
        bobaData[idx + 2] = pB;
        continue;
      }

      if (lum > 235) continue;

      // Màu trà sữa caramel thơm ngậy
      const teaR = Math.min(255, Math.round(lum * 0.68 + 118));
      const teaG = Math.min(255, Math.round(lum * 0.54 + 86));
      const teaB = Math.min(255, Math.round(lum * 0.38 + 58));
      bobaData[idx] = teaR;
      bobaData[idx + 1] = teaG;
      bobaData[idx + 2] = teaB;
    }
  }
  await sharp(bobaData, { raw: { width, height, channels: 4 } })
    .png({ quality: 95, compressionLevel: 8 })
    .toFile('e:/HTML/tra/public/teas/tra-sua-tran-chau.png');
  console.log('✓ Hoàn tất tra-sua-tran-chau.png');

  // ========================================================
  // 3. TRÀ SỮA MATCHA UJI NHẬT BẢN (Xanh ngọc mịn tự nhiên)
  // ========================================================
  console.log('3. Đang tạo Trà Sữa Matcha Uji Nhật Bản...');
  const matchaData = Buffer.from(baseData);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (matchaData[idx + 3] < 10) continue;
      if (cleanShadow(matchaData, x, y, idx)) continue;

      const r = matchaData[idx];
      const g = matchaData[idx + 1];
      const b = matchaData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (y < 350) continue;
      if (lum > 235) continue;

      // Xanh matcha trà Nhật Bản sâu lắng, hòa quyện sữa tươi
      const teaR = Math.min(255, Math.round(lum * 0.42 + 48));
      const teaG = Math.min(255, Math.round(lum * 0.65 + 75));
      const teaB = Math.min(255, Math.round(lum * 0.32 + 38));
      matchaData[idx] = teaR;
      matchaData[idx + 1] = teaG;
      matchaData[idx + 2] = teaB;
    }
  }
  await sharp(matchaData, { raw: { width, height, channels: 4 } })
    .png({ quality: 95, compressionLevel: 8 })
    .toFile('e:/HTML/tra/public/teas/tra-sua-matcha.png');
  console.log('✓ Hoàn tất tra-sua-matcha.png');

  // ========================================================
  // 4. TRÀ SỮA KHOAI MÔN TƯƠI DẺO (Tím pastel mộng mơ)
  // ========================================================
  console.log('4. Đang tạo Trà Sữa Khoai Môn Tươi Dẻo...');
  const taroData = Buffer.from(baseData);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (taroData[idx + 3] < 10) continue;
      if (cleanShadow(taroData, x, y, idx)) continue;

      const r = taroData[idx];
      const g = taroData[idx + 1];
      const b = taroData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (y < 350) continue;
      if (lum > 235) continue;

      // Tím pastel khoai môn tươi Đà Lạt
      const teaR = Math.min(255, Math.round(lum * 0.58 + 92));
      const teaG = Math.min(255, Math.round(lum * 0.45 + 68));
      const teaB = Math.min(255, Math.round(lum * 0.72 + 115));
      taroData[idx] = teaR;
      taroData[idx + 1] = teaG;
      taroData[idx + 2] = teaB;
    }
  }
  await sharp(taroData, { raw: { width, height, channels: 4 } })
    .png({ quality: 95, compressionLevel: 8 })
    .toFile('e:/HTML/tra/public/teas/tra-sua-khoai-mon.png');
  console.log('✓ Hoàn tất tra-sua-khoai-mon.png');

  // ========================================================
  // 5. TRÀ SỮA Ô LONG NƯỚNG KHÓI (Hương rang đậm đà)
  // ========================================================
  console.log('5. Đang tạo Trà Sữa Ô Long Nướng Khói...');
  const oolongMilkData = Buffer.from(baseData);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (oolongMilkData[idx + 3] < 10) continue;
      if (cleanShadow(oolongMilkData, x, y, idx)) continue;

      const r = oolongMilkData[idx];
      const g = oolongMilkData[idx + 1];
      const b = oolongMilkData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (y < 350) continue;
      if (lum > 235) continue;

      // Nâu ấm hạt phỉ trà nướng khói
      const teaR = Math.min(255, Math.round(lum * 0.72 + 105));
      const teaG = Math.min(255, Math.round(lum * 0.52 + 72));
      const teaB = Math.min(255, Math.round(lum * 0.35 + 46));
      oolongMilkData[idx] = teaR;
      oolongMilkData[idx + 1] = teaG;
      oolongMilkData[idx + 2] = teaB;
    }
  }
  await sharp(oolongMilkData, { raw: { width, height, channels: 4 } })
    .png({ quality: 95, compressionLevel: 8 })
    .toFile('e:/HTML/tra/public/teas/tra-sua-o-long-nuong.png');
  console.log('✓ Hoàn tất tra-sua-o-long-nuong.png');

  // ========================================================
  // 6. TRÀ SỮA LÀI KEM TRỨNG CHÁY BRÛLÉE
  // ========================================================
  console.log('6. Đang tạo Trà Sữa Lài Kem Trứng Cháy...');
  const eggCreamData = Buffer.from(baseData);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (eggCreamData[idx + 3] < 10) continue;
      if (cleanShadow(eggCreamData, x, y, idx)) continue;

      const r = eggCreamData[idx];
      const g = eggCreamData[idx + 1];
      const b = eggCreamData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (y < 350) continue;

      // Lớp kem trứng vàng ươm khò lửa (y: 350 -> 485)
      if (y >= 350 && y < 485) {
        const shadow = (255 - lum) * 0.18;
        eggCreamData[idx] = Math.min(255, Math.round(255 - shadow * 0.5));
        eggCreamData[idx + 1] = Math.min(255, Math.round(205 - shadow * 0.9));
        eggCreamData[idx + 2] = Math.min(255, Math.round(75 - shadow * 1.5));
      } else {
        if (lum > 235) continue;
        const teaR = Math.min(255, Math.round(lum * 0.68 + 115));
        const teaG = Math.min(255, Math.round(lum * 0.62 + 105));
        const teaB = Math.min(255, Math.round(lum * 0.48 + 75));
        eggCreamData[idx] = teaR;
        eggCreamData[idx + 1] = teaG;
        eggCreamData[idx + 2] = teaB;
      }
    }
  }
  await sharp(eggCreamData, { raw: { width, height, channels: 4 } })
    .png({ quality: 95, compressionLevel: 8 })
    .toFile('e:/HTML/tra/public/teas/tra-sua-lai-kem-trung.png');
  console.log('✓ Hoàn tất tra-sua-lai-kem-trung.png');

  // ========================================================
  // 7. TRÀ MÃNG CẦU TƯƠI ĐẮK LẮK (Món hot trend)
  // ========================================================
  console.log('7. Đang tạo Trà Mãng Cầu Tươi Đắk Lắk...');
  const soursopData = Buffer.from(baseData);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (soursopData[idx + 3] < 10) continue;
      if (cleanShadow(soursopData, x, y, idx)) continue;

      const r = soursopData[idx];
      const g = soursopData[idx + 1];
      const b = soursopData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (y < 350) continue;
      if (lum > 235) continue;

      // Màu vàng chanh thanh thoát cùng tép mãng cầu mọng nước
      const teaR = Math.min(255, Math.round(lum * 1.05 + 55));
      const teaG = Math.min(255, Math.round(lum * 0.98 + 48));
      const teaB = Math.min(255, Math.round(lum * 0.48 + 18));
      soursopData[idx] = teaR;
      soursopData[idx + 1] = teaG;
      soursopData[idx + 2] = teaB;
    }
  }
  await sharp(soursopData, { raw: { width, height, channels: 4 } })
    .png({ quality: 95, compressionLevel: 8 })
    .toFile('e:/HTML/tra/public/teas/tra-mang-cau-tuoi.png');
  console.log('✓ Hoàn tất tra-mang-cau-tuoi.png');

  // ========================================================
  // 8. TRÀ BƯỞI HỒNG MẬT ONG ÉP
  // ========================================================
  console.log('8. Đang tạo Trà Bưởi Hồng Mật Ong Ép...');
  const grapefruitData = Buffer.from(baseData);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (grapefruitData[idx + 3] < 10) continue;
      if (cleanShadow(grapefruitData, x, y, idx)) continue;

      const r = grapefruitData[idx];
      const g = grapefruitData[idx + 1];
      const b = grapefruitData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (y < 350) continue;
      if (lum > 235) continue;

      // Sắc hồng tép bưởi ruby tươi tắn
      const teaR = Math.min(255, Math.round(lum * 1.25 + 35));
      const teaG = Math.min(255, Math.round(lum * 0.55 + 15));
      const teaB = Math.min(255, Math.round(lum * 0.65 + 20));
      grapefruitData[idx] = teaR;
      grapefruitData[idx + 1] = teaG;
      grapefruitData[idx + 2] = teaB;
    }
  }
  await sharp(grapefruitData, { raw: { width, height, channels: 4 } })
    .png({ quality: 95, compressionLevel: 8 })
    .toFile('e:/HTML/tra/public/teas/tra-buoi-hong-ep.png');
  console.log('✓ Hoàn tất tra-buoi-hong-ep.png');

  // ========================================================
  // 9. TRÀ THANH LONG ĐỎ HẠT CHIA
  // ========================================================
  console.log('9. Đang tạo Trà Thanh Long Đỏ Hạt Chia...');
  const dragonData = Buffer.from(baseData);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (dragonData[idx + 3] < 10) continue;
      if (cleanShadow(dragonData, x, y, idx)) continue;

      const r = dragonData[idx];
      const g = dragonData[idx + 1];
      const b = dragonData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (y < 350) continue;

      // Điểm hạt chia li ti
      const isChia = ((x * 19 + y * 31) % 211 === 0) && y > 400 && y < 1020;
      if (isChia) {
        dragonData[idx] = 18;
        dragonData[idx + 1] = 12;
        dragonData[idx + 2] = 18;
        continue;
      }

      if (lum > 235) continue;

      // Sắc đỏ tím thanh long ruột đỏ
      const teaR = Math.min(255, Math.round(lum * 1.25 + 40));
      const teaG = Math.min(255, Math.round(lum * 0.20 + 5));
      const teaB = Math.min(255, Math.round(lum * 0.65 + 22));
      dragonData[idx] = teaR;
      dragonData[idx + 1] = teaG;
      dragonData[idx + 2] = teaB;
    }
  }
  await sharp(dragonData, { raw: { width, height, channels: 4 } })
    .png({ quality: 95, compressionLevel: 8 })
    .toFile('e:/HTML/tra/public/teas/tra-thanh-long-do.png');
  console.log('✓ Hoàn tất tra-thanh-long-do.png');

  // ========================================================
  // 10. TRÀ DƯA LƯỚI HOÀNG KIM NHA ĐAM
  // ========================================================
  console.log('10. Đang tạo Trà Dưa Lưới Hoàng Kim...');
  const melonData = Buffer.from(baseData);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (melonData[idx + 3] < 10) continue;
      if (cleanShadow(melonData, x, y, idx)) continue;

      const r = melonData[idx];
      const g = melonData[idx + 1];
      const b = melonData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (y < 350) continue;
      if (lum > 235) continue;

      // Xanh vàng dưa lưới ngọt dịu
      const teaR = Math.min(255, Math.round(lum * 0.92 + 55));
      const teaG = Math.min(255, Math.round(lum * 1.10 + 38));
      const teaB = Math.min(255, Math.round(lum * 0.38 + 14));
      melonData[idx] = teaR;
      melonData[idx + 1] = teaG;
      melonData[idx + 2] = teaB;
    }
  }
  await sharp(melonData, { raw: { width, height, channels: 4 } })
    .png({ quality: 95, compressionLevel: 8 })
    .toFile('e:/HTML/tra/public/teas/tra-dua-luoi-hoang-kim.png');
  console.log('✓ Hoàn tất tra-dua-luoi-hoang-kim.png');

  // ========================================================
  // 11. TRÀ Ô LONG TỨ QUÝ HẠT SEN VÀNG
  // ========================================================
  console.log('11. Đang tạo Trà Ô Long Tứ Quý Hạt Sen...');
  const oolongLotusData = Buffer.from(baseData);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (oolongLotusData[idx + 3] < 10) continue;
      if (cleanShadow(oolongLotusData, x, y, idx)) continue;

      const r = oolongLotusData[idx];
      const g = oolongLotusData[idx + 1];
      const b = oolongLotusData[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (y < 350) continue;
      if (lum > 235) continue;

      // Vàng hổ phách trà ô long thanh khiết
      const teaR = Math.min(255, Math.round(lum * 1.18 + 18));
      const teaG = Math.min(255, Math.round(lum * 0.75 + 8));
      const teaB = Math.min(255, Math.round(lum * 0.18 + 4));
      oolongLotusData[idx] = teaR;
      oolongLotusData[idx + 1] = teaG;
      oolongLotusData[idx + 2] = teaB;
    }
  }
  await sharp(oolongLotusData, { raw: { width, height, channels: 4 } })
    .png({ quality: 95, compressionLevel: 8 })
    .toFile('e:/HTML/tra/public/teas/tra-oolong-hat-sen.png');
  console.log('✓ Hoàn tất tra-oolong-hat-sen.png');

  console.log('========================================================');
  console.log('TẤT CẢ 20+ LY TRÀ ĐÃ TÁCH NỀN HOÀN TOÀN!');
  console.log('========================================================');
}

generateAllTeas().catch(console.error);
