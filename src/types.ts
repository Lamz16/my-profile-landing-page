export interface SkillItem {
  id?: string | number;
  name: string;
  category: 'frontend' | 'backend' | 'design' | 'other';
  level?: number;
}

export type Skill = SkillItem;

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  images?: string[];
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
  skills: SkillItem[];
  avatarUrl: string;
}

export interface InboxMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
