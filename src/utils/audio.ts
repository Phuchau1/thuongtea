// Web Audio API Synthesizer for UI sound effects & POS Kitchen Bells
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSwooshSound(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (err) {
    console.debug('Audio error', err);
  }
}

export function playClickSound(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (err) {
    console.debug('Audio error', err);
  }
}

export function playSuccessSound(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + i * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.05, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.26);
    });
  } catch (err) {
    console.debug('Audio error', err);
  }
}

// Chuông báo đơn hàng mới tại quầy thu ngân & pha chế (Ting-Ting POS Bell)
export function playKitchenChime(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // First Ding (E5: 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const now = ctx.currentTime;

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.28, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.65);

    // Second Dong (A5: 880.00 Hz) with soft harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    const secondDingTime = now + 0.18;

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, secondDingTime);
    gain2.gain.setValueAtTime(0.32, secondDingTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, secondDingTime + 0.85);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(secondDingTime);
    osc2.stop(secondDingTime + 0.9);
  } catch (err) {
    console.debug('Kitchen chime error', err);
  }
}

// Chuông máy POS chuyên nghiệp âm lượng to, rõ ràng, giai điệu Ting-Ting rộn rã
export function playPosCashierBell(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Giai điệu chuông thu ngân POS 4 nốt tươi sáng (Do - Mi - Sol - Do cao)
    const notes = [
      { freq: 783.99, time: 0, dur: 0.35, vol: 0.35 },    // G5
      { freq: 1046.50, time: 0.12, dur: 0.4, vol: 0.4 },  // C6
      { freq: 1318.51, time: 0.24, dur: 0.45, vol: 0.45 }, // E6
      { freq: 1567.98, time: 0.36, dur: 0.7, vol: 0.5 },  // G6 ngân vang
    ];

    notes.forEach(({ freq, time, dur, vol }) => {
      const osc = ctx.createOscillator();
      const overtone = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = now + time;

      // Nốt chính dạng sine ấm
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Hòa âm kim loại (brass chime) dạng triangle
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(freq * 2, startTime);

      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gain);
      overtone.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      overtone.start(startTime);
      osc.stop(startTime + dur + 0.05);
      overtone.stop(startTime + dur + 0.05);
    });

    // Lặp lại đợt ting thứ 2 sau 0.65 giây
    const secondWave = now + 0.65;
    const notes2 = [
      { freq: 1046.50, time: 0, dur: 0.35, vol: 0.38 },
      { freq: 1567.98, time: 0.14, dur: 0.8, vol: 0.52 },
    ];

    notes2.forEach(({ freq, time, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = secondWave + time;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur + 0.05);
    });
  } catch (err) {
    console.debug('POS cashier bell error', err);
  }
}

// Giọng đọc thông báo đơn hàng mới bằng tiếng Việt (Web Speech API)
export function speakNewOrderVoice(text: string = 'Có đơn hàng mới') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.02;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;
    
    // Tìm giọng tiếng Việt nếu có
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VN'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.debug('Voice speech error', e);
  }
}

let ringtoneInterval: ReturnType<typeof setInterval> | null = null;
let ringtoneTimeout: ReturnType<typeof setTimeout> | null = null;

export function stopPosRingtone() {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
  if (ringtoneTimeout) {
    clearTimeout(ringtoneTimeout);
    ringtoneTimeout = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

// Chuông máy POS đổ chuông liên tục ~5 giây khi có đơn hàng mới (nhịp Ting-Ting lặp lại mỗi 1.4s)
export function playPosRingtone5s(
  orderInfo?: { tableNumber?: string; orderType?: string; orderNumber?: number; total?: number; paymentStatus?: string; paymentMethod?: string },
  enabled: boolean = true
) {
  if (!enabled) return;
  stopPosRingtone();

  // Nhịp chuông đầu tiên (Ting-Ting-Ting!)
  playPosCashierBell(true);

  // Đọc thông báo giọng nói
  const isPaid = orderInfo?.paymentStatus === 'paid' || orderInfo?.paymentMethod === 'vietqr';
  let speechText = 'Có đơn hàng mới!';
  if (isPaid) {
    speechText = orderInfo?.tableNumber 
      ? `${orderInfo.tableNumber} đã chuyển khoản, có đơn mới!` 
      : 'Đơn hàng mới đã thanh toán chuyển khoản!';
  } else if (orderInfo?.tableNumber) {
    speechText = `${orderInfo.tableNumber} có đơn gọi món mới!`;
  } else if (orderInfo?.orderType === 'delivery') {
    speechText = 'Có đơn hàng giao đi mới!';
  }

  setTimeout(() => {
    speakNewOrderVoice(speechText);
  }, 600);

  // Lặp lại chuông mỗi 1.4 giây (khoảng 3 đợt nữa) -> Tổng thời gian chuông ~5 giây
  let count = 0;
  ringtoneInterval = setInterval(() => {
    count++;
    if (count >= 3) {
      stopPosRingtone();
      return;
    }
    playPosCashierBell(true);
  }, 1400);

  // Tự động dừng sau 5.2s
  ringtoneTimeout = setTimeout(() => {
    stopPosRingtone();
  }, 5200);
}

// Tổng hợp: Phát chuông POS rộn rã trong ~5 giây + Giọng thông báo đơn hàng
export function playNewOrderAlertSound(
  orderInfo?: { tableNumber?: string; orderType?: string; orderNumber?: number; total?: number; paymentStatus?: string; paymentMethod?: string },
  enabled: boolean = true
) {
  playPosRingtone5s(orderInfo, enabled);
}
