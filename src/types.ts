export interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'design' | 'other';
  level: number; // 0 to 100
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  tags: string[];
  demoUrl?: string;
  githubUrl?: string;
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  credentialUrl?: string;
  image: string;
}

export interface ProfileInfo {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  bio: string;
  longBio: string;
  skills: Skill[];
  avatarUrl: string;
}
