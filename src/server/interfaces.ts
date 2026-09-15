import { ProfileInfo, SkillItem, PortfolioItem, CertificateItem, InboxMessage } from '../types';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IProfileRepository {
  getProfile(): Promise<ProfileInfo>;
  updateProfile(profile: Partial<ProfileInfo>): Promise<ProfileInfo>;
}

export interface ISkillRepository {
  getSkills(): Promise<SkillItem[]>;
  addSkill(name: string, categoryCode: string): Promise<SkillItem>;
  deleteSkill(id: string | number): Promise<boolean>;
}

export interface IProjectRepository {
  getProjects(page?: number, limit?: number, category?: string, search?: string): Promise<PaginatedResult<PortfolioItem>>;
  getProjectById(id: string): Promise<PortfolioItem | null>;
  createProject(project: Omit<PortfolioItem, 'id'>): Promise<PortfolioItem>;
  updateProject(id: string, project: Omit<PortfolioItem, 'id'>): Promise<PortfolioItem>;
  deleteProject(id: string): Promise<boolean>;
}

export interface ICertificateRepository {
  getCertificates(page?: number, limit?: number): Promise<PaginatedResult<CertificateItem>>;
  createCertificate(certificate: Omit<CertificateItem, 'id'>): Promise<CertificateItem>;
  updateCertificate(id: string, certificate: Omit<CertificateItem, 'id'>): Promise<CertificateItem>;
  deleteCertificate(id: string): Promise<boolean>;
}

export interface IContactRepository {
  saveMessage(senderName: string, senderEmail: string, subject: string, message: string): Promise<InboxMessage>;
  getMessages(page?: number, limit?: number): Promise<PaginatedResult<InboxMessage>>;
  markAsRead(id: string): Promise<boolean>;
  deleteMessage(id: string): Promise<boolean>;
}

export interface IAdminRepository {
  verifyAdminCredentials(username: string, passwordAttempt: string): Promise<{ id: number; username: string } | null>;
  changePassword(adminId: number, oldPasswordAttempt: string, newPassword: string): Promise<boolean>;
  getAdminById(id: number): Promise<{ id: number; username: string } | null>;
}
