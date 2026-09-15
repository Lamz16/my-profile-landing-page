import { ProfileInfo, PortfolioItem, CertificateItem } from './types';

export const DEFAULT_PROFILE: ProfileInfo = {
  name: "Andi Salam Syahputra",
  title: "Software Engineer & Mobile Developer",
  location: "Jawa Timur, Indonesia",
  email: "andiku0755@gmail.com",
  phone: "+6287830314466",
  githubUrl: "https://github.com/Lamz16",
  linkedinUrl: "https://www.linkedin.com/in/lamz16/",
  instagramUrl: "https://instagram.com",
  bio: "Software Engineer dengan pengalaman lebih dari 2 tahun dalam pengembangan aplikasi mobile dan web menggunakan Kotlin, Java, Flutter, serta teknologi backend modern.",
  longBio: "Berpengalaman membangun aplikasi untuk sektor pemerintahan, kesehatan, dan transportasi dengan menerapkan Clean Architecture, MVVM, REST API, dan praktik pengembangan software modern. Terlibat dalam seluruh siklus pengembangan mulai dari analisis kebutuhan, implementasi fitur, debugging, optimasi performa, CI/CD, hingga deployment aplikasi ke platform produksi. Terbiasa menggunakan AI-assisted development untuk membantu analisis masalah teknis, debugging, dan eksplorasi solusi implementasi.",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
  skills: [
    // Mobile & Frontend
    { name: "Kotlin", category: "frontend", level: 100 },
    { name: "Java", category: "frontend", level: 100 },
    { name: "Dart (Flutter)", category: "frontend", level: 100 },
    { name: "Android SDK & Jetpack Compose", category: "frontend", level: 100 },
    { name: "XML Layout", category: "frontend", level: 100 },
    { name: "JavaScript", category: "frontend", level: 100 },

    // Backend & Networking
    { name: "REST API Integration", category: "backend", level: 100 },
    { name: "Retrofit & Dio", category: "backend", level: 100 },
    { name: "WebSocket & JSON Parsing", category: "backend", level: 100 },
    { name: "PHP", category: "backend", level: 100 },
    { name: "Google Apps Script", category: "backend", level: 100 },

    // Architecture & Data
    { name: "MVVM / MVC / Repository Pattern", category: "design", level: 100 },
    { name: "Clean Architecture", category: "design", level: 100 },
    { name: "Hilt Dependency Injection", category: "design", level: 100 },
    { name: "StateFlow & SharedFlow", category: "design", level: 100 },
    { name: "BLoC & Provider", category: "design", level: 100 },
    { name: "Room & SQLite Database", category: "design", level: 100 },
    { name: "PostgreSQL & MySQL", category: "design", level: 100 },
    { name: "Firebase (Firestore & Realtime DB)", category: "design", level: 100 },

    // Tools & Workflows
    { name: "Android Studio", category: "other", level: 100 },
    { name: "Git & Git Workflow", category: "other", level: 100 },
    { name: "Docker", category: "other", level: 100 },
    { name: "CI/CD & Firebase App Distribution", category: "other", level: 100 },
    { name: "Play Console & App Store Connect", category: "other", level: 100 },
    { name: "Postman & Figma", category: "other", level: 100 },
    { name: "Agile / Scrum Methodology", category: "other", level: 100 },
    { name: "AI-assisted Development", category: "other", level: 100 }
  ]
};

