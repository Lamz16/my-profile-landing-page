import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AboutSection from './components/AboutSection';
import PortfolioSection from './components/PortfolioSection';
import CertificateSection from './components/CertificateSection';
import ContactSection from './components/ContactSection';
import EditModal from './components/EditModal';

import { ProfileInfo, PortfolioItem, CertificateItem } from './types';
import { DEFAULT_PROFILE, DEFAULT_PORTFOLIO, DEFAULT_CERTIFICATES } from './data';
import { Terminal, Shield, Hammer, Info } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<ProfileInfo>(DEFAULT_PROFILE);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(DEFAULT_PORTFOLIO);
  const [certificates, setCertificates] = useState<CertificateItem[]>(DEFAULT_CERTIFICATES);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load state from localStorage on Mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('profile_data_custom');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      const savedPortfolio = localStorage.getItem('portfolio_data_custom');
      if (savedPortfolio) {
        setPortfolio(JSON.parse(savedPortfolio));
      }

      const savedCertificates = localStorage.getItem('certificates_data_custom');
      if (savedCertificates) {
        setCertificates(JSON.parse(savedCertificates));
      }
    } catch (e) {
      console.error("Failed to load saved state from localStorage:", e);
    }
  }, []);

  // Update handlers
  const handleSaveProfile = (updated: ProfileInfo) => {
    setProfile(updated);
    localStorage.setItem('profile_data_custom', JSON.stringify(updated));
  };

  const handleSavePortfolio = (updated: PortfolioItem[]) => {
    setPortfolio(updated);
    localStorage.setItem('portfolio_data_custom', JSON.stringify(updated));
  };

  const handleSaveCertificates = (updated: CertificateItem[]) => {
    setCertificates(updated);
    localStorage.setItem('certificates_data_custom', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#cbd5e1] font-sans selection:bg-[#fca311] selection:text-black">
      
      {/* 1. Header/Navigation */}
      <Header
        name={profile.name}
        onOpenEdit={() => setIsEditModalOpen(true)}
      />

      {/* Main Sections */}
      <main className="pt-20">
        
        {/* Quick notification banner at the very top (Optional but beautiful style highlight) */}
        <div className="bg-[#14171c] border-b border-[#22262e] py-2 px-4 text-center font-mono text-[10px] tracking-widest text-[#fca311]">
          <span>INDUSTRIAL WORKSPACE EDITION // FULLY INTERACTIVE & EDITABLE</span>
        </div>

        {/* 2. Hero & About Me */}
        <AboutSection profile={profile} />

        {/* 3. Portfolio Projects Showcase */}
        <PortfolioSection items={portfolio} />

        {/* 4. Professional Credentials */}
        <CertificateSection items={certificates} />

        {/* 5. Contact Form Section */}
        <ContactSection
          email={profile.email}
          phone={profile.phone}
          location={profile.location}
        />
      </main>

      {/* 6. Industrial Aesthetic Footer */}
      <footer className="bg-[#0a0c0e] border-t border-[#22262e] py-12 text-[#64748b] font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-[#22262e]/40 pb-8">
            
            {/* Left section: Identity */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-black tracking-wider uppercase">
                <Hammer className="w-4 h-4 text-[#f0643b]" />
                <span>{profile.name}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                Platform portofolio rekayasa web dan desain antarmuka responsif yang dapat dikelola sepenuhnya secara waktu nyata (real-time).
              </p>
            </div>

            {/* Middle section: System specs info */}
            <div className="space-y-1 text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5 font-bold text-[#fca311]">
                <Shield className="w-3.5 h-3.5 text-[#f0643b]" />
                <span>SISTEM INFORMASI DATA</span>
              </div>
              <p>MEDIA PENYIMPANAN: LOCALSTORAGE ENGINE</p>
              <p>AKSES EDIT: AKTIF & TERKLASIFIKASI</p>
              <p>VERSI WORKSPACE: v2.5.1 (INDUSTRIAL RUST)</p>
            </div>

            {/* Right section: Quick action indicator */}
            <div className="md:text-right space-y-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1 bg-[#14171c] hover:bg-zinc-800 text-[#fca311] border border-[#22262e] hover:border-[#fca311]/50 py-1.5 px-3 rounded-sm font-bold text-[10px] tracking-wider uppercase cursor-pointer transition-colors"
              >
                <span>BUKA CONTROL PANEL</span>
              </button>
              <p className="text-[9px] text-slate-600 block">DILENGKAPI KOTAK MASUK FORMULIR KONTAK</p>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-600">
            <div>
              <span>&copy; {new Date().getFullYear()} {profile.name.toUpperCase()}. HAK CIPTA DILINDUNGI UNDANG-UNDANG.</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#f0643b]">
              <Terminal className="w-3.5 h-3.5" />
              <span>CRAFTED IN INDUSTRIAL MODERN SPACE</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 7. Floating control panel modal */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        portfolio={portfolio}
        certificates={certificates}
        onSaveProfile={handleSaveProfile}
        onSavePortfolio={handleSavePortfolio}
        onSaveCertificates={handleSaveCertificates}
      />

    </div>
  );
}
