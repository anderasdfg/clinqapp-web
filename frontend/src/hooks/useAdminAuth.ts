import { useState, useEffect, createContext, useContext } from 'react';

interface AdminUser {
  username: string;
  role: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    // If no context, create a standalone hook
    return useAdminAuthStandalone();
  }
  return context;
};

// Standalone hook for when context is not available
const useAdminAuthStandalone = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const savedToken = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    } else {
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      
      const response = await fetch('http://localhost:3001/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error HTTP ${response.status}`);
      }

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        
        // Save to localStorage
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        
      } else {
        throw new Error(data.error || 'Respuesta inválida del servidor');
      }
    } catch (error) {
      
      // Better error handling for network issues
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se puede conectar al servidor. Verifica que esté ejecutándose.');
      }
      
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  const isAuthenticated = !!user && !!token;
  
  
  return {
    user,
    token,
    login,
    logout,
    isAuthenticated,
  };
};

// API helper function
export const adminApi = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('admin_token');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`http://localhost:3001/api/admin${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  },

  // Dashboard
  async getDashboard() {
    return this.request('/dashboard');
  },

  // Organizations
  async getOrganizations(params: { page?: number; limit?: number; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.search) query.set('search', params.search);
    
    return this.request(`/organizations?${query.toString()}`);
  },

  async getOrganization(id: string) {
    return this.request(`/organizations/${id}`);
  },

  async updateOrganization(id: string, data: any) {
    return this.request(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getOrganizationReminderStats(id: string, days: number = 30) {
    return this.request(`/organizations/${id}/reminder-stats?days=${days}`);
  },
};
