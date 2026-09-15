import React, { useState, useEffect } from 'react';
import { Award, Eye, ExternalLink, Calendar, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { CertificateItem, PaginatedResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api/client';
import { Pagination } from './Pagination';

interface CertificateSectionProps {
  initialItems?: CertificateItem[];
}

export default function CertificateSection({ initialItems }: CertificateSectionProps) {
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [certsResult, setCertsResult] = useState<PaginatedResult<CertificateItem> | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPaginatedCerts = async () => {
    setLoading(true);
    try {
      const res = await api.getCertificates(currentPage, 6);
      setCertsResult(res);
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaginatedCerts();
  }, [currentPage]);

  const itemsToDisplay = certsResult?.data || initialItems || [];

  return (
    <section id="sertifikat" className="py-24 bg-[#0a0c0e] text-[#cbd5e1] border-b border-[#22262e] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="max-w-3xl mb-16 space-y-3 font-mono">
          <div className="inline-flex items-center gap-1.5 bg-[#14171c] text-[#fca311] text-[10px] uppercase font-bold tracking-widest px-3 py-1 border border-[#22262e] rounded-sm">
            <Award className="w-3.5 h-3.5 text-[#f0643b]" />
            <span>SERTIFIKASI TEKNIK (POSTGRESQL PAGINATED)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-wider text-white uppercase">
            KREDENSIAL INDUSTRI & KOMPETENSI
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans text-justify">
            Verifikasi kompetensi profesional saya melalui sertifikasi resmi yang tersimpan di PostgreSQL database.
          </p>
        </div>

        {/* CERTIFICATE GRID */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-amber-500 font-mono text-xs gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Memuat data sertifikat...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {itemsToDisplay.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-col bg-[#14171c] border border-[#22262e] rounded-sm overflow-hidden shadow-sm hover:shadow-lg hover:border-[#fca311]/40 transition-all duration-300 group"
              >
                {/* Image preview */}
                <div className="relative aspect-video w-full bg-[#0d0f12] overflow-hidden border-b border-[#22262e]">
                  <img
                    src={cert.image}
                    alt={cert.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="p-3 bg-[#fca311] text-black font-extrabold rounded-sm shadow-md hover:bg-white transition-colors cursor-pointer"
                      title="Zoom sertifikat"
                    >
                      <Eye className="w-4 h-4 stroke-[2.5px]" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-mono font-black text-white text-sm sm:text-base leading-snug uppercase tracking-wide group-hover:text-[#fca311] transition-colors">
                      {cert.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold font-mono">
                      <ShieldCheck className="w-4 h-4 text-orange-500" />
                      <span className="uppercase tracking-widest">{cert.issuer}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#22262e] space-y-3 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-[#f0643b]" />
                      <span>DITERBITKAN: {cert.date.toUpperCase()}</span>
                    </div>

                    {cert.credentialId && (
                      <div className="font-mono bg-[#0d0f12] text-[#fca311] py-1 px-2 border border-[#22262e] rounded-sm truncate uppercase tracking-widest text-[9px] font-bold">
                        ID: {cert.credentialId}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2 font-bold tracking-wider text-[10px]">
                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="text-[#fca311] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 stroke-[2.5px]" />
                        <span>PREVIEW</span>
                      </button>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer"
                          className="text-[#f0643b] hover:text-[#fca311] transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <span>VERIFIKASI</span>
                          <ExternalLink className="w-3.5 h-3.5 stroke-[2.5px]" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {certsResult && (
          <div className="mt-12">
            <Pagination
              currentPage={certsResult.pagination.page}
              totalPages={certsResult.pagination.totalPages}
              totalItems={certsResult.pagination.total}
              limit={certsResult.pagination.limit}
              onPageChange={setCurrentPage}
              itemLabel="sertifikat"
            />
          </div>
        )}

        {/* LIGHTBOX MODAL */}
        <AnimatePresence>
          {selectedCert && (
            <div id="certificate-lightbox" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCert(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="relative bg-[#14171c] border-2 border-[#2c313d] rounded-sm overflow-hidden shadow-2xl max-w-3xl w-full z-10"
              >
                <div className="flex items-center justify-between p-4 border-b border-[#22262e] font-mono">
                  <div className="space-y-0.5">
                    <h3 className="font-black text-white text-sm uppercase tracking-wider pr-4">
                      {selectedCert.name}
                    </h3>
                    <p className="text-[10px] text-[#fca311] font-bold uppercase tracking-widest">{selectedCert.issuer}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="p-1.5 rounded-sm bg-[#0d0f12] text-slate-400 hover:text-white border border-[#22262e] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 bg-[#0d0f12] max-h-[70vh] overflow-y-auto flex items-center justify-center">
                  <img
                    src={selectedCert.image}
                    alt={selectedCert.name}
                    referrerPolicy="no-referrer"
                    className="max-w-full h-auto max-h-[60vh] object-contain rounded-sm border border-[#22262e]"
                  />
                </div>

                {selectedCert.credentialUrl && (
                  <div className="p-4 bg-[#14171c] border-t border-[#22262e] flex justify-end font-mono">
                    <a
                      href={selectedCert.credentialUrl}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#f0643b] hover:bg-[#e0542b] text-black font-extrabold text-xs tracking-wider py-2.5 px-4 rounded-sm shadow-[2px_2px_0px_0px_#fca311]"
                    >
                      <span>SITUS VERIFIKASI ASLI</span>
                      <ExternalLink className="w-4 h-4 stroke-[2.5px]" />
                    </a>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
