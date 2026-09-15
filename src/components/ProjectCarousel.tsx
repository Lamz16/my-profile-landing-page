import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Pause, Play, Image as ImageIcon } from 'lucide-react';

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

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  useEffect(() => {
    if (validImages.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused, validImages.length, autoPlayInterval]);

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
        className="w-full h-full object-cover transition-all duration-500 ease-in-out"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000';
        }}
      />

      {/* Top Banner Counter */}
      {validImages.length > 1 && (
        <div className="absolute top-2 left-2 z-10 bg-black/75 backdrop-blur-md px-2 py-1 rounded border border-[#22262e] text-[10px] font-mono font-bold text-amber-500 flex items-center gap-1.5 shadow-md">
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
        onClick={() => setIsFullscreen(true)}
        className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/90 text-white p-1.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
        title="Perbesar Gambar"
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
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-full border border-white/10">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-5 bg-amber-500' : 'w-1.5 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-5xl max-h-[80vh] w-full flex items-center justify-center">
            <img
              src={validImages[currentIndex]}
              alt={title}
              className="max-w-full max-h-[75vh] object-contain rounded border border-zinc-800 shadow-2xl"
            />
          </div>

          <div className="mt-4 flex items-center gap-4 text-white font-mono text-xs">
            <span>{title}</span>
            <span className="text-amber-500 font-bold">({currentIndex + 1} / {validImages.length})</span>
          </div>
        </div>
      )}
    </div>
  );
};
