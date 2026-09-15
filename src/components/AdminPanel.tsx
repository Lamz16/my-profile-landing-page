import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, User, Code2, FolderGit2, Award, Mail, KeyRound, 
  Plus, Trash2, Edit3, Save, X, Check, Eye, Lock, ArrowLeft, RefreshCw, AlertCircle,
  Upload, Camera, Image as ImageIcon
} from 'lucide-react';
import { api, adminAuth } from '../api/client';
import { ProfileInfo, SkillItem, PortfolioItem, CertificateItem, InboxMessage, PaginatedResult } from '../types';
import { Pagination } from './Pagination';
import { compressAndConvertToWebp } from '../utils/imageCompressor';

interface AdminPanelProps {
  onClose: () => void;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'projects' | 'certificates' | 'inbox' | 'security'>('profile');
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(adminAuth.isAuthenticated());
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Profile Form state
  const [profileData, setProfileData] = useState<ProfileInfo | null>(null);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Skills state
  const [skillsList, setSkillsList] = useState<SkillItem[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'frontend' | 'backend' | 'design' | 'other'>('frontend');

  // Projects state
  const [projectsResult, setProjectsResult] = useState<PaginatedResult<PortfolioItem> | null>(null);
  const [projectPage, setProjectPage] = useState(1);
  const [editingProject, setEditingProject] = useState<PortfolioItem | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<Omit<PortfolioItem, 'id'>>({
    title: '',
    description: '',
    category: 'Mobile Development',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'],
    tags: [],
    demoUrl: '',
    githubUrl: 'https://github.com/Lamz16'
  });
  const [tagInput, setTagInput] = useState('');

  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const certFileInputRef = useRef<HTMLInputElement>(null);

  // Certificates state
  const [certsResult, setCertsResult] = useState<PaginatedResult<CertificateItem> | null>(null);
  const [certPage, setCertPage] = useState(1);
  const [editingCert, setEditingCert] = useState<CertificateItem | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certForm, setCertForm] = useState<Omit<CertificateItem, 'id'>>({
    name: '',
    issuer: '',
    date: '2024',
    credentialId: '',
    credentialUrl: '',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
  });

  // Inbox state
  const [inboxResult, setInboxResult] = useState<PaginatedResult<InboxMessage> | null>(null);
  const [inboxPage, setInboxPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);

  // Security state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMessage, setSecurityMessage] = useState({ type: '', text: '' });

  // Check login on mount
  useEffect(() => {
    if (isLoggedIn) {
      loadAllAdminData();
    }
  }, [isLoggedIn, projectPage, certPage, inboxPage]);

  const loadAllAdminData = async () => {
    try {
      // Profile & Skills
      const prof = await api.getProfile();
      setProfileData(prof);

      const sk = await api.getSkills();
      setSkillsList(sk);

      // Projects
      const proj = await api.getProjects(projectPage, 5);
      setProjectsResult(proj);

      // Certs
      const crt = await api.getCertificates(certPage, 5);
      setCertsResult(crt);

      // Inbox
      const inbx = await api.getInboxMessages(inboxPage, 5);
      setInboxResult(inbx);
    } catch (err: any) {
      if (err.message.includes('401') || err.message.includes('Akses ditolak')) {
        adminAuth.removeToken();
        setIsLoggedIn(false);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      await api.adminLogin(loginUsername, loginPassword);
      setIsLoggedIn(true);
      loadAllAdminData();
      onRefreshData();
    } catch (err: any) {
      setAuthError(err.message || 'Login gagal.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    adminAuth.removeToken();
    setIsLoggedIn(false);
  };

  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file foto maksimal 5MB!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await api.uploadImage(base64String, 'avatar');
        if (profileData) {
          setProfileData({ ...profileData, avatarUrl: res.url });
        }
      } catch (err: any) {
        if (profileData) {
          setProfileData({ ...profileData, avatarUrl: base64String });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // MULTI-IMAGE UPLOAD FOR PROJECTS (COMPRESSED & CONVERTED TO WEBP ON SERVER DISK)
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const handleProjectMultiFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Compress & convert file to WebP in browser canvas
        const { base64Webp, fileName } = await compressAndConvertToWebp(file, 1600, 1600, 0.8);
        // Upload WebP string to server /api/upload which writes to uploads/ folder
        const res = await api.uploadImage(base64Webp, fileName);
        uploadedUrls.push(res.url);
      } catch (err: any) {
        alert(`Gagal memproses file ${file.name}: ${err.message}`);
      }
    }

    setProjectForm(prev => {
      const existing = prev.images && prev.images.length > 0 ? prev.images : (prev.image ? [prev.image] : []);
      const updated = [...existing, ...uploadedUrls];
      return {
        ...prev,
        image: updated[0] || prev.image,
        images: updated
      };
    });

    setIsUploadingImages(false);
  };

  const handleRemoveProjectImage = (indexToRemove: number) => {
    setProjectForm(prev => {
      const currentList = prev.images && prev.images.length > 0 ? prev.images : [prev.image];
      const updated = currentList.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        image: updated[0] || '',
        images: updated
      };
    });
  };

