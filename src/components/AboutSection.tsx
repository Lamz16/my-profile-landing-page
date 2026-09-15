import React from 'react';
import { MapPin, Mail, Github, Linkedin, Instagram, ArrowRight, Settings, Code2, Database, Palette, Lightbulb } from 'lucide-react';
import { ProfileInfo } from '../types';
import { motion } from 'motion/react';

interface AboutSectionProps {
  profile: ProfileInfo;
}

export default function AboutSection({ profile }: AboutSectionProps) {
  // Group skills by category
  const skillsByCategory = {
    frontend: profile.skills.filter(s => s.category === 'frontend'),
    backend: profile.skills.filter(s => s.category === 'backend'),
    design: profile.skills.filter(s => s.category === 'design'),
    other: profile.skills.filter(s => s.category === 'other'),
  };

  const categories = [
    { key: 'frontend', label: 'MOBILE & FRONTEND', icon: Code2, color: 'text-orange-500 bg-orange-950/20 border-orange-900/30' },
    { key: 'backend', label: 'BACKEND & NETWORKING', icon: Database, color: 'text-amber-500 bg-amber-950/20 border-amber-900/30' },
    { key: 'design', label: 'ARCHITECTURE & DATA', icon: Palette, color: 'text-yellow-500 bg-yellow-950/20 border-yellow-900/30' },
    { key: 'other', label: 'TOOLS & WORKFLOWS', icon: Lightbulb, color: 'text-zinc-400 bg-zinc-900/40 border-zinc-800' },
  ];

  return (
    <section id="tentang" className="py-24 bg-[#0d0f12] text-[#cbd5e1] relative overflow-hidden industrial-grid border-b border-[#22262e]">
      
      {/* Structural Industrial Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#f0643b]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#fca311]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HERO INTRO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24">
          <div className="lg:col-span-7 space-y-6">
            
            {/* Status Flag */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest bg-[#14171c] text-[#fca311] border border-[#22262e] shadow-inner"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#fca311] animate-pulse" />
              <span>TERSEDIA UNTUK FREELANCE & KOLABORASI</span>
            </motion.div>

            {/* Main Name Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-mono font-black tracking-tight text-white uppercase leading-none"
            >
              HALO, SAYA <br/>
              <span className="text-[#f0643b] selection:bg-[#fca311]">{profile.name}</span>
            </motion.h1>

            {/* Professional Title */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm sm:text-base font-mono font-bold tracking-widest text-[#fca311] border-l-2 border-[#fca311] pl-3 uppercase"
            >
              {profile.title}
            </motion.p>

            {/* Bio text */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-slate-400 max-w-xl leading-relaxed text-sm text-justify font-sans"
            >
              {profile.bio}
            </motion.p>

            {/* Location tag */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-2 text-slate-500 text-xs font-mono font-semibold"
            >
              <MapPin className="w-4 h-4 text-[#f0643b]" />
              <span className="uppercase tracking-widest">{profile.location}</span>
            </motion.div>

            {/* Social Icons & Call To Action */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center gap-4 pt-4 font-mono"
            >
              <a
                href="#kontak"
                className="inline-flex items-center gap-2 bg-[#f0643b] hover:bg-[#e0542b] text-black font-extrabold text-xs tracking-widest uppercase py-3.5 px-6 rounded-sm shadow-[3px_3px_0px_0px_#fca311] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#fca311] transition-all duration-200 cursor-pointer"
              >
                <span>HUBUNGI SAYA</span>
                <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </a>

              <div className="flex items-center gap-2">
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#14171c] hover:bg-[#1e222b] border border-[#22262e] rounded-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#14171c] hover:bg-[#1e222b] border border-[#22262e] rounded-sm text-slate-400 hover:text-[#fca311] transition-colors cursor-pointer"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#14171c] hover:bg-[#1e222b] border border-[#22262e] rounded-sm text-slate-400 hover:text-[#f0643b] transition-colors cursor-pointer"
                  title="Instagram Profile"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* AVATAR AND STATS - INDUSTRIAL SHARP BOX */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative w-72 h-72 sm:w-80 sm:h-80 bg-[#14171c] border-2 border-[#2c313d] p-3 shadow-[6px_6px_0px_0px_#f0643b] rounded-sm"
            >
              {/* Outer structural bounds corner marks */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#fca311]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#fca311]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#fca311]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#fca311]" />

              <div className="w-full h-full overflow-hidden bg-[#0d0f12] border border-[#22262e]">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </motion.div>

            {/* Quick stats panel */}
            <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-sm font-mono">
              <div className="p-4 bg-[#14171c] border border-[#22262e] text-center rounded-sm">
                <p className="text-2xl font-black text-[#f0643b]">3+</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">TAHUN PENGALAMAN</p>
              </div>
              <div className="p-4 bg-[#14171c] border border-[#22262e] text-center rounded-sm">
                <p className="text-2xl font-black text-[#fca311]">20+</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">PROYEK SELESAI</p>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED BIO & SKILLS BENTO GRID */}
        <div className="border-t border-[#22262e] pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 font-sans">
          
          {/* Detailed Bio - Raw steel text look */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-xl font-mono font-black tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-4 bg-[#f0643b] inline-block"></span>
              TENTANG SAYA
            </h2>
            <p className="text-slate-400 leading-relaxed text-justify text-sm">
              {profile.longBio}
            </p>
            
            <div className="p-5 bg-[#14171c]/50 border border-[#22262e] rounded-sm font-mono space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#fca311]">
                <Settings className="w-4 h-4 text-[#f0643b] animate-spin" style={{ animationDuration: '6s' }} />
                <span>FILOSOFI KERJA</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed text-justify font-sans">
                Menulis kode yang fungsional, modular, dan efisien merupakan prioritas utama saya. Saya meyakini setiap lini kode harus ditulis dengan presisi guna menghasilkan sistem berkinerja tinggi yang berkelanjutan.
              </p>
            </div>
          </div>

          {/* Skills Lists with industrial level slider look */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="text-xl font-mono font-black tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-4 bg-[#fca311] inline-block"></span>
              PENGUASAAN TEKNIS
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {categories.map((cat) => {
                const list = skillsByCategory[cat.key as keyof typeof skillsByCategory] || [];
                if (list.length === 0) return null;

                return (
                  <div
                    key={cat.key}
                    className="p-5 bg-[#14171c] border border-[#22262e] rounded-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-5 font-mono">
                        <div className={`p-1.5 border rounded-sm ${cat.color}`}>
                          <cat.icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-extrabold text-white text-[11px] tracking-wider">{cat.label}</h3>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {list.map((skill) => (
                          <span
                            key={skill.name}
                            className="bg-[#0d0f12] text-slate-300 hover:text-[#fca311] hover:border-[#fca311]/50 transition-colors text-[10px] font-mono font-bold px-2.5 py-1.5 border border-[#22262e] rounded-sm uppercase tracking-wider inline-block"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
