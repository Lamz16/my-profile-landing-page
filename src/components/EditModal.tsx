import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Mail, Award, FolderGit2, User, Key, Check, PlusCircle, LayoutGrid, Terminal } from 'lucide-react';
import { ProfileInfo, PortfolioItem, CertificateItem, Skill } from '../types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileInfo;
  portfolio: PortfolioItem[];
  certificates: CertificateItem[];
  onSaveProfile: (profile: ProfileInfo) => void;
  onSavePortfolio: (portfolio: PortfolioItem[]) => void;
  onSaveCertificates: (certificates: CertificateItem[]) => void;
}

export default function EditModal({
  isOpen,
  onClose,
  profile,
  portfolio,
  certificates,
  onSaveProfile,
  onSavePortfolio,
  onSaveCertificates
}: EditModalProps) {
  const [activeTab, setActiveTab] = useState<'profil' | 'skills' | 'portofolio' | 'sertifikat' | 'inbox'>('profil');

  // Local Form States
  const [localProfile, setLocalProfile] = useState<ProfileInfo>({ ...profile });
  const [localPortfolio, setLocalPortfolio] = useState<PortfolioItem[]>([...portfolio]);
  const [localCertificates, setLocalCertificates] = useState<CertificateItem[]>([...certificates]);
  const [localInbox, setLocalInbox] = useState<any[]>([]);

  // Skill Add State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'frontend' | 'backend' | 'design' | 'other'>('frontend');
  const [newSkillLevel, setNewSkillLevel] = useState(80);

  // Portfolio Add/Edit State
  const [editingPortId, setEditingPortId] = useState<string | null>(null);
  const [portForm, setPortForm] = useState<Partial<PortfolioItem>>({
    title: '',
    description: '',
    category: '',
    image: '',
    tags: [],
    demoUrl: '',
    githubUrl: ''
  });
  const [tempTag, setTempTag] = useState('');

  // Certificate Add/Edit State
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certForm, setCertForm] = useState<Partial<CertificateItem>>({
    name: '',
    issuer: '',
    date: '',
    credentialId: '',
    credentialUrl: '',
    image: ''
  });

  // Load Inbox from localStorage on open
  useEffect(() => {
    if (isOpen) {
      setLocalProfile({ ...profile });
      setLocalPortfolio([...portfolio]);
      setLocalCertificates([...certificates]);

      const loadInbox = () => {
        try {
          const stored = localStorage.getItem('profile_inbox');
          setLocalInbox(stored ? JSON.parse(stored) : []);
        } catch (e) {
          console.error(e);
        }
      };
      loadInbox();

      // Listen for contact form submission during session
      window.addEventListener('storage', loadInbox);
      return () => window.removeEventListener('storage', loadInbox);
    }
  }, [isOpen, profile, portfolio, certificates]);

  if (!isOpen) return null;

  // --- Profile Handlers ---
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalProfile({
      ...localProfile,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfileData = () => {
    onSaveProfile(localProfile);
    alert('Informasi profil berhasil disimpan!');
  };

  // --- Skill Handlers ---
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill: Skill = {
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: newSkillLevel
    };
    const updatedSkills = [...localProfile.skills, newSkill];
    const updatedProfile = { ...localProfile, skills: updatedSkills };
    setLocalProfile(updatedProfile);
    onSaveProfile(updatedProfile);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = localProfile.skills.filter((_, i) => i !== index);
    const updatedProfile = { ...localProfile, skills: updatedSkills };
    setLocalProfile(updatedProfile);
    onSaveProfile(updatedProfile);
  };

  // --- Portfolio Handlers ---
  const handleSavePortfolioItem = () => {
    if (!portForm.title || !portForm.description || !portForm.category) {
      alert('Harap isi Judul, Deskripsi, dan Kategori proyek.');
      return;
    }

    let updatedList: PortfolioItem[];
    if (editingPortId) {
      // Edit existing
      updatedList = localPortfolio.map(item =>
        item.id === editingPortId
          ? { ...item, ...portForm, tags: portForm.tags || [] } as PortfolioItem
          : item
      );
    } else {
      // Add new
      const newItem: PortfolioItem = {
        id: Date.now().toString(),
        title: portForm.title,
        description: portForm.description,
        category: portForm.category,
        image: portForm.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        tags: portForm.tags || [],
        demoUrl: portForm.demoUrl,
        githubUrl: portForm.githubUrl
      };
      updatedList = [...localPortfolio, newItem];
    }

    setLocalPortfolio(updatedList);
    onSavePortfolio(updatedList);
    resetPortfolioForm();
    alert('Daftar portofolio berhasil diperbarui!');
  };

  const resetPortfolioForm = () => {
    setEditingPortId(null);
    setPortForm({
      title: '',
      description: '',
      category: '',
      image: '',
      tags: [],
      demoUrl: '',
      githubUrl: ''
    });
    setTempTag('');
  };

  const handleEditPortfolio = (item: PortfolioItem) => {
    setEditingPortId(item.id);
    setPortForm(item);
  };

  const handleDeletePortfolio = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
      const updated = localPortfolio.filter(item => item.id !== id);
      setLocalPortfolio(updated);
      onSavePortfolio(updated);
    }
  };

  const handleAddTag = () => {
    if (!tempTag.trim()) return;
    const currentTags = portForm.tags || [];
    if (!currentTags.includes(tempTag.trim())) {
      setPortForm({
        ...portForm,
        tags: [...currentTags, tempTag.trim()]
      });
    }
    setTempTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPortForm({
      ...portForm,
      tags: (portForm.tags || []).filter(t => t !== tagToRemove)
    });
  };

  // --- Certificate Handlers ---
  const handleSaveCertificateItem = () => {
    if (!certForm.name || !certForm.issuer || !certForm.date) {
      alert('Harap isi Nama Sertifikat, Penerbit, dan Tanggal.');
      return;
    }

    let updatedList: CertificateItem[];
    if (editingCertId) {
      updatedList = localCertificates.map(item =>
        item.id === editingCertId
          ? { ...item, ...certForm } as CertificateItem
          : item
      );
    } else {
      const newItem: CertificateItem = {
        id: Date.now().toString(),
        name: certForm.name,
        issuer: certForm.issuer,
        date: certForm.date,
        credentialId: certForm.credentialId,
        credentialUrl: certForm.credentialUrl,
        image: certForm.image || 'https://images.unsplash.com/photo-1589330694653-ded6df53f6ee?auto=format&fit=crop&w=800&q=80'
      };
      updatedList = [...localCertificates, newItem];
    }

    setLocalCertificates(updatedList);
    onSaveCertificates(updatedList);
    resetCertificateForm();
    alert('Daftar sertifikasi berhasil diperbarui!');
  };

  const resetCertificateForm = () => {
    setEditingCertId(null);
    setCertForm({
      name: '',
      issuer: '',
      date: '',
      credentialId: '',
      credentialUrl: '',
      image: ''
    });
  };

  const handleEditCertificate = (item: CertificateItem) => {
    setEditingCertId(item.id);
    setCertForm(item);
  };

  const handleDeleteCertificate = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus sertifikat ini?')) {
      const updated = localCertificates.filter(item => item.id !== id);
      setLocalCertificates(updated);
      onSaveCertificates(updated);
    }
  };

  // --- Inbox Handlers ---
  const handleClearInbox = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan semua pesan masuk?')) {
      localStorage.removeItem('profile_inbox');
      setLocalInbox([]);
    }
  };

  return (
    <div id="admin-edit-modal" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative bg-zinc-900 border border-zinc-700/80 rounded-xl overflow-hidden w-full max-w-5xl h-[92vh] sm:h-[85vh] flex flex-col shadow-2xl font-mono text-zinc-100">
        
        {/* Header Panel */}
        <div className="bg-zinc-950 border-b border-zinc-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold tracking-wider text-amber-500 uppercase">Panel Kontrol Pengelola Profil</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Sidebar Nav */}
          <div className="md:w-60 bg-zinc-950/40 border-b md:border-b-0 md:border-r border-zinc-800 p-2 sm:p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('profil')}
              className={`flex items-center gap-2 py-2 px-3 rounded text-xs font-bold transition-all text-left w-full cursor-pointer whitespace-nowrap ${
                activeTab === 'profil'
                  ? 'bg-amber-600/10 text-amber-500 border-l-2 border-amber-500 font-extrabold'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>1. Biodata Utama</span>
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-2 py-2 px-3 rounded text-xs font-bold transition-all text-left w-full cursor-pointer whitespace-nowrap ${
                activeTab === 'skills'
                  ? 'bg-amber-600/10 text-amber-500 border-l-2 border-amber-500 font-extrabold'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span>2. Keahlian Teknis</span>
            </button>
            <button
              onClick={() => setActiveTab('portofolio')}
              className={`flex items-center gap-2 py-2 px-3 rounded text-xs font-bold transition-all text-left w-full cursor-pointer whitespace-nowrap ${
                activeTab === 'portofolio'
                  ? 'bg-amber-600/10 text-amber-500 border-l-2 border-amber-500 font-extrabold'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <FolderGit2 className="w-4 h-4 shrink-0" />
              <span>3. Portofolio</span>
            </button>
            <button
              onClick={() => setActiveTab('sertifikat')}
              className={`flex items-center gap-2 py-2 px-3 rounded text-xs font-bold transition-all text-left w-full cursor-pointer whitespace-nowrap ${
                activeTab === 'sertifikat'
                  ? 'bg-amber-600/10 text-amber-500 border-l-2 border-amber-500 font-extrabold'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span>4. Sertifikat</span>
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex items-center gap-2 py-2 px-3 rounded text-xs font-bold transition-all text-left w-full cursor-pointer relative whitespace-nowrap ${
                activeTab === 'inbox'
                  ? 'bg-amber-600/10 text-amber-500 border-l-2 border-amber-500 font-extrabold'
                  : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
              }`}
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span>5. Pesan Masuk</span>
              {localInbox.length > 0 && (
                <span className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 bg-amber-600 text-[9px] font-extrabold text-white rounded-full flex items-center justify-center">
                  {localInbox.length}
                </span>
              )}
            </button>
          </div>

          {/* Content Pane */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-zinc-900/60">
            
            {/* TAB 1: BIODATA */}
            {activeTab === 'profil' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold border-b border-zinc-800 pb-2 text-zinc-300 uppercase tracking-wide">Data Diri & Sosial</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Ubah informasi teks utama yang muncul di landing page profile Anda.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">NAMA LENGKAP</label>
                    <input
                      type="text"
                      name="name"
                      value={localProfile.name}
                      onChange={handleProfileChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">PEKERJAAN / GELAR</label>
                    <input
                      type="text"
                      name="title"
                      value={localProfile.title}
                      onChange={handleProfileChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">LOKASI</label>
                    <input
                      type="text"
                      name="location"
                      value={localProfile.location}
                      onChange={handleProfileChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">AVATAR URL (FOTO PROFIL)</label>
                    <input
                      type="text"
                      name="avatarUrl"
                      value={localProfile.avatarUrl}
                      onChange={handleProfileChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">E-MAIL</label>
                    <input
                      type="email"
                      name="email"
                      value={localProfile.email}
                      onChange={handleProfileChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">TELEPON / WA</label>
                    <input
                      type="text"
                      name="phone"
                      value={localProfile.phone}
                      onChange={handleProfileChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">GITHUB URL</label>
                    <input
                      type="text"
                      name="githubUrl"
                      value={localProfile.githubUrl}
                      onChange={handleProfileChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">LINKEDIN URL</label>
                    <input
                      type="text"
                      name="linkedinUrl"
                      value={localProfile.linkedinUrl}
                      onChange={handleProfileChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">INSTAGRAM URL</label>
                    <input
                      type="text"
                      name="instagramUrl"
                      value={localProfile.instagramUrl}
                      onChange={handleProfileChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400">BIO RINGKAS (HERO)</label>
                  <textarea
                    name="bio"
                    rows={2}
                    value={localProfile.bio}
                    onChange={handleProfileChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400">BIO DETAIL (TENTANG SAYA)</label>
                  <textarea
                    name="longBio"
                    rows={4}
                    value={localProfile.longBio}
                    onChange={handleProfileChange}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveProfileData}
                    className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-black font-extrabold text-xs py-2.5 px-5 rounded transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>SIMPAN BIODATA</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: SKILLS */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold border-b border-zinc-800 pb-2 text-zinc-300 uppercase tracking-wide">Keahlian Teknis</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Tambahkan atau hapus daftar keahlian teknis yang Anda kuasai.</p>
                </div>

                {/* Skill adder form */}
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-4">
                  <h4 className="text-xs font-bold text-amber-500">Tambah Keahlian Baru</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                    <div className="sm:col-span-7 space-y-1">
                      <label className="text-[10px] text-zinc-400">NAMA TEKNOLOGI / SKILL</label>
                      <input
                        type="text"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        placeholder="Contoh: Kotlin, Jetpack Compose, Docker"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-5 space-y-1">
                      <label className="text-[10px] text-zinc-400">KATEGORI</label>
                      <select
                        value={newSkillCategory}
                        onChange={(e) => setNewSkillCategory(e.target.value as any)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="frontend">Mobile & Frontend</option>
                        <option value="backend">Backend & Networking</option>
                        <option value="design">Architecture & Data</option>
                        <option value="other">Tools & Workflows</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleAddSkill}
                    className="inline-flex items-center gap-1.5 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border border-amber-500/30 text-xs font-bold py-2 px-4 rounded cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambahkan ke Profil</span>
                  </button>
                </div>

                {/* Skill lists by category */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-300">Daftar Keahlian Saat Ini ({localProfile.skills.length})</h4>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg divide-y divide-zinc-800/60 max-h-[300px] overflow-y-auto">
                    {localProfile.skills.map((skill, index) => (
                      <div key={`${skill.name}-${index}`} className="flex items-center justify-between p-3 text-xs hover:bg-zinc-900/40">
                        <div className="space-y-1">
                          <span className="font-bold text-zinc-200">{skill.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 uppercase tracking-wider">
                              {skill.category === 'frontend' ? 'Mobile & Frontend' : 
                               skill.category === 'backend' ? 'Backend & Networking' : 
                               skill.category === 'design' ? 'Architecture & Data' : 'Tools & Workflows'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSkill(index)}
                          className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-950/20 rounded cursor-pointer transition-all"
                          title="Hapus skill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {localProfile.skills.length === 0 && (
                      <div className="p-4 text-center text-zinc-500 text-xs">Belum ada data keahlian. Silakan tambahkan di atas.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PORTFOLIO */}
            {activeTab === 'portofolio' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold border-b border-zinc-800 pb-2 text-zinc-300 uppercase tracking-wide">
                    {editingPortId ? 'Edit Item Portofolio' : 'Tambah Portofolio Proyek'}
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Urus daftar karya unggulan Anda agar pengunjung dapat mengeksplorasi kode atau situs demo.</p>
                </div>

                {/* Editor form panel */}
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400">JUDUL PROYEK *</label>
                      <input
                        type="text"
                        value={portForm.title || ''}
                        onChange={(e) => setPortForm({ ...portForm, title: e.target.value })}
                        placeholder="Contoh: E-commerce Website"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400">KATEGORI *</label>
                      <input
                        type="text"
                        value={portForm.category || ''}
                        onChange={(e) => setPortForm({ ...portForm, category: e.target.value })}
                        placeholder="Contoh: Frontend Web, Full-Stack, IoT"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] text-zinc-400">DESKRIPSI PROYEK *</label>
                      <textarea
                        rows={3}
                        value={portForm.description || ''}
                        onChange={(e) => setPortForm({ ...portForm, description: e.target.value })}
                        placeholder="Deskripsikan fitur, tantangan, dan solusi proyek Anda..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] text-zinc-400">IMAGE URL</label>
                      <input
                        type="text"
                        value={portForm.image || ''}
                        onChange={(e) => setPortForm({ ...portForm, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400">LIVE DEMO URL (OPSIONAL)</label>
                      <input
                        type="text"
                        value={portForm.demoUrl || ''}
                        onChange={(e) => setPortForm({ ...portForm, demoUrl: e.target.value })}
                        placeholder="https://example.com/demo"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400">GITHUB REPO URL (OPSIONAL)</label>
                      <input
                        type="text"
                        value={portForm.githubUrl || ''}
                        onChange={(e) => setPortForm({ ...portForm, githubUrl: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Tag Manager inside project */}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-[10px] text-zinc-400 block">TEKNOLOGI YANG DIGUNAKAN (TAGS)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tempTag}
                          onChange={(e) => setTempTag(e.target.value)}
                          placeholder="Masukkan tag (contoh: React)"
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="bg-zinc-800 hover:bg-zinc-700 text-xs font-bold px-3 py-1 rounded cursor-pointer transition-colors"
                        >
                          Tambah Tag
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(portForm.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="bg-zinc-800 text-amber-500 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-zinc-700"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-red-500 font-extrabold focus:outline-none cursor-pointer"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleSavePortfolioItem}
                      className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-black font-extrabold text-xs py-2 px-4 rounded transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingPortId ? 'SIMPAN PERUBAHAN' : 'TAMBAHKAN KARYA'}</span>
                    </button>
                    {editingPortId && (
                      <button
                        onClick={resetPortfolioForm}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold py-2 px-4 rounded transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </div>

                {/* Listing Portfolio */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-300">Daftar Proyek Saat Ini ({localPortfolio.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {localPortfolio.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col justify-between hover:border-amber-500/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-xs text-zinc-100 line-clamp-1">{item.title}</span>
                            <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-amber-500 px-1 rounded uppercase">{item.category}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 line-clamp-2">{item.description}</p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-900 mt-4">
                          <button
                            onClick={() => handleEditPortfolio(item)}
                            className="text-[10px] font-bold text-amber-500 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-zinc-700 text-[10px]">|</span>
                          <button
                            onClick={() => handleDeletePortfolio(item.id)}
                            className="text-[10px] font-bold text-red-400 hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                    {localPortfolio.length === 0 && (
                      <div className="sm:col-span-2 text-center p-8 border border-zinc-800/50 rounded text-zinc-500 text-xs">Belum ada karya portofolio.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CERTIFICATE */}
            {activeTab === 'sertifikat' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold border-b border-zinc-800 pb-2 text-zinc-300 uppercase tracking-wide">
                    {editingCertId ? 'Edit Sertifikasi Kredensial' : 'Tambah Sertifikat Baru'}
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Kelola bukti kelulusan pelatihan, sertifikasi global, atau sertifikasi keahlian spesifik.</p>
                </div>

                {/* Editor form panel */}
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400">NAMA SERTIFIKAT *</label>
                      <input
                        type="text"
                        value={certForm.name || ''}
                        onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                        placeholder="Contoh: Certified Kubernetes Administrator"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400">ORGANISASI PENERBIT (ISSUER) *</label>
                      <input
                        type="text"
                        value={certForm.issuer || ''}
                        onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                        placeholder="Contoh: Cloud Native Computing Foundation"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400">TANGGAL TERBIT *</label>
                      <input
                        type="text"
                        value={certForm.date || ''}
                        onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                        placeholder="Contoh: Januari 2026 atau Seumur Hidup"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400">CREDENTIAL ID (OPSIONAL)</label>
                      <input
                        type="text"
                        value={certForm.credentialId || ''}
                        onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
                        placeholder="ID Sertifikasi"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] text-zinc-400">URL VERIFIKASI ASLI (OPSIONAL)</label>
                      <input
                        type="text"
                        value={certForm.credentialUrl || ''}
                        onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] text-zinc-400">GAMBAR / PREVIEW URL</label>
                      <input
                        type="text"
                        value={certForm.image || ''}
                        onChange={(e) => setCertForm({ ...certForm, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleSaveCertificateItem}
                      className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-black font-extrabold text-xs py-2 px-4 rounded transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingCertId ? 'SIMPAN PERUBAHAN' : 'TAMBAH SERTIFIKAT'}</span>
                    </button>
                    {editingCertId && (
                      <button
                        onClick={resetCertificateForm}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold py-2 px-4 rounded transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </div>

                {/* Certificate List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-300">Daftar Sertifikat Saat Ini ({localCertificates.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {localCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col justify-between hover:border-amber-500/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <span className="font-bold text-xs text-zinc-100 line-clamp-1">{cert.name}</span>
                          <span className="text-[9px] text-zinc-400">{cert.issuer} &bull; {cert.date}</span>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-900 mt-4">
                          <button
                            onClick={() => handleEditCertificate(cert)}
                            className="text-[10px] font-bold text-amber-500 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-zinc-700 text-[10px]">|</span>
                          <button
                            onClick={() => handleDeleteCertificate(cert.id)}
                            className="text-[10px] font-bold text-red-400 hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                    {localCertificates.length === 0 && (
                      <div className="text-center p-8 border border-zinc-800/50 rounded text-zinc-500 text-xs sm:col-span-2">Belum ada data sertifikasi.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: INBOX MESSAGES */}
            {activeTab === 'inbox' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wide">Pesan Pengunjung Masuk</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">Pesan yang dikirim oleh pengunjung melalui formulir kontak responsif Anda.</p>
                  </div>
                  {localInbox.length > 0 && (
                    <button
                      onClick={handleClearInbox}
                      className="inline-flex items-center gap-1.5 bg-red-950/40 hover:bg-red-950/70 text-red-400 border border-red-900/30 text-[10px] font-bold py-1 px-3 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Kosongkan</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                  {localInbox.map((msg, index) => (
                    <div key={msg.id || index} className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3 shadow-inner">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-zinc-900 text-xs text-zinc-400">
                        <div className="font-semibold text-zinc-100 flex flex-wrap items-center gap-1.5">
                          <span>{msg.senderName}</span>
                          <span className="text-zinc-600">&lt;{msg.senderEmail}&gt;</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">{msg.date}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-amber-500">Subjek: {msg.subject}</div>
                        <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/40 p-2.5 rounded border border-zinc-900/60 whitespace-pre-line text-justify">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))}

                  {localInbox.length === 0 && (
                    <div className="text-center py-16 border border-dashed border-zinc-800/75 rounded-lg text-zinc-500 text-xs">
                      Kotak masuk Anda kosong. Belum ada pesan formulir kontak yang terkirim.
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
