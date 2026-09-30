import React, { useState } from 'react';
import { X, Check, ShieldCheck, Leaf, Layers, Ruler, Weight, User, ShoppingBag, RotateCcw } from 'lucide-react';
import type { Figurine } from '../data/figurines';

interface DiscoverModalProps {
  figurine: Figurine;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (figurine: Figurine) => void;
}

export const DiscoverModal: React.FC<DiscoverModalProps> = ({
  figurine,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [isOrdered, setIsOrdered] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'art'>('overview');

  if (!isOpen) return null;

  const handleOrder = () => {
    onAddToCart(figurine);
    setIsOrdered(true);
    setTimeout(() => {
      setIsOrdered(false);
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto backdrop-blur-xl bg-black/75 animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Card */}
      <div 
        className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-white/20 text-white z-10 my-auto flex flex-col md:flex-row transition-all duration-500"
        style={{
          backgroundColor: '#141416',
          boxShadow: `0 25px 60px -15px ${figurine.bg}55`,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-transform active:scale-95"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: 3D Turntable Simulator Stage */}
        <div 
          className="relative w-full md:w-1/2 p-6 sm:p-8 flex flex-col items-center justify-between min-h-[380px] sm:min-h-[460px] overflow-hidden"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${figurine.bg}40 0%, #101012 85%)`
          }}
        >
          {/* Subtle series tag */}
          <div className="w-full flex items-center justify-between text-xs tracking-widest font-mono text-white/60 uppercase">
            <span>{figurine.series}</span>
            <span className="px-2 py-0.5 rounded-full border border-white/20 text-[10px] text-white/80 bg-white/5">
              {figurine.status}
            </span>
          </div>

          {/* 3D Figurine Showcase with Simulated Angle Tilt */}
          <div className="relative my-auto flex items-center justify-center w-full group">
            {/* Glow pedestal */}
            <div 
              className="absolute bottom-2 w-48 h-12 rounded-full blur-xl opacity-60"
              style={{ backgroundColor: figurine.bg }}
            />
            {/* Figurine Image with turntable rotation simulation */}
            <div 
              className="relative transition-transform duration-200 ease-out select-none cursor-grab active:cursor-grabbing"
              style={{
                transform: `rotateY(${rotation}deg) scale(1.05)`,
                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))'
              }}
            >
              <img
                src={figurine.src}
                alt={figurine.name}
                className="max-h-[280px] sm:max-h-[340px] w-auto object-contain pointer-events-none"
              />
            </div>
          </div>

          {/* Turntable 360 interactive rotation slider */}
          <div className="w-full max-w-xs flex flex-col items-center gap-2">
            <div className="flex items-center justify-between w-full text-[11px] text-white/60 tracking-wider">
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                360° INSPECT
              </span>
              <span>{Math.round(rotation)}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>

        {/* Right Side: Detailed Figurine Specs & Ordering */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between bg-black/40 backdrop-blur-md">
          <div>
            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-white/10 pb-3 mb-5 text-xs font-semibold tracking-wider">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-1 transition-colors ${
                  activeTab === 'overview' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/80'
                }`}
              >
                OVERVIEW
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-1 transition-colors ${
                  activeTab === 'specs' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/80'
                }`}
              >
                SPECIFICATIONS
              </button>
              <button
                onClick={() => setActiveTab('art')}
                className={`pb-1 transition-colors ${
                  activeTab === 'art' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/80'
                }`}
              >
                COLLECTOR PASS
              </button>
            </div>

            {/* Figurine Name & Price */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-white/50 mb-1">
                <span>EDITION #{figurine.id}</span>
                <span>•</span>
                <span className="text-white/80">{figurine.edition}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-anton tracking-wide uppercase text-white">
                {figurine.name}
              </h2>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-2xl font-bold font-inter text-white">
                  {figurine.price}
                </span>
                <span className="text-xs text-white/50 tracking-wider">USD (FREE WORLDWIDE INSURED SHIPPING)</span>
              </div>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <p className="text-sm text-white/70 leading-relaxed">
                  {figurine.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {figurine.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-white/80 bg-white/5 p-2 rounded-xl border border-white/10">
                      <Leaf className="w-3.5 h-3.5 text-white/60 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Specs */}
            {activeTab === 'specs' && (
              <div className="space-y-3 text-xs text-white/80">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="flex items-center gap-2 text-white/50">
                    <Ruler className="w-3.5 h-3.5" /> Dimensions
                  </span>
                  <span className="font-semibold text-white">{figurine.height}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="flex items-center gap-2 text-white/50">
                    <Weight className="w-3.5 h-3.5" /> Weight
                  </span>
                  <span className="font-semibold text-white">{figurine.weight}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="flex items-center gap-2 text-white/50">
                    <Layers className="w-3.5 h-3.5" /> Material
                  </span>
                  <span className="font-semibold text-white truncate max-w-[200px] text-right">{figurine.material}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="flex items-center gap-2 text-white/50">
                    <User className="w-3.5 h-3.5" /> Lead Sculptor
                  </span>
                  <span className="font-semibold text-white">{figurine.designer}</span>
                </div>
              </div>
            )}

            {/* Tab 3: Certificate / Collector Pass */}
            {activeTab === 'art' && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/15 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>NFC CRYPTOGRAPHIC AUTHENTICITY</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  Every ToonHub figurine includes an embedded tamper-proof NTAG chip in the baseplate. Scan with any iOS or Android phone to claim digital twin provenance and VIP drops.
                </p>
                <div className="font-mono text-[11px] bg-black/40 p-2.5 rounded-lg border border-white/10 text-white/80 flex items-center justify-between">
                  <span>SERIAL: TH-{figurine.id}-2026-X89</span>
                  <span className="text-emerald-400 font-bold">VERIFIED</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-6 border-t border-white/10 mt-6">
            <button
              onClick={handleOrder}
              disabled={isOrdered}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm tracking-wider uppercase flex items-center justify-center gap-3 shadow-xl transition-all duration-300 active:scale-95 ${
                isOrdered
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-black hover:bg-white/90 hover:shadow-white/20'
              }`}
            >
              {isOrdered ? (
                <>
                  <Check className="w-5 h-5 animate-bounce" />
                  <span>ADDED TO COLLECTION CART!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>SECURE FIGURINE ({figurine.price})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
