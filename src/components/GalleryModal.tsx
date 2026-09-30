import React from 'react';
import { X, ArrowRight, Leaf } from 'lucide-react';
import type { Figurine } from '../data/figurines';
import { IMAGES } from '../data/figurines';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeIndex: number;
  onSelectIndex: (index: number) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  activeIndex,
  onSelectIndex,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 backdrop-blur-2xl bg-black/85 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-[#121214] border border-white/20 rounded-3xl p-6 sm:p-10 text-white z-10 my-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-white/50 tracking-widest uppercase">
              <Leaf className="w-3.5 h-3.5 text-white/80" />
              <span>COLLECTIBLE ARCHIVE 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-anton uppercase tracking-wide mt-1">
              ALL 4 FIGURINES
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

        {/* Grid of 4 figurines */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {IMAGES.map((item: Figurine, index: number) => {
            const isCurrent = index === activeIndex;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectIndex(index);
                  onClose();
                }}
                className={`group relative rounded-2xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ${
                  isCurrent
                    ? 'border-white bg-white/10 ring-2 ring-white/50 shadow-lg'
                    : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                }`}
                style={{
                  background: isCurrent
                    ? `radial-gradient(circle at 50% 30%, ${item.bg}50 0%, #17171a 80%)`
                    : undefined,
                }}
              >
                {/* Active Badge */}
                {isCurrent && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-black tracking-wider">
                    ACTIVE
                  </span>
                )}

                {/* Figurine Image */}
                <div className="h-44 sm:h-48 flex items-center justify-center my-3 relative">
                  <div
                    className="absolute w-24 h-24 rounded-full blur-xl opacity-40 group-hover:opacity-75 transition-opacity"
                    style={{ backgroundColor: item.bg }}
                  />
                  <img
                    src={item.src}
                    alt={item.name}
                    className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-xl"
                  />
                </div>

                {/* Info */}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between text-xs text-white/60 font-mono mb-1">
                    <span>#{item.id}</span>
                    <span className="font-bold text-white">{item.price}</span>
                  </div>
                  <h3 className="font-anton text-lg uppercase tracking-wide group-hover:text-white transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-white/50 truncate mt-0.5">
                    {item.edition}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] font-semibold text-white/70 group-hover:text-white mt-3 pt-2 border-t border-white/5">
                    <span>ROTATE TO THIS</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
