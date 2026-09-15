import pg from 'pg';
import { newDb } from 'pg-mem';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

export interface DBAdapter {
  query(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }>;
}

let dbInstance: DBAdapter;

export async function getDb(): Promise<DBAdapter> {
  if (dbInstance) return dbInstance;

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && !databaseUrl.includes('localhost:5432')) {
    try {
      console.log('Connecting to PostgreSQL database via DATABASE_URL...');
      const pool = new Pool({
        connectionString: databaseUrl,
        ssl: databaseUrl.includes('sslmode=disable') ? false : { rejectUnauthorized: false }
      });
      // Test connection
      await pool.query('SELECT 1');
      console.log('Successfully connected to external PostgreSQL database!');
      dbInstance = pool;
    } catch (err) {
      console.warn('Failed to connect to external PostgreSQL, falling back to embedded PostgreSQL engine:', err);
      dbInstance = createEmbeddedPg();
    }
  } else {
    console.log('Initializing embedded PostgreSQL database engine...');
    dbInstance = createEmbeddedPg();
  }

  await initializeSchemaAndSeed(dbInstance);
  return dbInstance;
}

function createEmbeddedPg(): DBAdapter {
  const memDb = newDb();
  const { Client } = memDb.adapters.createPg();
  const client = new Client();
  client.connect();

  return {
    async query(text: string, params?: any[]) {
      try {
        const res = await client.query(text, params);
        return {
          rows: res.rows || [],
          rowCount: res.rowCount || (res.rows ? res.rows.length : 0)
        };
      } catch (err: any) {
        console.error('SQL Execution Error:', err.message, 'In Query:', text);
        throw err;
      }
    }
  };
}

