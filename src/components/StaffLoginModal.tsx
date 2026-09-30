import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldAlert, Clock, CheckCircle2, UserCheck } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { playClickSound, playSuccessSound } from '../utils/audio';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { loginStaff, clockIn, clockOut } = useOrders();
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'login' | 'attendance'>('login');

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      playClickSound(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4 && modalTab === 'login') {
        verifyAndLogin(nextPin);
      }
    }
  };

  const handleClear = () => {
    playClickSound(true);
    setPin('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const verifyAndLogin = (enteredPin: string) => {
    const res = loginStaff(enteredPin);
    if (res.success && res.staff) {
      playSuccessSound(true);
      setSuccessMsg(`Đăng nhập thành công: ${res.staff.name} (${res.staff.roleTitle})`);
      setTimeout(() => {
        setPin('');
        setSuccessMsg(null);
        onLoginSuccess();
      }, 400);
    } else {
      setErrorMsg(res.message || 'Mã PIN nhân viên không đúng!');
      setTimeout(() => {
        setPin('');
      }, 700);
    }
  };

  const handleClockIn = () => {
    if (pin.length !== 4) {
      setErrorMsg('Vui lòng nhập đủ 4 số mã nhân viên!');
      return;
    }
    const res = clockIn(pin);
    if (res.success) {
      playSuccessSound(true);
      setSuccessMsg(res.message);
      setErrorMsg(null);
      setTimeout(() => {
        setPin('');
      }, 1500);
    } else {
      setErrorMsg(res.message);
      setSuccessMsg(null);
    }
  };

  const handleClockOut = () => {
    if (pin.length !== 4) {
      setErrorMsg('Vui lòng nhập đủ 4 số mã nhân viên!');
      return;
    }
    const res = clockOut(pin);
    if (res.success) {
      playSuccessSound(true);
      setSuccessMsg(res.message);
      setErrorMsg(null);
      setTimeout(() => {
        setPin('');
      }, 1500);
    } else {
      setErrorMsg(res.message);
      setSuccessMsg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl z-10 border border-[#E8E1D2] text-[#222B25] text-center max-h-[92vh] overflow-y-auto">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF7F2] text-[#69776E] hover:bg-[#EAE3D2] flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Tab chuyển Đăng nhập quầy vs Chấm công */}
        <div className="flex p-1 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D2] mb-5 max-w-[280px] mx-auto">
          <button
            onClick={() => {
              setModalTab('login');
              setPin('');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              modalTab === 'login'
                ? 'bg-[#322821] text-white shadow-xs'
                : 'text-[#627068] hover:text-[#322821]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Vào Hệ Thống</span>
          </button>
          <button
            onClick={() => {
              setModalTab('attendance');
              setPin('');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              modalTab === 'attendance'
                ? 'bg-[#322821] text-white shadow-xs'
                : 'text-[#627068] hover:text-[#322821]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Chấm Công Ca</span>
          </button>
        </div>

        {/* Tiêu đề */}
        <h3 className="font-display font-bold text-xl text-[#322821]">
          {modalTab === 'login' ? 'Xác Thực Nhân Viên Quầy' : 'Chấm Công Đứng Quầy Bằng Mã Code'}
        </h3>
        <p className="text-xs text-[#6F7D74] mt-0.5">
          {modalTab === 'login' 
            ? 'Nhập mã PIN cá nhân để mở ca làm việc theo đúng vai trò' 
            : 'Nhập mã số nhân viên để ghi nhận giờ vào ca / ra ca'}
        </p>

        {/* 4 Chấm PIN */}
        <div className="flex items-center justify-center gap-3.5 my-4">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-[#322821] scale-125 shadow-sm'
                    : 'bg-[#EAE3D2] border border-[#D5CDBD]'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <div className="text-xs text-red-600 font-semibold mb-3 flex items-center justify-center gap-1 bg-red-50 p-2 rounded-xl border border-red-200">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="text-xs text-emerald-700 font-semibold mb-3 flex items-center justify-center gap-1 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Bàn phím số Numpad kiểu POS */}
        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
            <button
              key={n}
              onClick={() => handleKeyPress(n)}
              className="h-11 rounded-2xl bg-[#FAF7F2] hover:bg-[#EAE3D2] active:bg-[#DDD5C3] text-lg font-bold font-mono text-[#322821] transition-colors border border-[#E8E1D2] shadow-2xs"
            >
              {n}
            </button>
          ))}

          <button
            onClick={handleClear}
            className="h-11 rounded-2xl bg-[#FAF7F2] hover:bg-[#EAE3D2] text-xs font-bold text-[#8C9890] transition-colors border border-[#E8E1D2]"
          >
            XÓA
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="h-11 rounded-2xl bg-[#FAF7F2] hover:bg-[#EAE3D2] text-lg font-bold font-mono text-[#322821] transition-colors border border-[#E8E1D2] shadow-2xs"
          >
            0
          </button>

          {modalTab === 'login' ? (
            <button
              onClick={() => verifyAndLogin(pin)}
              disabled={pin.length < 4}
              className="h-11 rounded-2xl bg-[#322821] disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-sm"
              title="Đăng nhập"
            >
              <KeyRound className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleClear}
              className="h-11 rounded-2xl bg-[#322821] text-white flex items-center justify-center font-bold text-xs"
            >
              CL
            </button>
          )}
        </div>

        {/* Nút Chấm Công Vào / Ra Ca nếu ở tab Chấm Công */}
        {modalTab === 'attendance' && (
          <div className="flex gap-2 max-w-[280px] mx-auto mb-4">
            <button
              onClick={handleClockIn}
              disabled={pin.length < 4}
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-bold uppercase transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>VÀO CA (IN)</span>
            </button>
            <button
              onClick={handleClockOut}
              disabled={pin.length < 4}
              className="flex-1 py-2.5 rounded-xl bg-[#D95829] hover:bg-[#B7451E] disabled:opacity-40 text-white text-xs font-bold uppercase transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>RA CA (OUT)</span>
            </button>
          </div>
        )}

        {/* Khung ghi chú bảo mật hệ thống nội bộ */}
        <div className="pt-4 border-t border-[#F0EAE0] text-center text-xs text-[#7A8780] space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[#322821] font-bold">
            <Lock className="w-3.5 h-3.5 text-[#D95829]" />
            <span>Khu Vực Quản Trị Bảo Mật</span>
          </div>
          <p className="text-[11px] text-[#69776E] max-w-xs mx-auto leading-relaxed">
            Vui lòng nhập mã PIN bảo mật cá nhân (4 - 6 số) do Quản Lý Thượng Tea cấp để truy cập hệ thống.
          </p>
        </div>
      </div>
    </div>
  );
};
