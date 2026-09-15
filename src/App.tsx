import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AboutSection from './components/AboutSection';
import PortfolioSection from './components/PortfolioSection';
import CertificateSection from './components/CertificateSection';
import ContactSection from './components/ContactSection';
import { AdminPanel } from './components/AdminPanel';

import { ProfileInfo, PortfolioItem, CertificateItem } from './types';
import { DEFAULT_PROFILE, DEFAULT_PORTFOLIO, DEFAULT_CERTIFICATES } from './data';
import { Terminal, Shield, Hammer, Database } from 'lucide-react';
import { api } from './api/client';

export default function App() {
  const [profile, setProfile] = useState<ProfileInfo>(DEFAULT_PROFILE);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(DEFAULT_PORTFOLIO);
  const [certificates, setCertificates] = useState<CertificateItem[]>(DEFAULT_CERTIFICATES);
  
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Load profile from PostgreSQL API on mount
  const loadProfileFromDb = async () => {
    try {
      const profData = await api.getProfile();
      setProfile(profData);
    } catch (e) {
      console.warn("Could not fetch profile from server, using local fallback:", e);
      const savedProfile = localStorage.getItem('profile_data_custom');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    }
  };

  useEffect(() => {
    loadProfileFromDb();
  }, []);

  const handleRefreshAllData = () => {
    loadProfileFromDb();
  };

  // Quick edit modal save handlers
  const handleSaveProfile = (updated: ProfileInfo) => {
    setProfile(updated);
    localStorage.setItem('profile_data_custom', JSON.stringify(updated));
    // also attempt async server update
    api.updateProfile(updated).catch(() => {});
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
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
      />

      {/* Main Sections */}
      <main className="pt-20">
        
        {/* PostgreSQL Banner */}
        <div className="bg-[#14171c] border-b border-[#22262e] py-2 px-4 text-center font-mono text-[10px] tracking-widest text-[#fca311] flex items-center justify-center gap-2">
          <Database className="w-3.5 h-3.5 text-amber-500" />
          <span>FULL-STACK POSTGRESQL ENGINE • SOLID ARCHITECTURE • PAGINATED SHOWCASE</span>
        </div>

        {/* 2. Hero & About Me */}
        <AboutSection profile={profile} />

        {/* 3. Portfolio Projects Showcase (Paginated) */}
        <PortfolioSection initialItems={portfolio} />

        {/* 4. Professional Credentials (Paginated) */}
        <CertificateSection initialItems={certificates} />

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
            
            {/* Identity */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-black tracking-wider uppercase">
                <Hammer className="w-4 h-4 text-[#f0643b]" />
                <span>{profile.name}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
                Platform web portofolio full-stack terintegrasi database PostgreSQL dengan arsitektur SOLID & Repository Pattern.
              </p>
            </div>

            {/* System specs info */}
            <div className="space-y-1 text-[10px] text-slate-500">
              <div className="flex items-center gap-1.5 font-bold text-[#fca311]">
                <Shield className="w-3.5 h-3.5 text-[#f0643b]" />
                <span>DATABASE POSTGRESQL & AUTH</span>
              </div>
              <p>SCHEMA: 3NF NORMALIZED RELATIONAL</p>
              <p>ADMIN AUTH: JWT + BCRYPTHASH</p>
              <p>PAGINATION: SERVER-SIDE LIMIT/OFFSET</p>
            </div>

            {/* Admin trigger button */}
            <div className="md:text-right space-y-2">
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 border border-amber-400 py-2 px-4 rounded-sm font-black text-[11px] tracking-wider uppercase cursor-pointer transition-all shadow-md"
              >
                <span>BUKA ADMIN PORTAL POSTGRES</span>
              </button>
              <p className="text-[9px] text-slate-600 block">KELOLA SELURUH DATA KONTEN REAL-TIME</p>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-600">
            <div>
              <span>&copy; {new Date().getFullYear()} {profile.name.toUpperCase()}. HAK CIPTA DILINDUNGI UNDANG-UNDANG.</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#f0643b]">
              <Terminal className="w-3.5 h-3.5" />
              <span>POSTGRESQL FULL-STACK WORKSPACE</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 7. Admin Panel Portal */}
      {isAdminPanelOpen && (
        <AdminPanel
          onClose={() => setIsAdminPanelOpen(false)}
          onRefreshData={handleRefreshAllData}
        />
      )}

    </div>
  );
}
