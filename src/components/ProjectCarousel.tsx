import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon } from 'lucide-react';

interface ProjectCarouselProps {
  images: string[];
  title: string;
  autoPlayInterval?: number; // in ms
}

export const ProjectCarousel: React.FC<ProjectCarouselProps> = ({
  images,
  title,
  autoPlayInterval = 4000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const validImages = images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000'];

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleOpenFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsFullscreen(false);
  };

  // Keyboard navigation & Escape key support
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % validImages.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, validImages.length]);

  // Autoplay effect
  useEffect(() => {
    if (validImages.length <= 1 || isPaused || isFullscreen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused, isFullscreen, validImages.length, autoPlayInterval]);

  return (
    <div 
      className="relative group overflow-hidden bg-[#0a0c0e] aspect-video border-b border-[#22262e]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Slide Image */}
      <img
        src={validImages[currentIndex]}
        alt={`${title} slide ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-500 ease-in-out cursor-pointer"
        onClick={handleOpenFullscreen}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000';
        }}
      />

      {/* Top Banner Counter */}
      {validImages.length > 1 && (
        <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur-md px-2 py-1 rounded border border-[#22262e] text-[10px] font-mono font-bold text-amber-500 flex items-center gap-1.5 shadow-md pointer-events-none">
          <ImageIcon className="w-3 h-3 text-amber-400" />
          <span>{currentIndex + 1} / {validImages.length}</span>
          {isPaused ? (
            <span className="text-slate-400 text-[9px] uppercase tracking-wider">(DIPAUSE)</span>
          ) : (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          )}
        </div>
      )}

      {/* Fullscreen Expand Button */}
      <button
        type="button"
        onClick={handleOpenFullscreen}
        className="absolute top-2 right-2 z-10 bg-black/70 hover:bg-amber-500 hover:text-black text-white p-1.5 rounded border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
        title="Perbesar Gambar (Fullscreen)"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      {/* Previous / Next Manual Navigation Controls */}
      {validImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-amber-500 hover:text-black text-white p-1.5 rounded-full border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
            aria-label="Previous Image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-amber-500 hover:text-black text-white p-1.5 rounded-full border border-white/20 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
            aria-label="Next Image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Bottom Dot Indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/70 px-2 py-1 rounded-full border border-white/10">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-5 bg-amber-500' : 'w-1.5 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Fullscreen Portal Overlay */}
      {isFullscreen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex flex-col items-center justify-between p-4 sm:p-6"
          onClick={handleCloseFullscreen}
        >
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between z-10 max-w-6xl">
            <div className="flex items-center gap-2 text-white font-mono text-xs sm:text-sm">
              <span className="font-bold text-amber-500">{title}</span>
              <span className="text-slate-400">({currentIndex + 1} / {validImages.length})</span>
            </div>
            
            <button
              type="button"
              onClick={handleCloseFullscreen}
              className="bg-zinc-800 hover:bg-red-600 text-white p-2.5 rounded-full cursor-pointer transition-all shadow-xl flex items-center gap-1.5 border border-white/10 font-mono text-xs font-bold"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
              <span className="hidden sm:inline">TUTUP</span>
            </button>
          </div>

          {/* Main Enlarged Image & Controls */}
          <div 
            className="relative max-w-6xl max-h-[80vh] w-full flex-1 flex items-center justify-center my-auto px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={validImages[currentIndex]}
              alt={`${title} expanded slide`}
              className="max-w-full max-h-[78vh] object-contain rounded-lg border border-zinc-800 shadow-2xl"
            />

            {validImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-amber-500 hover:text-black text-white p-3 rounded-full border border-white/20 transition-all cursor-pointer shadow-2xl"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-amber-500 hover:text-black text-white p-3 rounded-full border border-white/20 transition-all cursor-pointer shadow-2xl"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Footer Navigation Dots */}
          {validImages.length > 1 && (
            <div 
              className="flex items-center gap-2 bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-800 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {validImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex ? 'w-6 bg-amber-500' : 'w-2 bg-white/30 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};
