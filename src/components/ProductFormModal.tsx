import React, { useState, useEffect } from 'react';
import { X, Leaf, Image as ImageIcon, Save } from 'lucide-react';
import type { FruitTeaItem } from '../types/tea';
import { playSuccessSound } from '../utils/audio';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: FruitTeaItem) => void;
  initialProduct?: FruitTeaItem | null;
}

const DEFAULT_TEA_IMAGES = [
  { label: 'Trà Sen Vàng Củ Năng', url: '/teas/tra-sen-vang.png' },
  { label: 'Trà Sữa Trân Châu', url: '/teas/tra-sua-tran-chau.png' },
  { label: 'Trà Sữa Ô Long Nướng', url: '/teas/tra-sua-o-long-nuong.png' },
  { label: 'Trà Sữa Matcha Uji', url: '/teas/tra-sua-matcha.png' },
  { label: 'Trà Sữa Khoai Môn', url: '/teas/tra-sua-khoai-mon.png' },
  { label: 'Trà Sữa Thái Đỏ Cheese', url: '/teas/tra-sua-thai-do.png' },
  { label: 'Trà Sữa Kem Trứng Cháy', url: '/teas/tra-sua-lai-kem-trung.png' },
  { label: 'Trà Đào Cam Sả', url: '/teas/tra-dao-cam-sa.png' },
  { label: 'Trà Dâu Tây Đà Lạt', url: '/teas/tra-dau-tay-nhiet-doi.png' },
  { label: 'Trà Xoài Cát Chanh Leo', url: '/teas/tra-xoai-chanh-leo.png' },
  { label: 'Trà Cam Vàng Mật Ong', url: '/teas/tra-cam-vang-mat-ong.png' },
  { label: 'Trà Ổi Hồng Ruby', url: '/teas/tra-oi-hong-ruby.png' },
  { label: 'Trà Chanh Dây Kim Quất', url: '/teas/tra-chanh-day-kim-quat.png' },
  { label: 'Trà Dâu Tằm Lạc Thần', url: '/teas/tra-dau-tam-lac-than.png' },
  { label: 'Trà Trái Cây Tứ Quý', url: '/teas/tra-trai-cay-tu-quy.png' },
  { label: 'Trà Mãng Cầu Tươi', url: '/teas/tra-mang-cau-tuoi.png' },
  { label: 'Trà Bưởi Hồng Ép', url: '/teas/tra-buoi-hong-ep.png' },
  { label: 'Trà Thanh Long Đỏ', url: '/teas/tra-thanh-long-do.png' },
  { label: 'Trà Dưa Lưới Hoàng Kim', url: '/teas/tra-dua-luoi-hoang-kim.png' },
  { label: 'Trà Ô Long Hạt Sen', url: '/teas/tra-oolong-hat-sen.png' },
  { label: 'Trà Nhài Vải Băng Tuyết', url: '/teas/tra-nhai-vai-thanh-mat.png' },
  { label: 'Trà Tuyết Việt Quất', url: '/teas/tra-viet-quat-tuyet.png' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const isEditing = Boolean(initialProduct);

  const [name, setName] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [price, setPrice] = useState<number>(49000);
  const [originalPrice, setOriginalPrice] = useState<number>(59000);
  const [category, setCategory] = useState<'signature' | 'fruit-tea' | 'milk-tea' | 'smoothie'>('fruit-tea');
  const [image, setImage] = useState<string>('/teas/tra-dao-cam-sa.png');
  const [bg, setBg] = useState<string>('#D95D39');
  const [panel, setPanel] = useState<string>('#F18F01');
  const [calories, setCalories] = useState<number>(140);
  const [description, setDescription] = useState<string>('');
  const [ingredientsStr, setIngredientsStr] = useState<string>('Trà xanh đặc sản, Trái cây tươi, Đường mía');
  const [flavorNotesStr, setFlavorNotesStr] = useState<string>('Thơm mát, Ngọt thanh, Chua dịu');
  const [isBestSeller, setIsBestSeller] = useState<boolean>(false);
  const [isNew, setIsNew] = useState<boolean>(false);
  const [badge, setBadge] = useState<string>('');

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setSubtitle(initialProduct.subtitle || '');
      setTagline(initialProduct.tagline || '');
      setPrice(initialProduct.price);
      setOriginalPrice(initialProduct.originalPrice || initialProduct.price + 10000);
      setCategory(initialProduct.category);
      setImage(initialProduct.image);
      setBg(initialProduct.bg || '#D95D39');
      setPanel(initialProduct.panel || '#F18F01');
      setCalories(initialProduct.calories || 140);
      setDescription(initialProduct.description || '');
      setIngredientsStr(initialProduct.ingredients ? initialProduct.ingredients.join(', ') : '');
      setFlavorNotesStr(initialProduct.flavorNotes ? initialProduct.flavorNotes.join(', ') : '');
      setIsBestSeller(Boolean(initialProduct.isBestSeller));
      setIsNew(Boolean(initialProduct.isNew));
      setBadge(initialProduct.badge || '');
    } else {
      // Giá trị mặc định khi tạo mới
      setName('');
      setSubtitle('');
      setTagline('');
      setPrice(49000);
      setOriginalPrice(59000);
      setCategory('fruit-tea');
      setImage('/teas/tra-dao-cam-sa.png');
      setBg('#D95D39');
      setPanel('#F18F01');
      setCalories(140);
      setDescription('');
      setIngredientsStr('Lục trà hoa lài, Trái cây tươi tự nhiên, Đường phèn');
      setFlavorNotesStr('Hương hoa lài thơm ngát, Vị quả chua ngọt');
      setIsBestSeller(false);
      setIsNew(true);
      setBadge('MÓN MỚI');
    }
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const productData: FruitTeaItem = {
      id: initialProduct?.id || `tea-${Date.now()}`,
      name: name.trim(),
      subtitle: subtitle.trim() || name.toUpperCase(),
      tagline: tagline.trim() || name,
      price: Number(price),
      originalPrice: Number(originalPrice),
      category,
      image: image.trim() || '/teas/tra-dao-cam-sa.png',
      bg,
      panel,
      description: description.trim() || `${name} được chiết xuất từ cốt trà tươi thơm lừng quyện cùng hoa quả mọng nước.`,
      ingredients: ingredientsStr.split(',').map((s) => s.trim()).filter(Boolean),
      calories: Number(calories) || 140,
      sweetnessDefault: 70,
      iceDefault: 70,
      isBestSeller,
      isNew,
      badge: badge.trim() || (isBestSeller ? 'BEST SELLER' : isNew ? 'MỚI' : undefined),
      flavorNotes: flavorNotesStr.split(',').map((s) => s.trim()).filter(Boolean),
    };

    playSuccessSound(true);
    onSave(productData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 border border-[#E8E1D2] text-[#222B25] max-h-[92vh] overflow-y-auto">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF7F2] text-[#69776E] hover:bg-[#EAE3D2] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tiêu đề */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F5EFE9] text-[#322821] flex items-center justify-center shadow-inner">
            <Leaf className="w-6 h-6 text-[#D95829]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-[#322821]">
              {isEditing ? 'Chỉnh Sửa Thông Tin Sản Phẩm' : 'Thêm Món Mới Vào Menu'}
            </h3>
            <p className="text-xs text-[#6F7D74] mt-0.5">
              Cập nhật tức thì trên cả trang chủ khách hàng và màn hình bán hàng POS
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên món & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1">
                Tên Món Trà (Tiếng Việt) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Trà Bưởi Hồng Mật Ong"
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-sm font-semibold text-[#322821] focus:outline-none focus:border-[#322821]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1">
                Tên Phụ / Tiếng Anh
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="VD: PINK GRAPEFRUIT TEA"
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-sm font-semibold text-[#322821] focus:outline-none focus:border-[#322821]"
              />
            </div>
          </div>

          {/* Phân loại & Giá bán */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1">
                Danh Mục
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-sm font-semibold text-[#322821] focus:outline-none focus:border-[#322821]"
              >
                <option value="signature">Món Signature (Đặc Sắc)</option>
                <option value="fruit-tea">Trà Trái Cây Tươi</option>
                <option value="milk-tea">Trà Sữa Mộc</option>
                <option value="smoothie">Sinh Tố & Đá Xay</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1">
                Giá Bán (VNĐ) *
              </label>
              <input
                type="number"
                step="1000"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-sm font-bold text-[#D95829] focus:outline-none focus:border-[#322821]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1">
                Giá Gốc (Gạch ngang)
              </label>
              <input
                type="number"
                step="1000"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-sm text-[#738279] focus:outline-none focus:border-[#322821]"
              />
            </div>
          </div>

          {/* Tagline & Lượng calo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#35423A] mb-1">
                Câu Giới Thiệu Ngắn (Tagline)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="VD: Vị bưởi hồng thơm nức, chua thanh mật ong rừng"
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-sm text-[#322821] focus:outline-none focus:border-[#322821]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1">
                Lượng Calo (kcal)
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-sm text-[#322821] focus:outline-none focus:border-[#322821]"
              />
            </div>
          </div>

          {/* Chọn ảnh sản phẩm */}
          <div>
            <label className="block text-xs font-bold text-[#35423A] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#322821]" />
                <span>Hình Ảnh Ly Trà Đã Tách Nền:</span>
              </span>
              <span className="text-[11px] text-[#7A8780] font-normal">Chọn từ thư viện có sẵn hoặc nhập link</span>
            </label>

            {/* Thư viện ảnh có sẵn */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-2.5">
              {DEFAULT_TEA_IMAGES.map((img) => (
                <button
                  type="button"
                  key={img.url}
                  onClick={() => setImage(img.url)}
                  className={`p-1 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    image === img.url
                      ? 'border-[#322821] bg-[#F5EFE9] ring-2 ring-[#322821]/30'
                      : 'border-[#EAE3D2] bg-[#FAF7F2] hover:bg-[#F0EAE0]'
                  }`}
                  title={img.label}
                >
                  <img src={img.url} alt={img.label} className="w-10 h-10 object-contain" />
                </button>
              ))}
            </div>

            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Hoặc dán URL ảnh /teas/..."
              className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-1.5 text-xs text-[#55635B] focus:outline-none focus:border-[#322821]"
            />
          </div>

          {/* Thành phần & Hương vị */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1">
                Thành Phần (cách nhau bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={ingredientsStr}
                onChange={(e) => setIngredientsStr(e.target.value)}
                placeholder="VD: Trà Ô Long, Bưởi hồng, Mật ong hoa rừng"
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-xs text-[#322821] focus:outline-none focus:border-[#322821]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#35423A] mb-1">
                Hương Vị Đặc Trưng (cách nhau dấu phẩy)
              </label>
              <input
                type="text"
                value={flavorNotesStr}
                onChange={(e) => setFlavorNotesStr(e.target.value)}
                placeholder="VD: Chua nhẹ, Ngọt mát, Thơm nồng"
                className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-xs text-[#322821] focus:outline-none focus:border-[#322821]"
              />
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label className="block text-xs font-bold text-[#35423A] mb-1">
              Mô Tả Sản Phẩm
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Hương vị trà bưởi hồng tươi mát nguyên chất kết hợp cùng mật ong hoa nhãn..."
              className="w-full bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3.5 py-2 text-xs text-[#322821] focus:outline-none focus:border-[#322821]"
            />
          </div>

          {/* Tags & Huy hiệu */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#37453D]">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="w-4 h-4 rounded text-[#322821] focus:ring-0"
              />
              <span>Gắn nhãn Best Seller</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#37453D]">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 rounded text-[#322821] focus:ring-0"
              />
              <span>Gắn nhãn Món Mới</span>
            </label>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-bold text-[#37453D]">Huy hiệu nổi bật:</span>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="VD: MÙA BƯỞI HỒNG"
                className="bg-[#FAF7F2] border border-[#DDD6C8] rounded-xl px-3 py-1 text-xs text-[#D95829] font-bold w-40"
              />
            </div>
          </div>

          {/* Nút lưu */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#F0EAE0]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#DDD6C8] text-xs font-bold text-[#627068] hover:bg-[#F3EDE2] transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#322821] hover:bg-[#211A15] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-emerald-300" />
              <span>{isEditing ? 'Lưu Thay Đổi' : 'Thêm Vào Menu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
