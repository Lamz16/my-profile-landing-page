import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  itemLabel = 'item'
}) => {
  if (totalPages <= 1 && totalItems <= limit) {
    return (
      <div className="flex justify-between items-center text-xs font-mono text-zinc-500 pt-4 border-t border-zinc-800/60">
        <span>Total: <strong className="text-amber-500 font-bold">{totalItems}</strong> {itemLabel}</span>
        <span className="text-[10px] uppercase text-zinc-600">Halaman 1 dari 1</span>
      </div>
    );
  }

  const startIdx = (currentPage - 1) * limit + 1;
  const endIdx = Math.min(currentPage * limit, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-800/80 font-mono text-xs">
      <div className="text-zinc-400 text-xs">
        Menampilkan <span className="text-amber-500 font-bold">{startIdx} - {endIdx}</span> dari <span className="text-amber-500 font-bold">{totalItems}</span> {itemLabel}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => (
            <React.Fragment key={idx}>
              {p === '...' ? (
                <span className="px-2 py-1 text-zinc-600 text-xs font-bold">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(p as number)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    currentPage === p
                      ? 'bg-amber-500 text-zinc-950 font-black border border-amber-400'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {p}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