export const DEFAULT_PORTFOLIO: PortfolioItem[] = [
  {
    id: "1",
    title: "Epakon SiGanteng (Android & iOS)",
    description: "Mengembangkan serta melakukan pemeliharaan aplikasi Epakon SiGanteng untuk ASN Kabupaten Pamekasan menggunakan arsitektur MVVM, Android Architecture Components dengan penerapan Repository Pattern, integrasi REST API, serta penyempurnaan UI/UX.",
    category: "Mobile Development",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    tags: ["Kotlin", "Flutter", "MVVM", "Repository Pattern", "REST API", "iOS"],
    demoUrl: "",
    githubUrl: "https://github.com/Lamz16"
  },
  {
    id: "2",
    title: "SiMapan RSUD Wahidin Mojokerto",
    description: "Melakukan pemeliharaan berkala aplikasi kesehatan RSUD Wahidin Mojokerto, mencakup proses migrasi Android SDK / API Level, penyelesaian bug kompleks, optimasi kompatibilitas perangkat, serta pengelolaan rilis melalui Google Play Console.",
    category: "Mobile Development",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    tags: ["Android SDK", "Kotlin", "Java", "Play Console", "Bug Fixes"],
    demoUrl: "",
    githubUrl: "https://github.com/Lamz16"
  },
  {
    id: "3",
    title: "Arjuna Trans & SaaS Travora",
    description: "Mengembangkan aplikasi sistem transportasi dan software as a service (SaaS) multiplatform dengan Flutter, menerapkan state management Provider & BLoC, serta implementasi konektivitas data REST API berkecepatan tinggi menggunakan Dio.",
    category: "Mobile Development",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    tags: ["Flutter", "BLoC", "Provider", "Dio", "REST API", "SaaS"],
    demoUrl: "",
    githubUrl: "https://github.com/Lamz16"
  },
  {
    id: "4",
    title: "Mobile Banking Prototype",
    description: "Membangun prototype aplikasi mobile banking berbasis Kotlin XML dengan mereplikasi tampilan, navigasi, dan simulasi transaksi BCA Mobile sebagai bahan presentasi klien, serta mengintegrasikan database Firebase Realtime.",
    category: "Freelance Project",
    image: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=800&q=80",
    tags: ["Kotlin", "XML Layout", "MVC Architecture", "Firebase Realtime DB"],
    demoUrl: "",
    githubUrl: "https://github.com/Lamz16"
  },
  {
    id: "5",
    title: "Web WordPress ADA Souvenir Yogyakarta",
    description: "Mengembangkan dan melakukan kustomisasi situs profil bisnis ADA Souvenir Yogyakarta menggunakan Elementor, serta merancang otomatisasi pencatatan data pengunjung ke Google Sheets dengan Google Apps Script.",
    category: "Web Development",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d296e?auto=format&fit=crop&w=800&q=80",
    tags: ["WordPress", "Elementor", "Google Apps Script", "Google Sheets"],
    demoUrl: "",
    githubUrl: "https://github.com/Lamz16"
  },
  {
    id: "6",
    title: "SG Sehat RS Semen Gresik",
    description: "Melakukan pemeliharaan dan pengembangan fitur fungsional pada aplikasi pasien internal RS Semen Gresik, menangani perbaikan bug berkelanjutan, serta meningkatkan kualitas performa runtime aplikasi Android.",
    category: "Mobile Development",
    image: "https://images.unsplash.com/photo-1504813184591-01552661c88c?auto=format&fit=crop&w=800&q=80",
    tags: ["Android Native", "Kotlin", "Java", "Bug Hunting"],
    demoUrl: "",
    githubUrl: "https://github.com/Lamz16"
  }
];

export const DEFAULT_CERTIFICATES: CertificateItem[] = [
  {
    id: "1",
    name: "Android Developer - Expert Certificate",
    issuer: "Dicoding Indonesia",
    date: "2024",
    credentialId: "DICODING-ANDROID-EXPERT",
    credentialUrl: "https://www.dicoding.com",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "2",
    name: "Android Developer Cohort Graduate",
    issuer: "Bangkit Academy (by Google, GoTo, Traveloka)",
    date: "Desember 2023",
    credentialId: "BANGKIT-2023-ANDROID",
    credentialUrl: "https://grow.google/intl/id_id/bangkit/",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "3",
    name: "Android Developer Certified Mentee",
    issuer: "Infinite Learning Indonesia",
    date: "Juni 2024",
    credentialId: "INFINITE-ANDROID-2024",
    credentialUrl: "https://infinitelearning.id",
    image: "https://images.unsplash.com/photo-1589330694653-ded6df53f6ee?auto=format&fit=crop&w=800&q=80"
  }
];
