import React, { useState } from 'react';
import { X, Smartphone, Coffee, Leaf, Footprints } from 'lucide-react';
import type { Figurine } from '../data/figurines';

interface ARModalProps {
  figurine: Figurine;
  isOpen: boolean;
  onClose: () => void;
}

export const ARModal: React.FC<ARModalProps> = ({
  figurine,
  isOpen,
  onClose,
}) => {
  const [comparison, setComparison] = useState<'cup' | 'phone' | 'sneaker'>('phone');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 backdrop-blur-2xl bg-black/85 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-[#131316] border border-white/20 rounded-3xl p-6 sm:p-8 text-white z-10 my-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-white/50 tracking-widest uppercase">
              <Leaf className="w-3.5 h-3.5 text-white/80" />
              <span>SCALE & VOLUME LAB</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-anton uppercase tracking-wide mt-1">
              REAL-WORLD PROPORTIONS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/15 transition-transform active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Object selection */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          <button
            onClick={() => setComparison('phone')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              comparison === 'phone'
                ? 'bg-white text-black border-white shadow-lg'
                : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>vs. Smartphone (15cm)</span>
          </button>

          <button
            onClick={() => setComparison('cup')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              comparison === 'cup'
                ? 'bg-white text-black border-white shadow-lg'
                : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>vs. Ceramic Mug (10cm)</span>
          </button>

          <button
            onClick={() => setComparison('sneaker')}
            className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              comparison === 'sneaker'
                ? 'bg-white text-black border-white shadow-lg'
                : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
            }`}
          >
            <Footprints className="w-4 h-4" />
            <span>vs. Sneaker (30cm)</span>
          </button>
        </div>

        {/* Visual comparison stage with ground line */}
        <div className="relative h-64 sm:h-80 rounded-2xl bg-black/50 border border-white/10 flex items-end justify-center gap-8 sm:gap-16 pb-6 px-6 overflow-hidden">
          {/* Height grid lines */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-6 px-4 opacity-15">
            <div className="w-full border-b border-dashed border-white text-[10px] text-right font-mono">30 cm</div>
            <div className="w-full border-b border-dashed border-white text-[10px] text-right font-mono">20 cm</div>
            <div className="w-full border-b border-dashed border-white text-[10px] text-right font-mono">10 cm</div>
            <div className="w-full border-b border-white text-[10px] text-right font-mono">0 cm (Base)</div>
          </div>

          {/* Reference object silhouette */}
          <div className="flex flex-col items-center z-10">
            {comparison === 'phone' && (
              <div className="w-14 h-32 rounded-2xl border-2 border-white/40 bg-white/10 flex flex-col items-center justify-between p-2 shadow-inner">
                <div className="w-5 h-1 bg-white/40 rounded-full" />
                <div className="text-[9px] font-mono text-white/60">6.1"</div>
                <div className="w-3 h-3 rounded-full border border-white/30" />
              </div>
            )}
            {comparison === 'cup' && (
              <div className="w-20 h-24 rounded-b-3xl border-2 border-white/40 bg-white/10 flex items-center justify-center relative">
                <div className="absolute -right-3 top-4 w-4 h-12 rounded-r-xl border-2 border-white/40" />
                <span className="text-[10px] font-mono text-white/60">Mug</span>
              </div>
            )}
            {comparison === 'sneaker' && (
              <div className="w-36 h-20 rounded-t-xl rounded-br-3xl border-2 border-white/40 bg-white/10 flex items-center justify-center">
                <span className="text-[10px] font-mono text-white/60">Sneaker</span>
              </div>
            )}
            <span className="text-[11px] text-white/50 font-mono mt-2 uppercase">
              {comparison === 'phone' ? 'Smartphone' : comparison === 'cup' ? 'Coffee Mug' : 'Sneaker'}
            </span>
          </div>

          {/* The Figurine */}
          <div className="flex flex-col items-center z-10">
            <div className="relative group">
              <div 
                className="absolute inset-0 blur-xl opacity-50"
                style={{ backgroundColor: figurine.bg }}
              />
              <img
                src={figurine.src}
                alt={figurine.name}
                className="h-48 sm:h-60 w-auto object-contain drop-shadow-2xl relative"
              />
            </div>
            <span className="text-xs font-semibold text-white font-anton uppercase tracking-wide mt-2">
              {figurine.name} ({figurine.height})
            </span>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <span>Actual desktop figurine height: {figurine.height} • Weight: {figurine.weight}</span>
          <span className="font-mono text-white/40">CALIBRATED TO 1:1 SCALE</span>
        </div>
      </div>
    </div>
  );
};
