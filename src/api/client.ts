import { ProfileInfo, SkillItem, PortfolioItem, CertificateItem, InboxMessage, PaginatedResult } from '../types';

const ADMIN_TOKEN_KEY = 'portfolio_admin_jwt_token';

export const adminAuth = {
  getToken: () => localStorage.getItem(ADMIN_TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(ADMIN_TOKEN_KEY),
  isAuthenticated: () => !!localStorage.getItem(ADMIN_TOKEN_KEY)
};

async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = adminAuth.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Terjadi kesalahan pada server.');
  }

  return data as T;
}

export const api = {
  // Admin Authentication
  adminLogin: async (username: string, password: string) => {
    const res = await fetchApi<{ token: string; user: any; message: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res.token) {
      adminAuth.setToken(res.token);
    }
    return res;
  },
  
  checkAdminStatus: () => fetchApi<{ user: { id: number; username: string } }>('/api/admin/me'),

  changeAdminPassword: (oldPassword: string, newPassword: string) =>
    fetchApi<{ message: string }>('/api/admin/change-password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword })
    }),

  // Profile API
  getProfile: () => fetchApi<ProfileInfo>('/api/profile'),
  updateProfile: (profile: Partial<ProfileInfo>) =>
    fetchApi<ProfileInfo>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    }),

  // Skills API
  getSkills: () => fetchApi<SkillItem[]>('/api/skills'),
  addSkill: (name: string, category: string) =>
    fetchApi<SkillItem>('/api/skills', {
      method: 'POST',
      body: JSON.stringify({ name, category })
    }),
  deleteSkill: (id: string | number) =>
    fetchApi<{ success: boolean }>(`/api/skills/${id}`, {
      method: 'DELETE'
    }),

  // Projects API (Paginated)
  getProjects: (page: number = 1, limit: number = 4, category?: string, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    return fetchApi<PaginatedResult<PortfolioItem>>(`/api/projects?${params.toString()}`);
  },

  createProject: (project: Omit<PortfolioItem, 'id'>) =>
    fetchApi<PortfolioItem>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    }),

  updateProject: (id: string, project: Omit<PortfolioItem, 'id'>) =>
    fetchApi<PortfolioItem>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project)
    }),

  deleteProject: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/projects/${id}`, {
      method: 'DELETE'
    }),

  // Certificates API (Paginated)
  getCertificates: (page: number = 1, limit: number = 6) =>
    fetchApi<PaginatedResult<CertificateItem>>(`/api/certificates?page=${page}&limit=${limit}`),

  createCertificate: (certificate: Omit<CertificateItem, 'id'>) =>
    fetchApi<CertificateItem>('/api/certificates', {
      method: 'POST',
      body: JSON.stringify(certificate)
    }),

  updateCertificate: (id: string, certificate: Omit<CertificateItem, 'id'>) =>
    fetchApi<CertificateItem>(`/api/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(certificate)
    }),

  deleteCertificate: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/certificates/${id}`, {
      method: 'DELETE'
    }),

  // Contact API
  sendMessage: (name: string, email: string, subject: string, message: string) =>
    fetchApi<{ message: string; data: InboxMessage }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name, email, subject, message })
    }),

  getInboxMessages: (page: number = 1, limit: number = 5) =>
    fetchApi<PaginatedResult<InboxMessage>>(`/api/contact/messages?page=${page}&limit=${limit}`),

  markMessageAsRead: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/contact/messages/${id}/read`, {
      method: 'PATCH'
    }),

  deleteMessage: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/contact/messages/${id}`, {
      method: 'DELETE'
    })
};