async function initializeSchemaAndSeed(db: DBAdapter) {
  // 1. Create normalized 3NF Schema
  await db.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(100) NOT NULL,
      bio TEXT NOT NULL,
      long_bio TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      github_url TEXT NOT NULL,
      linkedin_url TEXT NOT NULL,
      instagram_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS skill_categories (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      display_order INT DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      category_id INT REFERENCES skill_categories(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      display_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS project_categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      category_id INT REFERENCES project_categories(id) ON DELETE RESTRICT,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      demo_url TEXT,
      github_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS project_tag_map (
      project_id INT REFERENCES projects(id) ON DELETE CASCADE,
      tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (project_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS issuers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id SERIAL PRIMARY KEY,
      issuer_id INT REFERENCES issuers(id) ON DELETE RESTRICT,
      name VARCHAR(255) NOT NULL,
      issue_date VARCHAR(100) NOT NULL,
      credential_id VARCHAR(255),
      credential_url TEXT,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inbox_messages (
      id SERIAL PRIMARY KEY,
      sender_name VARCHAR(255) NOT NULL,
      sender_email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed Admin User if none exists
  const adminCheck = await db.query('SELECT COUNT(*) as count FROM admin_users');
  if (parseInt(adminCheck.rows[0].count, 10) === 0) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    await db.query(
      'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)',
      ['admin', hash]
    );
    console.log('Default admin created: username="admin", password="admin123"');
  }

  // Seed Profile
  const profileCheck = await db.query('SELECT COUNT(*) as count FROM profiles');
  if (parseInt(profileCheck.rows[0].count, 10) === 0) {
    await db.query(
      `INSERT INTO profiles 
       (name, title, location, email, phone, bio, long_bio, avatar_url, github_url, linkedin_url, instagram_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        'Andi Salam Syahputra',
        'Software Engineer & Mobile Developer',
        'Jawa Timur, Indonesia',
        'andiku0755@gmail.com',
        '+6287830314466',
        'Software Engineer dengan pengalaman lebih dari 2 tahun dalam pengembangan aplikasi mobile dan web menggunakan Kotlin, Java, Flutter, serta teknologi backend modern.',
        'Berpengalaman membangun aplikasi untuk sektor pemerintahan, kesehatan, dan transportasi dengan menerapkan Clean Architecture, MVVM, REST API, dan praktik pengembangan software modern. Terlibat dalam seluruh siklus pengembangan mulai dari analisis kebutuhan, implementasi fitur, debugging, optimasi performa, CI/CD, hingga deployment aplikasi ke platform produksi. Terbiasa menggunakan AI-assisted development untuk membantu analisis masalah teknis, debugging, dan eksplorasi solusi implementasi.',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
        'https://github.com/Lamz16',
        'https://www.linkedin.com/in/lamz16/',
        'https://instagram.com'
      ]
    );
  }

  // Seed Skill Categories
  const catCheck = await db.query('SELECT COUNT(*) as count FROM skill_categories');
  if (parseInt(catCheck.rows[0].count, 10) === 0) {
    await db.query(`
      INSERT INTO skill_categories (code, name, display_order) VALUES
      ('frontend', 'Mobile & Frontend', 1),
      ('backend', 'Backend & Networking', 2),
      ('design', 'Architecture & Data', 3),
      ('other', 'Tools & Workflows', 4)
    `);
  }

  // Seed Skills
  const skillCheck = await db.query('SELECT COUNT(*) as count FROM skills');
  if (parseInt(skillCheck.rows[0].count, 10) === 0) {
    const cats = await db.query('SELECT id, code FROM skill_categories');
    const catMap: Record<string, number> = {};
    cats.rows.forEach(r => { catMap[r.code] = r.id; });

    const defaultSkills = [
      { cat: 'frontend', name: 'Kotlin' },
      { cat: 'frontend', name: 'Java' },
      { cat: 'frontend', name: 'Dart (Flutter)' },
      { cat: 'frontend', name: 'Android SDK & Jetpack Compose' },
      { cat: 'frontend', name: 'XML Layout' },
      { cat: 'frontend', name: 'JavaScript' },
      { cat: 'backend', name: 'REST API Integration' },
      { cat: 'backend', name: 'Retrofit & Dio' },
      { cat: 'backend', name: 'WebSocket & JSON Parsing' },
      { cat: 'backend', name: 'PHP' },
      { cat: 'backend', name: 'Google Apps Script' },
      { cat: 'design', name: 'MVVM / MVC / Repository Pattern' },
      { cat: 'design', name: 'Clean Architecture' },
      { cat: 'design', name: 'Hilt Dependency Injection' },
      { cat: 'design', name: 'StateFlow & SharedFlow' },
      { cat: 'design', name: 'BLoC & Provider' },
      { cat: 'design', name: 'Room & SQLite Database' },
      { cat: 'design', name: 'PostgreSQL & MySQL' },
      { cat: 'design', name: 'Firebase (Firestore & Realtime DB)' },
      { cat: 'other', name: 'Android Studio' },
      { cat: 'other', name: 'Git & Git Workflow' },
      { cat: 'other', name: 'Docker' },
      { cat: 'other', name: 'CI/CD & Firebase App Distribution' },
      { cat: 'other', name: 'Play Console & App Store Connect' },
      { cat: 'other', name: 'Postman & Figma' },
      { cat: 'other', name: 'Agile / Scrum Methodology' },
      { cat: 'other', name: 'AI-assisted Development' }
    ];

    for (let i = 0; i < defaultSkills.length; i++) {
      const s = defaultSkills[i];
      if (catMap[s.cat]) {
        await db.query(
          'INSERT INTO skills (category_id, name, display_order) VALUES ($1, $2, $3)',
          [catMap[s.cat], s.name, i + 1]
        );
      }
    }
  }

  // Seed Project Categories & Projects
  const projCheck = await db.query('SELECT COUNT(*) as count FROM projects');
  if (parseInt(projCheck.rows[0].count, 10) === 0) {
    await db.query(`
      INSERT INTO project_categories (name, slug) VALUES
      ('Mobile Development', 'mobile-development'),
      ('Web Development', 'web-development'),
      ('Freelance Project', 'freelance-project')
      ON CONFLICT DO NOTHING;
    `);

    const pCats = await db.query('SELECT id, name FROM project_categories');
    const pCatMap: Record<string, number> = {};
    pCats.rows.forEach(r => { pCatMap[r.name] = r.id; });

    const rawProjects = [
      {
        title: 'Epakon SiGanteng (Android & iOS)',
        description: 'Mengembangkan serta melakukan pemeliharaan aplikasi Epakon SiGanteng untuk ASN Kabupaten Pamekasan menggunakan arsitektur MVVM, Android Architecture Components dengan penerapan Repository Pattern, integrasi REST API, serta penyempurnaan UI/UX.',
        category: 'Mobile Development',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        tags: ['Kotlin', 'Flutter', 'MVVM', 'Repository Pattern', 'REST API', 'iOS'],
        githubUrl: 'https://github.com/Lamz16'
      },
      {
        title: 'SiMapan RSUD Wahidin Mojokerto',
        description: 'Melakukan pemeliharaan berkala aplikasi kesehatan RSUD Wahidin Mojokerto, mencakup proses migrasi Android SDK / API Level, penyelesaian bug kompleks, optimasi kompatibilitas perangkat, serta pengelolaan rilis melalui Google Play Console.',
        category: 'Mobile Development',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
        tags: ['Android SDK', 'Kotlin', 'Java', 'Play Console', 'Bug Fixes'],
        githubUrl: 'https://github.com/Lamz16'
      },
      {
        title: 'Arjuna Trans & SaaS Travora',
        description: 'Mengembangkan aplikasi sistem transportasi dan software as a service (SaaS) multiplatform dengan Flutter, menerapkan state management Provider & BLoC, serta implementasi konektivitas data REST API berkecepatan tinggi menggunakan Dio.',
        category: 'Mobile Development',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        tags: ['Flutter', 'BLoC', 'Provider', 'Dio', 'REST API', 'SaaS'],
        githubUrl: 'https://github.com/Lamz16'
      },
      {
        title: 'Mobile Banking Prototype',
        description: 'Membangun prototype aplikasi mobile banking berbasis Kotlin XML dengan mereplikasi tampilan, navigasi, dan simulasi transaksi BCA Mobile sebagai bahan presentasi klien, serta mengintegrasikan database Firebase Realtime.',
        category: 'Freelance Project',
        image: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=800&q=80',
        tags: ['Kotlin', 'XML Layout', 'MVC Architecture', 'Firebase Realtime DB'],
        githubUrl: 'https://github.com/Lamz16'
      },
      {
        title: 'Web WordPress ADA Souvenir Yogyakarta',
        description: 'Mengembangkan dan melakukan kustomisasi situs profil bisnis ADA Souvenir Yogyakarta menggunakan Elementor, serta merancang otomatisasi pencatatan data pengunjung ke Google Sheets dengan Google Apps Script.',
        category: 'Web Development',
        image: 'https://images.unsplash.com/photo-1472851294608-062f824d296e?auto=format&fit=crop&w=800&q=80',
        tags: ['WordPress', 'Elementor', 'Google Apps Script', 'Google Sheets'],
        githubUrl: 'https://github.com/Lamz16'
      },
      {
        title: 'SG Sehat RS Semen Gresik',
        description: 'Melakukan pemeliharaan dan pengembangan fitur fungsional pada aplikasi pasien internal RS Semen Gresik, menangani perbaikan bug berkelanjutan, serta meningkatkan kualitas performa runtime aplikasi Android.',
        category: 'Mobile Development',
        image: 'https://images.unsplash.com/photo-1504813184591-01552661c88c?auto=format&fit=crop&w=800&q=80',
        tags: ['Android Native', 'Kotlin', 'Java', 'Bug Hunting'],
        githubUrl: 'https://github.com/Lamz16'
      }
    ];

    for (const proj of rawProjects) {
      const catId = pCatMap[proj.category] || 1;
      const res = await db.query(
        `INSERT INTO projects (category_id, title, description, image_url, github_url)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [catId, proj.title, proj.description, proj.image, proj.githubUrl]
      );
      const projectId = res.rows[0].id;

      for (const tagName of proj.tags) {
        await db.query('INSERT INTO tags (name) VALUES ($1) ON CONFLICT DO NOTHING', [tagName]);
        const tagRes = await db.query('SELECT id FROM tags WHERE name = $1', [tagName]);
        if (tagRes.rows.length > 0) {
          const tagId = tagRes.rows[0].id;
          await db.query('INSERT INTO project_tag_map (project_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [projectId, tagId]);
        }
      }
    }
  }

  // Seed Certificates & Issuers
  const certCheck = await db.query('SELECT COUNT(*) as count FROM certificates');
  if (parseInt(certCheck.rows[0].count, 10) === 0) {
    const rawCertificates = [
      {
        name: 'Android Developer - Expert Certificate',
        issuer: 'Dicoding Indonesia',
        date: '2024',
        credentialId: 'DICODING-ANDROID-EXPERT',
        credentialUrl: 'https://www.dicoding.com',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Android Developer Cohort Graduate',
        issuer: 'Bangkit Academy (by Google, GoTo, Traveloka)',
        date: 'Desember 2023',
        credentialId: 'BANGKIT-2023-ANDROID',
        credentialUrl: 'https://grow.google/intl/id_id/bangkit/',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Android Developer Certified Mentee',
        issuer: 'Infinite Learning Indonesia',
        date: 'Juni 2024',
        credentialId: 'INFINITE-ANDROID-2024',
        credentialUrl: 'https://infinitelearning.id',
        image: 'https://images.unsplash.com/photo-1589330694653-ded6df53f6ee?auto=format&fit=crop&w=800&q=80'
      }
    ];

    for (const cert of rawCertificates) {
      await db.query('INSERT INTO issuers (name) VALUES ($1) ON CONFLICT DO NOTHING', [cert.issuer]);
      const issuerRes = await db.query('SELECT id FROM issuers WHERE name = $1', [cert.issuer]);
      const issuerId = issuerRes.rows[0].id;

      await db.query(
        `INSERT INTO certificates (issuer_id, name, issue_date, credential_id, credential_url, image_url)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [issuerId, cert.name, cert.date, cert.credentialId, cert.credentialUrl, cert.image]
      );
    }
  }

  // Seed sample message
  const msgCheck = await db.query('SELECT COUNT(*) as count FROM inbox_messages');
  if (parseInt(msgCheck.rows[0].count, 10) === 0) {
    await db.query(
      `INSERT INTO inbox_messages (sender_name, sender_email, subject, message, is_read)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'Budi Santoso',
        'budi@techfirm.co.id',
        'Penawaran Project Mobile App (Flutter & Kotlin)',
        'Halo Mas Andi, kami bermaksud mendiskusikan peluang kerja sama proyek pembuatan aplikasi mobile enterprise. Mohon informasi ketersediaan jadwal Anda.',
        false
      ]
    );
  }
}
