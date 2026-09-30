import React, { useState, useEffect } from 'react';
import { X, Armchair, Users, FileText, Save } from 'lucide-react';
import type { DiningTable } from '../types/tea';
import { playSuccessSound } from '../utils/audio';

interface TableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (table: DiningTable) => void;
  initialTable?: DiningTable | null;
  existingTables?: DiningTable[];
}

const PRESET_ZONES = [
  'Tầng 1 (Trong nhà)',
  'Tầng 2 (Ban công)',
  'Sân Vườn Thoáng Mát',
  'Phòng VIP Riêng Tư',
  'Khu Vực Quầy Bar',
  'Khác',
];

export const TableFormModal: React.FC<TableFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTable,
  existingTables = [],
}) => {
  const isEditing = Boolean(initialTable);

  const [name, setName] = useState<string>('');
  const [zone, setZone] = useState<string>('Tầng 1 (Trong nhà)');
  const [customZone, setCustomZone] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(4);
  const [notes, setNotes] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (initialTable) {
      setName(initialTable.name);
      setCapacity(initialTable.capacity || 4);
      setNotes(initialTable.notes || '');
      setIsActive(initialTable.isActive !== false);

      const tableZone = initialTable.zone || 'Tầng 1 (Trong nhà)';
      if (PRESET_ZONES.includes(tableZone)) {
        setZone(tableZone);
        setCustomZone('');
      } else {
        setZone('Khác');
        setCustomZone(tableZone);
      }
    } else {
      // Đề xuất tên bàn tiếp theo dựa trên số lượng bàn hiện có
      const count = existingTables.length + 1;
      const suggestedName = `Bàn ${String(count).padStart(2, '0')}`;
      setName(suggestedName);
      setZone('Tầng 1 (Trong nhà)');
      setCustomZone('');
      setCapacity(4);
      setNotes('');
      setIsActive(true);
    }
  }, [initialTable, isOpen, existingTables.length]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      alert('Vui lòng nhập tên bàn!');
      return;
    }

    // Kiểm tra tên bàn trùng lặp
    const duplicate = existingTables.find(
      (t) => t.name.toLowerCase() === cleanName.toLowerCase() && t.id !== initialTable?.id
    );
    if (duplicate) {
      alert(`Tên bàn "${cleanName}" đã tồn tại. Vui lòng đặt tên khác!`);
      return;
    }

    const finalZone = zone === 'Khác' && customZone.trim() ? customZone.trim() : zone;

    const tableData: DiningTable = {
      id: initialTable ? initialTable.id : `tbl-${Date.now().toString().slice(-4)}`,
      name: cleanName,
      zone: finalZone,
      capacity: Number(capacity) || 4,
      notes: notes.trim(),
      isActive: isActive,
    };

    onSave(tableData);
    playSuccessSound();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-emerald-100 flex flex-col my-8 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
              <Armchair className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold tracking-wide">
                {isEditing ? 'Chỉnh Sửa Thông Tin Bàn' : 'Thêm Bàn Mới Vào Sơ Đồ'}
              </h2>
              <p className="text-xs text-emerald-200/80">
                {isEditing ? `Mã: ${initialTable?.id} • ${initialTable?.name}` : 'Thiết lập vị trí, số chỗ ngồi và khu vực'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tên Bàn */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Tên Bàn / Số Bàn <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Armchair className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="VD: Bàn 13, Bàn VIP 01, Bàn Sân Vườn 02..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold text-gray-800 transition-all text-sm"
              />
            </div>
          </div>

          {/* Sức Chứa / Số Chỗ Ngồi */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Sức Chứa (Số Ghế Ngồi) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Users className="w-4 h-4" />
              </span>
              <input
                type="number"
                required
                min={1}
                max={50}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold text-emerald-800 transition-all text-sm"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[2, 4, 6, 8, 10].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setCapacity(num)}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-lg border transition-all ${
                    capacity === num
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  {num} ghế
                </button>
              ))}
            </div>
          </div>

          {/* Khu Vực / Tầng */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Khu Vực Phân Bổ (Zone)
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRESET_ZONES.map((z) => (
                <button
                  type="button"
                  key={z}
                  onClick={() => setZone(z)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    zone === z
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold ring-1 ring-emerald-600 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>

            {zone === 'Khác' && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Nhập tên khu vực tự chọn (VD: Tầng Lửng, Góc Check-in)..."
                  value={customZone}
                  onChange={(e) => setCustomZone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm"
                />
              </div>
            )}
          </div>

          {/* Ghi chú / Tiện ích bàn */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Ghi Chú Vị Trí / Tiện Ích
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">
                <FileText className="w-4 h-4" />
              </span>
              <textarea
                rows={2}
                placeholder="VD: Bàn cạnh cửa sổ lãng mạn, có ổ cắm laptop, phù hợp họp nhóm..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm text-gray-800"
              />
            </div>
          </div>

          {/* Kích hoạt bàn */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-gray-800">
                Trạng Thái Hoạt Động
              </span>
              <span className="text-xs text-gray-500">
                {isActive ? 'Đang mở cho khách ngồi & quét mã QR' : 'Tạm dừng sử dụng / đang sửa chữa'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isActive ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-800 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Cập Nhật Bàn' : 'Lưu Bàn Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
