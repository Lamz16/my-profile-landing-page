import React, { useState, useEffect } from 'react';
import { ExternalLink, Github, Layers, Search, RefreshCw } from 'lucide-react';
import { PortfolioItem, PaginatedResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api/client';
import { Pagination } from './Pagination';
import { ProjectCarousel } from './ProjectCarousel';

interface PortfolioSectionProps {
  initialItems?: PortfolioItem[];
}

export default function PortfolioSection({ initialItems }: PortfolioSectionProps) {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsResult, setProjectsResult] = useState<PaginatedResult<PortfolioItem> | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ['Semua', 'Mobile Development', 'Web Development', 'Freelance Project'];

  const fetchPaginatedProjects = async () => {
    setLoading(true);
    try {
      const res = await api.getProjects(currentPage, 4, activeCategory, searchQuery);
      setProjectsResult(res);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaginatedProjects();
  }, [currentPage, activeCategory, searchQuery]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const itemsToDisplay = projectsResult?.data || initialItems || [];

  return (
    <section id="portofolio" className="py-24 bg-[#0d0f12] text-[#cbd5e1] border-b border-[#22262e] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="max-w-3xl mb-12 space-y-3 font-mono">
          <div className="inline-flex items-center gap-1.5 bg-[#14171c] text-[#fca311] text-[10px] uppercase font-bold tracking-widest px-3 py-1 border border-[#22262e] rounded-sm">
            <Layers className="w-3.5 h-3.5 text-[#f0643b]" />
            <span>PORTOFOLIO SHOWCASE (POSTGRESQL PAGINATED)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-wider text-white uppercase">
            PROYEK PILIHAN & KARYA TEKNIK
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans text-justify">
            Eksplorasi rekayasa perangkat lunak mobile & web yang disimpan dan di-query langsung dari database PostgreSQL ter-normalisasi dengan dukungan pagination halaman.
          </p>
        </div>

        {/* CONTROLS: CATEGORIES & SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 font-mono">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 text-xs font-bold tracking-wider uppercase border rounded-sm transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#f0643b] text-black border-[#f0643b] font-black shadow-[2px_2px_0px_0px_#fca311]'
                    : 'bg-[#14171c] hover:bg-[#1e222b] text-slate-400 hover:text-white border-[#22262e]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Cari nama / teknologi..."
              className="w-full bg-[#14171c] border border-[#22262e] rounded-sm pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#fca311]"
            />
          </div>
        </div>

        {/* PROJECTS GRID */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-amber-500 font-mono text-xs gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Memuat data proyek dari PostgreSQL...</span>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            <AnimatePresence mode="popLayout">
              {itemsToDisplay.map((item) => (
                <motion.div
                  layout
                  id={`portfolio-item-${item.id}`}
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="group flex flex-col bg-[#14171c] border border-[#22262e] hover:border-[#f0643b]/40 rounded-sm overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 relative"
                >
                  {/* Image Carousel Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0d0f12] border-b border-[#22262e]">
                    <ProjectCarousel
                      images={item.images && item.images.length > 0 ? item.images : [item.image]}
                      title={item.title}
                    />
                    <div className="absolute top-2 left-2 pointer-events-none z-10 font-mono">
                      <span className="inline-block bg-black/85 backdrop-blur-sm text-[#fca311] border border-[#22262e] text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-mono font-black text-white group-hover:text-[#fca311] transition-colors duration-200 uppercase tracking-wide">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed text-justify font-sans">
                        {item.description}
                      </p>
                    </div>

                    {/* Tags and Links */}
                    <div className="space-y-4 pt-4 border-t border-[#22262e] font-mono">
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-[#0d0f12] text-[#fca311] text-[9px] font-bold px-2 py-0.5 rounded-sm border border-[#22262e] uppercase tracking-wider"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs font-bold tracking-wider pt-1">
                        {item.demoUrl && (
                          <a
                            href={item.demoUrl}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[#f0643b] hover:text-[#fca311] transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5px]" />
                            <span>LIVE DEMO</span>
                          </a>
                        )}
                        {item.githubUrl && (
                          <a
                            href={item.githubUrl}
                            target="_blank"
                            referrerPolicy="no-referrer"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                          >
                            <Github className="w-3.5 h-3.5 stroke-[2.5px]" />
                            <span>REPOSITORI</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {itemsToDisplay.length === 0 && !loading && (
          <div className="text-center py-12 font-mono">
            <p className="text-slate-500">Tidak ada proyek yang sesuai dengan pencarian atau filter.</p>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {projectsResult && (
          <div className="mt-8">
            <Pagination
              currentPage={projectsResult.pagination.page}
              totalPages={projectsResult.pagination.totalPages}
              totalItems={projectsResult.pagination.total}
              limit={projectsResult.pagination.limit}
              onPageChange={setCurrentPage}
              itemLabel="proyek"
            />
          </div>
        )}

      </div>
    </section>
  );
}
