import React, { useState } from 'react';
import { X, QrCode, Printer, ExternalLink, Copy, Check } from 'lucide-react';
import { playClickSound, playSuccessSound } from '../utils/audio';
import { useOrders } from '../context/OrderContext';

interface TableQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateScan: (tableId: string) => void;
}

export const TableQrModal: React.FC<TableQrModalProps> = ({
  isOpen,
  onClose,
  onSimulateScan,
}) => {
  const { allTablesList } = useOrders();
  const tableList = allTablesList && allTablesList.length > 0
    ? allTablesList
    : Array.from({ length: 12 }, (_, i) => `Bàn ${String(i + 1).padStart(2, '0')}`);
  const [selectedTable, setSelectedTable] = useState<string>(tableList[0] || 'Bàn 01');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Base URL for the QR
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:5173';
  const tableUrl = `${origin}/?table=${encodeURIComponent(selectedTable)}`;

  // SVG QR Code generator (clean dynamic QR visual)
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(tableUrl)}&bgcolor=FAF7F2&color=322821&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tableUrl);
    setCopied(true);
    playClickSound(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = () => {
    playSuccessSound(true);
    onSimulateScan(selectedTable);
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 border border-[#E8E1D2] text-[#222B25] max-h-[90vh] overflow-y-auto">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF7F2] text-[#69776E] hover:bg-[#EAE3D2] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tiêu đề */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF3EF] text-[#164E3D] flex items-center justify-center mx-auto mb-2 shadow-sm">
            <QrCode className="w-6 h-6 text-[#164E3D]" />
          </div>
          <h3 className="font-display font-bold text-2xl text-[#164E3D]">
            Mã QR Đặt Món Thông Minh Tại Bàn
          </h3>
          <p className="text-xs text-[#6B7870] mt-1 max-w-lg mx-auto">
            Dán mã QR này trên mặt bàn. Khách chỉ cần quét mã bằng Zalo/Camera, web tự động lưu số bàn, khách chọn trà và bấm <strong>Gọi Món (Thanh toán sau tại quầy)</strong>.
          </p>
        </div>

        {/* Danh sách 12 bàn để chọn xem QR */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#35423A] mb-2 text-center">
            Chọn Bàn Cần Xem & In Mã QR:
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
            {tableList.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedTable(t);
                  playClickSound(true);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedTable === t
                    ? 'bg-[#164E3D] text-white shadow-sm'
                    : 'bg-[#FAF7F2] border border-[#DDD6C8] text-[#55635B] hover:bg-[#EAE3D2]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* KHUNG TEM MÃ QR CHUẨN DÁN MICA TẠI QUÁN */}
        <div className="bg-[#FAF7F2] border-2 border-dashed border-[#322821]/30 rounded-3xl p-6 text-center max-w-sm mx-auto shadow-inner">
          <div className="flex items-center justify-center gap-2 mb-2 text-[#322821] font-bold text-sm">
            <span>🍃 THƯỢNG • QUÉT GỌI MÓN</span>
          </div>

          <div className="font-display font-extrabold text-3xl text-[#322821] tracking-tight">
            {selectedTable}
          </div>
          <div className="text-[11px] text-[#69776E] mb-3">
            Quét mã chọn món - Thanh toán sau khi dùng bữa
          </div>

          {/* Hình QR Image */}
          <div className="w-52 h-52 mx-auto bg-white p-3 rounded-2xl border border-[#DDD6C8] shadow-sm flex items-center justify-center">
            <img
              src={qrSvgUrl}
              alt={`Mã QR ${selectedTable}`}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-[11px] text-[#7A8780] font-mono mt-3 break-all bg-white/80 p-2 rounded-xl border border-[#E2DAD0]">
            {tableUrl}
          </div>
        </div>

        {/* Các nút hành động */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleSimulate}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#322821] hover:bg-[#211A15] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#322821]/25 transition-all"
          >
            <ExternalLink className="w-4 h-4 text-[#F4A261]" />
            <span>Giả Lập Quét {selectedTable} ➔ Vào Chọn Món</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl border border-[#D5CDBD] hover:bg-[#FAF7F2] text-[#425047] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Đã chép link' : 'Sao chép link'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl border border-[#D5CDBD] hover:bg-[#FAF7F2] text-[#425047] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            title="In tem QR dán bàn"
          >
            <Printer className="w-4 h-4" />
            <span>In Tem QR</span>
          </button>
        </div>

      </div>
    </div>
  );
};
