import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Leaf } from 'lucide-react';
import { IMAGES } from '../data/figurines';
import type { Figurine } from '../data/figurines';
import { Header } from './Header';
import { DiscoverModal } from './DiscoverModal';
import { GalleryModal } from './GalleryModal';
import { ARModal } from './ARModal';
import { playSwooshSound, playClickSound, playSuccessSound } from '../utils/audio';

export const ToonHubHero: React.FC = () => {
  // State & Logic required by prompt
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  // Modern features state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isAROpen, setIsAROpen] = useState<boolean>(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mouse tilt parallax for desktop center figurine
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch gesture tracking for mobile swipe
  const touchStartX = useRef<number | null>(null);

  // Preload all 4 images on mount via new Image() (Strict Prompt Requirement)
  useEffect(() => {
    IMAGES.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });
  }, []);

  // Responsive window resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation functions with 650ms animation lock
  const navigate = useCallback((direction: 'next' | 'prev') => {
    if (isAnimating) return;

    setIsAnimating(true);
    playSwooshSound(soundEnabled);

    setActiveIndex((prev) => {
      if (direction === 'next') {
        return (prev + 1) % 4;
      } else {
        return (prev + 3) % 4;
      }
    });

    setTimeout(() => {
      setIsAnimating(false);
    }, 650);
  }, [isAnimating, soundEnabled]);

  const goToIndex = useCallback((index: number) => {
    if (isAnimating || index === activeIndex) return;

    setIsAnimating(true);
    playSwooshSound(soundEnabled);
    setActiveIndex(index % 4);

    setTimeout(() => {
      setIsAnimating(false);
    }, 650);
  }, [isAnimating, activeIndex, soundEnabled]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDiscoverOpen || isGalleryOpen || isAROpen) return;
      if (e.key === 'ArrowRight' || e.key === 'KeyD') {
        navigate('next');
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
        navigate('prev');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isDiscoverOpen, isGalleryOpen, isAROpen]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        navigate('prev');
      } else {
        navigate('next');
      }
    }
    touchStartX.current = null;
  };

  // Mouse Parallax for Desktop Center Figurine
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * 2;
    const y = ((clientY - top) / height - 0.5) * 2;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Add to cart toast
  const handleAddToCart = (figurine: Figurine) => {
    setCartCount((c) => c + 1);
    playSuccessSound(soundEnabled);
    setToastMessage(`Added "${figurine.name}" to cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Derived role positions for each item in the carousel:
  // center = activeIndex
  // left = (activeIndex + 3) % 4
  // right = (activeIndex + 1) % 4
  // back = (activeIndex + 2) % 4
  const getRole = (index: number): 'center' | 'left' | 'right' | 'back' => {
    if (index === activeIndex) return 'center';
    if (index === (activeIndex + 3) % 4) return 'left';
    if (index === (activeIndex + 1) % 4) return 'right';
    return 'back';
  };

  const currentFigurine = IMAGES[activeIndex];

  // SVG fractalNoise data URI required by prompt:
  // baseFrequency=0.9, numOctaves=4, opacity 0.08 inside SVG
  const grainSvgUri = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E";

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{
        backgroundColor: IMAGES[activeIndex].bg,
        transition: 'background-color 650ms cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: "'Inter', sans-serif",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[120] bg-white text-black font-semibold text-xs py-2 px-5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <Leaf className="w-3.5 h-3.5 text-black" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Inside: a relative w-full div with height: 100vh; overflow: hidden */}
      <div className="relative w-full h-[100dvh] overflow-hidden">
        
        {/* 1. Grain overlay (absolute inset-0 pointer-events-none, zIndex 50):
            SVG fractalNoise data URI, baseFrequency=0.9, numOctaves=4, opacity 0.08 inside SVG,
            container opacity: 0.4, backgroundSize: 200px 200px, repeat. */}
        <div
          className="absolute inset-0 pointer-events-none z-50"
          style={{
            backgroundImage: `url("${grainSvgUri}")`,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
            opacity: 0.4,
          }}
        />

        {/* Ambient Radial Vignette */}
        <div className="absolute inset-0 pointer-events-none z-[1] bg-radial from-transparent via-black/10 to-black/35" />

        {/* 2. Giant ghost text "3D SHAPE" (absolute inset-x-0 flex items-center justify-center pointer-events-none select-none, zIndex 2, top: 18%):
            font Anton, fontSize: clamp(90px, 28vw, 380px), weight 900, color white, opacity 1,
            lineHeight 1, uppercase, letterSpacing -0.02em, whiteSpace nowrap. */}
        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none z-[2]"
          style={{
            top: '18%',
          }}
        >
          <span
            className="font-anton uppercase tracking-[-0.02em] whitespace-nowrap text-white"
            style={{
              fontSize: 'clamp(90px, 28vw, 380px)',
              lineHeight: 1,
              fontWeight: 900,
              opacity: 1,
              textShadow: '0 20px 40px rgba(0,0,0,0.12)',
            }}
          >
            3D SHAPE
          </span>
        </div>

        {/* Header containing brand label & modern controls (zIndex 60) */}
        <Header
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            if (next) playClickSound(true);
          }}
          onOpenGallery={() => setIsGalleryOpen(true)}
          onOpenAR={() => setIsAROpen(true)}
          onOpenDiscover={() => setIsDiscoverOpen(true)}
          cartCount={cartCount}
        />

        {/* 4. Carousel (absolute inset-0, zIndex 3): map all 4 */}
        <div className="absolute inset-0 z-[3] flex items-center justify-center">
          {IMAGES.map((item, index) => {
            const role = getRole(index);

            // Compute transform styles based on role & responsive viewport
            let transformStr = '';
            let opacityVal = 0;
            let filterVal = '';
            let zIndexVal = 1;
            let pointerEvents = 'none';

            if (role === 'center') {
              // Center figurine: scaled up, no blur, high z-index, interactive tilt on desktop
              const scale = isMobile ? 1.25 : 1.68;
              const tiltRotateX = isMobile ? 0 : -tilt.y * 12;
              const tiltRotateY = isMobile ? 0 : tilt.x * 14;
              const tiltTranslateX = isMobile ? 0 : tilt.x * 15;
              const tiltTranslateY = isMobile ? 0 : tilt.y * 15;

              transformStr = `translate3d(calc(-50% + ${tiltTranslateX}px), calc(-40% + ${tiltTranslateY}px), 0px) scale(${scale}) rotateX(${tiltRotateX}deg) rotateY(${tiltRotateY}deg)`;
              opacityVal = 1;
              filterVal = 'blur(0px) drop-shadow(0 25px 35px rgba(0, 0, 0, 0.4))';
              zIndexVal = 10;
              pointerEvents = 'auto';
            } else if (role === 'left') {
              // Left figurine
              const offsetPx = isMobile ? -145 : -380;
              const scale = isMobile ? 0.65 : 0.82;
              transformStr = `translate3d(calc(-50% + ${offsetPx}px), -36%, 0px) scale(${scale}) rotateY(15deg)`;
              opacityVal = 0.45;
              filterVal = 'blur(2px) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.3))';
              zIndexVal = 5;
              pointerEvents = 'auto';
            } else if (role === 'right') {
              // Right figurine
              const offsetPx = isMobile ? 145 : 380;
              const scale = isMobile ? 0.65 : 0.82;
              transformStr = `translate3d(calc(-50% + ${offsetPx}px), -36%, 0px) scale(${scale}) rotateY(-15deg)`;
              opacityVal = 0.45;
              filterVal = 'blur(2px) drop-shadow(0 15px 25px rgba(0, 0, 0, 0.3))';
              zIndexVal = 5;
              pointerEvents = 'auto';
            } else {
              // Back figurine (hidden/ghosted)
              transformStr = 'translate3d(-50%, -20%, 0px) scale(0.42)';
              opacityVal = 0;
              filterVal = 'blur(8px)';
              zIndexVal = 1;
              pointerEvents = 'none';
            }

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isAnimating) return;
                  if (role === 'left') {
                    navigate('prev');
                  } else if (role === 'right') {
                    navigate('next');
                  } else if (role === 'center') {
                    setIsDiscoverOpen(true);
                  }
                }}
                className={`absolute top-1/2 left-1/2 will-change-transform ${
                  role === 'center'
                    ? 'cursor-pointer'
                    : role === 'left' || role === 'right'
                    ? 'cursor-pointer hover:opacity-70'
                    : 'pointer-events-none'
                }`}
                style={{
                  transform: transformStr,
                  opacity: opacityVal,
                  filter: filterVal,
                  zIndex: zIndexVal,
                  pointerEvents: pointerEvents as 'none' | 'auto',
                  transition: 'all 650ms cubic-bezier(0.4, 0, 0.2, 1)',
                  perspective: 1200,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Visual glow ground shadow for center figurine */}
                {role === 'center' && (
                  <div
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-12 rounded-full blur-2xl opacity-60 pointer-events-none transition-all duration-650"
                    style={{
                      backgroundColor: item.panel,
                    }}
                  />
                )}

                {/* Figurine image */}
                <img
                  src={item.src}
                  alt={item.name}
                  draggable={false}
                  className="max-h-[52vh] sm:max-h-[58vh] md:max-h-[64vh] w-auto object-contain select-none transition-all duration-650"
                />

                {/* Center figurine hover hint */}
                {role === 'center' && !isMobile && (
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-medium tracking-widest text-white/90 border border-white/10 uppercase">
                    CLICK TO INSPECT SPECS
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 5. Bottom-Left Information & Navigation Controls (zIndex 60) */}
        <div className="absolute bottom-6 left-4 sm:bottom-16 sm:left-10 md:left-16 z-[60] flex flex-col items-start text-white max-w-[280px] sm:max-w-sm">
          {/* Series badge */}
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase text-white/70 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>{currentFigurine.series}</span>
          </div>

          {/* Figurine Name */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-anton uppercase tracking-wide leading-none text-white drop-shadow-md">
            {currentFigurine.name}
          </h1>

          {/* Pricing & Edition */}
          <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm font-medium">
            <span className="font-bold text-white bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/15">
              {currentFigurine.price}
            </span>
            <span className="text-white/80 font-mono tracking-wider text-[11px] uppercase">
              {currentFigurine.edition}
            </span>
          </div>

          {/* Navigation Controls: ArrowLeft & ArrowRight buttons */}
          <div className="flex items-center gap-3 mt-4 sm:mt-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('prev')}
                disabled={isAnimating}
                aria-label="Previous Figurine"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/20 bg-white/10 hover:bg-white/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md flex items-center justify-center text-white transition-all duration-200 shadow-lg group"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-0.5" />
              </button>

              <button
                onClick={() => navigate('next')}
                disabled={isAnimating}
                aria-label="Next Figurine"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/20 bg-white/10 hover:bg-white/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md flex items-center justify-center text-white transition-all duration-200 shadow-lg group"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Pagination Number indicator & Interactive dots */}
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-white/20">
              <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider">
                0{activeIndex + 1}
              </span>
              <span className="text-white/40 text-xs font-mono">/ 04</span>

              <div className="flex items-center gap-1.5 ml-2">
                {IMAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 6. Bottom-Right Action Link "DISCOVER IT" (zIndex 60):
            Font Anton, clamp(20px, 4vw, 56px), weight 400, uppercase, no underline,
            hover opacity 0.95 -> 1 (duration 200ms), followed by ArrowRight (w-5 h-5 sm:w-8 sm:h-8, strokeWidth 2.25) */}
        <div className="absolute bottom-6 right-4 sm:bottom-16 sm:right-10 md:right-16 z-[60] flex items-center">
          <button
            onClick={() => {
              playClickSound(soundEnabled);
              setIsDiscoverOpen(true);
            }}
            className="group flex items-center gap-2 sm:gap-3 text-white transition-all duration-200 focus:outline-none"
            style={{
              opacity: 0.95,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.95';
            }}
            title="Discover Figurine Details & Order"
          >
            <span
              className="font-anton uppercase tracking-[-0.01em] no-underline leading-none select-none text-white drop-shadow-md"
              style={{
                fontSize: 'clamp(20px, 4vw, 56px)',
              }}
            >
              DISCOVER IT
            </span>
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/10 group-hover:bg-white/20 border border-white/20 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1 backdrop-blur-sm">
              <ArrowRight
                className="w-5 h-5 sm:w-8 sm:h-8 text-white transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.25}
              />
            </div>
          </button>
        </div>

        {/* Center Bottom Scroll / Swipe hint on mobile */}
        <div className="sm:hidden absolute bottom-2 inset-x-0 flex items-center justify-center pointer-events-none z-[60] text-[10px] tracking-widest text-white/50 uppercase font-mono">
          <span>SWIPE LEFT / RIGHT TO EXPLORE</span>
        </div>

      </div>

      {/* Modals for Deep Modern Interactive Features */}
      <DiscoverModal
        figurine={currentFigurine}
        isOpen={isDiscoverOpen}
        onClose={() => setIsDiscoverOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        activeIndex={activeIndex}
        onSelectIndex={goToIndex}
      />

      <ARModal
        figurine={currentFigurine}
        isOpen={isAROpen}
        onClose={() => setIsAROpen(false)}
      />
    </div>
  );
};
