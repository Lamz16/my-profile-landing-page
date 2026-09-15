import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';

import { ProfileRepository } from './src/server/repositories/ProfileRepository';
import { SkillRepository } from './src/server/repositories/SkillRepository';
import { ProjectRepository } from './src/server/repositories/ProjectRepository';
import { CertificateRepository } from './src/server/repositories/CertificateRepository';
import { ContactRepository } from './src/server/repositories/ContactRepository';
import { AdminRepository } from './src/server/repositories/AdminRepository';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-portfolio-admin-key-2026';
const PORT = 3000;

// Instantiate Repositories (SOLID Dependency Injection)
const profileRepo = new ProfileRepository();
const skillRepo = new SkillRepository();
const projectRepo = new ProjectRepository();
const certificateRepo = new CertificateRepository();
const contactRepo = new ContactRepository();
const adminRepo = new AdminRepository();

interface AuthRequest extends Request {
  adminUser?: { id: number; username: string };
}

function requireAdminAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Akses ditolak. Token autentikasi tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    req.adminUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesi admin kedaluwarsa atau tidak valid.' });
  }
}

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // HEALTH CHECK
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', engine: 'PostgreSQL Full-Stack Engine', timestamp: new Date().toISOString() });
  });

  // ADMIN AUTH ROUTES
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password wajib diisi.' });
      }

      const admin = await adminRepo.verifyAdminCredentials(username, password);
      if (!admin) {
        return res.status(401).json({ error: 'Username atau password admin salah.' });
      }

      const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token, user: admin, message: 'Login Admin Berhasil' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Gagal melakukan login.' });
    }
  });

  app.get('/api/admin/me', requireAdminAuth, async (req: AuthRequest, res) => {
    return res.json({ user: req.adminUser });
  });

  app.put('/api/admin/change-password', requireAdminAuth, async (req: AuthRequest, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Password lama dan password baru wajib diisi.' });
      }

      const success = await adminRepo.changePassword(req.adminUser!.id, oldPassword, newPassword);
      if (!success) {
        return res.status(400).json({ error: 'Password lama yang Anda masukkan salah.' });
      }

      return res.json({ message: 'Password admin berhasil diperbarui!' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PROFILE ROUTES
  app.get('/api/profile', async (req, res) => {
    try {
      const profile = await profileRepo.getProfile();
      return res.json(profile);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/profile', requireAdminAuth, async (req, res) => {
    try {
      const updated = await profileRepo.updateProfile(req.body);
      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // SKILLS ROUTES
  app.get('/api/skills', async (req, res) => {
    try {
      const skills = await skillRepo.getSkills();
      return res.json(skills);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/skills', requireAdminAuth, async (req, res) => {
    try {
      const { name, category } = req.body;
      if (!name) return res.status(400).json({ error: 'Nama skill wajib diisi.' });
      const newSkill = await skillRepo.addSkill(name, category || 'frontend');
      return res.status(201).json(newSkill);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/skills/:id', requireAdminAuth, async (req, res) => {
    try {
      const success = await skillRepo.deleteSkill(req.params.id);
      return res.json({ success });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PROJECTS ROUTES (WITH PAGINATION)
  app.get('/api/projects', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 4;
      const category = (req.query.category as string) || '';
      const search = (req.query.search as string) || '';

      const result = await projectRepo.getProjects(page, limit, category, search);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/projects', requireAdminAuth, async (req, res) => {
    try {
      const { title, description, category, image, tags, demoUrl, githubUrl } = req.body;
      if (!title || !description || !category || !image) {
        return res.status(400).json({ error: 'Judul, deskripsi, kategori, dan gambar wajib diisi.' });
      }

      const newProject = await projectRepo.createProject({
        title,
        description,
        category,
        image,
        tags: Array.isArray(tags) ? tags : [],
        demoUrl: demoUrl || '',
        githubUrl: githubUrl || ''
      });

      return res.status(201).json(newProject);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/projects/:id', requireAdminAuth, async (req, res) => {
    try {
      const updated = await projectRepo.updateProject(req.params.id, req.body);
      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/projects/:id', requireAdminAuth, async (req, res) => {
    try {
      const success = await projectRepo.deleteProject(req.params.id);
      return res.json({ success });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // CERTIFICATES ROUTES (WITH PAGINATION)
  app.get('/api/certificates', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 6;

      const result = await certificateRepo.getCertificates(page, limit);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/certificates', requireAdminAuth, async (req, res) => {
    try {
      const { name, issuer, date, credentialId, credentialUrl, image } = req.body;
      if (!name || !issuer || !date || !image) {
        return res.status(400).json({ error: 'Nama sertifikat, penerbit, tanggal, dan gambar wajib diisi.' });
      }

      const newCert = await certificateRepo.createCertificate({
        name,
        issuer,
        date,
        credentialId: credentialId || '',
        credentialUrl: credentialUrl || '',
        image
      });

      return res.status(201).json(newCert);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/certificates/:id', requireAdminAuth, async (req, res) => {
    try {
      const updated = await certificateRepo.updateCertificate(req.params.id, req.body);
      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/certificates/:id', requireAdminAuth, async (req, res) => {
    try {
      const success = await certificateRepo.deleteCertificate(req.params.id);
      return res.json({ success });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // CONTACT & INBOX ROUTES
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Nama, email, subjek, dan pesan wajib diisi.' });
      }

      const savedMsg = await contactRepo.saveMessage(name, email, subject, message);
      return res.status(201).json({ message: 'Pesan Anda berhasil dikirim ke Andi Salam!', data: savedMsg });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/contact/messages', requireAdminAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 5;

      const result = await contactRepo.getMessages(page, limit);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/contact/messages/:id/read', requireAdminAuth, async (req, res) => {
    try {
      const success = await contactRepo.markAsRead(req.params.id);
      return res.json({ success });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/contact/messages/:id', requireAdminAuth, async (req, res) => {
    try {
      const success = await contactRepo.deleteMessage(req.params.id);
      return res.json({ success });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // VITE OR STATIC SERVING
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Express full-stack running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
