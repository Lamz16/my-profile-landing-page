import React, { useState, useEffect } from 'react';
import { Menu, X, Edit, Cpu, Award, FolderGit2, User, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  name: string;
  onOpenEdit: () => void;
}

export default function Header({ name, onOpenEdit }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'TENTANG SAYA', href: '#tentang', icon: User },
    { label: 'PORTOFOLIO', href: '#portofolio', icon: FolderGit2 },
    { label: 'SERTIFIKAT', href: '#sertifikat', icon: Award },
    { label: 'KONTAK', href: '#kontak', icon: PhoneCall },
  ];

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-mono ${
        isScrolled
          ? 'bg-[#0d0f12]/90 backdrop-blur-md border-b border-[#22262e] py-3.5'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo / Name - Industrial Vibe */}
          <motion.a
            id="logo-brand"
            href="#"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 font-mono font-black text-lg tracking-wider text-white"
          >
            <div className="w-8 h-8 bg-[#f0643b] text-black flex items-center justify-center font-black rounded-sm shadow-[2px_2px_0px_0px_#fca311]">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="uppercase text-sm sm:text-base">
              {name.split(' ')[0]}<span className="text-[#fca311] font-bold">_DEV</span>
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[11px] font-bold tracking-widest text-slate-400 hover:text-[#fca311] transition-colors relative group py-1"
              >
                <span>{item.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#f0643b] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Edit Profile Trigger & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button
              id="edit-profile-btn"
              onClick={onOpenEdit}
              className="flex items-center gap-2 bg-[#14171c] hover:bg-[#1e222b] text-[#fca311] border border-[#2c313d] hover:border-[#fca311]/50 font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-sm transition-all duration-200 cursor-pointer shadow-sm"
              title="Akses panel edit profil"
            >
              <Edit className="w-3.5 h-3.5 text-[#f0643b]" />
              <span className="hidden sm:inline">KELOLA PROFIL</span>
            </button>

            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-sm bg-[#14171c] border border-[#2c313d] text-slate-300 hover:text-[#f0643b] focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#0d0f12] border-b border-[#22262e]"
          >
            <div className="px-4 pt-2 pb-6 space-y-1 bg-[#14171c]/50">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3.5 rounded-sm text-xs font-bold tracking-widest text-slate-300 hover:bg-[#1a1e26] hover:text-[#fca311] transition-colors border-l-2 border-transparent hover:border-[#f0643b]"
                >
                  <item.icon className="w-4 h-4 text-[#f0643b]" />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

