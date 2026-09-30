import React from 'react';
import { Volume2, VolumeX, Grid3X3, ShoppingBag, Eye, Leaf } from 'lucide-react';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenGallery: () => void;
  onOpenAR: () => void;
  onOpenDiscover: () => void;
  cartCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenGallery,
  onOpenAR,
  onOpenDiscover,
  cartCount,
}) => {
  return (
    <header className="pointer-events-none select-none">
      {/* 3. Top-left brand label "TOONHUB" (exact prompt requirement: absolute top-6 left-4 sm:left-8, zIndex 60, text-xs font-semibold uppercase, white, opacity 0.9, letterSpacing 0.18em) */}
      <div 
        className="absolute top-6 left-4 sm:left-8 z-[60] text-xs font-semibold uppercase tracking-[0.18em] text-white opacity-90 pointer-events-auto flex items-center gap-2 cursor-pointer group"
        onClick={onOpenDiscover}
        title="TOONHUB Collectibles"
      >
        <span className="w-2 h-2 rounded-full bg-white group-hover:scale-125 transition-transform duration-300 animate-pulse" />
        <span>TOONHUB</span>
        <span className="hidden md:inline-block text-[10px] font-normal opacity-60 tracking-wider ml-1 border-l border-white/20 pl-2">
          ART TOY COLLECTIVE
        </span>
      </div>

      {/* Center Nav Pill for desktop */}
      <nav className="hidden lg:flex absolute top-6 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto items-center gap-1 px-3 py-1.5 rounded-full bg-black/15 backdrop-blur-md border border-white/10 text-white/80 text-xs font-medium tracking-wider">
        <button 
          onClick={onOpenGallery}
          className="px-3 py-1 rounded-full hover:text-white hover:bg-white/15 transition-all flex items-center gap-1.5"
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          <span>CATALOG</span>
        </button>
        <button 
          onClick={onOpenAR}
          className="px-3 py-1 rounded-full hover:text-white hover:bg-white/15 transition-all flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>SCALE LAB</span>
        </button>
        <button 
          onClick={onOpenDiscover}
          className="px-3 py-1 rounded-full hover:text-white hover:bg-white/15 transition-all flex items-center gap-1.5"
        >
          <Leaf className="w-3.5 h-3.5" />
          <span>EDITIONS</span>
        </button>
      </nav>

      {/* Top-Right Action Dock */}
      <div className="absolute top-6 right-4 sm:right-8 z-[60] pointer-events-auto flex items-center gap-2 sm:gap-3 text-white">
        {/* AR Scale trigger */}
        <button
          onClick={onOpenAR}
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 transition-all duration-300"
          title="Interactive Scale Comparison"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>3D SCALE</span>
        </button>

        {/* Gallery Catalog modal button */}
        <button
          onClick={onOpenGallery}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/15 transition-all duration-300"
          title="View all 4 figurines"
          aria-label="View figurine catalog"
        >
          <Grid3X3 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 active:scale-95 ${
            soundEnabled 
              ? 'bg-white/20 border-white/30 text-white' 
              : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/15'
          }`}
          title={soundEnabled ? 'Mute SFX audio' : 'Enable SFX audio'}
          aria-label="Toggle audio effects"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-pulse" />
          ) : (
            <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          )}
        </button>

        {/* Cart / Bag counter */}
        <button
          onClick={onOpenDiscover}
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/15 transition-all duration-300"
          title="View order cart"
          aria-label="View cart"
        >
          <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-black text-[11px] font-bold flex items-center justify-center shadow-lg animate-bounce">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