  // CERTIFICATE WEBP UPLOAD HANDLER
  const handleCertFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { base64Webp, fileName } = await compressAndConvertToWebp(file, 1600, 1600, 0.8);
      const res = await api.uploadImage(base64Webp, fileName);
      setCertForm(prev => ({ ...prev, image: res.url }));
    } catch (err: any) {
      alert(`Gagal memproses foto sertifikat: ${err.message}`);
    }
  };

  // PROFILE SAVE
  const handleSaveProfile = async () => {
    if (!profileData) return;
    setProfileLoading(true);
    setProfileSaveSuccess(false);
    try {
      const updated = await api.updateProfile(profileData);
      setProfileData(updated);
      setProfileSaveSuccess(true);
      onRefreshData();
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan profil.');
    } finally {
      setProfileLoading(false);
    }
  };

  // SKILL ACTIONS
  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;
    try {
      const added = await api.addSkill(newSkillName.trim(), newSkillCategory);
      setSkillsList([...skillsList, added]);
      setNewSkillName('');
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Gagal menambah skill.');
    }
  };

  const handleDeleteSkill = async (id: string | number) => {
    if (!confirm('Hapus skill ini dari database?')) return;
    try {
      await api.deleteSkill(id);
      setSkillsList(skillsList.filter(s => s.id !== id));
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus skill.');
    }
  };

  // PROJECT ACTIONS
  const handleOpenProjectModal = (proj?: PortfolioItem) => {
    if (proj) {
      const imagesList = proj.images && proj.images.length > 0 ? proj.images : [proj.image];
      setEditingProject(proj);
      setProjectForm({
        title: proj.title,
        description: proj.description,
        category: proj.category,
        image: imagesList[0] || proj.image,
        images: imagesList,
        tags: [...proj.tags],
        demoUrl: proj.demoUrl || '',
        githubUrl: proj.githubUrl || ''
      });
    } else {
      setEditingProject(null);
      setProjectForm({
        title: '',
        description: '',
        category: 'Mobile Development',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'],
        tags: ['Kotlin', 'Flutter', 'REST API'],
        demoUrl: '',
        githubUrl: 'https://github.com/Lamz16'
      });
    }
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.title || !projectForm.description) return alert('Lengkapi judul dan deskripsi proyek!');
    try {
      if (editingProject) {
        await api.updateProject(editingProject.id, projectForm);
      } else {
        await api.createProject(projectForm);
      }
      setIsProjectModalOpen(false);
      loadAllAdminData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan proyek.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Yakin ingin menghapus proyek ini dari PostgreSQL?')) return;
    try {
      await api.deleteProject(id);
      loadAllAdminData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus proyek.');
    }
  };

  // CERTIFICATE ACTIONS
  const handleOpenCertModal = (cert?: CertificateItem) => {
    if (cert) {
      setEditingCert(cert);
      setCertForm({
        name: cert.name,
        issuer: cert.issuer,
        date: cert.date,
        credentialId: cert.credentialId || '',
        credentialUrl: cert.credentialUrl || '',
        image: cert.image
      });
    } else {
      setEditingCert(null);
      setCertForm({
        name: '',
        issuer: 'Dicoding Indonesia',
        date: '2024',
        credentialId: '',
        credentialUrl: 'https://dicoding.com',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
      });
    }
    setIsCertModalOpen(true);
  };

  const handleSaveCert = async () => {
    if (!certForm.name || !certForm.issuer) return alert('Lengkapi nama sertifikat dan penerbit!');
    try {
      if (editingCert) {
        await api.updateCertificate(editingCert.id, certForm);
      } else {
        await api.createCertificate(certForm);
      }
      setIsCertModalOpen(false);
      loadAllAdminData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan sertifikat.');
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm('Hapus sertifikat ini?')) return;
    try {
      await api.deleteCertificate(id);
      loadAllAdminData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus sertifikat.');
    }
  };

  // INBOX ACTIONS
  const handleMarkRead = async (id: string) => {
    try {
      await api.markMessageAsRead(id);
      loadAllAdminData();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Hapus pesan ini dari inbox?')) return;
    try {
      await api.deleteMessage(id);
      if (selectedMessage?.id === id) setSelectedMessage(null);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pesan.');
    }
  };

  // CHANGE PASSWORD
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok!' });
      return;
    }
    try {
      const res = await api.changeAdminPassword(oldPassword, newPassword);
      setSecurityMessage({ type: 'success', text: res.message });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setSecurityMessage({ type: 'error', text: err.message || 'Gagal mengubah password.' });
    }
  };

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 bg-[#090a0c]/95 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#12151b] border border-[#22262e] rounded-lg p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#22262e] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">PANEL ADMIN PORTFOLIO</h2>
                <p className="text-[11px] text-slate-400">PostgreSQL Full-Stack Database System</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">USERNAME ADMIN</label>
              <input
                type="text"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                required
                className="w-full bg-[#0d0f12] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">PASSWORD ADMIN</label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
                placeholder="Masukkan password admin"
                className="w-full bg-[#0d0f12] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold py-2.5 rounded transition-all uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>MASUK PORTAL ADMIN</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#090a0c]/95 backdrop-blur-md flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#12151b] border-b border-[#22262e] px-4 py-3 sm:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">DASHBOARD ADMIN PORTFOLIO</h1>
            <p className="text-[10px] text-amber-500 font-mono">PostgreSQL Database Connected • Normalized 3NF Schema</p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={() => { loadAllAdminData(); onRefreshData(); }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1d24] border border-[#22262e] text-slate-300 hover:text-white hover:border-amber-500/50 transition-all"
            title="Refresh Data dari PostgreSQL"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded bg-red-950/40 border border-red-800/60 text-red-300 hover:bg-red-900/40 transition-all text-xs font-bold"
          >
            Logout
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-[#1a1d24] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar Tabs & Content */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-[#12151b]/80 border-b md:border-b-0 md:border-r border-[#22262e] p-3 shrink-0 flex md:flex-col overflow-x-auto gap-1 font-mono text-xs">
          {[
            { id: 'profile', label: '1. Profil & Bio', icon: User },
            { id: 'skills', label: '2. Keahlian Teknis', icon: Code2 },
            { id: 'projects', label: '3. Proyek (Paginated)', icon: FolderGit2 },
            { id: 'certificates', label: '4. Sertifikat (Paginated)', icon: Award },
            { id: 'inbox', label: '5. Pesan Inbox', icon: Mail },
            { id: 'security', label: '6. Keamanan Admin', icon: KeyRound },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded font-bold transition-all text-left whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#090a0c]">
          {/* 1. PROFIL TAB */}
          {activeTab === 'profile' && profileData && (
            <div className="max-w-3xl space-y-6 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#22262e] pb-3">
                <div>
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">EDIT PROFIL PERTAMA (POSTGRESQL)</h2>
                  <p className="text-[11px] text-slate-400">Ubah informasi identitas utama, kontak, dan riwayat bio Anda.</p>
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold px-4 py-2 rounded flex items-center gap-2 transition-all uppercase tracking-wider"
                >
                  {profileLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>SIMPAN PROFIL</span>
                </button>
              </div>

              {profileSaveSuccess && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 rounded flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Profil berhasil tersimpan di database PostgreSQL!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px] font-bold">NAMA LENGKAP</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full bg-[#12151b] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px] font-bold">PROFESI / JABATAN</label>
                  <input
                    type="text"
                    value={profileData.title}
                    onChange={e => setProfileData({ ...profileData, title: e.target.value })}
                    className="w-full bg-[#12151b] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px] font-bold">LOKASI</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={e => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full bg-[#12151b] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px] font-bold">EMAIL KONTAN</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full bg-[#12151b] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px] font-bold">NOMOR TELEPON / WHATSAPP</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full bg-[#12151b] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2 p-4 bg-[#12151b] border border-[#22262e] rounded space-y-3">
                  <label className="text-amber-500 uppercase text-[10px] font-bold block tracking-wider">FOTO PROFIL / AVATAR</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={profileData.avatarUrl}
                      alt={profileData.name}
                      className="w-20 h-20 rounded-md object-cover border-2 border-amber-500/50 shadow-md shrink-0 bg-black"
                    />
                    <div className="space-y-2 flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          ref={avatarFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => avatarFileInputRef.current?.click()}
                          className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3 py-1.5 rounded flex items-center gap-1.5 uppercase text-xs transition-all shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>UPLOAD FOTO LOKAL</span>
                        </button>
                        <span className="text-[10px] text-slate-400">Atau masukkan URL foto di bawah</span>
                      </div>
                      <input
                        type="text"
                        value={profileData.avatarUrl}
                        onChange={e => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-[#0d0f12] border border-[#22262e] rounded px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px] font-bold">URL GITHUB</label>
                  <input
                    type="text"
                    value={profileData.githubUrl}
                    onChange={e => setProfileData({ ...profileData, githubUrl: e.target.value })}
                    className="w-full bg-[#12151b] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px] font-bold">URL LINKEDIN</label>
                  <input
                    type="text"
                    value={profileData.linkedinUrl}
                    onChange={e => setProfileData({ ...profileData, linkedinUrl: e.target.value })}
                    className="w-full bg-[#12151b] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px] font-bold">BIO RINGKAS (HERO SECTION)</label>
                <textarea
                  rows={2}
                  value={profileData.bio}
                  onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full bg-[#12151b] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px] font-bold">LONG BIO (TENTANG SAYA)</label>
                <textarea
                  rows={4}
                  value={profileData.longBio}
                  onChange={e => setProfileData({ ...profileData, longBio: e.target.value })}
                  className="w-full bg-[#12151b] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* 2. SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="max-w-3xl space-y-6 font-mono text-xs">
              <div className="border-b border-[#22262e] pb-3">
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">KELOLA KEAHLIAN TEKNIS (NORMALIZED TABLE)</h2>
                <p className="text-[11px] text-slate-400">Data tersimpan terstruktur di tabel `skills` dan `skill_categories` (3NF).</p>
              </div>

              {/* Add Skill Form */}
              <div className="p-4 bg-[#12151b] border border-[#22262e] rounded space-y-3">
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Tambah Skill Baru</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={e => setNewSkillName(e.target.value)}
                    placeholder="Contoh: Jetpack Compose, Docker, GraphQL"
                    className="flex-1 bg-[#0d0f12] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  <select
                    value={newSkillCategory}
                    onChange={e => setNewSkillCategory(e.target.value as any)}
                    className="bg-[#0d0f12] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="frontend">Mobile & Frontend</option>
                    <option value="backend">Backend & Networking</option>
                    <option value="design">Architecture & Data</option>
                    <option value="other">Tools & Workflows</option>
                  </select>
                  <button
                    onClick={handleAddSkill}
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded flex items-center justify-center gap-1.5 uppercase"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>

              {/* Skill Tags List */}
              <div className="space-y-4">
                {['frontend', 'backend', 'design', 'other'].map(cat => {
                  const filtered = skillsList.filter(s => s.category === cat);
                  const label = cat === 'frontend' ? 'Mobile & Frontend' :
                                cat === 'backend' ? 'Backend & Networking' :
                                cat === 'design' ? 'Architecture & Data' : 'Tools & Workflows';
                  return (
                    <div key={cat} className="space-y-2">
                      <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">{label} ({filtered.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {filtered.map(skill => (
                          <div
                            key={skill.id || skill.name}
                            className="bg-[#12151b] border border-[#22262e] rounded px-3 py-1.5 flex items-center gap-2 text-slate-300"
                          >
                            <span>{skill.name}</span>
                            <button
                              onClick={() => handleDeleteSkill(skill.id!)}
                              className="text-slate-500 hover:text-red-400 transition-colors"
                              title="Hapus Skill"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. PROJECTS TAB (WITH PAGINATION) */}
          {activeTab === 'projects' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#22262e] pb-3">
                <div>
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">KELOLA PROYEK PORTOFOLIO (POSTGRESQL PAGINATED)</h2>
                  <p className="text-[11px] text-slate-400">Mendukung relasi 3NF Many-to-Many tag proyek dan query SQL `LIMIT/OFFSET`.</p>
                </div>
                <button
                  onClick={() => handleOpenProjectModal()}
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded flex items-center gap-2 uppercase"
                >
                  <Plus className="w-4 h-4" />
                  <span>TAMBAH PROYEK</span>
                </button>
              </div>

              {projectsResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {projectsResult.data.map(proj => (
                      <div key={proj.id} className="p-4 bg-[#12151b] border border-[#22262e] rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img src={proj.image} alt={proj.title} className="w-16 h-12 object-cover rounded border border-[#22262e] shrink-0" />
                          <div>
                            <span className="text-[10px] text-amber-500 uppercase font-bold">{proj.category}</span>
                            <h3 className="text-sm font-bold text-white">{proj.title}</h3>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {proj.tags.map(t => (
                                <span key={t} className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenProjectModal(proj)}
                            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded transition-all"
                            title="Edit Proyek"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-2 bg-red-950/40 hover:bg-red-900/40 border border-red-800 text-red-300 rounded transition-all"
                            title="Hapus Proyek"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Pagination
                    currentPage={projectsResult.pagination.page}
                    totalPages={projectsResult.pagination.totalPages}
                    totalItems={projectsResult.pagination.total}
                    limit={projectsResult.pagination.limit}
                    onPageChange={setProjectPage}
                    itemLabel="proyek"
                  />
                </div>
              )}
            </div>
          )}

          {/* 4. CERTIFICATES TAB (WITH PAGINATION) */}
          {activeTab === 'certificates' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#22262e] pb-3">
                <div>
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">KELOLA SERTIFIKAT (POSTGRESQL PAGINATED)</h2>
                  <p className="text-[11px] text-slate-400">Data tersimpan di tabel `certificates` dan `issuers` (Normalized 3NF).</p>
                </div>
                <button
                  onClick={() => handleOpenCertModal()}
                  className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 rounded flex items-center gap-2 uppercase"
                >
                  <Plus className="w-4 h-4" />
                  <span>TAMBAH SERTIFIKAT</span>
                </button>
              </div>

              {certsResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {certsResult.data.map(cert => (
                      <div key={cert.id} className="p-4 bg-[#12151b] border border-[#22262e] rounded flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img src={cert.image} alt={cert.name} className="w-16 h-12 object-cover rounded border border-[#22262e] shrink-0" />
                          <div>
                            <span className="text-[10px] text-amber-500 uppercase font-bold">{cert.issuer} • {cert.date}</span>
                            <h3 className="text-sm font-bold text-white">{cert.name}</h3>
                            {cert.credentialId && <p className="text-[10px] text-zinc-500">ID: {cert.credentialId}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenCertModal(cert)}
                            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded transition-all"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCert(cert.id)}
                            className="p-2 bg-red-950/40 hover:bg-red-900/40 border border-red-800 text-red-300 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Pagination
                    currentPage={certsResult.pagination.page}
                    totalPages={certsResult.pagination.totalPages}
                    totalItems={certsResult.pagination.total}
                    limit={certsResult.pagination.limit}
                    onPageChange={setCertPage}
                    itemLabel="sertifikat"
                  />
                </div>
              )}
            </div>
          )}

          {/* 5. INBOX MESSAGES TAB */}
          {activeTab === 'inbox' && (
            <div className="space-y-6 font-mono text-xs">
              <div className="border-b border-[#22262e] pb-3">
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">PESAN DARI PENGUNJUNG WEB (POSTGRESQL INBOX)</h2>
                <p className="text-[11px] text-slate-400">Pesan dari form kontak masuk secara real-time ke PostgreSQL database.</p>
              </div>

              {inboxResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {inboxResult.data.map(msg => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded border transition-all ${
                          msg.isRead
                            ? 'bg-[#12151b] border-[#22262e] opacity-80'
                            : 'bg-[#161a23] border-amber-500/50 shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              {!msg.isRead && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 text-[9px] font-bold uppercase">BARU</span>
                              )}
                              <h3 className="text-sm font-bold text-white">{msg.subject}</h3>
                            </div>
                            <p className="text-[11px] text-amber-500 mt-0.5">
                              {msg.senderName} ({msg.senderEmail}) • {new Date(msg.createdAt).toLocaleString('id-ID')}
                            </p>
                            <p className="text-slate-300 mt-2 whitespace-pre-wrap">{msg.message}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!msg.isRead && (
                              <button
                                onClick={() => handleMarkRead(msg.id)}
                                className="p-2 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded hover:bg-emerald-900/40"
                                title="Tandai Sudah Dibaca"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-2 bg-red-950/40 border border-red-800 text-red-300 rounded hover:bg-red-900/40"
                              title="Hapus Pesan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Pagination
                    currentPage={inboxResult.pagination.page}
                    totalPages={inboxResult.pagination.totalPages}
                    totalItems={inboxResult.pagination.total}
                    limit={inboxResult.pagination.limit}
                    onPageChange={setInboxPage}
                    itemLabel="pesan"
                  />
                </div>
              )}
            </div>
          )}

          {/* 6. SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="max-w-md space-y-6 font-mono text-xs">
              <div className="border-b border-[#22262e] pb-3">
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">KEAMANAN & UBAH PASSWORD ADMIN</h2>
                <p className="text-[11px] text-slate-400">Password disimpan dalam bentuk hash terenkripsi Bcrypt di PostgreSQL.</p>
              </div>

              {securityMessage.text && (
                <div
                  className={`p-3 rounded border text-xs ${
                    securityMessage.type === 'success'
                      ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                      : 'bg-red-950/50 border-red-800 text-red-300'
                  }`}
                >
                  {securityMessage.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px] font-bold">PASSWORD LAMA</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    required
                    className="w-full bg-[#12151b] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px] font-bold">PASSWORD BARU</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-[#12151b] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[10px] font-bold">KONFIRMASI PASSWORD BARU</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-[#12151b] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-2.5 rounded transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>PERBARUI PASSWORD ADMIN</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* PROJECT MODAL */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#12151b] border border-[#22262e] rounded-lg p-6 space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#22262e] pb-3">
              <h3 className="text-sm font-bold text-white uppercase">{editingProject ? 'Edit Proyek' : 'Tambah Proyek Baru'}</h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px] font-bold">JUDUL PROYEK</label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full bg-[#0d0f12] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px] font-bold">KATEGORI PROYEK</label>
                <select
                  value={projectForm.category}
                  onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                  className="w-full bg-[#0d0f12] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Freelance Project">Freelance Project</option>
                </select>
              </div>

              {/* MULTI-IMAGE GALLERY UPLOAD */}
              <div className="p-4 bg-[#0d0f12] border border-[#22262e] rounded space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-amber-500 uppercase text-[10px] font-bold tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>DOKUMENTASI GAMBAR PROYEK (BISA MULTI-INPUT & CAROUSEL)</span>
                  </label>
                  <span className="text-[9px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded font-mono">
                    AUTO-COMPRESS WEBP
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={projectFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleProjectMultiFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingImages}
                    onClick={() => projectFileInputRef.current?.click()}
                    className="bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 text-zinc-950 font-bold px-3 py-1.5 rounded flex items-center gap-1.5 uppercase text-xs transition-all cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingImages ? 'MENGOMPRES & MENGUNGGAH...' : 'UPLOAD GAMBAR LOKAL (MULTI)'}</span>
                  </button>
                  <span className="text-[10px] text-slate-400">Otomatis dikonversi ke WebP & disimpan ke folder /uploads</span>
                </div>

                {/* Images Preview Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                  {(projectForm.images && projectForm.images.length > 0 ? projectForm.images : [projectForm.image]).map((imgUrl, idx) => (
                    <div key={idx} className="relative group aspect-video bg-black rounded border border-[#22262e] overflow-hidden">
                      <img src={imgUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 bg-black/80 px-1 py-0.5 text-[8px] text-amber-400 rounded font-mono font-bold">
                        #{idx + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProjectImage(idx)}
                        className="absolute top-1 right-1 bg-red-900/90 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Hapus gambar ini"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px] font-bold">DESKRIPSI PROYEK</label>
                <textarea
                  rows={3}
                  value={projectForm.description}
                  onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full bg-[#0d0f12] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px] font-bold">TAGS / TEKNOLOGI (PISAHKAN KOMA)</label>
                <input
                  type="text"
                  value={projectForm.tags.join(', ')}
                  onChange={e => setProjectForm({ ...projectForm, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  placeholder="Contoh: Kotlin, Flutter, MVVM, REST API"
                  className="w-full bg-[#0d0f12] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px] font-bold">URL REPOSITORY GITHUB</label>
                <input
                  type="text"
                  value={projectForm.githubUrl}
                  onChange={e => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                  className="w-full bg-[#0d0f12] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#22262e]">
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="px-4 py-2 rounded bg-zinc-800 text-zinc-300 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProject}
                className="px-4 py-2 rounded bg-amber-500 text-zinc-950 font-bold uppercase"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CERTIFICATE MODAL */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#12151b] border border-[#22262e] rounded-lg p-6 space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#22262e] pb-3">
              <h3 className="text-sm font-bold text-white uppercase">{editingCert ? 'Edit Sertifikat' : 'Tambah Sertifikat Baru'}</h3>
              <button onClick={() => setIsCertModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px] font-bold">NAMA SERTIFIKAT</label>
                <input
                  type="text"
                  value={certForm.name}
                  onChange={e => setCertForm({ ...certForm, name: e.target.value })}
                  className="w-full bg-[#0d0f12] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px] font-bold">PENERBIT / ISSUER</label>
                <input
                  type="text"
                  value={certForm.issuer}
                  onChange={e => setCertForm({ ...certForm, issuer: e.target.value })}
                  className="w-full bg-[#0d0f12] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px] font-bold">TANGGAL / TAHUN RILIS</label>
                <input
                  type="text"
                  value={certForm.date}
                  onChange={e => setCertForm({ ...certForm, date: e.target.value })}
                  className="w-full bg-[#0d0f12] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px] font-bold">CREDENTIAL ID (OPTIONAL)</label>
                <input
                  type="text"
                  value={certForm.credentialId}
                  onChange={e => setCertForm({ ...certForm, credentialId: e.target.value })}
                  className="w-full bg-[#0d0f12] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase text-[10px] font-bold">URL KREDENSIAL / SERTIFIKAT</label>
                <input
                  type="text"
                  value={certForm.credentialUrl}
                  onChange={e => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                  className="w-full bg-[#0d0f12] border border-[#22262e] rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-[#0d0f12] border border-[#22262e] rounded space-y-2">
                <label className="text-amber-500 uppercase text-[10px] font-bold tracking-wider block">GAMBAR SERTIFIKAT (WEBP CONVERTED)</label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <img src={certForm.image} alt="Preview" className="w-16 h-12 object-cover rounded border border-[#22262e] bg-black shrink-0" />
                  <div className="space-y-1 flex-1 w-full">
                    <div className="flex items-center gap-2">
                      <input
                        ref={certFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCertFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => certFileInputRef.current?.click()}
                        className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-3 py-1.5 rounded flex items-center gap-1.5 uppercase text-xs transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>UPLOAD SERTIFIKAT (LOKAL)</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={certForm.image}
                      onChange={e => setCertForm({ ...certForm, image: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-[#12151b] border border-[#22262e] rounded px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#22262e]">
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="px-4 py-2 rounded bg-zinc-800 text-zinc-300 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCert}
                className="px-4 py-2 rounded bg-amber-500 text-zinc-950 font-bold uppercase"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
