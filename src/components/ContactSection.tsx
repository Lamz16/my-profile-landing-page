import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ContactSectionProps {
  email: string;
  phone: string;
  location: string;
}

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactSection({ email, phone, location }: ContactSectionProps) {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setError('Harap lengkapi semua kolom formulir.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Format alamat e-mail tidak sesuai.');
      return;
    }

    setIsSending(true);

    // Simulate sending message to local inbox mock
    setTimeout(() => {
      try {
        const storedInbox = localStorage.getItem('profile_inbox');
        const inbox = storedInbox ? JSON.parse(storedInbox) : [];
        const newMessage = {
          id: Date.now().toString(),
          senderName: formData.name,
          senderEmail: formData.email,
          subject: formData.subject,
          message: formData.message,
          date: new Date().toLocaleString('id-ID', { hour12: false }),
        };
        inbox.unshift(newMessage);
        localStorage.setItem('profile_inbox', JSON.stringify(inbox));

        // Trigger storage event to synchronize open panel components
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error("Failed to save message to inbox mock: ", e);
      }

      setIsSending(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  return (
    <section id="kontak" className="py-24 bg-[#0d0f12] text-[#cbd5e1] relative overflow-hidden industrial-grid">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="max-w-3xl mb-16 space-y-3 font-mono">
          <div className="inline-flex items-center gap-1.5 bg-[#14171c] text-[#fca311] text-[10px] uppercase font-bold tracking-widest px-3 py-1 border border-[#22262e] rounded-sm">
            <Mail className="w-3.5 h-3.5 text-[#f0643b]" />
            <span>HUBUGINI KONTAK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-wider text-white uppercase">
            MULAI DISKUSI PROYEK BARU
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans text-justify">
            Apakah Anda memiliki proyek menarik, butuh jasa konsultasi rekayasa web, atau sekadar ingin berdiskusi? Tulis pesan Anda di bawah ini!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* SIDE INFORMATION */}
          <div className="lg:col-span-5 space-y-8 font-mono">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">SALURAN KOMUNIKASI</h3>
              <p className="text-slate-400 text-xs sm:text-sm font-sans leading-relaxed text-justify">
                Anda dapat mengirim pesan melalui formulir interaktif di samping atau langsung menghubungi saya secara instan melalui kontak di bawah.
              </p>
            </div>

            <div className="space-y-4">
              {/* Email Card */}
              <div className="flex items-start gap-4 p-5 bg-[#14171c] border border-[#22262e] rounded-sm">
                <div className="p-2.5 rounded-sm bg-[#f0643b]/10 text-[#f0643b] border border-[#f0643b]/20">
                  <Mail className="w-4 h-4 stroke-[2.5px]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">EMAIL UTAMA</p>
                  <a href={`mailto:${email}`} className="text-xs sm:text-sm font-bold text-white hover:text-[#fca311] transition-colors uppercase tracking-wider block mt-1">
                    {email}
                  </a>
                </div>
              </div>

              {/* Phone Card */}
              <div className="flex items-start gap-4 p-5 bg-[#14171c] border border-[#22262e] rounded-sm">
                <div className="p-2.5 rounded-sm bg-[#fca311]/10 text-[#fca311] border border-[#fca311]/20">
                  <Phone className="w-4 h-4 stroke-[2.5px]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TELEPON / WA</p>
                  <a href={`tel:${phone}`} className="text-xs sm:text-sm font-bold text-white hover:text-[#fca311] transition-colors uppercase tracking-wider block mt-1">
                    {phone}
                  </a>
                </div>
              </div>

              {/* Location Card */}
              <div className="flex items-start gap-4 p-5 bg-[#14171c] border border-[#22262e] rounded-sm">
                <div className="p-2.5 rounded-sm bg-zinc-800 text-zinc-400 border border-zinc-700">
                  <MapPin className="w-4 h-4 stroke-[2.5px]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">WILAYAH OPERASI</p>
                  <p className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mt-1">{location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CONTACT FORM CONTAINER */}
          <div className="lg:col-span-7 bg-[#14171c] border border-[#22262e] rounded-sm p-6 sm:p-8 shadow-sm relative">
            
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#fca311]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#fca311]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#fca311]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#fca311]" />

            {isSuccess ? (
              <motion.div
                id="contact-success-state"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-4 font-mono"
              >
                <div className="inline-flex p-3 rounded-sm bg-[#fca311]/10 text-[#fca311] border border-[#fca311]/20">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5px]" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">PESAN TERKIRIM</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto font-sans leading-relaxed">
                  Terima kasih, pesan Anda telah terekam dan diteruskan ke panel kontrol administrator pengelola. Saya akan merespons secepatnya.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-4 inline-flex text-[10px] font-bold tracking-widest text-black bg-[#fca311] hover:bg-white border-none py-2 px-4 rounded-sm cursor-pointer uppercase shadow-sm transition-colors"
                >
                  KIRIM PESAN BARU
                </button>
              </motion.div>
            ) : (
              <form id="contact-submission-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-mono">
                  <div className="space-y-1.5">
                    <label htmlFor="name-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NAMA PENGIRIM *</label>
                    <input
                      id="name-input"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="NAMA LENGKAP"
                      className="w-full bg-[#0d0f12] border border-[#22262e] rounded-sm py-2.5 px-3.5 text-xs focus:outline-none focus:border-[#fca311] text-white placeholder-zinc-600 font-mono tracking-wider"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="email-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ALAMAT EMAIL *</label>
                    <input
                      id="email-input"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="CONTOH@DOMAIN.COM"
                      className="w-full bg-[#0d0f12] border border-[#22262e] rounded-sm py-2.5 px-3.5 text-xs focus:outline-none focus:border-[#fca311] text-white placeholder-zinc-600 font-mono tracking-wider"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 font-mono">
                  <label htmlFor="subject-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SUBJEK PESAN *</label>
                  <input
                    id="subject-input"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="KOLABORASI, TAWARAN PEKERJAAN, FREELANCE..."
                    className="w-full bg-[#0d0f12] border border-[#22262e] rounded-sm py-2.5 px-3.5 text-xs focus:outline-none focus:border-[#fca311] text-white placeholder-zinc-600 font-mono tracking-wider"
                  />
                </div>

                <div className="space-y-1.5 font-mono">
                  <label htmlFor="message-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ISI PESAN LENGKAP *</label>
                  <textarea
                    id="message-input"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="TULIS DETAIL PERTANYAAN ATAU PENAWARAN ANDA DI SINI..."
                    className="w-full bg-[#0d0f12] border border-[#22262e] rounded-sm py-2.5 px-3.5 text-xs focus:outline-none focus:border-[#fca311] text-white placeholder-zinc-600 font-mono tracking-wider resize-none leading-relaxed"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3.5 bg-red-950/20 border border-red-900/30 rounded-sm text-red-400 text-[11px] font-mono font-bold uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  id="submit-contact-btn"
                  type="submit"
                  disabled={isSending}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#f0643b] hover:bg-[#e0542b] text-black font-extrabold text-xs tracking-widest uppercase py-3.5 px-6 rounded-sm transition-all duration-200 cursor-pointer shadow disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span>SEDANG MENGIRIM...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 stroke-[2.5px]" />
                      <span>KIRIM PESAN SEKARANG</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
